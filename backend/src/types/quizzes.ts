export interface QuizDto {
  courseCode: string;
  courseTitle: string;
  title: string;
  startDate?: string;
  endDate?: string;
  totalMarks?: number;
  obtainedMarks?: number;
  availabilityStatus: 'open' | 'closed' | 'upcoming' | 'unknown';
  submissionStatus: 'submitted' | 'not_submitted' | 'unknown';
  resultStatus: 'declared' | 'pending' | 'unknown';
  submitDate?: string;
}

export interface QuizSummaryDto {
  total: number;
  submitted: number;
  pending: number;
  open: number;
  closed: number;
  resultDeclared: number;
}
