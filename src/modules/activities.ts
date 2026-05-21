import { SessionManager } from '../core/session';
import { AssignmentModule } from './assignments';
import { QuizModule } from './quizzes';
import { GDBModule } from './gdb';
import { LectureModule } from './lectures';
import { DashboardModule } from './dashboard';
import type { UnifiedActivity, ActivityAggregate } from '../types/activities';
import type { DashboardCourse } from '../types/dashboard';
import { toUnifiedActivity, buildAggregate } from '../utils/activity';
import { noopLogger, type Logger } from '../utils/logger';
import { PerformanceTracker } from '../utils/performance';

export interface SmartFetchOptions {
  enabled?: boolean;
  skipEmptyCourses?: boolean;
}

export interface SmartActivityResult {
  aggregate: ActivityAggregate;
  performance: ReturnType<PerformanceTracker['getReport']>;
  skippedModules: string[];
  executedModules: string[];
}

export class ActivityModule {
  private assignments: AssignmentModule;
  private quizzes: QuizModule;
  private gdbs: GDBModule;
  private lectures: LectureModule;
  private dashboard: DashboardModule;
  private debug: Logger;

  constructor(session: SessionManager, debug: Logger = noopLogger) {
    this.debug = debug.child('activities');
    this.assignments = new AssignmentModule(session, this.debug);
    this.quizzes = new QuizModule(session, this.debug);
    this.gdbs = new GDBModule(session, this.debug);
    this.lectures = new LectureModule(session, this.debug);
    this.dashboard = new DashboardModule(session, this.debug);
  }

  async getAll(options: SmartFetchOptions = {}): Promise<ActivityAggregate | SmartActivityResult> {
    if (options.enabled) {
      return this.getAllSmart(options);
    }
    return this.getAllLegacy();
  }

  private async getAllLegacy(): Promise<ActivityAggregate> {
    this.debug.debug('Fetching all activities (legacy mode)...');
    const [assignments, quizzes, gdbs, lectures] = await Promise.all([
      this.assignments.getAssignments(),
      this.quizzes.getQuizzes(),
      this.gdbs.getGDBs(),
      this.lectures.getLectures(),
    ]);

    const unified: UnifiedActivity[] = [
      ...assignments.map((a) => toUnifiedActivity(a, 'assignment')),
      ...quizzes.map((q) => toUnifiedActivity(q, 'quiz')),
      ...gdbs.map((g) => toUnifiedActivity(g, 'gdb')),
      ...lectures.map((l) => toUnifiedActivity(l, 'lecture')),
    ];

    const agg = buildAggregate(unified);
    this.debug.info(`Activities: ${agg.pending.length} pending, ${agg.submitted.length} submitted, ${agg.missed.length} missed, ${agg.resultDeclared.length} results`);
    return agg;
  }

