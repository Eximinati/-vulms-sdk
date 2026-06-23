import type { NotificationStore } from './types.js';

export class InMemoryNotificationStore implements NotificationStore {
  private sent: Set<string> = new Set();

  has(id: string): boolean {
    return this.sent.has(id);
  }

  set(id: string): void {
    this.sent.add(id);
  }

  clear(): void {
    this.sent.clear();
  }

  size(): number {
    return this.sent.size;
  }
}
