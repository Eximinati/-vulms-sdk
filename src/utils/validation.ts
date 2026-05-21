import * as cheerio from 'cheerio';

export type ValidationState = 'INVALID' | 'EMPTY_VALID' | 'VALID';

export interface PageValidationResult {
  state: ValidationState;
  pageType: 'unknown' | 'login' | 'home' | 'courses' | 'course_home' | 'lecture' | 'quiz' | 'assignment' | 'gdb';
  indicators: string[];
  missingExpected?: string;
}

export interface SemanticSelector {
  selector: string;
  count: number;
  expectedMin: number;
}

function analyzeSemantic(html: string, pageType: 'lecture' | 'quiz' | 'assignment' | 'gdb'): PageValidationResult {
  const $ = cheerio.load(html);
  const lowerHtml = html.toLowerCase();
  const indicators: string[] = [];

  const hasLogin = lowerHtml.includes('txtusername') || lowerHtml.includes('id="txtuser') || lowerHtml.includes('name="username"');
  if (hasLogin) {
    return {
      state: 'INVALID',
      pageType: 'login',
      indicators: ['login_form'],
      missingExpected: 'page contains login form',
    };
  }

  const isHome = lowerHtml.includes('gvcourselist') && !lowerHtml.includes('gv' + pageType);
  if (isHome) {
    return {
      state: 'INVALID',
      pageType: 'home',
      indicators: ['course_list'],
      missingExpected: 'page is course dashboard, not ' + pageType,
    };
  }

  const selectors = getSemanticSelectors(pageType);
  let foundContent = false;
  let hasContentStructure = false;

  for (const sel of selectors) {
    const elements = $(sel.selector);
    const count = elements.length;
    if (count > 0) {
      indicators.push(sel.selector + ':' + count);
      if (count >= sel.expectedMin) {
        hasContentStructure = true;
      }
      foundContent = true;
    }
  }

  if (hasContentStructure) {
    return {
      state: 'VALID',
      pageType,
      indicators,
    };
  }

  if (foundContent) {
    return {
      state: 'EMPTY_VALID',
      pageType,
      indicators,
      missingExpected: 'page has structure but no content items found',
    };
  }

  return {
    state: 'INVALID',
    pageType: 'unknown',
    indicators,
    missingExpected: 'no ' + pageType + ' content structure found',
  };
}

function getSemanticSelectors(pageType: 'lecture' | 'quiz' | 'assignment' | 'gdb'): SemanticSelector[] {
  switch (pageType) {
    case 'lecture':
      return [
        { selector: '[id*="gvTileRepeaterLecture_"]', count: 0, expectedMin: 1 },
        { selector: '[id*="gvLecture_"]', count: 0, expectedMin: 1 },
        { selector: '[id*="lblLectureTitle_"]', count: 0, expectedMin: 1 },
        { selector: '[id*="lblTitle_"]', count: 0, expectedMin: 1 },
        { selector: '[class*="ActivitySession"]', count: 0, expectedMin: 1 },
        { selector: '#MainContent_pnlLecture', count: 0, expectedMin: 1 },
        { selector: '#MainContent_gvLecture', count: 0, expectedMin: 1 },
      ];
    case 'quiz':
      return [
        { selector: '[id*="gvTileRepeaterQuiz_"]', count: 0, expectedMin: 1 },
        { selector: '[id*="gvQuiz_"]', count: 0, expectedMin: 1 },
        { selector: '[id*="lblQuizTitle_"]', count: 0, expectedMin: 1 },
        { selector: '#MainContent_pnlQuiz', count: 0, expectedMin: 1 },
        { selector: '#MainContent_gvQuiz', count: 0, expectedMin: 1 },
      ];
    case 'assignment':
      return [
        { selector: '[id*="gvTileRepeaterAssignment_"]', count: 0, expectedMin: 1 },
        { selector: '[id*="gvAssignment_"]', count: 0, expectedMin: 1 },
        { selector: '[id*="lblTitle_"]', count: 0, expectedMin: 1 },
        { selector: '#MainContent_pnlAssignment', count: 0, expectedMin: 1 },
        { selector: '#MainContent_gvAssignment', count: 0, expectedMin: 1 },
      ];
    case 'gdb':
      return [
        { selector: '[id*="gvTileRepeaterGDB_pnl_"]', count: 0, expectedMin: 1 },
        { selector: '[id*="gvTileRepeaterGDB_lbl"]', count: 0, expectedMin: 1 },
        { selector: '[id*="lblTitle_"]', count: 0, expectedMin: 1 },
        { selector: '#MainContent_pnlGDB', count: 0, expectedMin: 1 },
        { selector: '#MainContent_gvGDB', count: 0, expectedMin: 1 },
        { selector: '[class*="GDBTitle"]', count: 0, expectedMin: 1 },
      ];
  }
}

export function validateLecturePage(html: string): PageValidationResult {
  return analyzeSemantic(html, 'lecture');
}

export function validateQuizPage(html: string): PageValidationResult {
  return analyzeSemantic(html, 'quiz');
}

export function validateAssignmentPage(html: string): PageValidationResult {
  return analyzeSemantic(html, 'assignment');
}

export function validateGDBPage(html: string): PageValidationResult {
  return analyzeSemantic(html, 'gdb');
}

export function validateCourseListPage(html: string): PageValidationResult {
  const $ = cheerio.load(html);
  const lowerHtml = html.toLowerCase();
  const indicators: string[] = [];

  const hasLogin = lowerHtml.includes('txtusername') || lowerHtml.includes('id="txtuser') || lowerHtml.includes('name="username"');
  if (hasLogin) {
    return {
      state: 'INVALID',
      pageType: 'login',
      indicators: ['login_form'],
    };
  }

  const courseCards = $('[id^="MainContent_gvCourseList_"]');
  const portlets = $('.m-portlet');

  if (courseCards.length > 0) {
    indicators.push('course_cards:' + courseCards.length);
  }
  if (portlets.length > 0) {
    indicators.push('course_portlets:' + portlets.length);
  }

  const h3Elements = $('h3');
  const courseCodes = h3Elements.filter((_, el) => {
    const text = $(el).text().trim();
    return /[A-Z]{2,4}\d{3}[A-Z]?/i.test(text);
  });

  if (courseCodes.length > 0) {
    indicators.push('course_codes:' + courseCodes.length);
  }

  if (indicators.length >= 2) {
    return {
      state: 'VALID',
      pageType: 'courses',
      indicators,
    };
  }

  return {
    state: 'INVALID',
    pageType: 'unknown',
    indicators,
    missingExpected: 'course list structure not found',
  };
}

export function isEmptyValid(result: PageValidationResult): boolean {
  return result.state === 'EMPTY_VALID';
}

export function isValid(result: PageValidationResult): boolean {
  return result.state === 'VALID';
}

export function isInvalid(result: PageValidationResult): boolean {
  return result.state === 'INVALID';
}