import type { ExportedSession } from 'vulms-sdk';

export interface StoredUserSession {
  studentId: string;
  exportedSession: ExportedSession;
  createdAt: number;
  lastValidatedAt?: number;
}

export interface JwtPayload {
  sub: string;
}
