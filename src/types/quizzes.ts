import { z } from 'zod';

export const QuizAvailabilityStatusSchema = z.enum(['open', 'closed', 'upcoming', 'unknown']);
export type QuizAvailabilityStatus = z.infer<typeof QuizAvailabilityStatusSchema>;

export const QuizSubmissionStatusSchema = z.enum(['submitted', 'not_submitted', 'unknown']);
export type QuizSubmissionStatus = z.infer<typeof QuizSubmissionStatusSchema>;

export const QuizResultStatusSchema = z.enum(['declared', 'pending', 'unknown']);
export type QuizResultStatus = z.infer<typeof QuizResultStatusSchema>;

export const QuizStatusSchema = z.enum([
  'pending',
  'submitted',
  'attempted',
  'missed',
  'result_declared',
]);
export type QuizStatus = z.infer<typeof QuizStatusSchema>;

export const QuizSchema = z.object({
  courseCode: z.string(),
  courseTitle: z.string(),
  title: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  totalMarks: z.number().optional(),
  obtainedMarks: z.number().optional(),
  availabilityStatus: QuizAvailabilityStatusSchema,
  submissionStatus: QuizSubmissionStatusSchema,
  resultStatus: QuizResultStatusSchema,
  submitDate: z.date().optional(),
});
export type Quiz = z.infer<typeof QuizSchema>;