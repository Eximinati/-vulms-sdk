import * as cheerio from 'cheerio';

export type ControlType = 'image-button' | 'postback' | 'link' | 'unknown';

export interface DetectedControl {
  type: ControlType;
  name: string;
  id: string;
  href?: string;
}

export interface NavigationResult {
  html: string;
  controlType: ControlType;
  controlId: string;
  responseUrl?: string;
  pageTitle?: string;
  hasQuizRepeater: boolean;
  navigationSuccess: boolean;
}

export function detectControlType(element: any, $: cheerio.CheerioAPI): DetectedControl {
  const $el = $(element);
  const tag = element.tagName.toLowerCase();
  const type = $el.attr('type')?.toLowerCase();
  const id = $el.attr('id') || '';
  const name = $el.attr('name') || id;
  const href = $el.attr('href');

  if (tag === 'input' && type === 'image') {
    return { type: 'image-button', name, id };
  }

  if (tag === 'input' && (type === 'submit' || type === 'button')) {
    return { type: 'postback', name, id };
  }

  if (tag === 'a' && href) {
    return { type: 'link', name, id, href };
  }

  if (id.includes('ibtn') || name.includes('ibtn')) {
    return { type: 'image-button', name, id };
  }

  return { type: 'unknown', name, id };
}

export function isImageButton(name: string): boolean {
  return name.includes('ibtn') || name.includes('$ibtn');
}

export function buildImageButtonFields(name: string): Record<string, string> {
  return {
    [name]: 'Submit',
    [`${name}.x`]: '10',
    [`${name}.y`]: '10',
  };
}

export function findControlButtons(html: string, prefix: string): DetectedControl[] {
  const $ = cheerio.load(html);
  const controls: DetectedControl[] = [];

  $(`input[id^="${prefix}"]`).each((_: number, el) => {
    const ctrl = detectControlType(el, $);
    if (ctrl.type !== 'unknown') controls.push(ctrl);
  });

  $(`a[id^="${prefix}"]`).each((_: number, el) => {
    const ctrl = detectControlType(el, $);
    if (ctrl.type !== 'unknown') controls.push(ctrl);
  });

  return controls;
}

export function hasQuizRepeater(html: string): boolean {
  return html.includes('gvTileRepeaterQuiz_lblTitle_');
}

export function hasAssignmentRepeater(html: string): boolean {
  return html.includes('gvTileRepeaterAssignment_Label3_') || html.includes('gvTileRepeaterAssignment_lblTitle_');
}

export function hasGDBRepeater(html: string): boolean {
  return html.includes('gvTileRepeaterGDB_pnl_') || html.includes('gvTileRepeaterGDB_lblTitle_') || html.includes('GDBTitle');
}

export function hasLectureRepeater(html: string): boolean {
  return html.includes('gvTileRepeaterLecture_') || html.includes('ActivitySession');
}

export function extractPageTitle(html: string): string {
  const $ = cheerio.load(html);
  const title = $('title').text().trim();
  if (title) return title;

  const h1 = $('h1').first().text().trim();
  if (h1) return h1;

  const h3 = $('h3.m-subheader__title').first().text().trim();
  if (h3) return h3;

  return 'unknown';
}