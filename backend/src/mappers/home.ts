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

export function toHomeAssignmentDto(a: Assignment): AssignmentDto {
  return {
    courseCode: a.courseCode,
    courseTitle: a.courseTitle,
    title: a.title,
    lesson: a.lesson,
    dueDate: a.dueDate?.toISOString(),
    status: a.status,
    totalMarks: a.totalMarks,
    obtainedMarks: a.obtainedMarks,
  };
}

export function getRecentAssignments(assignments: Assignment[], limit = 5): Assignment[] {
  return [...assignments]
    .sort((a, b) => {
      const da = a.dueDate?.getTime() ?? 0;
      const db = b.dueDate?.getTime() ?? 0;
      return db - da;
    })
    .slice(0, limit);
}
