import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { SessionManager } from '../core/session';
import type { Quiz } from '../types/quizzes';
import { parseQuizzes } from '../parsers/quiz-parser';
import { noopLogger, type Logger } from '../utils/logger';
import type { RuntimeState } from '../core/runtime-state';
import { getCache, setCache } from '../core/runtime-state';

export interface QuizSummary {
  total: number;
  submitted: number;
  pending: number;
  open: number;
  closed: number;
  resultDeclared: number;
}

export interface QuizAggregate {
  quizzes: Quiz[];
  byCourse: Map<string, Quiz[]>;
  summary: QuizSummary;
}

export interface QuizTraversalStep {
  courseCode: string;
  success: boolean;
  htmlLength: number;
  quizzesFound: number;
  error?: string;
}

export interface QuizTraversalReport {
  steps: QuizTraversalStep[];
  summary: { [code: string]: string };
  totalCourses: number;
  totalQuizzes: number;
}

export class QuizModule {
  private session: SessionManager;
  private debug!: Logger;
  private runtime: RuntimeState;
  private navDir: string;
  private traversalSteps: QuizTraversalStep[] = [];

  constructor(session: SessionManager, debug: Logger = noopLogger, runtime?: RuntimeState) {
    this.session = session;
    this.debug = debug.child('quizzes');
    this.runtime = runtime ?? { loggedIn: false, cache: {}, telemetry: { cacheHits: 0, cacheMisses: 0, skippedTraversals: 0, requestsSaved: 0 }, createdAt: Date.now() };
    this.navDir = path.join(process.cwd(), 'debug', 'navigation', 'quizzes');
    if (!fs.existsSync(this.navDir)) fs.mkdirSync(this.navDir, { recursive: true });
  }

  async getQuizzes(courseCode?: string, options?: { forceRefresh?: boolean }): Promise<Quiz[]> {
    if (courseCode) return this.getQuizzesForCourse(courseCode);
    return this.getAllQuizzes(options?.forceRefresh);
  }

  async getAll(): Promise<QuizAggregate> {
    const quizzes = await this.getAllQuizzes();
    const byCourse = new Map<string, Quiz[]>();
    for (const q of quizzes) {
      const existing = byCourse.get(q.courseCode) || [];
      existing.push(q);
      byCourse.set(q.courseCode, existing);
    }
    const summary: QuizSummary = {
      total: quizzes.length,
      submitted: quizzes.filter(q => q.submissionStatus === 'submitted').length,
      pending: quizzes.filter(q => q.resultStatus === 'pending' && q.submissionStatus === 'not_submitted').length,
      open: quizzes.filter(q => q.availabilityStatus === 'open').length,
      closed: quizzes.filter(q => q.availabilityStatus === 'closed').length,
      resultDeclared: quizzes.filter(q => q.resultStatus === 'declared').length,
    };
    return { quizzes, byCourse, summary };
  }

  async getByCourse(): Promise<Map<string, Quiz[]>> {
    const agg = await this.getAll();
    return agg.byCourse;
  }

  async getSummary(): Promise<QuizSummary> {
    const agg = await this.getAll();
    return agg.summary;
  }

  async getTraversalReport(): Promise<QuizTraversalReport> {
    return {
      steps: this.traversalSteps,
      summary: this.buildSummary(),
      totalCourses: this.traversalSteps.length,
      totalQuizzes: this.traversalSteps.reduce((n, s) => n + s.quizzesFound, 0),
    };
  }

  private buildSummary(): { [code: string]: string } {
    const summary: { [code: string]: string } = {};
    for (const step of this.traversalSteps) {
      if (step.quizzesFound > 0) {
        summary[step.courseCode] = `SUCCESS (${step.quizzesFound} quiz${step.quizzesFound !== 1 ? 's' : ''})`;
      } else if (step.error) {
        summary[step.courseCode] = `NAVIGATION FAILED (${step.error})`;
      } else {
        summary[step.courseCode] = 'No quizzes available';
      }
    }
    return summary;
  }

