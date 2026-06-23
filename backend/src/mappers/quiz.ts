import type { Quiz } from 'vulms-sdk';
import type { QuizDto, QuizSummaryDto } from '../types/quizzes.js';

function toDateStr(d: Date | string | undefined): string | undefined {
  if (!d) return undefined;
  if (d instanceof Date) return d.toISOString();
  return d;
}

export function toQuizDto(q: Quiz): QuizDto {
  return {
    courseCode: q.courseCode,
    courseTitle: q.courseTitle,
    title: q.title,
    startDate: toDateStr(q.startDate),
    endDate: toDateStr(q.endDate),
    totalMarks: q.totalMarks,
    obtainedMarks: q.obtainedMarks,
    availabilityStatus: q.availabilityStatus,
    submissionStatus: q.submissionStatus,
    resultStatus: q.resultStatus,
    submitDate: toDateStr(q.submitDate),
  };
}

export function toQuizSummaryDto(summary: {
  total: number;
  submitted: number;
  pending: number;
  open: number;
  closed: number;
  resultDeclared: number;
}): QuizSummaryDto {
  return {
    total: summary.total,
    submitted: summary.submitted,
    pending: summary.pending,
    open: summary.open,
    closed: summary.closed,
    resultDeclared: summary.resultDeclared,
  };
}
