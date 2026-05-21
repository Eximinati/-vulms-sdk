import * as cheerio from 'cheerio';
import type { GDB } from '../types/gdb';
import { parseVulmsDate } from '../utils/date';
import { normalizeStatus, parseMarks, extractCodeFromText } from '../utils/activity';
import { noopLogger, type Logger } from '../utils/logger';

export function parseGDBs(html: string, debug: Logger = noopLogger): GDB[] {
  const log = debug;
  const $ = cheerio.load(html);
  const gdbs: GDB[] = [];

  log.debug(`parseGDBs: parsing HTML, length=${html.length}`);

  const tileGDBs = tryParseTileRepeater($, log);
  if (tileGDBs.length > 0) {
    log.info(`parseGDBs: ${tileGDBs.length} from tile repeater`);
    return tileGDBs;
  }

  const classGDBs = tryParseClassBased($, log);
  if (classGDBs.length > 0) {
    log.info(`parseGDBs: ${classGDBs.length} from class-based`);
    return classGDBs;
  }

  const tableGDBs = tryParseTable($);
  if (tableGDBs.length > 0) {
    log.info(`parseGDBs: ${tableGDBs.length} from table`);
    return tableGDBs;
  }

  log.info(`parseGDBs: ${gdbs.length} GDBs extracted`);
  return gdbs;
}

function tryParseTileRepeater($: cheerio.CheerioAPI, log: Logger): GDB[] {
  const gdbs: GDB[] = [];
  const courseCode = extractCourseCode($);

  const panelSelector = '[id^="MainContent_gvTileRepeaterGDB_pnl_"]';
  const panelIds = new Set<number>();

  $(panelSelector).each((_: number, el) => {
    const id = $(el).attr('id') || '';
    const match = id.match(/_(\d+)$/);
    if (match) panelIds.add(parseInt(match[1]));
  });

  log.debug(`parseGDBs: found ${panelIds.size} tile panel indices`);

  if (panelIds.size === 0) {
    log.debug(`parseGDBs: no tile repeater panels found`);
    return gdbs;
  }

  const sortedIndices = Array.from(panelIds).sort((a, b) => a - b);

  for (const idx of sortedIndices) {
    const titleEl = $(`#MainContent_gvTileRepeaterGDB_lblTitle_${idx}`);
    const title = titleEl.text().trim();

    if (!title || title.includes('GDB Title:') || title.includes('Title:')) {
      log.debug(`parseGDBs: skipping idx=${idx} — no title or helper label`);
      continue;
    }

    const totalMarksEl = $(`#MainContent_gvTileRepeaterGDB_Label9_${idx}`);
    const totalMarksStr = totalMarksEl.text().trim();
    const totalMarks = totalMarksStr && totalMarksStr !== '-' ? parseMarks(totalMarksStr) : undefined;

    const endDateEl = $(`#MainContent_gvTileRepeaterGDB_Label3_${idx}`);
    const endDateStr = endDateEl.text().trim();
    const dueDate = endDateStr && endDateStr !== '-' ? parseVulmsDate(endDateStr) || undefined : undefined;

    const statusEl = $(`#MainContent_gvTileRepeaterGDB_lblStatus_${idx}`);
    const statusStr = statusEl.text().trim();

    const submissionEl = $(`#MainContent_gvTileRepeaterGDB_lblSubmissionStatus_${idx}`);
    const submissionStr = submissionEl.text().trim();

    const status = normalizeGDBStatus(statusStr, submissionStr);

    log.debug(`parseGDBs: idx=${idx} title="${title}" status=${status}`);

    gdbs.push({
      courseCode,
      courseTitle: '',
      title,
      dueDate,
      totalMarks,
      obtainedMarks: undefined,
      status,
    });
  }

  log.info(`parseGDBs: extracted ${gdbs.length} from tile repeater`);
  return gdbs;
}

