import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { SessionManager } from '../core/session';
import type { GDB } from '../types/gdb';
import { parseGDBs } from '../parsers/gdb-parser';
import { noopLogger, type Logger } from '../utils/logger';

export interface GDBSummary {
  total: number;
  submitted: number;
  pending: number;
  missed: number;
  resultDeclared: number;
}

export interface GDBAggregate {
  gdbs: GDB[];
  byCourse: Map<string, GDB[]>;
  summary: GDBSummary;
}

export interface GDBTraversalStep {
  courseCode: string;
  success: boolean;
  htmlLength: number;
  gdbsFound: number;
  error?: string;
}

export interface GDBTraversalReport {
  steps: GDBTraversalStep[];
  summary: { [code: string]: string };
  totalCourses: number;
  totalGDBs: number;
}

export class GDBModule {
  private session: SessionManager;
  private debug!: Logger;
  private navDir: string;
  private traversalSteps: GDBTraversalStep[] = [];

  constructor(session: SessionManager, debug: Logger = noopLogger) {
    this.session = session;
    this.debug = debug.child('gdb');
    this.navDir = path.join(process.cwd(), 'debug', 'navigation', 'gdb');
    if (!fs.existsSync(this.navDir)) fs.mkdirSync(this.navDir, { recursive: true });
  }

  async getGDBs(courseCode?: string): Promise<GDB[]> {
    if (courseCode) return this.getGDBsForCourse(courseCode);
    return this.getAllGDBs();
  }

  async getAll(): Promise<GDBAggregate> {
    const gdbs = await this.getAllGDBs();
    const byCourse = new Map<string, GDB[]>();
    for (const g of gdbs) {
      const existing = byCourse.get(g.courseCode) || [];
      existing.push(g);
      byCourse.set(g.courseCode, existing);
    }
    const summary: GDBSummary = {
      total: gdbs.length,
      submitted: gdbs.filter(g => g.status === 'submitted' || g.status === 'attempted').length,
      pending: gdbs.filter(g => g.status === 'pending').length,
      missed: gdbs.filter(g => g.status === 'missed').length,
      resultDeclared: gdbs.filter(g => g.status === 'result_declared').length,
    };
    return { gdbs, byCourse, summary };
  }

  async getByCourse(): Promise<Map<string, GDB[]>> {
    const agg = await this.getAll();
    return agg.byCourse;
  }

  async getSummary(): Promise<GDBSummary> {
    const agg = await this.getAll();
    return agg.summary;
  }

  async getTraversalReport(): Promise<GDBTraversalReport> {
    return {
      steps: this.traversalSteps,
      summary: this.buildSummary(),
      totalCourses: this.traversalSteps.length,
      totalGDBs: this.traversalSteps.reduce((n, s) => n + s.gdbsFound, 0),
    };
  }

  private buildSummary(): { [code: string]: string } {
    const summary: { [code: string]: string } = {};
    for (const step of this.traversalSteps) {
      if (step.gdbsFound > 0) {
        summary[step.courseCode] = `SUCCESS (${step.gdbsFound} GDB${step.gdbsFound !== 1 ? 's' : ''})`;
      } else if (step.error) {
        summary[step.courseCode] = `NAVIGATION FAILED (${step.error})`;
      } else {
        summary[step.courseCode] = 'EMPTY';
      }
    }
    return summary;
  }

  private async getGDBsForCourse(courseCode: string): Promise<GDB[]> {
    const http = this.session.getHttpClient();
    const pbe = this.session.getPostBackEngine();

    pbe.clearState();
    const homeHtml = await http.get({ path: '/Home.aspx' });
    const courseIndex = this.findCourseIndex(homeHtml, courseCode);
    if (courseIndex < 0) { this.debug.warn(`Course not found: ${courseCode}`); return []; }

    const eventTarget = `ctl00$MainContent$gvCourseList$ctl${String(courseIndex).padStart(2, '0')}$ibtnGDB`;
    this.debug.info(`[NAVIGATE] GDB page for ${courseCode}`);

    let html = '';
    try {
      html = await pbe.performNavigation('/Home.aspx', eventTarget, 'gdb', courseCode, true);
    } catch (e) {
      this.debug.warn(`[NAVIGATION FAILED] course=${courseCode} error=${(e as Error).message}`);
      return [];
    }

    const $ = cheerio.load(html);
    const pageTitle = $('title').text().trim();
    this.debug.info(`[NAVIGATION RESULT] course=${courseCode} htmlLength=${html.length} title="${pageTitle}"`);

    this.saveNavHtml(courseCode, html);

    const gdbs = parseGDBs(html, this.debug);
    for (const g of gdbs) g.courseCode = courseCode.toUpperCase();
    this.debug.info(`[PARSE] course=${courseCode} gdbsFound=${gdbs.length}`);

    if (gdbs.length === 0) {
      this.debug.warn(`[EMPTY] course=${courseCode} reason=no GDBs extracted`);
    }

    return gdbs;
  }

