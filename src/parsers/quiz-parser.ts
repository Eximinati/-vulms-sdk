import * as cheerio from 'cheerio';
import type { Quiz } from '../types/quizzes';
import { parseVulmsDate } from '../utils/date';
import { parseMarks, extractCodeFromText } from '../utils/activity';
import { buildConfidence, fingerprintHtml, type ParseConfidence } from '../utils/confidence';
import { noopLogger, type Logger } from '../utils/logger';

export interface ParseQuizzesOptions {
  courseCode?: string;
}

export function parseQuizzes(
  html: string,
  debug: Logger = noopLogger,
  options: ParseQuizzesOptions = {},
): { quizzes: Quiz[]; confidence: ParseConfidence } {
  const log = debug;
  const $ = cheerio.load(html);

  log.debug(`parseQuizzes: parsing HTML, length=${html.length}`);

  const fp = fingerprintHtml(html, 'quizzes');
  log.debug(`parseQuizzes: fingerprint=${fp}`);

  const primary = tryParseTileRepeater($, log, options.courseCode);
  if (primary.quizzes.length > 0) {
    log.info(`parseQuizzes: ${primary.quizzes.length} from tile repeater (confidence=${primary.confidence.confidence})`);
    return primary;
  }

  const fallback = tryParseTable($, log, options.courseCode);
  if (fallback.quizzes.length > 0) {
    log.info(`parseQuizzes: ${fallback.quizzes.length} from table`);
    return fallback;
  }

  const warnings = [{ code: 'NO_QUIZZES', message: 'No quiz data found in page' }];
  log.warn(`parseQuizzes: no quizzes found`);
  return { quizzes: [], confidence: buildConfidence(0, 0, 0, warnings, fp) };
}

function tryParseTileRepeater(
  $: cheerio.CheerioAPI,
  log: Logger,
  forcedCourseCode?: string,
): { quizzes: Quiz[]; confidence: ParseConfidence } {
  const quizzes: Quiz[] = [];
  const seen = new Set<string>();
  const warnings: { code: string; message: string }[] = [];
  let skipped = 0;

  const courseCode = forcedCourseCode || extractCourseCode($);

  const rowSelector = '[id*="MainContent_gvTileRepeaterQuiz_"]';
  const tileIds = new Set<number>();

  $(rowSelector).each((_: number, el) => {
    const id = $(el).attr('id') || '';
    const match = id.match(/_(\d+)$/);
    if (match) tileIds.add(parseInt(match[1]));
  });

  log.debug(`parseQuizzes: found ${tileIds.size} tile indices`);

  if (tileIds.size === 0) {
    warnings.push({ code: 'NO_TILES', message: 'No gvTileRepeaterQuiz elements found' });
    return {
      quizzes: [],
      confidence: buildConfidence(0, 0, 0, warnings, fingerprintHtml($.html(), 'quizzes')),
    };
  }

  const sortedIndices = Array.from(tileIds).sort((a, b) => a - b);

  for (const idx of sortedIndices) {
    const titleEl = $(`#MainContent_gvTileRepeaterQuiz_lblTitle_${idx}`);
    const title = titleEl.text().trim();
    if (!title || title.includes('Quiz Title:')) {
      skipped++;
      log.debug(`parseQuizzes: skipping idx=${idx} — no title or helper label`);
      continue;
    }

    const key = `${courseCode}|${title}`;
    if (seen.has(key)) {
      log.debug(`parseQuizzes: duplicate skipped idx=${idx}: "${title}"`);
      skipped++;
      continue;
    }
    seen.add(key);

    const startDateStr = $(`#MainContent_gvTileRepeaterQuiz_lblStartDate_${idx}`).text().trim();
    const endDateStr = $(`#MainContent_gvTileRepeaterQuiz_lblEndDate_${idx}`).text().trim();
    const totalMarksStr = $(`#MainContent_gvTileRepeaterQuiz_lblTotalMarks_${idx}`).text().trim();
    const availabilityStr = $(`#MainContent_gvTileRepeaterQuiz_lblStatus_${idx}`).text().trim();
    const submissionEl = $(`#MainContent_gvTileRepeaterQuiz_lblSubmitted_${idx}`);
    const submissionHtml = submissionEl.html() || '';
    const submissionStr = submissionEl.text().trim();
    const resultStr = $(`#MainContent_gvTileRepeaterQuiz_lblGetMarks_${idx}`).text().trim();

    const startDate = startDateStr && startDateStr !== '-' && startDateStr !== '' ? parseVulmsDate(startDateStr) || undefined : undefined;
    const endDate = endDateStr && endDateStr !== '-' && endDateStr !== '' ? parseVulmsDate(endDateStr) || undefined : undefined;
    const totalMarks = totalMarksStr ? parseMarks(totalMarksStr) : undefined;

    const availabilityStatus = normalizeAvailability(availabilityStr);
    const { submissionStatus, submitDate } = normalizeSubmissionWithDate(submissionStr, submissionHtml);
    const resultStatus = normalizeResult(resultStr);
    const obtainedMarks = resultStatus === 'declared' && resultStr ? parseMarks(resultStr) : undefined;

    log.debug(`parseQuizzes: idx=${idx} title="${title}" avail=${availabilityStatus} sub=${submissionStatus} result=${resultStatus}`);

    quizzes.push({
      courseCode,
      courseTitle: '',
      title,
      startDate,
      endDate,
      totalMarks,
      obtainedMarks,
      availabilityStatus,
      submissionStatus,
      resultStatus,
      submitDate,
    });
  }

  log.info(`parseQuizzes: extracted ${quizzes.length}, skipped ${skipped}, total rows ${sortedIndices.length}`);
  const confidence = buildConfidence(quizzes.length, sortedIndices.length, skipped, warnings, fingerprintHtml($.html(), 'quizzes'));
  return { quizzes, confidence };
}

