import { SessionManager } from '../core/session';
import { VULMS_ENDPOINTS } from '../constants/urls';
import type { Course } from '../types/course';
import { parseCoursesFromHome } from '../parsers/course-parser';
import { noopLogger, type Logger } from '../utils/logger';

export class CourseModule {
  private session: SessionManager;
  private debug: Logger;

  constructor(session: SessionManager, debug: Logger = noopLogger) {
    this.session = session;
    this.debug = debug.child('courses');
  }

  async getEnrolledCourses(): Promise<Course[]> {
    this.debug.debug('Fetching enrolled courses from home page');
    const html = await this.session.getHttpClient().get({ path: VULMS_ENDPOINTS.HOME });
    const courses = parseCoursesFromHome(html, this.debug);
    this.debug.info(`Found ${courses.length} enrolled courses`);
    return courses;
  }
}