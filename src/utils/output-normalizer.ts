export interface NormalizedOutput {
  normalized: unknown;
  metadata: {
    itemCount: number;
    courses: string[];
    activityTypes: string[];
    hasDynamicContent: boolean;
  };
}

const DYNAMIC_KEYS = new Set([
  'timestamp', 'createdAt', 'updatedAt', 'modifiedAt', 'submittedAt',
  'dueDate', 'date', 'startedAt', 'endedAt', 'publishedAt',
  'traceId', 'requestId', 'sessionId', 'id', '_id', 'correlationId',
  'duration', 'elapsed', 'elapsedMs', 'timeMs', 'durationMs',
  'memoryUsage', 'memoryUsageMb', 'heapUsed', 'rss',
  'cacheHit', 'cacheMiss', 'cacheHits', 'cacheMisses',
  'skippedTraversals', 'skippedCount', 'requestsSaved', 'requestCount',
  'retryCount', 'retries', 'redirectCount',
  'viewStateSize', 'eventValidationSize',
  'validationState', 'failureType', 'success',
  'operation', 'module', 'courseCode',
]);

const DYNAMIC_PATTERNS = [
  /timestamp/i, /createdAt/i, /updatedAt/i, /modifiedAt/i, /submittedAt/i,
  /dueDate/i, /startedAt/i, /endedAt/i, /publishedAt/i,
  /traceId/i, /requestId/i, /sessionId/i, /correlationId/i,
  /duration/i, /elapsed/i, /timeMs/i, /memoryUsage/i,
  /cacheHit/i, /skipped/i, /retry/i, /redirect/i,
  /viewState/i, /eventValidation/i, /validation/i, /failure/i,
];

export function normalizeOutput(output: unknown, options: {
  stripTimestamps?: boolean;
  stripIds?: boolean;
  sortArrays?: boolean;
} = {}): NormalizedOutput {
  const opts = { stripTimestamps: true, stripIds: true, sortArrays: true, ...options };

  const normalized = deepNormalize(output, opts);

  const courses = new Set<string>();
  const activityTypes = new Set<string>();
  let hasDynamicContent = false;

  collectMetadata(normalized, courses, activityTypes, () => {
    hasDynamicContent = true;
  });

  return {
    normalized,
    metadata: {
      itemCount: countItems(normalized),
      courses: Array.from(courses).sort(),
      activityTypes: Array.from(activityTypes).sort(),
      hasDynamicContent,
    },
  };
}

function deepNormalize(value: unknown, opts: { stripTimestamps: boolean; stripIds: boolean; sortArrays: boolean }): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    if (opts.stripTimestamps && isTimestamp(value)) return '[DATE]';
    return value;
  }
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    const mapped = value.map(item => deepNormalize(item, opts));
    return opts.sortArrays ? sortArray(mapped) : mapped;
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      const val = obj[key];
      if (shouldStripKey(key)) {
        continue;
      }
      if (opts.stripTimestamps && isTimestampKey(key)) {
        result[key] = '[DATE]';
      } else if (opts.stripIds && isIdKey(key)) {
        result[key] = '[ID]';
      } else {
        result[key] = deepNormalize(val, opts);
      }
    }

    return result;
  }

  return value;
}

function shouldStripKey(key: string): boolean {
  const lower = key.toLowerCase();
  if (DYNAMIC_KEYS.has(lower)) return true;
  for (const pattern of DYNAMIC_PATTERNS) {
    if (pattern.test(key)) return true;
  }
  return false;
}

function isTimestamp(value: string): boolean {
  const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  return isoPattern.test(value) || /^\d{10,13}$/.test(value);
}

function isTimestampKey(key: string): boolean {
  return ['timestamp', 'createdAt', 'updatedAt', 'modifiedAt', 'submittedAt', 'dueDate', 'startedAt', 'endedAt'].includes(key.toLowerCase());
}

function isIdKey(key: string): boolean {
  return ['id', '_id', 'traceId', 'requestId', 'sessionId', 'correlationId'].includes(key.toLowerCase());
}

function sortArray(arr: unknown[]): unknown[] {
  return arr.sort((a, b) => {
    const aStr = JSON.stringify(a);
    const bStr = JSON.stringify(b);
    return aStr.localeCompare(bStr);
  });
}

function collectMetadata(
  obj: unknown,
  courses: Set<string>,
  activityTypes: Set<string>,
  onDynamicKey: (key: string) => void,
): void {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      collectMetadata(item, courses, activityTypes, onDynamicKey);
    }
    return;
  }

  const record = obj as Record<string, unknown>;

  if (record.courseCode && typeof record.courseCode === 'string') {
    courses.add(record.courseCode);
  }

  if (record.type && typeof record.type === 'string') {
    activityTypes.add(record.type);
  }

  if (record.status && typeof record.status === 'string') {
    activityTypes.add(record.status);
  }

  for (const key of Object.keys(record)) {
    if (shouldStripKey(key)) {
      onDynamicKey(key);
    }
    if (typeof record[key] === 'object' && record[key] !== null) {
      collectMetadata(record[key], courses, activityTypes, onDynamicKey);
    }
  }
}

function countItems(obj: unknown): number {
  if (Array.isArray(obj)) return obj.length;
  if (obj && typeof obj === 'object') {
    const record = obj as Record<string, unknown>;
    if (record.courses && Array.isArray(record.courses)) {
      let total = 0;
      for (const key of Object.keys(record)) {
        if (Array.isArray(record[key])) {
          total += (record[key] as unknown[]).length;
        }
      }
      return total;
    }
    return 1;
  }
  return 0;
}

export function areSemanticallyEqual(a: unknown, b: unknown, options: { stripTimestamps?: boolean; stripIds?: boolean } = {}): boolean {
  const normA = normalizeOutput(a, options);
  const normB = normalizeOutput(b, options);

  const aJson = JSON.stringify(normA.normalized);
  const bJson = JSON.stringify(normB.normalized);

  return aJson === bJson;
}

export function getSemanticDiff(a: unknown, b: unknown, options: { stripTimestamps?: boolean; stripIds?: boolean } = {}): string[] {
  const normA = normalizeOutput(a, options);
  const normB = normalizeOutput(b, options);

  const aStr = JSON.stringify(normA.normalized, null, 2);
  const bStr = JSON.stringify(normB.normalized, null, 2);

  if (aStr === bStr) return [];

  const diffs: string[] = [];

  const metaA = normA.metadata;
  const metaB = normB.metadata;

  if (metaA.itemCount !== metaB.itemCount) {
    diffs.push(`Item count differs: ${metaA.itemCount} vs ${metaB.itemCount}`);
  }

  const coursesA = new Set(metaA.courses);
  const coursesB = new Set(metaB.courses);
  const coursesDiff = [...coursesA].filter(c => !coursesB.has(c)).concat([...coursesB].filter(c => !coursesA.has(c)));
  if (coursesDiff.length > 0) {
    diffs.push(`Courses differ: ${coursesDiff.join(', ')}`);
  }

  const typesA = new Set(metaA.activityTypes);
  const typesB = new Set(metaB.activityTypes);
  const typesDiff = [...typesA].filter(t => !typesB.has(t)).concat([...typesB].filter(t => !typesA.has(t)));
  if (typesDiff.length > 0) {
    diffs.push(`Activity types differ: ${typesDiff.join(', ')}`);
  }

  return diffs;
}

export function computeOutputFingerprint(output: unknown): string {
  const normalized = normalizeOutput(output);
  const json = JSON.stringify(normalized.normalized);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}
