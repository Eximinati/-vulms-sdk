export type ActivityType = 'assignment' | 'quiz' | 'gdb' | 'lecture';

export interface UnifiedActivity {
  type: ActivityType;
  courseCode: string;
  courseTitle: string;
  title: string;
  dueDate?: Date;
  totalMarks?: number;
  obtainedMarks?: number;
  status: 'pending' | 'submitted' | 'missed' | 'result_declared';
}

export interface ActivityAggregate {
  pending: UnifiedActivity[];
  missed: UnifiedActivity[];
  submitted: UnifiedActivity[];
  resultDeclared: UnifiedActivity[];
}
