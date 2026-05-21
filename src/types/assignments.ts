import { z } from 'zod';
import { ActivityStatusSchema } from './common';

export const AssignmentSchema = z.object({
  courseCode: z.string(),
  courseTitle: z.string(),
  title: z.string(),
  lesson: z.string().optional(),
  dueDate: z.date().optional(),
  totalMarks: z.number().optional(),
  status: ActivityStatusSchema,
  submitDate: z.date().optional(),
  fileSize: z.string().optional(),
  obtainedMarks: z.number().optional(),
});

export type Assignment = z.infer<typeof AssignmentSchema>;
