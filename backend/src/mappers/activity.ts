import type { Assignment } from 'vulms-sdk';
import type { Quiz } from 'vulms-sdk';
import type { GDB } from 'vulms-sdk';
import type { ActivityDto, ActivityType } from '../types/activities.js';

function toDateStr(d: Date | string | undefined): string | undefined {
  if (!d) return undefined;
  if (d instanceof Date) return d.toISOString();
  return d;
}

function generateId(type: ActivityType, courseCode: string, title: string, dueDate?: string): string {
  const base = `${type}:${courseCode}:${title}`;
  return dueDate ? `${base}:${dueDate}` : base;
}

export function assignmentToActivity(a: Assignment): ActivityDto {
  const dueDate = toDateStr(a.dueDate);
  return {
    id: generateId('assignment', a.courseCode, a.title, dueDate),
    type: 'assignment',
    courseCode: a.courseCode,
    courseTitle: a.courseTitle,
    title: a.title,
    dueDate,
    status: a.status,
    totalMarks: a.totalMarks,
    obtainedMarks: a.obtainedMarks,
  };
}

export function quizToActivity(q: Quiz): ActivityDto {
  const dueDate = toDateStr(q.endDate);
  return {
    id: generateId('quiz', q.courseCode, q.title, dueDate),
    type: 'quiz',
    courseCode: q.courseCode,
    courseTitle: q.courseTitle,
    title: q.title,
    dueDate,
    status: q.submissionStatus === 'submitted' ? 'submitted' : q.resultStatus === 'declared' ? 'result_declared' : 'pending',
    totalMarks: q.totalMarks,
    obtainedMarks: q.obtainedMarks,
  };
}

export function gdbToActivity(g: GDB): ActivityDto {
  const dueDate = toDateStr(g.dueDate);
  return {
    id: generateId('gdb', g.courseCode, g.title, dueDate),
    type: 'gdb',
    courseCode: g.courseCode,
    courseTitle: g.courseTitle,
    title: g.title,
    dueDate,
    status: g.status,
    totalMarks: g.totalMarks,
    obtainedMarks: g.obtainedMarks,
  };
}

export function toActivitySummaryDto(counts: {
  assignments: number;
  quizzes: number;
  gdbs: number;
}): { assignments: number; quizzes: number; gdbs: number; total: number } {
  return {
    assignments: counts.assignments,
    quizzes: counts.quizzes,
    gdbs: counts.gdbs,
    total: counts.assignments + counts.quizzes + counts.gdbs,
  };
}
