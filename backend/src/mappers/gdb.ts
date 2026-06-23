import type { GDB } from 'vulms-sdk';
import type { GdbDto, GdbSummaryDto } from '../types/gdbs.js';

function toDateStr(d: Date | string | undefined): string | undefined {
  if (!d) return undefined;
  if (d instanceof Date) return d.toISOString();
  return d;
}

export function toGdbDto(g: GDB): GdbDto {
  return {
    courseCode: g.courseCode,
    courseTitle: g.courseTitle,
    title: g.title,
    dueDate: toDateStr(g.dueDate),
    totalMarks: g.totalMarks,
    obtainedMarks: g.obtainedMarks,
    status: g.status,
  };
}

export function toGdbSummaryDto(summary: {
  total: number;
  submitted: number;
  pending: number;
  missed: number;
  resultDeclared: number;
}): GdbSummaryDto {
  return {
    total: summary.total,
    submitted: summary.submitted,
    pending: summary.pending,
    missed: summary.missed,
    resultDeclared: summary.resultDeclared,
  };
}
