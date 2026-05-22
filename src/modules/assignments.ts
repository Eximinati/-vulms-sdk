import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { SessionManager } from '../core/session';
import type { Assignment } from '../types/assignments';
import { parseAssignments } from '../parsers/assignment-parser';
import { noopLogger, type Logger } from '../utils/logger';
import type { RuntimeState } from '../core/runtime-state';
import { getCache, setCache } from '../core/runtime-state';

export interface AssignmentSummary {
  total: number;
  submitted: number;
  pending: number;
  missed: number;
  resultDeclared: number;
}

export interface AssignmentAggregate {
  assignments: Assignment[];
  byCourse: Map<string, Assignment[]>;
  summary: AssignmentSummary;
}

export interface TraversalStep {
  courseCode: string;
  eventTarget: string;
  success: boolean;
  htmlLength: number;
  assignmentsFound: number;
  error?: string;
}

export interface TraversalReport {
  steps: TraversalStep[];
  summary: { [code: string]: string };
  totalCourses: number;
  totalAssignments: number;
}

export class AssignmentModule {
  private session: SessionManager;
  private debug!: Logger;
  private runtime: RuntimeState;
  private navDir: string;
  private traversalSteps: TraversalStep[] = [];

constructor(session: SessionManager, debug: Logger = noopLogger, runtime?: RuntimeState) {
    this.session = session;
    this.debug = debug.child('assignments');
    this.runtime = runtime ?? { loggedIn: false, cache: {}, telemetry: { cacheHits: 0, cacheMisses: 0, skippedTraversals: 0, requestsSaved: 0 }, createdAt: Date.now() };
    this.navDir = path.join(process.cwd(), 'debug', 'navigation', 'assignments');
    if (!fs.existsSync(this.navDir)) fs.mkdirSync(this.navDir, { recursive: true });
  }

  async getAssignments(courseCode?: string, options?: { forceRefresh?: boolean }): Promise<Assignment[]> {
    if (courseCode) {
      return this.getAssignmentsForCourse(courseCode);
    }
    return this.getAllAssignments(options?.forceRefresh);
  }

  async getAll(): Promise<AssignmentAggregate> {
    const assignments = await this.getAllAssignments();

    const byCourse = new Map<string, Assignment[]>();
    for (const a of assignments) {
      const existing = byCourse.get(a.courseCode) || [];
      existing.push(a);
      byCourse.set(a.courseCode, existing);
    }

    const summary: AssignmentSummary = {
      total: assignments.length,
      submitted: assignments.filter(a => a.status === 'submitted').length,
      pending: assignments.filter(a => a.status === 'pending').length,
      missed: assignments.filter(a => a.status === 'missed').length,
      resultDeclared: assignments.filter(a => a.status === 'result_declared').length,
    };

    return { assignments, byCourse, summary };
  }

  async getByCourse(): Promise<Map<string, Assignment[]>> {
    const agg = await this.getAll();
    return agg.byCourse;
  }

  async getSummary(): Promise<AssignmentSummary> {
    const agg = await this.getAll();
    return agg.summary;
  }

  async getTraversalReport(): Promise<TraversalReport> {
    const byCourse = new Map<string, Assignment[]>();
    for (const step of this.traversalSteps) {
      byCourse.set(step.courseCode, []);
    }
    return {
      steps: this.traversalSteps,
      summary: this.buildSummary(),
      totalCourses: this.traversalSteps.length,
      totalAssignments: this.traversalSteps.reduce((n, s) => n + s.assignmentsFound, 0),
    };
  }

  private buildSummary(): { [code: string]: string } {
    const summary: { [code: string]: string } = {};
    for (const step of this.traversalSteps) {
      if (step.assignmentsFound > 0) {
        summary[step.courseCode] = `SUCCESS (${step.assignmentsFound} assignment${step.assignmentsFound !== 1 ? 's' : ''})`;
      } else if (step.error) {
        summary[step.courseCode] = `NAVIGATION FAILED (${step.error})`;
      } else {
        summary[step.courseCode] = 'No assignments available';
      }
    }
    return summary;
  }

  private async getAssignmentsForCourse(courseCode: string): Promise<Assignment[]> {
    const http = this.session.getHttpClient();
    const pbe = this.session.getPostBackEngine();

    const homeHtml = await http.get({ path: '/Home.aspx' });
    const courseIndex = this.findCourseIndex(homeHtml, courseCode);

    if (courseIndex < 0) {
      this.debug.warn(`Course not found: ${courseCode}`);
      return [];
    }

    const eventTarget = `ctl00$MainContent$gvCourseList$ctl${String(courseIndex).padStart(2, '0')}$ibtnAssignments`;
    this.debug.info(`[NAVIGATE] Assignment page for ${courseCode}`);

    let html = '';
    try {
      html = await pbe.performNavigation('/Home.aspx', eventTarget, 'assignment', courseCode);
    } catch (e) {
      this.debug.warn(`[NAVIGATION FAILED] course=${courseCode} error=${(e as Error).message}`);
      return [];
    }

    const $ = cheerio.load(html);
    const pageTitle = $('title').text().trim();
    this.debug.info(`[NAVIGATION RESULT] course=${courseCode} htmlLength=${html.length} title="${pageTitle}"`);

    this.saveNavHtml(courseCode, html);

    const { assignments, confidence, metrics } = parseAssignments(html, this.debug, { courseCode });

    this.debug.info(`[PARSE] course=${courseCode} layout=${metrics.layout} assignmentsFound=${assignments.length} confidence=${confidence.confidence}`);

    if (assignments.length === 0) {
      this.debug.debug(`[EMPTY ASSIGNMENT PAGE] course=${courseCode} reason=no assignments available`);
    }

    return assignments;
  }

