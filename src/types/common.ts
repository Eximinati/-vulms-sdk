import { z } from 'zod';

export const ActivityStatusSchema = z.enum([
  'pending',
  'submitted',
  'attempted',
  'missed',
  'result_declared',
]);

export type ActivityStatus = z.infer<typeof ActivityStatusSchema>;
