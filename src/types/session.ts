import { z } from 'zod';

export const AspNetWebFormDataSchema = z.object({
  __VIEWSTATE: z.string(),
  __EVENTVALIDATION: z.string(),
  __VIEWSTATEGENERATOR: z.string().optional(),
  __PREVIOUSPAGE: z.string().optional(),
});

export type AspNetWebFormData = z.infer<typeof AspNetWebFormDataSchema>;

export interface SessionState {
  cookies: string;
  isValid: boolean;
  username?: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

export interface ExportedSession {
  username?: string;
  cookies: string;
  createdAt: number;
  exportedAt: number;
  sdkVersion: string;
}

export interface SessionValidationResult {
  valid: boolean;
  reason?: string;
}
