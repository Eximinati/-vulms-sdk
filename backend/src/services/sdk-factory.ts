import { VulmsSDK, type ExportedSession, type SessionValidationResult } from 'vulms-sdk';
import { sessionStore } from './session-store.js';

export interface AuthenticatedSdk {
  sdk: VulmsSDK;
  studentId: string;
  validation: SessionValidationResult;
}

export async function getAuthenticatedSdk(studentId: string): Promise<AuthenticatedSdk> {
  const stored = sessionStore.get(studentId);
  if (!stored) {
    throw new SessionMissingError(studentId);
  }

  const t0 = Date.now();
  const sdk = new VulmsSDK();
  await sdk.importSession(stored.exportedSession);
  const t1 = Date.now();
  console.log(`[PERF] importSession: ${t1 - t0}ms`);

  const v0 = Date.now();
  const validation = await sdk.validateImportedSession();
  const v1 = Date.now();
  console.log(`[PERF] validateSession: ${v1 - v0}ms`);

  if (!validation.valid) {
    throw new SessionInvalidError(studentId, validation.reason);
  }

  return { sdk, studentId, validation };
}

export class SessionMissingError extends Error {
  constructor(studentId: string) {
    super(`No session found for ${studentId}`);
    this.name = 'SessionMissingError';
  }
}

export class SessionInvalidError extends Error {
  constructor(studentId: string, reason?: string) {
    super(`Session invalid for ${studentId}: ${reason || 'unknown'}`);
    this.name = 'SessionInvalidError';
  }
}
