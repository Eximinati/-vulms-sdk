import { z } from 'zod';

export const GDBStatusSchema = z.enum([
  'pending',
  'submitted',
  'attempted',
  'missed',
  'result_declared',
]);

export type GDBStatus = z.infer<typeof GDBStatusSchema>;

export const GDBSchema = z.object({
  courseCode: z.string(),
  courseTitle: z.string(),
  title: z.string(),
  dueDate: z.date().optional(),
  totalMarks: z.number().optional(),
  obtainedMarks: z.number().optional(),
  status: GDBStatusSchema,
});

export type GDB = z.infer<typeof GDBSchema>;
