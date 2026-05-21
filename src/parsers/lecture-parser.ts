import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import type { Lecture, LectureStatus } from '../types/lectures';
import { extractCodeFromText } from '../utils/activity';
import { noopLogger, type Logger } from '../utils/logger';

export function parseLectures(html: string, debug: Logger = noopLogger): Lecture[] {
  const log = debug;
  const $ = cheerio.load(html);
  const lectures: Lecture[] = [];

  log.debug(`parseLectures: parsing HTML, length=${html.length}`);

  const tableLectures = tryParseTable($);
  if (tableLectures.length > 0) {
    log.info(`parseLectures: ${tableLectures.length} from table`);
    return tableLectures;
  }

  const candidates = $(
    'h1, h2, h3, h4, th, .lecture-card, .lecture-row, [class*="lecture"]',
  ).filter((_, el) => el.type === 'tag');

  log.debug(`parseLectures: ${candidates.length} candidate elements`);

  let currentGroup: { code: string; title: string } | null = null;

  candidates.each((_, rawEl) => {
    const el = rawEl as Element;
    const $el = $(el);
    const tag = el.tagName.toLowerCase();

    if (['h1', 'h2', 'h3', 'h4', 'th'].includes(tag)) {
      const group = extractGroupCourse($el);
      if (group) { currentGroup = group; log.debug(`parseLectures: course group=${group.code}`); }
      return;
    }

    try {
      const lecture = parseSingleLecture($, $el, currentGroup);
      if (lecture) lectures.push(lecture);
    } catch (e) {
      log.debug(`parseLectures: skipped element: ${(e as Error).message}`);
    }
  });

  log.info(`parseLectures: ${lectures.length} lectures extracted`);
  return lectures;
}

function tryParseTable($: cheerio.CheerioAPI): Lecture[] {
  const lectures: Lecture[] = [];
  const tables = $('table');
  if (tables.length === 0) return lectures;

  let currentHeaderCourse: string | null = null;

  tables.each((_, table) => {
    const $table = $(table);
    const prevHeader = $table.prevAll('h1, h2, h3, h4').first();
    if (prevHeader.length > 0) {
      const code = extractCodeFromText(prevHeader.text());
      if (code) currentHeaderCourse = code;
    }

    const rows = $table.find('tr');
    if (rows.length < 2) return;

    let headerCourse: string | null = currentHeaderCourse;

    rows.each((_, row) => {
      const $row = $(row);
      if ($row.find('th').length > 0) {
        const thText = $row.text().trim();
        const code = extractCodeFromText(thText);
        if (code) headerCourse = code;
        return;
      }

      const tds = $row.find('td');
      if (tds.length < 2) return;

      const cells: string[] = [];
      tds.each((_, td) => { cells.push($(td).text().trim()); });

      const title = cells[0] || '';
      if (!title) return;

      const weekNum = extractWeekNumber(cells);

      const status = determineLectureStatus(
        title + ' ' + cells.slice(1).join(' '),
        $row.html() || '',
      );

      lectures.push({
        courseCode: headerCourse || '',
        courseTitle: '',
        week: weekNum,
        title,
        type: cells.length > 1 ? cells[1] || undefined : undefined,
        duration: cells.length > 2 ? cells[2] || undefined : undefined,
        status,
        url: $row.find('a').first().attr('href') || undefined,
      });
    });
  });

  return lectures;
}

function extractGroupCourse(el: cheerio.Cheerio<Element>): { code: string; title: string } | null {
  const text = el.text().trim();
  const match = text.match(/([A-Z]{2,4}\d{3}[A-Z]?)\s*-?\s*(.+)/i);
  if (match) {
    return {
      code: match[1].toUpperCase(),
      title: match[2].trim(),
    };
  }
  return null;
}

function parseSingleLecture(
  $: cheerio.CheerioAPI,
  card: cheerio.Cheerio<Element>,
  groupCourse: { code: string; title: string } | null,
): Lecture | null {
  const htmlContent = $.html(card);
  const cardText = card.text();

  const courseCode =
    extractField(card, ['[class*="course-code"]', '[class*="course"]']) ||
    groupCourse?.code ||
    extractCodeFromText($('title').text()) ||
    '';

  const courseTitle =
    extractField(card, ['[class*="course-title"]', '[class*="coursename"]']) ||
    groupCourse?.title ||
    '';

  const title =
    extractField(card, ['[class*="title"]', '[class*="heading"]', 'h3', 'h4', 'strong']) || '';

  const weekStr = extractField(card, ['[class*="week"]', '[class*="lesson"]']);
  const week = weekStr ? parseInt(weekStr.match(/\d+/)?.[0] || '', 10) || undefined : undefined;

  const lectureType = extractField(card, ['[class*="type"]', '[class*="format"]']) || undefined;

  const duration = extractField(card, ['[class*="duration"]', '[class*="time"]']) || undefined;

  const url = card.find('a').first().attr('href') || undefined;

  const status = determineLectureStatus(cardText, htmlContent);

  if (!title) return null;

  return {
    courseCode,
    courseTitle,
    week,
    title,
    type: lectureType,
    duration,
    status,
    url,
  };
}

function extractField(card: cheerio.Cheerio<Element>, selectors: string[]): string | null {
  for (const selector of selectors) {
    const el = card.find(selector).first();
    if (el.length > 0) {
      const text = el.text().trim();
      if (text) return text;
    }
  }
  return null;
}

function extractWeekNumber(cells: string[]): number | undefined {
  for (const cell of cells) {
    const match = cell.match(/week\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);
  }
  return undefined;
}

function determineLectureStatus(text: string, html: string): LectureStatus {
  const lowerText = text.toLowerCase();
  const lowerHtml = html.toLowerCase();

  if (lowerText.includes('unwatched') || lowerText.includes('not watched')) {
    return 'unwatched';
  }

  if (
    lowerHtml.includes('watched') ||
    lowerText.includes('watched') ||
    lowerText === 'completed'
  ) {
    return 'watched';
  }

  if (lowerText.includes('new') || lowerHtml.includes('class="new"')) {
    return 'new';
  }

  if (lowerText.includes('pending')) {
    return 'unwatched';
  }

  return 'new';
}