function tryParseTable(
  $: cheerio.CheerioAPI,
  log: Logger,
  forcedCourseCode?: string,
): { quizzes: Quiz[]; confidence: ParseConfidence } {
  const quizzes: Quiz[] = [];
  const seen = new Set<string>();
  const warnings: { code: string; message: string }[] = [];
  let skipped = 0;

  const courseCode = forcedCourseCode || extractCourseCode($);
  const tables = $('table');
  if (tables.length === 0) {
    warnings.push({ code: 'NO_TABLES', message: 'No tables found in fallback parse' });
    return { quizzes: [], confidence: buildConfidence(0, 0, 0, warnings, fingerprintHtml($.html(), 'quizzes')) };
  }

  let headerCourse: string | null = null;

  tables.each((_, table) => {
    const rows = $(table).find('tr');
    rows.each((_, row) => {
      const $row = $(row);
      if ($row.find('th').length > 0) {
        const code = extractCodeFromText($row.text().trim());
        if (code) headerCourse = code;
        return;
      }

      const tds = $row.find('td');
      if (tds.length < 2) return;

      const cells: string[] = [];
      tds.each((_, td) => { cells.push($(td).text().trim()); });

      const title = cells[0] || '';
      if (!title || title.includes('Quiz Title:')) {
        skipped++;
        return;
      }

      const code = headerCourse || courseCode;
      const key = `${code}|${title}`;
      if (seen.has(key)) {
        skipped++;
        return;
      }
      seen.add(key);

      const startDateStr = cells.length > 1 ? cells[1] : '';
      const endDateStr = cells.length > 2 ? cells[2] : '';
      const totalMarksStr = cells.length > 3 ? cells[3] : '';

      quizzes.push({
        courseCode: code,
        courseTitle: '',
        title,
        startDate: startDateStr && startDateStr !== '-' ? parseVulmsDate(startDateStr) || undefined : undefined,
        endDate: endDateStr && endDateStr !== '-' ? parseVulmsDate(endDateStr) || undefined : undefined,
        totalMarks: totalMarksStr ? parseMarks(totalMarksStr) : undefined,
        availabilityStatus: 'unknown',
        submissionStatus: 'unknown',
        resultStatus: 'unknown',
      });
    });
  });

  const fp = fingerprintHtml($.html(), 'quizzes-table');
  log.info(`parseQuizzes: table fallback extracted ${quizzes.length} (skipped ${skipped})`);
  return { quizzes, confidence: buildConfidence(quizzes.length, quizzes.length + skipped, skipped, warnings, fp) };
}

function extractCourseCode($: cheerio.CheerioAPI): string {
  const subheader = $('h3.m-subheader__title').text();
  const match = subheader.match(/([A-Z]{2,4}\d{3}[A-Z]?)/i);
  if (match) return match[1].toUpperCase();

  const titleText = $('title').text();
  const titleMatch = titleText.match(/([A-Z]{2,4}\d{3}[A-Z]?)/i);
  if (titleMatch) return titleMatch[1].toUpperCase();

  return '';
}

function normalizeAvailability(text: string): Quiz['availabilityStatus'] {
  const lower = text.toLowerCase().trim();
  if (lower === 'open') return 'open';
  if (lower === 'closed') return 'closed';
  if (!lower || lower === '-' || lower === 'upcoming') return 'upcoming';
  return 'unknown';
}

function normalizeSubmissionWithDate(text: string, html: string): { submissionStatus: Quiz['submissionStatus']; submitDate: Date | undefined } {
  const lower = text.toLowerCase().trim();
  let status: Quiz['submissionStatus'] = 'not_submitted';
  let submitDate: Date | undefined = undefined;

  if (lower === 'not submitted' || lower === 'not attempted') {
    status = 'not_submitted';
  } else if (lower.includes('result declared')) {
    status = 'submitted';
    const dateMatch = html.match(/Submit Date:\s*([^<]+)/i);
    if (dateMatch) {
      const dateStr = dateMatch[1].trim();
      submitDate = parseVulmsDate(dateStr) || undefined;
    }
  } else if (lower === 'submitted' || lower === 'attempted') {
    status = 'submitted';
    const dateMatch = html.match(/Submit Date:\s*([^<]+)/i);
    if (dateMatch) {
      const dateStr = dateMatch[1].trim();
      submitDate = parseVulmsDate(dateStr) || undefined;
    }
  } else if (lower.includes('submitted') || lower.includes('attempted')) {
    status = 'submitted';
    const dateMatch = html.match(/Submit Date:\s*([^<]+)/i);
    if (dateMatch) {
      const dateStr = dateMatch[1].trim();
      submitDate = parseVulmsDate(dateStr) || undefined;
    }
  } else if (lower === '-' || lower === '') {
    status = 'not_submitted';
  } else {
    status = 'unknown';
  }

  return { submissionStatus: status, submitDate };
}

function normalizeResult(text: string): Quiz['resultStatus'] {
  const lower = text.toLowerCase().trim();
  if (lower && lower !== '-' && lower !== '' && lower !== 'pending') return 'declared';
  return 'pending';
}