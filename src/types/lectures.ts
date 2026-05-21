import { z } from 'zod';

export const LectureStatusSchema = z.enum([
  'new',
  'watched',
  'unwatched',
]);

export type LectureStatus = z.infer<typeof LectureStatusSchema>;

export const LectureSchema = z.object({
  courseCode: z.string(),
  courseTitle: z.string(),
  week: z.number().optional(),
  title: z.string(),
  type: z.string().optional(),
  duration: z.string().optional(),
  status: LectureStatusSchema,
  url: z.string().optional(),
});

export type Lecture = z.infer<typeof LectureSchema>;
