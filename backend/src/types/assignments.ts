export interface AssignmentDto {
  courseCode: string;
  courseTitle: string;
  title: string;
  lesson?: string;
  dueDate?: string;
  status: string;
  totalMarks?: number;
  obtainedMarks?: number;
}

export interface AssignmentSummaryDto {
  total: number;
  submitted: number;
  pending: number;
  missed: number;
  resultDeclared: number;
}
