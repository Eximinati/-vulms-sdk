export interface NormalizedOutput {
  normalized: unknown;
  metadata: {
    itemCount: number;
    courses: string[];
    activityTypes: string[];
    timestamp?: number;
    hasDynamicContent: boolean;
  };
}

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

  collectMetadata(normalized, courses, activityTypes, (k) => {
    if (['timestamp', 'date', 'createdAt', 'updatedAt', 'id', '_id'].includes(k)) {
      hasDynamicContent = true;
    }
  });

  return {
    normalized,
    metadata: {
      itemCount: countItems(normalized),
      courses: Array.from(courses).sort(),
      activityTypes: Array.from(activityTypes).sort(),
      timestamp: extractTimestamp(normalized),
      hasDynamicContent,
    },
  };
}

function deepNormalize(value: unknown, opts: { stripTimestamps: boolean; stripIds: boolean; sortArrays: boolean }): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    if (opts.stripTimestamps && isTimestamp(value)) return '[TIMESTAMP]';
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

    for (const [key, val] of Object.entries(obj)) {
      if (opts.stripTimestamps && isTimestampKey(key)) {
        result[key] = '[TIMESTAMP]';
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

function isTimestamp(value: string): boolean {
  const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  return isoPattern.test(value) || /^\d{10,13}$/.test(value);
}

function isTimestampKey(key: string): boolean {
  return ['timestamp', 'createdAt', 'updatedAt', 'modifiedAt', 'submittedAt', 'dueDate'].includes(key.toLowerCase());
}

function isIdKey(key: string): boolean {
  return ['id', '_id', 'traceId', 'requestId', 'sessionId'].includes(key.toLowerCase());
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
    if (['timestamp', 'date', 'id'].some(k => key.toLowerCase().includes(k))) {
      onDynamicKey(key);
    }
    if (typeof record[key] === 'object') {
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

function extractTimestamp(obj: unknown): number | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  const record = obj as Record<string, unknown>;

  if (record.timestamp && typeof record.timestamp === 'number') return record.timestamp;
  if (record.createdAt && typeof record.createdAt === 'string') {
    return new Date(record.createdAt).getTime();
  }

  for (const value of Object.values(record)) {
    if (typeof value === 'number' && value > 1000000000000 && value < 2000000000000) {
      return value;
    }
  }

  return undefined;
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