  private async getAllSmart(_options: SmartFetchOptions): Promise<SmartActivityResult> {
    const perf = new PerformanceTracker(this.debug);
    this.debug.info('Fetching all activities (smart mode with dashboard optimization)...');

    perf.start('Dashboard Discovery');
    let dashboards: DashboardCourse[] = [];
    try {
      dashboards = await this.dashboard.getAll({ debug: this.debug });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.debug.warn('Dashboard fetch failed: ' + errMsg + ', falling back to legacy');
      perf.end('Dashboard Discovery');
      const agg = await this.getAllLegacy();
      return {
        aggregate: agg,
        performance: perf.getReport(),
        skippedModules: [],
        executedModules: ['assignments', 'quizzes', 'gdb', 'lectures'],
      };
    }
    perf.end('Dashboard Discovery');
    perf.incrementRequest();

    const skippedModules: string[] = [];
    const executedModules: string[] = [];

    const hasAnyQuizzes = dashboards.some(d => d.hasQuizzes);
    const hasAnyAssignments = dashboards.some(d => d.hasAssignments);
    const hasAnyGDBs = dashboards.some(d => d.hasGDBs);
    const hasAnyLectures = dashboards.some(d => d.hasLectures);

    let allAssignments: Awaited<ReturnType<typeof this.assignments.getAssignments>> = [];
    let allQuizzes: Awaited<ReturnType<typeof this.quizzes.getQuizzes>> = [];
    let allGDBs: Awaited<ReturnType<typeof this.gdbs.getGDBs>> = [];
    let allLectures: Awaited<ReturnType<typeof this.lectures.getLectures>> = [];

    if (hasAnyAssignments) {
      perf.start('Assignments');
      executedModules.push('assignments');
      try {
        const result = await this.assignments.getAssignments();
        allAssignments = result;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        this.debug.warn('Assignments fetch failed: ' + errMsg);
      }
      perf.end('Assignments');
    } else {
      this.debug.debug('Skipping assignments - dashboard indicates none');
      skippedModules.push('assignments');
      perf.incrementSkipped();
    }

    if (hasAnyQuizzes) {
      perf.start('Quizzes');
      executedModules.push('quizzes');
      try {
        const result = await this.quizzes.getQuizzes();
        allQuizzes = result;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        this.debug.warn('Quizzes fetch failed: ' + errMsg);
      }
      perf.end('Quizzes');
    } else {
      this.debug.debug('Skipping quizzes - dashboard indicates none');
      skippedModules.push('quizzes');
      perf.incrementSkipped();
    }

    if (hasAnyGDBs) {
      perf.start('GDB');
      executedModules.push('gdb');
      try {
        const result = await this.gdbs.getGDBs();
        allGDBs = result;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        this.debug.warn('GDB fetch failed: ' + errMsg);
      }
      perf.end('GDB');
    } else {
      this.debug.debug('Skipping GDB - dashboard indicates none');
      skippedModules.push('gdb');
      perf.incrementSkipped();
    }

    if (hasAnyLectures) {
      perf.start('Lectures');
      executedModules.push('lectures');
      try {
        const result = await this.lectures.getLectures();
        allLectures = result;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        this.debug.warn('Lectures fetch failed: ' + errMsg);
      }
      perf.end('Lectures');
    } else {
      this.debug.debug('Skipping lectures - dashboard indicates none');
      skippedModules.push('lectures');
      perf.incrementSkipped();
    }

    const unified: UnifiedActivity[] = [
      ...allAssignments.map((a) => toUnifiedActivity(a, 'assignment')),
      ...allQuizzes.map((q) => toUnifiedActivity(q, 'quiz')),
      ...allGDBs.map((g) => toUnifiedActivity(g, 'gdb')),
      ...allLectures.map((l) => toUnifiedActivity(l, 'lecture')),
    ];

    const agg = buildAggregate(unified);
    this.debug.info('Smart Activities: ' + agg.pending.length + ' pending, ' + agg.submitted.length + ' submitted, ' + agg.missed.length + ' missed, ' + agg.resultDeclared.length + ' results');
    this.debug.info('Skipped: ' + skippedModules.join(', ') + ' | Executed: ' + executedModules.join(', '));

    return {
      aggregate: agg,
      performance: perf.getReport(),
      skippedModules,
      executedModules,
    };
  }

  async getPending(): Promise<UnifiedActivity[]> {
    const result = await this.getAll();
    if ('aggregate' in result) {
      return result.aggregate.pending;
    }
    return result.pending;
  }

  async getMissed(): Promise<UnifiedActivity[]> {
    const result = await this.getAll();
    if ('aggregate' in result) {
      return result.aggregate.missed;
    }
    return result.missed;
  }

  async getSubmitted(): Promise<UnifiedActivity[]> {
    const result = await this.getAll();
    if ('aggregate' in result) {
      return result.aggregate.submitted;
    }
    return result.submitted;
  }

  async getResultDeclared(): Promise<UnifiedActivity[]> {
    const result = await this.getAll();
    if ('aggregate' in result) {
      return result.aggregate.resultDeclared;
    }
    return result.resultDeclared;
  }
}