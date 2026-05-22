import axios, { AxiosInstance } from 'axios';
import * as tough from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { VULMS_BASE_URL } from '../constants/urls';
import type { Logger } from '../utils/logger';
import { noopLogger } from '../utils/logger';

export interface RequestOptions {
  path: string;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface PostRequestOptions extends RequestOptions {
  data: Record<string, string>;
  referer?: string;
}

export interface RequestTrace {
  id: string;
  method: 'GET' | 'POST';
  url: string;
  finalUrl?: string;
  status?: number;
  duration: number;
  redirects: string[];
  payloadSize?: number;
  responseSize?: number;
  contentType?: string;
  viewStateSize?: number;
  eventValidationSize?: number;
  hasLoginForm?: boolean;
  hasCourseList?: boolean;
  hasLectureRepeater?: boolean;
  hasQuizRepeater?: boolean;
  hasAssignmentRepeater?: boolean;
  hasGDBRepeater?: boolean;
  error?: string;
  timestamp: number;
}

export interface RetryConfig {
  retries: number;
  baseDelay: number;
  maxDelay: number;
  retryOn: number[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3,
  baseDelay: 500,
  maxDelay: 8000,
  retryOn: [408, 429, 500, 502, 503, 504],
};

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
};

export class HttpClient {
  private client: AxiosInstance;
  private cookieJar: tough.CookieJar;
  private debug: Logger;
  private traceRequests: boolean;
  private retryConfig: RetryConfig;
  private traces: RequestTrace[];
  private maxTraces: number;

  constructor(
    options: {
      headers?: Record<string, string>;
      debug?: Logger;
      traceRequests?: boolean;
      retryConfig?: Partial<RetryConfig>;
      timeout?: number;
      maxTraces?: number;
    } = {},
  ) {
    this.cookieJar = new tough.CookieJar();
    this.debug = options.debug ?? noopLogger;
    this.traceRequests = options.traceRequests ?? false;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...options.retryConfig };
    this.traces = [];
    this.maxTraces = options.maxTraces ?? 200;

    const headers = { ...DEFAULT_HEADERS, ...options.headers };

    this.client = wrapper(
      axios.create({
        baseURL: VULMS_BASE_URL,
        timeout: options.timeout ?? 30000,
        withCredentials: true,
        jar: this.cookieJar,
        headers,
        maxRedirects: 5,
        validateStatus: (status) => status < 400,
      }),
    );
  }

  async get(options: RequestOptions): Promise<string> {
    return this.executeWithRetry('GET', options.path, options);
  }

  async post(options: PostRequestOptions): Promise<string> {
    return this.executeWithRetry('POST', options.path, options);
  }

  private async executeWithRetry(
    method: 'GET' | 'POST',
    path: string,
    options: RequestOptions | PostRequestOptions,
    attempt = 0,
  ): Promise<string> {
    const start = Date.now();
    const redirects: string[] = [];
    const baseUrl = `${VULMS_BASE_URL}${options.path}`;
    let lastError: Error | null = null;

    for (let i = attempt; i <= this.retryConfig.retries; i++) {
      try {
        if (i > 0) {
          const delay = Math.min(this.retryConfig.baseDelay * Math.pow(2, i - 1), this.retryConfig.maxDelay);
          this.debug.warn(`Retry ${i}/${this.retryConfig.retries} for ${method} ${path} after ${delay}ms`);
          await this.sleep(delay);
        }

        const result = await this.execute(method, path, options);
        const duration = Date.now() - start;
        this.logTrace(method, baseUrl, 200, duration, redirects, undefined, result.length, result);

        return result;
      } catch (error) {
        lastError = error as Error;

        if (!this.isRetryable(error) || i >= this.retryConfig.retries) {
          const duration = Date.now() - start;
          const status = this.extractStatus(error);
          this.logTrace(method, baseUrl, status, duration, redirects, this.getErrorMessage(error), undefined, '');
          throw error;
        }

        if (i < this.retryConfig.retries) {
          const delay = this.retryConfig.baseDelay * Math.pow(2, i);
          this.debug.warn(
            `${method} ${path} failed (attempt ${i + 1}): ${this.getErrorMessage(error)}. Retrying in ${delay}ms`,
          );
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private async execute(
    method: 'GET' | 'POST',
    path: string,
    options: RequestOptions | PostRequestOptions,
  ): Promise<string> {
    const baseUrl = `${VULMS_BASE_URL}${path}`;

    if (this.traceRequests) {
      this.debug.info(`[TRACE] ${method} ${baseUrl}`);
    }

    if (method === 'GET') {
      const response = await this.client.get(path, {
        params: options.params,
        headers: options.headers,
        timeout: options.timeout,
      });

      if (this.traceRequests) {
        this.debug.info(`[TRACE] ${method} ${baseUrl} -> ${response.status} (${(response.data as string).length}b)`);
      }

      return response.data as string;
    } else {
      const postOpts = options as PostRequestOptions;
      const payload = new URLSearchParams(postOpts.data).toString();

      if (this.traceRequests) {
        this.debug.info(`[TRACE] POST ${baseUrl} (${payload.length}b)`);
      }

      const response = await this.client.post(path, payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: postOpts.referer || `${VULMS_BASE_URL}${path}`,
          ...options.headers,
        },
        timeout: options.timeout,
      });

      if (this.traceRequests) {
        this.debug.info(`[TRACE] POST ${baseUrl} -> ${response.status} (${(response.data as string).length}b)`);
      }

      return response.data as string;
    }
  }

  private isRetryable(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status && this.retryConfig.retryOn.includes(status)) return true;
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return true;
    }
    return false;
  }

