import { z } from 'zod';

export const CourseSchema = z.object({
  code: z.string(),
  title: z.string(),
});

export type Course = z.infer<typeof CourseSchema>;
