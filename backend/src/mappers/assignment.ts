import type { Assignment } from 'vulms-sdk';
import type { AssignmentDto, AssignmentSummaryDto } from '../types/assignments.js';

export function toAssignmentDto(a: Assignment): AssignmentDto {
  return {
    courseCode: a.courseCode,
    courseTitle: a.courseTitle,
    title: a.title,
    lesson: a.lesson,
    dueDate: a.dueDate instanceof Date ? a.dueDate.toISOString() : typeof a.dueDate === 'string' ? a.dueDate : undefined,
    status: a.status,
    totalMarks: a.totalMarks,
    obtainedMarks: a.obtainedMarks,
  };
}

export function toAssignmentSummaryDto(summary: {
  total: number;
  submitted: number;
  pending: number;
  missed: number;
  resultDeclared: number;
}): AssignmentSummaryDto {
  return {
    total: summary.total,
    submitted: summary.submitted,
    pending: summary.pending,
    missed: summary.missed,
    resultDeclared: summary.resultDeclared,
  };
}
