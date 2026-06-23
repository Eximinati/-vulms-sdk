export type NotificationType =
  | 'assignment_due'
  | 'quiz_open'
  | 'quiz_upcoming'
  | 'gdb_due'
  | 'result_declared';

export interface NotificationCandidate {
  id: string;
  type: NotificationType;
  activityId: string;
  courseCode: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface NotificationStore {
  has(id: string): boolean;
  set(id: string): void;
  clear(): void;
  size(): number;
}
