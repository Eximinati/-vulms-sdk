import type { HttpClient } from './http-client';
import type { AspNetWebFormData } from '../types/session';
import { extractAspNetFormData, buildPostbackData } from '../parsers/aspnet-parser';
import { VULMS_BASE_URL } from '../constants/urls';
import { noopLogger, type Logger } from '../utils/logger';
import { isImageButton, buildImageButtonFields, extractPageTitle } from '../utils/navigation';
import { validateLecturePage, validateQuizPage, validateAssignmentPage, validateGDBPage, type PageValidationResult } from '../utils/validation';

export interface PostBackOptions {
  page: string;
  eventTarget?: string;
  eventArgument?: string;
  extraFields?: Record<string, string>;
  refreshFormState?: boolean;
}

export class PostBackEngine {
  private httpClient!: HttpClient;
  private lastFormData: AspNetWebFormData | null = null;
  private lastPage: string | null = null;
  private debug!: Logger;

  constructor(httpClient: HttpClient, debug: Logger = noopLogger) {
    this.httpClient = httpClient;
    this.debug = debug;
  }

  async performPostBack(options: PostBackOptions): Promise<string> {
    const target = options.eventTarget || 'none';
    const isImgBtn = isImageButton(target);

    this.debug.debug(`PostBack: ${options.page} [${target}] type=${isImgBtn ? 'image-button' : 'standard'}`);

    const needsRefresh =
      options.refreshFormState || !this.lastFormData || this.lastPage !== options.page;

    if (needsRefresh) {
      this.debug.debug(`  Fetching form state from ${options.page}`);
      const pageHtml = await this.httpClient.get({ path: options.page });
      this.lastFormData = extractAspNetFormData(pageHtml);
      this.lastPage = options.page;
      this.debug.debug(`  VIEWSTATE length: ${this.lastFormData.__VIEWSTATE.length}`);
    }

    const fields: Record<string, string> = {};

    if (isImgBtn) {
      const imgFields = buildImageButtonFields(target);
      for (const [k, v] of Object.entries(imgFields)) {
        fields[k] = v;
      }
      this.debug.debug(`  Image button: ${target} + ${target}.x/y`);
    } else {
      if (options.eventTarget) {
        fields.__EVENTTARGET = options.eventTarget;
        this.debug.debug(`  __EVENTTARGET=${options.eventTarget}`);
      }
    }

    if (options.eventArgument) fields.__EVENTARGUMENT = options.eventArgument;

    const data = buildPostbackData(this.lastFormData!, {
      ...fields,
      ...options.extraFields,
    });

    const html = await this.httpClient.post({
      path: options.page,
      data,
      referer: `${VULMS_BASE_URL}${options.page}`,
    });

    const pageTitle = extractPageTitle(html);
    this.debug.debug(`  Response: title="${pageTitle}" length=${html.length}`);

    try {
      this.lastFormData = extractAspNetFormData(html);
      this.lastPage = options.page;
      this.debug.debug(`  Response OK, VIEWSTATE length: ${this.lastFormData.__VIEWSTATE.length}`);
    } catch (e) {
      this.debug.warn(`  Failed to extract form state from response: ${(e as Error).message}`);
      this.lastFormData = null;
      this.lastPage = null;
    }

    return html;
  }

  async performNavigation(
    page: string,
    eventTarget: string,
    expectedRepeater: 'quiz' | 'assignment' | 'gdb' | 'lecture',
    courseCode?: string,
    refreshState?: boolean,
  ): Promise<string> {
    const isImg = isImageButton(eventTarget);
    const tag = '[POSTBACK]';
    const target = isImg ? eventTarget : (eventTarget || 'none');

    this.debug.debug(`${tag} target=${target} page=${page} isImageButton=${isImg} expect=${expectedRepeater} refreshState=${refreshState}`);

    const startTime = Date.now();
    const html = await this.performPostBack({ page, eventTarget, refreshFormState: refreshState });
    const elapsed = Date.now() - startTime;

    const validation = this.validatePage(html, expectedRepeater);
    const title = extractPageTitle(html);
    const formAction = this.extractFormAction(html);

    this.debug.debug(`[NAVIGATION RESULT] course=${courseCode || 'unknown'} state=${validation.state} url=${formAction} htmlLength=${html.length} title="${title}" elapsed=${elapsed}ms indicators=[${validation.indicators.join(', ')}]`);

    if (validation.state === 'INVALID') {
      const errorMsg = `Navigation validation failed for ${courseCode || 'unknown'}: expected=${expectedRepeater}, state=${validation.state}, title="${title}", missing=${validation.missingExpected || 'unknown'}`;
      this.debug.warn(`[NAVIGATION FAILED] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    return html;
  }

  private validatePage(html: string, type: 'quiz' | 'assignment' | 'gdb' | 'lecture'): PageValidationResult {
    switch (type) {
      case 'quiz': return validateQuizPage(html);
      case 'assignment': return validateAssignmentPage(html);
      case 'gdb': return validateGDBPage(html);
      case 'lecture': return validateLecturePage(html);
    }
  }

  private extractFormAction(html: string): string {
    const match = html.match(/<form[^>]*action="([^"]*)"/i);
    return match ? match[1] : '';
  }

  async fetchWithFormState(page: string): Promise<string> {
    this.debug.debug(`fetchWithFormState: ${page}`);
    const html = await this.httpClient.get({ path: page });
    this.lastFormData = extractAspNetFormData(html);
    this.lastPage = page;
    return html;
  }

  clearState(): void {
    this.lastFormData = null;
    this.lastPage = null;
    this.debug.debug('PostBack state cleared');
  }

  hasState(): boolean {
    return this.lastFormData !== null && this.lastPage !== null;
  }
}