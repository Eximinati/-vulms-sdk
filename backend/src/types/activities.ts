export type ActivityType = 'assignment' | 'quiz' | 'gdb';

export interface ActivityDto {
  id: string;
  type: ActivityType;
  courseCode: string;
  courseTitle: string;
  title: string;
  dueDate?: string;
  status: string;
  totalMarks?: number;
  obtainedMarks?: number;
}

export interface ActivitySummaryDto {
  assignments: number;
  quizzes: number;
  gdbs: number;
  total: number;
}
