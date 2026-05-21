import { z } from 'zod';

export const DashboardActivityTypeSchema = z.enum(['quiz', 'assignment', 'gdb', 'lecture']);
export type DashboardActivityType = z.infer<typeof DashboardActivityTypeSchema>;

export const DashboardActivityPreviewSchema = z.object({
  type: DashboardActivityTypeSchema,
  title: z.string().optional(),
  isPending: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isUpcoming: z.boolean().optional(),
  dueDate: z.date().optional(),
  courseCode: z.string(),
});
export type DashboardActivityPreview = z.infer<typeof DashboardActivityPreviewSchema>;

export const DashboardCourseSchema = z.object({
  courseCode: z.string(),
  courseTitle: z.string(),
  hasQuizzes: z.boolean().optional(),
  hasAssignments: z.boolean().optional(),
  hasGDBs: z.boolean().optional(),
  hasLectures: z.boolean().optional(),
  quizCount: z.number().optional(),
  assignmentCount: z.number().optional(),
  gdbCount: z.number().optional(),
  lectureCount: z.number().optional(),
  upcomingCount: z.number().optional(),
  pendingCount: z.number().optional(),
  activities: z.array(DashboardActivityPreviewSchema),
});
export type DashboardCourse = z.infer<typeof DashboardCourseSchema>;

export const DashboardMetricsSchema = z.object({
  totalRequests: z.number(),
  dashboardRequests: z.number(),
  moduleRequests: z.number(),
  modulesSkipped: z.number(),
  modulesExecuted: z.number(),
  startTime: z.date(),
  endTime: z.date().optional(),
  durationMs: z.number().optional(),
});
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;

export interface SmartFetchOptions {
  enabled?: boolean;
  skipEmptyCourses?: boolean;
}

export interface DashboardResult {
  courses: DashboardCourse[];
  metrics: DashboardMetrics;
  skippedCourses: string[];
  executedCourses: string[];
}