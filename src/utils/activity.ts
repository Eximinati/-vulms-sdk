import type { ActivityStatus } from '../types/common';
import type {
  UnifiedActivity,
  ActivityAggregate,
  ActivityType,
} from '../types/activities';
import type { Assignment } from '../types/assignments';
import type { Quiz } from '../types/quizzes';
import type { GDB } from '../types/gdb';
import type { Lecture } from '../types/lectures';

const RESULT_KEYWORDS = ['result', 'marked', 'graded', 'result declared'] as const;
const SUBMITTED_KEYWORDS = ['submitted', 'submission date', 'submit-date'] as const;
const ATTEMPTED_KEYWORDS = ['attempted'] as const;
const MISSED_KEYWORDS = ['missed', 'overdue', 'late', 'not submitted', 'not attempted'] as const;

const MARKS_REGEX = /(\d+(?:\.\d+)?)/;

export function normalizeStatus(text: string, html?: string): ActivityStatus {
  const lowerText = text.toLowerCase().trim();
  const lowerHtml = html?.toLowerCase() || '';
  const combined = lowerText + ' ' + lowerHtml;

  if (matchesAny(combined, RESULT_KEYWORDS)) return 'result_declared';
  if (matchesAny(combined, ['not submitted', 'not attempted'])) return 'missed';
  if (matchesAny(combined, SUBMITTED_KEYWORDS)) return 'submitted';
  if (matchesAny(combined, ATTEMPTED_KEYWORDS)) return 'attempted';
  if (matchesAny(combined, MISSED_KEYWORDS)) return 'missed';

  return 'pending';
}

function matchesAny(text: string, keywords: readonly string[]): boolean {
  return keywords.some((kw) => text.includes(kw));
}

export function parseMarks(text: string): number | undefined {
  const match = text.match(MARKS_REGEX);
  return match ? parseFloat(match[1]) : undefined;
}

export function parseTotalAndObtained(text: string): {
  total?: number;
  obtained?: number;
} {
  const fractionMatch = text.match(
    /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/,
  );
  if (fractionMatch) {
    return {
      obtained: parseFloat(fractionMatch[1]),
      total: parseFloat(fractionMatch[2]),
    };
  }
  return {};
}

export function parseObtainedMarks(text: string): number | undefined {
  const { obtained } = parseTotalAndObtained(text);
  if (obtained !== undefined) return obtained;
  return parseMarks(text);
}

export function extractCodeFromText(text: string): string | null {
  const match = text.match(/([A-Z]{2,4}\d{3}[A-Z]?)/i);
  return match ? match[1].toUpperCase() : null;
}

export function toUnifiedActivity(
  item: Assignment | Quiz | GDB | Lecture,
  type: ActivityType,
): UnifiedActivity {
  const base = {
    type,
    courseCode: item.courseCode,
    courseTitle: item.courseTitle,
    title: item.title,
    dueDate: undefined as Date | undefined,
    totalMarks: undefined as number | undefined,
    obtainedMarks: undefined as number | undefined,
  };

  if ('dueDate' in item) {
    base.dueDate = item.dueDate;
  }
  if ('endDate' in item) {
    base.dueDate = (item as { endDate?: Date }).endDate;
  }
  if ('totalMarks' in item) {
    base.totalMarks = item.totalMarks;
  }
  if ('obtainedMarks' in item) {
    base.obtainedMarks = item.obtainedMarks;
  }

  let status: UnifiedActivity['status'] = 'pending';

  if (type === 'quiz' && 'resultStatus' in item) {
    const q = item as Quiz;
    if (q.resultStatus === 'declared') status = 'result_declared';
    else if (q.submissionStatus === 'submitted') status = 'submitted';
    else if (q.availabilityStatus === 'open') status = 'pending';
    else if (q.availabilityStatus === 'closed' && q.submissionStatus === 'not_submitted') status = 'missed';
    else if (q.availabilityStatus === 'upcoming') status = 'pending';
  } else {
    const rawStatus = (item as Record<string, unknown>).status as string;
    if (rawStatus === 'missed') status = 'missed';
    else if (rawStatus === 'result_declared') status = 'result_declared';
    else if (rawStatus === 'submitted') status = 'submitted';
    else if (rawStatus === 'attempted') status = 'submitted';
    else if (rawStatus === 'watched') status = 'submitted';
    else if (rawStatus === 'pending' || rawStatus === 'new' || rawStatus === 'unwatched') status = 'pending';
  }

  return { ...base, status };
}

export function buildAggregate(activities: UnifiedActivity[]): ActivityAggregate {
  const agg: ActivityAggregate = {
    pending: [],
    missed: [],
    submitted: [],
    resultDeclared: [],
  };

  for (const a of activities) {
    switch (a.status) {
      case 'pending':
        agg.pending.push(a);
        break;
      case 'missed':
        agg.missed.push(a);
        break;
      case 'submitted':
        agg.submitted.push(a);
        break;
      case 'result_declared':
        agg.resultDeclared.push(a);
        break;
    }
  }

  return agg;
}
