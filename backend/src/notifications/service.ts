import type { ActivityDto } from '../types/activities.js';
import type { NotificationCandidate, NotificationStore } from './types.js';
import { InMemoryNotificationStore } from './store.js';
import { generateNotificationCandidates, type EngineResult } from './engine.js';

export class NotificationService {
  private store: NotificationStore;

  constructor(store?: NotificationStore) {
    this.store = store || new InMemoryNotificationStore();
  }

  generateCandidates(activities: ActivityDto[]): EngineResult {
    return generateNotificationCandidates(activities, this.store);
  }

  hasNotification(id: string): boolean {
    return this.store.has(id);
  }

  getStoreSize(): number {
    return this.store.size();
  }

  clearStore(): void {
    this.store.clear();
  }
}

let defaultService: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!defaultService) {
    defaultService = new NotificationService();
  }
  return defaultService;
}
