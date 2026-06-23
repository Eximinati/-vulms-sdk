export interface GdbDto {
  courseCode: string;
  courseTitle: string;
  title: string;
  dueDate?: string;
  totalMarks?: number;
  obtainedMarks?: number;
  status: 'pending' | 'submitted' | 'attempted' | 'missed' | 'result_declared';
}

export interface GdbSummaryDto {
  total: number;
  submitted: number;
  pending: number;
  missed: number;
  resultDeclared: number;
}