  private extractStatus(error: unknown): number | undefined {
    if (axios.isAxiosError(error)) return error.response?.status;
    return undefined;
  }

  private getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return `HTTP ${error.response?.status}: ${error.message}`;
    }
    if (error instanceof Error) return error.message;
    return String(error);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private logTrace(
    method: 'GET' | 'POST',
    url: string,
    status: number | undefined,
    duration: number,
    redirects: string[],
    error?: string,
    responseSize?: number,
    html?: string,
  ): void {
    const traceId = `REQ_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const aspNetState = html ? this.analyzeAspNetState(html) : undefined;

    const trace: RequestTrace = {
      id: traceId,
      method,
      url,
      finalUrl: redirects.length > 0 ? redirects[redirects.length - 1] : undefined,
      status,
      duration,
      redirects: [...redirects],
      error,
      responseSize,
      contentType: aspNetState?.contentType,
      viewStateSize: aspNetState?.viewStateSize,
      eventValidationSize: aspNetState?.eventValidationSize,
      hasLoginForm: aspNetState?.hasLoginForm,
      hasCourseList: aspNetState?.hasCourseList,
      hasLectureRepeater: aspNetState?.hasLectureRepeater,
      hasQuizRepeater: aspNetState?.hasQuizRepeater,
      hasAssignmentRepeater: aspNetState?.hasAssignmentRepeater,
      hasGDBRepeater: aspNetState?.hasGDBRepeater,
      timestamp: Date.now(),
    };
    this.traces.push(trace);

    if (this.traces.length > this.maxTraces) {
      this.traces = this.traces.slice(-this.maxTraces);
    }

    if (!this.traceRequests) return;

    const icon = status && status < 400 ? '✓' : error ? '✗' : '?';
    const redirectInfo = redirects.length > 0 ? ` (${redirects.length} redirects)` : '';
    const aspNetInfo = aspNetState
      ? ` VS:${aspNetState.viewStateSize}b EV:${aspNetState.eventValidationSize}b`
      : '';
    this.debug.info(
      `[TRACE] ${icon} ${method} ${url}${redirectInfo} ${status || 'ERR'} ${duration}ms${responseSize ? ` ${responseSize}b` : ''}${aspNetInfo}`,
    );
  }

  private analyzeAspNetState(html: string): {
    contentType: string | undefined;
    viewStateSize: number;
    eventValidationSize: number;
    hasLoginForm: boolean;
    hasCourseList: boolean;
    hasLectureRepeater: boolean;
    hasQuizRepeater: boolean;
    hasAssignmentRepeater: boolean;
    hasGDBRepeater: boolean;
  } {
    const lowerHtml = html.toLowerCase();
    const vsMatch = html.match(/__viewstate[^>]*value="([^"]*)"/i);
    const evMatch = html.match(/__eventvalidation[^>]*value="([^"]*)"/i);
    const ctMatch = html.match(/<meta[^>]*http-equiv[^>]*content-type[^>]*content="([^"]*)"/i);

    return {
      contentType: ctMatch?.[1],
      viewStateSize: vsMatch ? vsMatch[1].length : 0,
      eventValidationSize: evMatch ? evMatch[1].length : 0,
      hasLoginForm: lowerHtml.includes('txtusername') || lowerHtml.includes('txtuserid'),
      hasCourseList: lowerHtml.includes('gvcourselist'),
      hasLectureRepeater: lowerHtml.includes('gvtilerepeaterlecture') || lowerHtml.includes('gvlecture'),
      hasQuizRepeater: lowerHtml.includes('gvtilerepeaterquiz') || lowerHtml.includes('gvquiz'),
      hasAssignmentRepeater: lowerHtml.includes('gvtilerepeaterassignment') || lowerHtml.includes('gvassignment'),
      hasGDBRepeater: lowerHtml.includes('gvtilerepeatergdb') || lowerHtml.includes('gvgdb'),
    };
  }

  async getCookies(): Promise<string> {
    const cookies = await this.cookieJar.getCookies(VULMS_BASE_URL);
    return cookies.map((c) => `${c.key}=${c.value}`).join('; ');
  }

  async setCookies(cookieString: string): Promise<void> {
    const cookies = cookieString.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie) await this.cookieJar.setCookie(cookie, VULMS_BASE_URL);
    }
  }

  getCookieJar(): tough.CookieJar {
    return this.cookieJar;
  }

  getTraces(): RequestTrace[] {
    return [...this.traces];
  }

  clearTraces(): void {
    this.traces = [];
  }
}
