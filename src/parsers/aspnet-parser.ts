import * as cheerio from 'cheerio';
import type { AspNetWebFormData } from '../types/session';
import { ParsingError } from '../core/errors';
import { ASPNET_SELECTORS, ROOT_FORM_SELECTORS } from '../constants/selectors';

export function extractAspNetFormData(html: string): AspNetWebFormData {
  const $ = cheerio.load(html);

  const viewstate = $(ASPNET_SELECTORS.VIEWSTATE).val();
  const eventValidation = $(ASPNET_SELECTORS.EVENTVALIDATION).val();
  const viewstateGenerator = $(ASPNET_SELECTORS.VIEWSTATEGENERATOR).val();
  const previousPage = $(ASPNET_SELECTORS.PREVIOUSPAGE).val();

  if (typeof viewstate === 'string' && viewstate) {
    return {
      __VIEWSTATE: viewstate,
      __EVENTVALIDATION: typeof eventValidation === 'string' ? eventValidation : '',
      __VIEWSTATEGENERATOR: typeof viewstateGenerator === 'string' ? viewstateGenerator : undefined,
      __PREVIOUSPAGE: typeof previousPage === 'string' ? previousPage : undefined,
    };
  }

  const rootViewstate = $(ROOT_FORM_SELECTORS.VIEWSTATE).val();
  const rootEventValidation = $(ROOT_FORM_SELECTORS.EVENTVALIDATION).val();
  const rootViewstateGenerator = $(ROOT_FORM_SELECTORS.VIEWSTATEGENERATOR).val();

  if (typeof rootViewstate === 'string' && rootViewstate) {
    return {
      __VIEWSTATE: rootViewstate,
      __EVENTVALIDATION: typeof rootEventValidation === 'string' ? rootEventValidation : '',
      __VIEWSTATEGENERATOR: typeof rootViewstateGenerator === 'string' ? rootViewstateGenerator : undefined,
    };
  }

  throw new ParsingError(
    'Failed to extract form data: no __VIEWSTATE or __EVENTVALIDATION found. Page may be a redirect/captcha.',
  );
}

export function extractRootFormData(html: string): {
  __VIEWSTATE: string;
  __EVENTVALIDATION: string;
  __VIEWSTATEGENERATOR?: string;
  studentId: string;
  password: string;
  recaptchaResponse: string;
  recaptchaSiteKey: string;
  action: string;
} {
  const $ = cheerio.load(html);

  const viewstate = $(ROOT_FORM_SELECTORS.VIEWSTATE).val();
  const eventValidation = $(ROOT_FORM_SELECTORS.EVENTVALIDATION).val();
  const viewstateGenerator = $(ROOT_FORM_SELECTORS.VIEWSTATEGENERATOR).val();

  if (typeof viewstate !== 'string' || typeof eventValidation !== 'string') {
    throw new ParsingError('Failed to extract root form data: missing hidden fields');
  }

  const formAction = $('form').attr('action') || './';
  const recaptchaSiteKey = html.match(/recaptcha\/api\.js\?render=([A-Za-z0-9_-]+)/)?.[1] || '';

  return {
    __VIEWSTATE: viewstate,
    __EVENTVALIDATION: eventValidation,
    __VIEWSTATEGENERATOR: typeof viewstateGenerator === 'string' ? viewstateGenerator : undefined,
    studentId: 'txtStudentID',
    password: 'txtPassword',
    recaptchaResponse: 'g-recaptcha-response',
    recaptchaSiteKey,
    action: formAction,
  };
}

export function buildLoginData(
  formData: { __VIEWSTATE: string; __EVENTVALIDATION: string; __VIEWSTATEGENERATOR?: string },
  username: string,
  password: string,
): Record<string, string> {
  return {
    __VIEWSTATE: formData.__VIEWSTATE,
    __EVENTVALIDATION: formData.__EVENTVALIDATION,
    ...(formData.__VIEWSTATEGENERATOR
      ? { __VIEWSTATEGENERATOR: formData.__VIEWSTATEGENERATOR }
      : {}),
    txtStudentID: username,
    txtPassword: password,
    ibtnLogin: 'Sign In',
  };
}

export function buildPostbackData(
  formData: AspNetWebFormData,
  extraFields?: Record<string, string>,
): Record<string, string> {
  const data: Record<string, string> = {
    __VIEWSTATE: formData.__VIEWSTATE,
    __EVENTVALIDATION: formData.__EVENTVALIDATION,
  };

  if (formData.__VIEWSTATEGENERATOR) {
    data.__VIEWSTATEGENERATOR = formData.__VIEWSTATEGENERATOR;
  }

  if (formData.__PREVIOUSPAGE) {
    data.__PREVIOUSPAGE = formData.__PREVIOUSPAGE;
  }

  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      data[key] = value;
    }
  }

  return data;
}

export function isLoginSuccess(html: string): boolean {
  return (
    !html.includes('Incorrect') &&
    !html.includes('Invalid') &&
    !html.includes('Login.aspx') &&
    html.includes('__VIEWSTATE')
  );
}

export function isLoginError(html: string): boolean {
  return (
    html.includes('Incorrect') ||
    html.includes('Invalid') ||
    html.includes('error') ||
    html.includes('alert-danger')
  );
}