  private async getQuizzesForCourse(courseCode: string): Promise<Quiz[]> {
    const http = this.session.getHttpClient();
    const pbe = this.session.getPostBackEngine();

    pbe.clearState();
    const homeHtml = await http.get({ path: '/Home.aspx' });
    const courseIndex = this.findCourseIndex(homeHtml, courseCode);
    if (courseIndex < 0) { this.debug.warn(`Course not found: ${courseCode}`); return []; }

    const eventTarget = `ctl00$MainContent$gvCourseList$ctl${String(courseIndex).padStart(2, '0')}$ibtnQuizzes`;
    this.debug.info(`[NAVIGATE] Quiz page for ${courseCode}`);

    let html = '';
    try {
      html = await pbe.performNavigation('/Home.aspx', eventTarget, 'quiz', courseCode, true);
    } catch (e) {
      this.debug.warn(`[NAVIGATION FAILED] course=${courseCode} error=${(e as Error).message}`);
      return [];
    }

    const $ = cheerio.load(html);
    const pageTitle = $('title').text().trim();
    this.debug.info(`[NAVIGATION RESULT] course=${courseCode} htmlLength=${html.length} title="${pageTitle}"`);

    this.saveNavHtml(courseCode, html);

    const { quizzes, confidence } = parseQuizzes(html, this.debug, { courseCode });
    this.debug.info(`[PARSE] course=${courseCode} quizzesFound=${quizzes.length} confidence=${confidence.confidence}`);

    if (confidence.warnings.length > 0) {
      for (const w of confidence.warnings) {
        this.debug.warn(`Quiz parse warning: ${w.code} - ${w.message}`);
      }
    }

    if (quizzes.length === 0) {
      this.debug.debug(`[EMPTY QUIZ PAGE] course=${courseCode} reason=no quizzes available`);
    }

    return quizzes;
  }

  private async getAllQuizzes(forceRefresh: boolean = false): Promise<Quiz[]> {
    const cached = getCache<Quiz[]>(this.runtime, 'quizzes');
    if (cached && !forceRefresh) {
      this.debug.debug('[CACHE HIT] quizzes');
      return cached;
    }

    this.debug.debug('[CACHE MISS] quizzes');
    this.traversalSteps = [];
    const http = this.session.getHttpClient();
    const pbe = this.session.getPostBackEngine();

    const homeHtml = this.runtime.dashboardHtml
      ? this.runtime.dashboardHtml
      : await http.get({ path: '/Home.aspx' });
    const courseIndices = this.findAllCourseIndices(homeHtml);
    this.debug.info(`[COURSES] Found ${courseIndices.length} courses: ${courseIndices.map(([, c]) => c).join(', ')}`);

    const allQuizzes: Quiz[] = [];
    const seen = new Set<string>();
    const indicators = this.runtime.dashboardIndicators;

    for (const [index, code] of courseIndices) {
      if (indicators && !indicators.quizzes.has(code)) {
        this.debug.debug(`[SKIPPED TRAVERSAL] ${code} quiz (no dashboard indicator)`);
        this.runtime.telemetry.skippedTraversals++;
        this.runtime.telemetry.requestsSaved++;
        this.traversalSteps.push({
          courseCode: code,
          success: true,
          htmlLength: 0,
          quizzesFound: 0,
        });
        continue;
      }

      this.debug.info(`[COURSE] ${code}`);

      pbe.clearState();
      const eventTarget = `ctl00$MainContent$gvCourseList$ctl${String(index).padStart(2, '0')}$ibtnQuizzes`;
      this.debug.info(`[NAVIGATE] Quiz page for ${code} eventTarget=${eventTarget}`);

      let html = '';
      let navError: string | undefined;
      try {
        html = await pbe.performNavigation('/Home.aspx', eventTarget, 'quiz', code, true);
      } catch (e) {
        navError = (e as Error).message;
        this.debug.warn(`[NAVIGATION FAILED] course=${code} error=${navError}`);
      }

      if (!navError) {
        const $ = cheerio.load(html);
        const pageTitle = $('title').text().trim();
        this.debug.info(`[NAVIGATION RESULT] course=${code} htmlLength=${html.length} title="${pageTitle}"`);

        this.saveNavHtml(code, html);

        const { quizzes, confidence } = parseQuizzes(html, this.debug, { courseCode: code });
        this.debug.info(`[PARSE] course=${code} quizzesFound=${quizzes.length} confidence=${confidence.confidence}`);

        if (quizzes.length === 0) {
          this.debug.debug(`[EMPTY QUIZ PAGE] course=${code} reason=no quizzes available`);
        }

        for (const q of quizzes) {
          const key = this.quizKey(q);
          if (!seen.has(key)) { seen.add(key); allQuizzes.push(q); }
          else this.debug.debug(`[DEDUP] Skipping duplicate: ${key}`);
        }

        this.traversalSteps.push({
          courseCode: code,
          success: true,
          htmlLength: html.length,
          quizzesFound: quizzes.length,
        });
      } else {
        this.traversalSteps.push({
          courseCode: code,
          success: false,
          htmlLength: 0,
          quizzesFound: 0,
          error: navError,
        });
      }
    }

    this.printTraversalSummary();
    this.debug.info(`[TOTAL] ${allQuizzes.length} quizzes from ${courseIndices.length} courses`);
    setCache(this.runtime, 'quizzes', allQuizzes);
    return allQuizzes;
  }