  private async getAllGDBs(): Promise<GDB[]> {
    this.traversalSteps = [];
    const http = this.session.getHttpClient();
    const pbe = this.session.getPostBackEngine();

    const homeHtml = await http.get({ path: '/Home.aspx' });
    const courseIndices = this.findAllCourseIndices(homeHtml);
    this.debug.info(`[COURSES] Found ${courseIndices.length} courses: ${courseIndices.map(([, c]) => c).join(', ')}`);

    const allGDBs: GDB[] = [];
    const seen = new Set<string>();

    for (const [index, code] of courseIndices) {
      this.debug.info(`[COURSE] ${code}`);

      pbe.clearState();
      const eventTarget = `ctl00$MainContent$gvCourseList$ctl${String(index).padStart(2, '0')}$ibtnGDB`;
      this.debug.info(`[NAVIGATE] GDB page for ${code} eventTarget=${eventTarget}`);

      let html = '';
      let navError: string | undefined;
      try {
        html = await pbe.performNavigation('/Home.aspx', eventTarget, 'gdb', code, true);
      } catch (e) {
        navError = (e as Error).message;
        this.debug.warn(`[NAVIGATION FAILED] course=${code} error=${navError}`);
      }

      if (!navError) {
        const $ = cheerio.load(html);
        const pageTitle = $('title').text().trim();
        this.debug.info(`[NAVIGATION RESULT] course=${code} htmlLength=${html.length} title="${pageTitle}"`);

        this.saveNavHtml(code, html);

        const gdbs = parseGDBs(html, this.debug);
        this.debug.info(`[PARSE] course=${code} gdbsFound=${gdbs.length}`);

        if (gdbs.length === 0) {
          this.debug.warn(`[EMPTY] course=${code} reason=no GDBs extracted`);
        }

        for (const g of gdbs) {
          g.courseCode = code;
          const key = this.activityKey(g);
          if (!seen.has(key)) { seen.add(key); allGDBs.push(g); }
          else this.debug.debug(`[DEDUP] Skipping duplicate: ${key}`);
        }

        this.traversalSteps.push({
          courseCode: code,
          success: true,
          htmlLength: html.length,
          gdbsFound: gdbs.length,
        });
      } else {
        this.traversalSteps.push({
          courseCode: code,
          success: false,
          htmlLength: 0,
          gdbsFound: 0,
          error: navError,
        });
      }
    }

    this.printTraversalSummary();
    this.debug.info(`[TOTAL] ${allGDBs.length} GDBs from ${courseIndices.length} courses`);
    return allGDBs;
  }

  private printTraversalSummary(): void {
    const summary = this.buildSummary();
    const bar = '======================================';
    const lines: string[] = [];
    lines.push(`\n${bar}`);
    lines.push(`GDB TRAVERSAL SUMMARY`);
    lines.push(bar);

    const maxLen = Math.max(...Object.keys(summary).map(k => k.length), 8);
    for (const [code, result] of Object.entries(summary)) {
      const padded = code.padEnd(maxLen + 2);
      lines.push(`${padded} → ${result}`);
    }

    lines.push(bar);
    lines.push(`Total: ${this.traversalSteps.length} courses, ${this.traversalSteps.reduce((n, s) => n + s.gdbsFound, 0)} GDBs`);
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

  private activityKey(g: GDB): string {
    return `${g.courseCode}|${g.title}|${g.dueDate?.toISOString() || ''}`;
  }

  private findCourseIndex(html: string, courseCode: string): number {
    const $ = cheerio.load(html);
    const code = courseCode.toUpperCase();
    let found = -1;
    $('[id^="MainContent_gvCourseList_ibtnGDB_"]').each((_: number, el) => {
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
    $('[id^="MainContent_gvCourseList_ibtnGDB_"]').each((_: number, el) => {
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