import { chromium, Browser } from 'playwright';
import { VULMS_BASE_URL } from '../constants/urls';
import type { LoginResult } from '../types/session';

export interface BrowserLoginOptions {
  timeout?: number;
  headless?: boolean;
}

function cookiesToString(cookies: {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
}[]): string {
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

export interface QuizPageData {
  courseCode: string;
  html: string;
}

export async function loginWithBrowser(
  studentId: string,
  password: string,
  options: BrowserLoginOptions = {},
): Promise<LoginResult & { cookies?: string; quizPages?: QuizPageData[] }> {
  const { timeout = 60000, headless = true } = options;

  let browser: Browser | null = null;
  const t0 = Date.now();

  try {
    const tLaunch = Date.now();
    browser = await chromium.launch({ headless });
    console.log(`[LOGIN-PERF] browserLaunch: ${Date.now() - tLaunch}ms`);

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();
    const quizPages: QuizPageData[] = [];
    const courseMap = new Map<string, string>();

    await page.route('**/StudentQuizListView.aspx', async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      quizPages.push({ courseCode: courseMap.get(route.request().url()) || 'UNKNOWN', html: body });
      await route.fulfill({ response });
    });

    const tPageLoad = Date.now();
    await page.goto(`${VULMS_BASE_URL}/`, { timeout, waitUntil: 'load' });
    console.log(`[LOGIN-PERF] pageLoad: ${Date.now() - tPageLoad}ms`);

    await page.waitForSelector('#txtStudentID', { timeout: 15000 });

    const tFill = Date.now();
    await page.fill('#txtStudentID', studentId);
    await page.fill('#txtPassword', password);
    console.log(`[LOGIN-PERF] credentialFill: ${Date.now() - tFill}ms`);

    const tSubmit = Date.now();
    await page.click('#ibtnLogin');
    await page.waitForLoadState('load', { timeout });
    console.log(`[LOGIN-PERF] submitLogin: ${Date.now() - tSubmit}ms`);

    const tDetect = Date.now();
    const html = await page.content();
    const hasLoginForm = html.includes('txtStudentID');
    const hasIncorrect = html.includes('Incorrect');
    console.log(`[LOGIN-PERF] loginSuccessDetection: ${Date.now() - tDetect}ms`);

    if (hasLoginForm || hasIncorrect) {
      return { success: false, error: 'Invalid credentials' };
    }

    const tDiscovery = Date.now();
    const courseCards = await page.$$('.m-portlet');
    for (let i = 0; i < courseCards.length; i++) {
      const h3 = await courseCards[i].$('h3');
      if (h3) {
        const text = await h3.textContent() || '';
        const codeMatch = text.match(/^([A-Z]{2,4}\d{3}[A-Z]?)/i);
        if (codeMatch) {
          courseMap.set(`${VULMS_BASE_URL}/Quiz/StudentQuizListView.aspx?CourseCode=${codeMatch[1]}`, codeMatch[1]);
        }
      }
    }
    console.log(`[LOGIN-PERF] courseDiscovery: ${Date.now() - tDiscovery}ms (${courseMap.size} courses)`);

    const tQuiz = Date.now();
    for (const [url, code] of courseMap) {
      try {
        await page.goto(url, { timeout: 30000, waitUntil: 'load' });
        const quizHtml = await page.content();
        if (quizHtml.includes('Quiz') || quizHtml.includes('quiz')) {
          quizPages.push({ courseCode: code, html: quizHtml });
        }
      } catch { /* skip failed course pages */ }
    }
    console.log(`[LOGIN-PERF] quizTraversal: ${Date.now() - tQuiz}ms (${courseMap.size} pages)`);

    const tCookies = Date.now();
    const cookies = await context.cookies([VULMS_BASE_URL]);
    const cookieStr = cookiesToString(cookies);
    console.log(`[LOGIN-PERF] cookieExtraction: ${Date.now() - tCookies}ms`);

    console.log(`[LOGIN-PERF] totalLogin: ${Date.now() - t0}ms`);

    return { success: true, cookies: cookieStr, quizPages };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: `Browser login failed: ${error.message}` };
    }
    return { success: false, error: 'Browser login failed' };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
