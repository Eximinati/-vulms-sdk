import { SessionManager } from '../core/session';
import { VULMS_ENDPOINTS } from '../constants/urls';
import { parseDashboard } from '../parsers/dashboard-parser';
import { DashboardCourse, DashboardResult, DashboardMetrics, DashboardActivityPreview, type DashboardActivityType, type SmartFetchOptions } from '../types/dashboard';
import { noopLogger, type Logger } from '../utils/logger';

export interface DashboardOptions {
  courseCode?: string;
  debug?: Logger;
}

export class DashboardModule {
  private session: SessionManager;
  private debug: Logger;

  constructor(session: SessionManager, debug: Logger = noopLogger) {
    this.session = session;
    this.debug = debug.child('dashboard');
  }

  async get(courseCode: string, options: DashboardOptions = {}): Promise<DashboardCourse | null> {
    const log = options.debug || this.debug;
    log.info(`dashboard.get: ${courseCode}`);

    const url = `${VULMS_ENDPOINTS.COURSE_HOME}?code=${courseCode}`;
    const html = await this.session.getHttpClient().get({ path: url });
    const courses = parseDashboard(html, log, { courseCode });

    return courses.find(c => c.courseCode === courseCode) || null;
  }

  async getAll(options: DashboardOptions = {}): Promise<DashboardCourse[]> {
    const log = options.debug || this.debug;
    log.info('dashboard.getAll');

    const html = await this.session.getHttpClient().get({ path: VULMS_ENDPOINTS.HOME });
    return parseDashboard(html, log);
  }

  async getAllWithMetrics(options: DashboardOptions = {}): Promise<DashboardResult> {
    const log = options.debug || this.debug;
    const startTime = new Date();
    log.info('dashboard.getAllWithMetrics: starting');

    const metrics: DashboardMetrics = {
      totalRequests: 0,
      dashboardRequests: 1,
      moduleRequests: 0,
      modulesSkipped: 0,
      modulesExecuted: 0,
      startTime,
    };

    const html = await this.session.getHttpClient().get({ path: VULMS_ENDPOINTS.HOME });
    metrics.totalRequests++;
    const courses = parseDashboard(html, log);

    const skippedCourses: string[] = [];
    const executedCourses: string[] = [];

    for (const course of courses) {
      const hasAnyActivity = course.hasQuizzes || course.hasAssignments || course.hasGDBs || course.hasLectures;

      if (!hasAnyActivity) {
        skippedCourses.push(course.courseCode);
        metrics.modulesSkipped += 4;
        log.debug(`dashboard.getAllWithMetrics: ${course.courseCode} skipped - no activities indicated`);
        continue;
      }

      executedCourses.push(course.courseCode);
      metrics.moduleRequests += 4;
      metrics.modulesExecuted += 4;
    }

    const endTime = new Date();
    metrics.endTime = endTime;
    metrics.durationMs = endTime.getTime() - startTime.getTime();

    log.info(`dashboard.getAllWithMetrics: ${courses.length} courses, skipped=${skippedCourses.length}, executed=${executedCourses.length}, duration=${metrics.durationMs}ms`);

    return {
      courses,
      metrics,
      skippedCourses,
      executedCourses,
    };
  }
}

export { type DashboardActivityPreview, type DashboardCourse, type DashboardMetrics, type DashboardResult, type DashboardActivityType, type SmartFetchOptions };