  private printTraversalSummary(): void {
    const summary = this.buildSummary();
    const bar = '======================================';
    const lines: string[] = [];
    lines.push(`\n${bar}`);
    lines.push(`QUIZ TRAVERSAL SUMMARY`);
    lines.push(bar);

    const maxLen = Math.max(...Object.keys(summary).map(k => k.length), 8);
    for (const [code, result] of Object.entries(summary)) {
      const padded = code.padEnd(maxLen + 2);
      lines.push(`${padded} → ${result}`);
    }

    lines.push(bar);
    lines.push(`Total: ${this.traversalSteps.length} courses, ${this.traversalSteps.reduce((n, s) => n + s.quizzesFound, 0)} quizzes`);
    lines.push('');

    for (const line of lines) {
      this.debug.info(line);
    }
  }

  private saveNavHtml(courseCode: string, html: string): void {
    try {
      const fp = path.join(this.navDir, `${courseCode}.html`);
      fs.writeFileSync(fp, html, 'utf-8');
      this.debug.debug(`[SAVE HTML] ${fp} (${html.length} bytes)`);
    } catch {
      this.debug.warn(`[SAVE HTML FAILED] could not save HTML for ${courseCode}`);
    }
  }

  private quizKey(q: Quiz): string {
    const start = q.startDate?.toISOString().slice(0, 10) || '';
    return `${q.courseCode}|${q.title}|${start}`;
  }

  private findCourseIndex(html: string, courseCode: string): number {
    const $ = cheerio.load(html);
    const code = courseCode.toUpperCase();
    let found = -1;
    $('[id^="MainContent_gvCourseList_ibtnQuizzes_"]').each((_: number, el) => {
      if (found >= 0) return;
      const id = $(el).attr('id') || '';
      const match = id.match(/_(\d+)$/);
      if (!match) return;
      const idx = parseInt(match[1]);
      const card = $(el).closest('.m-portlet');
      const h3 = card.find('h3').first();
      const h3Text = h3.text().trim();
      const codeMatch = h3Text.match(/^([A-Z]{2,4}\d{3}[A-Z]?)/i);
      if (codeMatch && codeMatch[1].toUpperCase() === code) found = idx;
    });
    return found;
  }

  private findAllCourseIndices(html: string): Array<[number, string]> {
    const $ = cheerio.load(html);
    const results: Array<[number, string]> = [];
    const seen = new Set<string>();
    $('[id^="MainContent_gvCourseList_ibtnQuizzes_"]').each((_: number, el) => {
      const id = $(el).attr('id') || '';
      const match = id.match(/_(\d+)$/);
      if (!match) return;
      const idx = parseInt(match[1]);
      const card = $(el).closest('.m-portlet');
      const h3 = card.find('h3').first();
      const h3Text = h3.text().trim();
      const codeMatch = h3Text.match(/^([A-Z]{2,4}\d{3}[A-Z]?)/i);
      const code = codeMatch ? codeMatch[1].toUpperCase() : `IDX_${idx}`;
      if (!seen.has(code)) { seen.add(code); results.push([idx, code]); }
    });
    return results;
  }
}