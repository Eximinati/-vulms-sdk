import * as cheerio from 'cheerio';
import type { Assignment } from '../types/assignments';
import { parseVulmsDate } from '../utils/date';
import { buildSelector, buildIdPattern, ASSIGNMENT_CONTRACTS, ASSIGNMENT_LAYOUT, type AssignmentLayout } from './contracts/assignment-contracts';
import { fingerprintHtml, buildConfidence, type ParseConfidence } from '../utils/confidence';
import { noopLogger, type Logger } from '../utils/logger';

export interface ParseAssignmentsOptions {
  courseCode?: string;
}

export interface ParseMetrics {
  layout: AssignmentLayout;
  parser: 'tileRepeater' | 'table' | 'fallback';
  selectorsMatched: number;
  selectorsTotal: number;
  emptyFields: string[];
  htmlLength: number;
  repeaterIndices: number[];
}

export interface ParseAssignmentsResult {
  assignments: Assignment[];
  confidence: ParseConfidence;
  metrics: ParseMetrics;
}

export function parseAssignments(
  html: string,
  debug: Logger = noopLogger,
  options: ParseAssignmentsOptions = {},
): ParseAssignmentsResult {
  const log = debug;
  const $ = cheerio.load(html);

  const fp = fingerprintHtml(html, 'assignments');
  log.debug(`parseAssignments: parsing HTML, length=${html.length}, fingerprint=${fp}`);

  const layout = detectAssignmentLayout($);
  log.debug(`parseAssignments: detected layout="${layout}"`);

  const contract = ASSIGNMENT_CONTRACTS[layout];
  const courseCode = options.courseCode || extractCourseCode($);

  const result = parseWithContract($, log, contract, courseCode, layout, fp);

  log.info(`parseAssignments: ${result.assignments.length} assignments extracted using ${result.metrics.parser} (layout=${layout}, confidence=${result.confidence.confidence})`);
  return result;
}

export function detectAssignmentLayout($: cheerio.CheerioAPI): AssignmentLayout {
  if ($('[id*="MainContent_gvTileRepeaterAssignment_Label3_"]').length > 0) {
    return ASSIGNMENT_LAYOUT.STANDARD;
  }

  if ($('[id*="MainContent_gvTileRepeaterAssignment_Label1_"]').length > 0) {
    return ASSIGNMENT_LAYOUT.PRACTICAL;
  }

  if ($('[id*="MainContent_gvTileRepeaterAssignment_lblTitle_"]').length > 0) {
    return ASSIGNMENT_LAYOUT.LEGACY;
  }

  if ($('[id*="MainContent_gvTileRepeaterAssignment_"]').length > 0) {
    return ASSIGNMENT_LAYOUT.UNKNOWN;
  }

  return ASSIGNMENT_LAYOUT.UNKNOWN;
}

function parseWithContract(
  $: cheerio.CheerioAPI,
  log: Logger,
  contract: (typeof ASSIGNMENT_CONTRACTS)[keyof typeof ASSIGNMENT_CONTRACTS],
  courseCode: string,
  layout: AssignmentLayout,
  fp: string,
): ParseAssignmentsResult {
  const assignments: Assignment[] = [];
  const seen = new Set<string>();
  const warnings: { code: string; message: string }[] = [];
  let skipped = 0;

  const titlePattern = buildIdPattern(contract, 'titleLabel');
  const titleMatches = $(titlePattern);
  log.debug(`parseWithContract: ${titleMatches.length} title elements found (layout=${layout})`);

  const repeaterIndices: number[] = [];

  titleMatches.each((_: number, el) => {
    const id = $(el).attr('id') || '';
    const match = id.match(/_(\d+)$/);
    if (match) repeaterIndices.push(parseInt(match[1]));
  });

  if (repeaterIndices.length === 0) {
    warnings.push({ code: 'NO_TILES', message: `No tile elements found for layout=${layout}` });
    const tableResult = tryParseTable($, log, courseCode, layout, fp);
    return {
      assignments: tableResult.assignments,
      confidence: buildConfidence(0, 0, 0, [{ code: 'NO_TILES', message: `Fallback to table for layout=${layout}` }], fp),
      metrics: {
        layout,
        parser: 'table',
        selectorsMatched: 0,
        selectorsTotal: 0,
        emptyFields: [],
        htmlLength: $.html().length,
        repeaterIndices: [],
      },
    };
  }

  const sortedIndices = Array.from(new Set(repeaterIndices)).sort((a, b) => a - b);
  const totalSelectors = Object.keys(contract.selectors).length;
  let selectorsMatched = 0;

  for (const idx of sortedIndices) {
    const titleEl = $(buildSelector(contract, 'titleLabel', idx));
    const title = titleEl.text().trim();

    if (!title || (contract.skipLabels as readonly string[]).includes(title)) {
      skipped++;
      log.debug(`parseWithContract: skipping idx=${idx} — title="${title}" (skip label or empty)`);
      continue;
    }

    const key = `${courseCode}|${title}`;
    if (seen.has(key)) {
      skipped++;
      log.debug(`parseWithContract: duplicate skipped idx=${idx}: "${title}"`);
      continue;
    }
    seen.add(key);

    selectorsMatched++;

    const lessonEl = $(buildSelector(contract, 'lessonLabel', idx));
    const lesson = lessonEl.text().trim() || undefined;

    const dueDateEl = $(buildSelector(contract, 'dueDateLabel', idx));
    const dueDateStr = dueDateEl.text().trim();
    const dueDate = dueDateStr && dueDateStr !== '-' ? parseVulmsDate(dueDateStr) || undefined : undefined;

    const totalMarksEl = $(buildSelector(contract, 'totalMarksLabel', idx));
    const totalMarks = parseMarks(totalMarksEl.text().trim());

    const submitStatusEl = $(buildSelector(contract, 'submitStatusLabel', idx));
    const submitText = submitStatusEl.text().trim();

    const submitDateEl = $(buildSelector(contract, 'submitDateLabel', idx));
    const submitDateStr = submitDateEl.text().trim();
    const submitDate = submitDateStr && submitDateStr !== '-' ? parseVulmsDate(submitDateStr) || undefined : undefined;

    const status = deriveAssignmentStatus({
      rawStatus: submitText,
      submittedAt: submitDate,
      dueDate,
    });

    const fileSizeEl = $(buildSelector(contract, 'fileSizeLabel', idx));
    const fileSize = fileSizeEl.text().trim() || undefined;

    const resultEl = $(buildSelector(contract, 'obtainedMarksLabel', idx));
    const obtainedMarks = parseMarks(resultEl.text().trim());

    log.debug(`parseWithContract: idx=${idx} title="${title}" status=${status} raw="${submitText}" due="${dueDateStr}" submitted="${submitDateStr}"`);

    assignments.push({
      courseCode,
      courseTitle: '',
      title,
      lesson,
      dueDate,
      totalMarks,
      status,
      submitDate,
      fileSize,
      obtainedMarks,
    });
  }

  log.info(`parseWithContract: extracted ${assignments.length}, skipped ${skipped}, total rows ${sortedIndices.length}`);
  const confidence = buildConfidence(assignments.length, sortedIndices.length, skipped, warnings, fp);

  return {
    assignments,
    confidence,
    metrics: {
      layout,
      parser: 'tileRepeater',
      selectorsMatched,
      selectorsTotal: sortedIndices.length * totalSelectors,
      emptyFields: [],
      htmlLength: $.html().length,
      repeaterIndices: sortedIndices,
    },
  };
}

