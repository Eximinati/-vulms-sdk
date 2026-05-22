import { SessionManager } from '../core/session';
import { VULMS_ENDPOINTS } from '../constants/urls';
import type { Course } from '../types/course';
import { parseCoursesFromHome } from '../parsers/course-parser';
import { noopLogger, type Logger } from '../utils/logger';
import type { RuntimeState } from '../core/runtime-state';
import { getCache, setCache } from '../core/runtime-state';

export class CourseModule {
  private session: SessionManager;
  private debug: Logger;
  private runtime: RuntimeState;

  constructor(session: SessionManager, debug: Logger = noopLogger, runtime?: RuntimeState) {
    this.session = session;
    this.debug = debug.child('courses');
    this.runtime = runtime ?? { loggedIn: false, cache: {}, telemetry: { cacheHits: 0, cacheMisses: 0, skippedTraversals: 0, requestsSaved: 0 }, createdAt: Date.now() };
  }

  async getEnrolledCourses(forceRefresh: boolean = false): Promise<Course[]> {
    const cached = getCache<Course[]>(this.runtime, 'courses');
    if (cached && !forceRefresh) {
      this.debug.debug('[CACHE HIT] courses');
      return cached;
    }

    this.debug.debug('[CACHE MISS] courses');
    const html = await this.session.getHttpClient().get({ path: VULMS_ENDPOINTS.HOME });
    const courses = parseCoursesFromHome(html, this.debug);
    setCache(this.runtime, 'courses', courses);
    this.runtime.courses = courses;
    this.runtime.coursesCachedAt = Date.now();
    this.debug.info(`Found ${courses.length} enrolled courses`);
    return courses;
  }
}
