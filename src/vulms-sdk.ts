import { HttpClient } from './client/http-client';
import { SessionManager } from './core/session';
import { createRuntimeState, type RuntimeState, type DashboardIndicators, getCache, setCache, invalidateCache, extractDashboardIndicators } from './core/runtime-state';
import { AssignmentModule } from './modules/assignments';
import { CourseModule } from './modules/courses';
import { QuizModule } from './modules/quizzes';
import { GDBModule } from './modules/gdb';
import { LectureModule } from './modules/lectures';
import { ActivityModule } from './modules/activities';
import { DashboardModule } from './modules/dashboard';
import type { LoginResult } from './types/session';
import type { Course } from './types/course';
import { DebugLogger } from './utils/logger';
import { mergeConfig, type SDKConfig, type RequiredSDKConfig } from './config';
import type { RequestTrace } from './client';
import { VULMS_ENDPOINTS } from './constants/urls';

export { type SDKConfig };

export class VulmsSDK {
  public readonly client: HttpClient;
  public readonly session: SessionManager;
  public readonly assignments: AssignmentModule;
  public readonly courses: CourseModule;
  public readonly quizzes: QuizModule;
  public readonly gdb: GDBModule;
  public readonly lectures: LectureModule;
  public readonly activities: ActivityModule;
  public readonly dashboard: DashboardModule;
  public readonly debug: DebugLogger;
  public readonly config: RequiredSDKConfig;

  private runtime: RuntimeState;

  constructor(options: SDKConfig = {}) {
    this.config = mergeConfig(options);
    this.debug = new DebugLogger(this.config.logger, 'sdk');
    this.runtime = createRuntimeState();

    this.client = new HttpClient({
      debug: this.debug,
      traceRequests: this.config.traceRequests,
      timeout: this.config.timeout,
    });

    this.session = new SessionManager(this.client, this.debug);
    this.assignments = new AssignmentModule(this.session, this.debug, this.runtime);
    this.courses = new CourseModule(this.session, this.debug, this.runtime);
    this.quizzes = new QuizModule(this.session, this.debug, this.runtime);
    this.gdb = new GDBModule(this.session, this.debug, this.runtime);
    this.lectures = new LectureModule(this.session, this.debug, this.runtime);
    this.activities = new ActivityModule(this.session, this.debug, this.runtime);
    this.dashboard = new DashboardModule(this.session, this.debug, this.runtime);
  }

  getRuntimeState(): RuntimeState {
    return this.runtime;
  }

  isAuthenticated(): boolean {
    return this.runtime.loggedIn && this.session.isAuthenticated();
  }

  /** @internal Observability — requires config.debugDashboard: true */
  getDebugDashboard(): Record<string, unknown> | null {
    if (!this.config.debugDashboard) return null;
    return {
      loggedIn: this.runtime.loggedIn,
      username: this.runtime.username,
      coursesCached: !!this.runtime.courses,
      dashboardIndicators: this.runtime.dashboardIndicators
        ? {
            assignments: this.runtime.dashboardIndicators.assignments.size,
            quizzes: this.runtime.dashboardIndicators.quizzes.size,
            gdbs: this.runtime.dashboardIndicators.gdbs.size,
            lectures: this.runtime.dashboardIndicators.lectures.size,
          }
        : null,
      cache: {
        assignments: !!this.runtime.cache.assignments,
        quizzes: !!this.runtime.cache.quizzes,
        gdbs: !!this.runtime.cache.gdbs,
        lectures: !!this.runtime.cache.lectures,
        activities: !!this.runtime.cache.activities,
        courses: !!this.runtime.cache.courses,
      },
      telemetry: { ...this.runtime.telemetry },
      traceCount: this.client.getTraces().length,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      uptimeMs: Date.now() - this.runtime.createdAt,
    };
  }

  async login(username: string, password: string): Promise<LoginResult> {
    if (this.runtime.loggedIn && this.session.isAuthenticated()) {
      this.debug.debug('[SDK] Already authenticated, skipping login');
      return { success: true };
    }

    const result = await this.session.login(username, password);

    if (result.success) {
      await this.postLoginSetup(username);
    }

    return result;
  }

  async loginWithBrowser(username: string, password: string): Promise<LoginResult> {
    if (this.runtime.loggedIn && this.session.isAuthenticated()) {
      this.debug.debug('[SDK] Already authenticated, skipping login');
      return { success: true };
    }

    const result = await this.session.loginWithBrowser(username, password);

    if (result.success) {
      await this.postLoginSetup(username);
    }

    return result;
  }

  private async postLoginSetup(username: string): Promise<void> {
    this.runtime.loggedIn = true;
    this.runtime.username = username;
    this.runtime.cookies = await this.client.getCookies();

    this.debug.info('[SDK] Post-login: caching dashboard');
    const homeHtml = await this.client.get({ path: VULMS_ENDPOINTS.HOME });
    this.runtime.dashboardIndicators = extractDashboardIndicators(homeHtml);
    this.debug.info(`[SDK] Dashboard indicators: assignments=${this.runtime.dashboardIndicators.assignments.size} quizzes=${this.runtime.dashboardIndicators.quizzes.size} gdbs=${this.runtime.dashboardIndicators.gdbs.size} lectures=${this.runtime.dashboardIndicators.lectures.size}`);

    this.runtime.dashboardHtml = homeHtml;
    this.runtime.dashboardCachedAt = Date.now();
  }

  async getDashboardHtml(forceRefresh: boolean = false): Promise<string> {
    const ttlMs = this.config.cacheTtlMs;
    if (!forceRefresh && this.runtime.dashboardHtml && this.runtime.dashboardCachedAt) {
      if (Date.now() - this.runtime.dashboardCachedAt < ttlMs) {
        this.debug.debug('[SDK] [REUSED DASHBOARD] Returning cached Home.aspx');
        return this.runtime.dashboardHtml;
      }
    }

    this.debug.debug('[SDK] Fetching fresh Home.aspx');
    const homeHtml = await this.client.get({ path: VULMS_ENDPOINTS.HOME });
    this.runtime.dashboardHtml = homeHtml;
    this.runtime.dashboardCachedAt = Date.now();
    this.runtime.dashboardIndicators = extractDashboardIndicators(homeHtml);
    return homeHtml;
  }

  async getCourses(forceRefresh: boolean = false): Promise<Course[]> {
    const cached = getCache<Course[]>(this.runtime, 'courses', this.config.cacheTtlMs);
    if (cached && !forceRefresh && this.config.cache) {
      this.debug.debug('[SDK] [CACHE HIT] courses');
      return cached;
    }

    this.debug.debug('[SDK] [CACHE MISS] courses');
    const courses = await this.courses.getEnrolledCourses();
    if (this.config.cache) {
      setCache(this.runtime, 'courses', courses);
    }
    this.runtime.courses = courses;
    this.runtime.coursesCachedAt = Date.now();
    return courses;
  }

  getDashboardIndicators(): DashboardIndicators | undefined {
    return this.runtime.dashboardIndicators;
  }

  getCacheTelemetry(): RuntimeState['telemetry'] {
    return { ...this.runtime.telemetry };
  }

  invalidateCache(key?: keyof RuntimeState['cache']): void {
    invalidateCache(this.runtime, key);
  }

  releaseMemory(): void {
    this.runtime.dashboardHtml = undefined;
    this.runtime.cookies = undefined;
    this.client.clearTraces();
    invalidateCache(this.runtime);
  }

  getTraces(): RequestTrace[] {
    return this.client.getTraces();
  }

  clearTraces(): void {
    this.client.clearTraces();
  }
}
