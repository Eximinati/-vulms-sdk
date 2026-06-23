import { HttpClient } from '../client/http-client';
import { PostBackEngine } from '../client/postback-engine';
import { VULMS_BASE_URL, VULMS_ENDPOINTS } from '../constants/urls';
import type { SessionState, LoginResult } from '../types/session';
import {
  extractAspNetFormData,
  buildLoginData,
  isLoginSuccess,
  isLoginError,
} from '../parsers/aspnet-parser';
import { AuthenticationError, ParsingError } from './errors';
import { loginWithBrowser } from '../client/browser-login';
import { noopLogger, type Logger } from '../utils/logger';

export class SessionManager {
  private httpClient: HttpClient;
  private postbackEngine: PostBackEngine;
  private state: SessionState;

  constructor(httpClient: HttpClient, debug: Logger = noopLogger) {
    this.httpClient = httpClient;
    this.postbackEngine = new PostBackEngine(httpClient, debug ?? noopLogger);
    this.state = {
      cookies: '',
      isValid: false,
    };
  }

  async initialize(): Promise<void> {
    await this.httpClient.get({ path: '/' });
    const cookies = await this.httpClient.getCookies();
    this.state.cookies = cookies;
  }

  async login(username: string, password: string): Promise<LoginResult> {
    try {
      const rootPage = await this.httpClient.get({ path: '/' });

      let formData: {
        __VIEWSTATE: string;
        __EVENTVALIDATION: string;
        __VIEWSTATEGENERATOR?: string;
      };

      try {
        formData = extractAspNetFormData(rootPage);
      } catch {
        return { success: false, error: 'Failed to parse login page. Site may be unavailable.' };
      }

      const loginData = buildLoginData(formData, username, password);
      const referer = `${VULMS_BASE_URL}/`;

      const result = await this.httpClient.post({
        path: '/',
        data: loginData,
        referer,
      });

      if (isLoginSuccess(result)) {
        const cookies = await this.httpClient.getCookies();
        this.state = {
          cookies,
          isValid: true,
          username,
        };
        return { success: true };
      }

      if (isLoginError(result)) {
        return { success: false, error: 'Invalid credentials' };
      }

      if (result.includes('__VIEWSTATE') && result.includes('txtStudentID')) {
        return { success: false, error: 'Login failed. Please check your credentials.' };
      }

      return { success: false, error: 'Unexpected login response' };
    } catch (error) {
      if (error instanceof ParsingError) {
        return { success: false, error: error.message };
      }
      if (error instanceof AuthenticationError) {
        return { success: false, error: 'Authentication failed' };
      }
      throw new AuthenticationError(
        'Login failed',
        { cause: error instanceof Error ? error : undefined },
      );
    }
  }

  async loginWithBrowser(username: string, password: string): Promise<LoginResult> {
    try {
      const result = await loginWithBrowser(username, password);

      if (result.success && result.cookies) {
        await this.httpClient.setCookies(result.cookies);
        this.state = {
          cookies: result.cookies,
          isValid: true,
          username,
        };
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Browser login failed' };
    }
  }

  async validateSession(): Promise<boolean> {
    try {
      const html = await this.httpClient.get({
        path: VULMS_ENDPOINTS.HOME,
      });

      const isLoginPage =
        html.includes('Login.aspx') ||
        html.includes('txtStudentID') ||
        html.includes('Incorrect username');

      const isValid = !isLoginPage;

      this.state.isValid = isValid;
      return isValid;
    } catch {
      this.state.isValid = false;
      return false;
    }
  }

  ensureAuthenticated(): void {
    if (!this.state.isValid) {
      throw new AuthenticationError(
        'Session is not authenticated. Call login() first.',
      );
    }
  }

  async ensureValidSession(): Promise<void> {
    if (!this.state.isValid) {
      throw new AuthenticationError(
        'Session is not authenticated. Call login() first.',
      );
    }
    const valid = await this.validateSession();
    if (!valid) {
      this.state.isValid = false;
      throw new AuthenticationError('Session has expired. Re-login required.');
    }
  }

  async importCookies(cookies: string, username?: string): Promise<void> {
    await this.httpClient.setCookies(cookies);
    this.state = {
      cookies,
      isValid: true,
      username,
    };
  }

  clearSession(): void {
    this.state = {
      cookies: '',
      isValid: false,
    };
  }

  getState(): SessionState {
    return { ...this.state };
  }

  isAuthenticated(): boolean {
    return this.state.isValid;
  }

  getHttpClient(): HttpClient {
    return this.httpClient;
  }

  getPostBackEngine(): PostBackEngine {
    return this.postbackEngine;
  }

  async navigateToCoursePage(): Promise<string> {
    return this.postbackEngine.fetchWithFormState(VULMS_ENDPOINTS.COURSE_HOME);
  }

  async navigateToAssignmentPageForCourse(courseIndex: number): Promise<string> {
    await this.navigateToCoursePage();
    const eventTarget = `ctl00$MainContent$gvCourseList$ctl${String(courseIndex).padStart(2, '0')}$ibtnAssignments`;
    return this.postbackEngine.performPostBack({
      page: VULMS_ENDPOINTS.COURSE_HOME,
      eventTarget,
    });
  }
}