function tryParseTable(
  $: cheerio.CheerioAPI,
  log: Logger,
  courseCode: string,
  layout: AssignmentLayout,
  fp: string,
): ParseAssignmentsResult {
  const assignments: Assignment[] = [];
  const warnings: { code: string; message: string }[] = [];

  const tables = $('table');
  if (tables.length === 0) {
    warnings.push({ code: 'NO_TABLES', message: 'No tables found in fallback parse' });
    return {
      assignments: [],
      confidence: buildConfidence(0, 0, 0, warnings, fp),
      metrics: { layout, parser: 'table', selectorsMatched: 0, selectorsTotal: 0, emptyFields: [], htmlLength: $.html().length, repeaterIndices: [] },
    };
  }

  let headerCourse: string | null = null;

  tables.each((_, table) => {
    const rows = $(table).find('tr');
    rows.each((_, row) => {
      const $row = $(row);
      if ($row.find('th').length > 0) {
        const thText = $row.text().trim();
        const code = extractCourseCodeFromText(thText);
        if (code) headerCourse = code;
        return;
      }

      const tds = $row.find('td');
      if (tds.length < 2) return;

      const cells: string[] = [];
      tds.each((_, td) => { cells.push($(td).text().trim()); });

      const title = cells[0] || '';
      if (!title || title.includes('Title:')) return;

      const dueDate = cells.length > 1 && cells[1] !== '-' ? parseVulmsDate(cells[1]) || undefined : undefined;
      const totalMarks = cells.length > 2 ? parseMarks(cells[2]) : undefined;
      const rawStatus = cells.length > 3 ? cells[3] : '';
      const status = deriveAssignmentStatus({ rawStatus, dueDate });

      assignments.push({
        courseCode: headerCourse || courseCode,
        courseTitle: '',
        title,
        dueDate,
        totalMarks,
        status,
      });
    });
  });

  log.info(`tryParseTable: extracted ${assignments.length}`);
  return {
    assignments,
    confidence: buildConfidence(assignments.length, assignments.length, 0, warnings, fp),
    metrics: { layout, parser: 'table', selectorsMatched: assignments.length, selectorsTotal: assignments.length, emptyFields: [], htmlLength: $.html().length, repeaterIndices: [] },
  };
}

function parseMarks(text: string): number | undefined {
  const cleaned = text.replace(/,/g, '').trim();
  if (!cleaned || cleaned === '-' || cleaned === '') return undefined;
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

function deriveAssignmentStatus(args: {
  rawStatus?: string;
  submittedAt?: Date | null;
  dueDate?: Date | null;
}): Assignment['status'] {
  const raw = (args.rawStatus || '').toLowerCase().trim();

  if (raw.includes('not submitted')) return 'missed';
  if (raw.includes('not attempted')) return 'missed';
  if (raw.includes('result')) return 'result_declared';
  if (raw.includes('graded')) return 'result_declared';
  if (raw.includes('checked')) return 'result_declared';
  if (raw.includes('missed')) return 'missed';
  if (raw.includes('expired')) return 'missed';
  if (raw.includes('submitted')) return 'submitted';

  if (args.submittedAt) {
    const t = args.submittedAt.getTime();
    if (!Number.isNaN(t)) return 'submitted';
  }

  if (args.dueDate) {
    const t = args.dueDate.getTime();
    if (!Number.isNaN(t)) {
      if (t < Date.now()) return 'missed';
      return 'pending';
    }
  }

  return 'pending';
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

function extractCourseCodeFromText(text: string): string | null {
  const match = text.match(/([A-Z]{2,4}\d{3}[A-Z]?)/i);
  return match ? match[1].toUpperCase() : null;
}