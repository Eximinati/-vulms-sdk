import * as cheerio from 'cheerio';
import { SessionManager } from '../core/session';
import { VULMS_ENDPOINTS } from '../constants/urls';
import type { Lecture } from '../types/lectures';
import { parseLectures } from '../parsers/lecture-parser';
import { noopLogger, type Logger } from '../utils/logger';
import { validateLecturePage } from '../utils/validation';
import type { RuntimeState } from '../core/runtime-state';
import { getCache, setCache } from '../core/runtime-state';

export class LectureModule {
  private session: SessionManager;
  private debug!: Logger;
  private runtime: RuntimeState;

  constructor(session: SessionManager, debug: Logger = noopLogger, runtime?: RuntimeState) {
    this.session = session;
    this.debug = debug.child('lectures');
    this.runtime = runtime ?? { loggedIn: false, cache: {}, telemetry: { cacheHits: 0, cacheMisses: 0, skippedTraversals: 0, requestsSaved: 0 }, createdAt: Date.now() };
  }

  async getLectures(courseCode?: string, options?: { forceRefresh?: boolean }): Promise<Lecture[]> {
    if (courseCode) return this.getLecturesForCourse(courseCode);
    return this.getAllLectures(options?.forceRefresh);
  }

  private async getLecturesForCourse(courseCode: string): Promise<Lecture[]> {
    const pbe = this.session.getPostBackEngine();

    pbe.clearState();

    const lectureUrl = `${VULMS_ENDPOINTS.LECTURE_SCHEDULE}?code=${courseCode}`;
    this.debug.info(`[FETCH] LectureSchedule: ${courseCode}`);

    let html = '';
    try {
      html = await pbe.fetchWithFormState(lectureUrl);
    } catch (e) {
      this.debug.warn(`[LECTURE PAGE FAILED] course=${courseCode} error=${(e as Error).message}`);
      return [];
    }

    if (!this.isValidLecturePage(html, this.debug)) {
      this.debug.warn(`[INVALID LECTURE PAGE] course=${courseCode}`);
      return [];
    }

    const lectures = parseLectures(html, this.debug);
    for (const l of lectures) l.courseCode = courseCode.toUpperCase();
    this.debug.info(`[PARSE] course=${courseCode} lecturesFound=${lectures.length}`);

    if (lectures.length === 0) {
      this.debug.debug(`[EMPTY LECTURE PAGE] course=${courseCode} reason=no lectures available`);
    }

    return lectures;
  }

  private async getAllLectures(forceRefresh: boolean = false): Promise<Lecture[]> {
    const cached = getCache<Lecture[]>(this.runtime, 'lectures');
    if (cached && !forceRefresh) {
      this.debug.debug('[CACHE HIT] lectures');
      return cached;
    }

    this.debug.debug('[CACHE MISS] lectures');
    const http = this.session.getHttpClient();
    const pbe = this.session.getPostBackEngine();

    pbe.clearState();

    const homeHtml = this.runtime.dashboardHtml
      ? this.runtime.dashboardHtml
      : await http.get({ path: VULMS_ENDPOINTS.HOME });
    const courseIndices = this.findAllCourseIndices(homeHtml);
    this.debug.debug(`Found ${courseIndices.length} courses with lecture buttons`);

    const allLectures: Lecture[] = [];
    const seen = new Set<string>();
    const indicators = this.runtime.dashboardIndicators;

    for (let i = 0; i < courseIndices.length; i++) {
      const [index, code] = courseIndices[i];

      if (indicators && !indicators.lectures.has(code)) {
        this.debug.debug(`[SKIPPED TRAVERSAL] ${code} lecture (no dashboard indicator)`);
        this.runtime.telemetry.skippedTraversals++;
        this.runtime.telemetry.requestsSaved++;
        continue;
      }

      pbe.clearState();

      const eventTarget = `ctl00$MainContent$gvCourseList$ctl${String(index).padStart(2, '0')}$ibtnActivitySession`;

      this.debug.info(`[NAVIGATE] Lecture page for ${code} eventTarget=${eventTarget}`);

      let html = '';
      try {
        html = await pbe.performNavigation(VULMS_ENDPOINTS.HOME, eventTarget, 'lecture', code, true);
      } catch (e) {
        this.debug.warn(`[NAVIGATION FAILED] course=${code} error=${(e as Error).message}`);
        continue;
      }

      const validation = validateLecturePage(html);
      if (validation.state === 'INVALID') {
        this.debug.warn(`[INVALID PAGE] course=${code} state=${validation.state} missing=${validation.missingExpected}`);
        continue;
      }

      const lectures = parseLectures(html, this.debug);
      for (const l of lectures) l.courseCode = code;

      for (const l of lectures) {
        const key = this.lectureKey(l);
        if (!seen.has(key)) {
          seen.add(key);
          allLectures.push(l);
        } else {
          this.debug.debug(`Skipping duplicate: ${key}`);
        }
      }

      if (i < courseIndices.length - 1) {
        await this.delay(200);
      }
    }

    this.debug.info(`Total: ${allLectures.length} lectures`);
    setCache(this.runtime, 'lectures', allLectures);
    return allLectures;
  }

  private lectureKey(l: Lecture): string {
    return `${l.courseCode}|${l.title}|${l.week || ''}`;
  }

  private isValidLecturePage(html: string, log: Logger): boolean {
    if (!html || html.length < 100) {
      log.debug('isValidLecturePage: empty/short HTML');
      return false;
    }

    const lowerHtml = html.toLowerCase();

    if (lowerHtml.includes('login') && lowerHtml.includes('username')) {
      log.debug('isValidLecturePage: login page detected');
      return false;
    }

    if (lowerHtml.includes('student login') || lowerHtml.includes('vulms.vu.edu.pk')) {
      const hasLoginForm = html.includes('id="txtUserName"') || html.includes('name="txtUserName"');
      if (hasLoginForm) {
        log.debug('isValidLecturePage: login form detected');
        return false;
      }
    }

    if (lowerHtml.includes('gvCourseList') && !lowerHtml.includes('gvLecture') && !lowerHtml.includes('lblLecture')) {
      log.debug('isValidLecturePage: course list detected (dashboard), not lecture page');
      return false;
    }

    return true;
  }

  private findAllCourseIndices(html: string): Array<[number, string]> {
    const $ = cheerio.load(html);
    const results: Array<[number, string]> = [];
    const seen = new Set<string>();

    $('[id^="MainContent_gvCourseList_ibtnActivitySession_"]').each((_: number, el) => {
      const id = $(el).attr('id') || '';
      const match = id.match(/_(\d+)$/);
      if (!match) return;
      const idx = parseInt(match[1]);
      const card = $(el).closest('.m-portlet');
      const h3 = card.find('h3').first();
      const h3Text = h3.text().trim();
      const codeMatch = h3Text.match(/^([A-Z]{2,4}\d{3}[A-Z]?)/i);
      const code = codeMatch ? codeMatch[1].toUpperCase() : `IDX_${idx}`;
      if (!seen.has(code)) {
        seen.add(code);
        results.push([idx, code]);
      }
    });

    return results;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
