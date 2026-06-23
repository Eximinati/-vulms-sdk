import { z } from 'zod';

export const LoginRequestSchema = z.object({
  studentId: z.string().min(1, 'studentId is required'),
  password: z.string().min(1, 'password is required'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
