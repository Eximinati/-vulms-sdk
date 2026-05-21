import { HttpClient } from './client/http-client';
import { SessionManager } from './core/session';
import { AssignmentModule } from './modules/assignments';
import { CourseModule } from './modules/courses';
import { QuizModule } from './modules/quizzes';
import { GDBModule } from './modules/gdb';
import { LectureModule } from './modules/lectures';
import { ActivityModule } from './modules/activities';
import { DashboardModule } from './modules/dashboard';
import type { LoginResult } from './types/session';
import { DebugLogger } from './utils/logger';
import { mergeConfig, type SDKConfig, type RequiredConfig } from './config';
import type { RequestTrace } from './client';

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
  public readonly config: RequiredConfig;

  constructor(options: SDKConfig = {}) {
    this.config = mergeConfig(options);
    this.debug = new DebugLogger(this.config.debug, 'sdk');

    this.client = new HttpClient({
      debug: this.debug,
      traceRequests: this.config.traceRequests,
      timeout: this.config.timeout,
    });

    this.session = new SessionManager(this.client, this.debug);
    this.assignments = new AssignmentModule(this.session, this.debug);
    this.courses = new CourseModule(this.session, this.debug);
    this.quizzes = new QuizModule(this.session, this.debug);
    this.gdb = new GDBModule(this.session, this.debug);
    this.lectures = new LectureModule(this.session, this.debug);
    this.activities = new ActivityModule(this.session, this.debug);
    this.dashboard = new DashboardModule(this.session, this.debug);
  }

  async login(username: string, password: string): Promise<LoginResult> {
    return this.session.login(username, password);
  }

  async loginWithBrowser(username: string, password: string): Promise<LoginResult> {
    return this.session.loginWithBrowser(username, password);
  }

  getTraces(): RequestTrace[] {
    return this.client.getTraces();
  }

  clearTraces(): void {
    this.client.clearTraces();
  }
}
