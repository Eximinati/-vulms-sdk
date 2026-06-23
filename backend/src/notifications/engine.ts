import type { ActivityDto } from '../types/activities.js';
import type { NotificationCandidate, NotificationStore } from './types.js';
import { allRules } from './rules.js';

export interface EngineResult {
  candidates: NotificationCandidate[];
  newCount: number;
  skippedCount: number;
}

export function generateNotificationCandidates(
  activities: ActivityDto[],
  store: NotificationStore,
): EngineResult {
  const candidates: NotificationCandidate[] = [];
  let skippedCount = 0;

  for (const activity of activities) {
    for (const rule of allRules) {
      const candidate = rule(activity);
      if (!candidate) continue;

      if (store.has(candidate.id)) {
        skippedCount++;
        continue;
      }

      store.set(candidate.id);
      candidates.push(candidate);
    }
  }

  return {
    candidates,
    newCount: candidates.length,
    skippedCount,
  };
}