  async getAllAssignments(forceRefresh: boolean = false): Promise<Assignment[]> {
    const cached = getCache<Assignment[]>(this.runtime, 'assignments');
    if (cached && !forceRefresh) {
      this.debug.debug('[CACHE HIT] assignments');
      return cached;
    }

    this.debug.debug('[CACHE MISS] assignments');
    this.traversalSteps = [];

    const http = this.session.getHttpClient();
    const pbe = this.session.getPostBackEngine();

    const homeHtml = this.runtime.dashboardHtml
      ? this.runtime.dashboardHtml
      : await http.get({ path: '/Home.aspx' });
    const courseIndices = this.findAllCourseIndices(homeHtml);

    this.debug.info(`[COURSES] Found ${courseIndices.length} courses: ${courseIndices.map(([, c]) => c).join(', ')}`);

    const allAssignments: Assignment[] = [];
    const seen = new Set<string>();
    const indicators = this.runtime.dashboardIndicators;

    for (const [index, code] of courseIndices) {
      if (indicators && !indicators.assignments.has(code)) {
        this.debug.debug(`[SKIPPED TRAVERSAL] ${code} assignment (no dashboard indicator)`);
        this.runtime.telemetry.skippedTraversals++;
        this.runtime.telemetry.requestsSaved++;
        this.traversalSteps.push({
          courseCode: code,
          eventTarget: '',
          success: true,
          htmlLength: 0,
          assignmentsFound: 0,
        });
        continue;
      }

      this.debug.info(`[COURSE] ${code}`);

      pbe.clearState();

      const eventTarget = `ctl00$MainContent$gvCourseList$ctl${String(index).padStart(2, '0')}$ibtnAssignments`;
      this.debug.info(`[NAVIGATE] Assignment page for ${code} eventTarget=${eventTarget}`);

      let html = '';
      let navError: string | undefined;
      try {
        html = await pbe.performNavigation('/Home.aspx', eventTarget, 'assignment', code, true);
      } catch (e) {
        navError = (e as Error).message;
        this.debug.warn(`[NAVIGATION FAILED] course=${code} error=${navError}`);
      }

      if (!navError) {
        const $ = cheerio.load(html);
        const pageTitle = $('title').text().trim();
        this.debug.info(`[NAVIGATION RESULT] course=${code} htmlLength=${html.length} title="${pageTitle}"`);

        this.saveNavHtml(code, html);

        const { assignments, confidence, metrics } = parseAssignments(html, this.debug, { courseCode: code });

        this.debug.info(`[PARSE] course=${code} layout=${metrics.layout} parser=${metrics.parser} assignmentsFound=${assignments.length} confidence=${confidence.confidence} selectors=${metrics.selectorsMatched}/${metrics.selectorsTotal} indices=[${metrics.repeaterIndices.join(',')}] emptyFields=[${metrics.emptyFields.join(',')}]`);

        if (assignments.length === 0) {
          this.debug.debug(`[EMPTY ASSIGNMENT PAGE] course=${code} reason=no assignments available`);
        }

        for (const a of assignments) {
          const key = this.activityKey(a);
          if (!seen.has(key)) {
            seen.add(key);
            allAssignments.push(a);
          } else {
            this.debug.debug(`[DEDUP] Skipping duplicate: ${key}`);
          }
        }

        this.traversalSteps.push({
          courseCode: code,
          eventTarget,
          success: true,
          htmlLength: html.length,
          assignmentsFound: assignments.length,
        });
      } else {
        this.traversalSteps.push({
          courseCode: code,
          eventTarget,
          success: false,
          htmlLength: 0,
          assignmentsFound: 0,
          error: navError,
        });
      }
    }

    this.printTraversalSummary();

    this.debug.info(`[TOTAL] ${allAssignments.length} assignments from ${courseIndices.length} courses`);
    setCache(this.runtime, 'assignments', allAssignments);
    return allAssignments;
  }

  private printTraversalSummary(): void {
    const summary = this.buildSummary();
    const bar = '======================================';
    const lines: string[] = [];
    lines.push(`\n${bar}`);
    lines.push(`TRAVERSAL SUMMARY`);
    lines.push(bar);

    const maxLen = Math.max(...Object.keys(summary).map(k => k.length), 8);

    for (const [code, result] of Object.entries(summary)) {
      const padded = code.padEnd(maxLen + 2);
      lines.push(`${padded} → ${result}`);
    }

    lines.push(bar);
    lines.push(`Total: ${this.traversalSteps.length} courses, ${this.traversalSteps.reduce((n, s) => n + s.assignmentsFound, 0)} assignments`);
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

  private activityKey(a: Assignment): string {
    return `${a.courseCode}|${a.title}|${a.dueDate?.toISOString() || ''}|${a.totalMarks || ''}`;
  }

  private findCourseIndex(html: string, courseCode: string): number {
    const $ = cheerio.load(html);
    const code = courseCode.toUpperCase();
    let found = -1;

    $('[id^="MainContent_gvCourseList_ibtnAssignments_"]').each((_: number, el) => {
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

    $('[id^="MainContent_gvCourseList_ibtnAssignments_"]').each((_: number, el) => {
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