function tryParseClassBased($: cheerio.CheerioAPI, log: Logger): GDB[] {
  const gdbs: GDB[] = [];

  const candidates = $(
    'h1, h2, h3, h4, th, .gdb-card, .stu-gdb-box, [class*="gdb"]',
  ).filter((_, el) => el.type === 'tag');

  log.debug(`parseGDBs: ${candidates.length} candidate elements`);

  let currentGroup: { code: string; title: string } | null = null;

  candidates.each((_, rawEl) => {
    const el = rawEl as unknown as { tagName: string };
    const $el = $(rawEl);
    const tag = el.tagName.toLowerCase();

    if (['h1', 'h2', 'h3', 'h4', 'th'].includes(tag)) {
      const text = $el.text().trim();
      const match = text.match(/([A-Z]{2,4}\d{3}[A-Z]?)\s*-?\s*(.+)/i);
      if (match) {
        currentGroup = { code: match[1].toUpperCase(), title: match[2].trim() };
        log.debug(`parseGDBs: course group=${currentGroup.code}`);
      }
      return;
    }

    const cardText = $el.text();
    if (!cardText.trim()) return;

    const titleEl = $el.find('[class*="title"]').first();
    const title = titleEl.length > 0 ? titleEl.text().trim() : $el.find('div').first().text().trim();

    if (!title || title.includes('Title:')) return;

    const dueDateEl = $el.find('[class*="due"]').first();
    const dueDateStr = dueDateEl.length > 0 ? dueDateEl.text().trim() : '';
    const dueDate = dueDateStr ? parseVulmsDate(dueDateStr) || undefined : undefined;

    const marksEl = $el.find('[class*="marks"]').first();
    const marksStr = marksEl.length > 0 ? marksEl.text().trim() : '';
    const totalMarks = marksStr && !marksStr.includes('obtained') ? parseMarks(marksStr) : undefined;

    const obtainedMarksEl = $el.find('[class*="marks-obtained"]').first();
    const obtainedMarksStr = obtainedMarksEl.length > 0 ? obtainedMarksEl.text().trim() : '';
    const obtainedMarks = obtainedMarksStr ? parseMarks(obtainedMarksStr) : undefined;

    const status = normalizeStatus(cardText) as GDB['status'];

    gdbs.push({
      courseCode: currentGroup?.code || '',
      courseTitle: currentGroup?.title || '',
      title,
      dueDate,
      totalMarks,
      obtainedMarks,
      status,
    });
  });

  return gdbs;
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

function normalizeGDBStatus(statusStr: string, submissionStr: string): GDB['status'] {
  const statusLower = statusStr.toLowerCase().trim();
  const subLower = submissionStr.toLowerCase().trim();

  if (subLower.includes('submitted') || subLower.includes('attempted')) {
    return 'submitted';
  }
  if (subLower.includes('result declared') || subLower.includes('graded')) {
    return 'result_declared';
  }
  if (statusLower === 'closed' || statusLower === 'expired') {
    return 'missed';
  }
  if (statusLower === 'open') {
    return 'pending';
  }
  if (statusLower === '-' || statusLower === '' || !statusLower) {
    return 'pending';
  }

  return normalizeStatus(statusStr) as GDB['status'];
}

function tryParseTable($: cheerio.CheerioAPI): GDB[] {
  const gdbs: GDB[] = [];
  const tables = $('table');
  if (tables.length === 0) return gdbs;

  tables.each((_, table) => {
    const rows = $(table).find('tr');
    if (rows.length < 2) return;

    let headerCourse: string | null = null;

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

      gdbs.push({
        courseCode: headerCourse || '',
        courseTitle: '',
        title,
        dueDate: cells.length > 2 ? parseVulmsDate(cells[2]) || undefined : undefined,
        totalMarks: undefined,
        obtainedMarks: undefined,
        status: normalizeStatus(title + ' ' + cells.slice(1).join(' ')) as GDB['status'],
      });
    });
  });

  return gdbs;
}