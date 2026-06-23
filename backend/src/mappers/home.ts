import type { Course, Assignment } from 'vulms-sdk';
import type { HomeCourseDto, HomeDashboardDto } from '../types/home.js';
import type { AssignmentDto } from '../types/assignments.js';

export function toHomeCourseDto(c: Course): HomeCourseDto {
  return { code: c.code, title: c.title };
}

export function toHomeDashboardDto(d: {
  courseCode: string;
  hasAssignments?: boolean;
  hasQuizzes?: boolean;
  hasGDBs?: boolean;
  hasLectures?: boolean;
}): HomeDashboardDto {
  return {
    courseCode: d.courseCode,
    hasAssignments: d.hasAssignments ?? false,
    hasQuizzes: d.hasQuizzes ?? false,
    hasGDBs: d.hasGDBs ?? false,
    hasLectures: d.hasLectures ?? false,
  };
}

function toMs(date: Date | string | undefined): number {
  if (!date) return 0;
  if (date instanceof Date) return date.getTime();
  return new Date(date).getTime() || 0;
}

export function toHomeAssignmentDto(a: Assignment): AssignmentDto {
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

export function getRecentAssignments(assignments: Assignment[], limit = 5): Assignment[] {
  return [...assignments]
    .sort((a, b) => toMs(b.dueDate) - toMs(a.dueDate))
    .slice(0, limit);
}
