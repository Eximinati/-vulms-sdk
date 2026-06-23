import type { AssignmentDto, AssignmentSummaryDto } from './assignments.js';

export interface HomeCourseDto {
  code: string;
  title: string;
}

export interface HomeDashboardDto {
  courseCode: string;
  hasAssignments: boolean;
  hasQuizzes: boolean;
  hasGDBs: boolean;
  hasLectures: boolean;
}

export interface HomeAssignmentsDto {
  summary: AssignmentSummaryDto;
  recent: AssignmentDto[];
}

export interface HomeResponseDto {
  meta: { generatedAt: string };
  student: { studentId: string };
  courses: HomeCourseDto[];
  dashboard: HomeDashboardDto[];
  assignments: HomeAssignmentsDto;
}
