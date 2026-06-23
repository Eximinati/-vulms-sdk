import type { StoredUserSession } from '../types/auth.js';

export class SessionStore {
  private store = new Map<string, StoredUserSession>();

  set(studentId: string, session: StoredUserSession): void {
    this.store.set(studentId, session);
  }

  get(studentId: string): StoredUserSession | undefined {
    return this.store.get(studentId);
  }

  delete(studentId: string): boolean {
    return this.store.delete(studentId);
  }

  has(studentId: string): boolean {
    return this.store.has(studentId);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

export const sessionStore = new SessionStore();
