import * as fs from 'fs';
import * as path from 'path';

export interface TelemetryEntry {
  timestamp: string;
  operation: string;
  module: string;
  courseCode?: string;
  success: boolean;
  duration: number;
  retryCount: number;
  validationState: 'VALID' | 'EMPTY_VALID' | 'INVALID';
  failureType?: string;
  requestCount: number;
  skippedCount: number;
  viewStateSize?: number;
  eventValidationSize?: number;
  redirectCount: number;
  memoryUsageMb?: number;
  outputFingerprint?: string;
}

export interface TelemetrySession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  entries: TelemetryEntry[];
}

export interface TelemetrySummary {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  failureRate: number;
  avgDuration: number;
  durationVariance: number;
  totalRetries: number;
  retryRate: number;
  emptyValidCount: number;
  invalidCount: number;
  validationStateDistribution: Record<string, number>;
  failureTypeDistribution: Record<string, number>;
  moduleSuccessRates: Record<string, { total: number; success: number; rate: number }>;
  consistencyScore: number;
  stabilityScore: number;
  productionReadinessPercent: number;
}

export class TelemetryStore {
  private baseDir: string;
  private currentSession: TelemetrySession | null = null;
  private sessionEntries: TelemetryEntry[] = [];
  private maxInMemoryEntries: number;

  constructor(baseDir: string = 'debug/telemetry', maxInMemoryEntries: number = 200) {
    this.baseDir = baseDir;
    this.maxInMemoryEntries = maxInMemoryEntries;
    this.ensureDirectory();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  startSession(): string {
    const sessionId = `SESSION_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.currentSession = {
      sessionId,
      startTime: new Date().toISOString(),
      entries: [],
    };
    this.sessionEntries = [];
    return sessionId;
  }

  recordEntry(entry: Omit<TelemetryEntry, 'timestamp'>): void {
    const fullEntry: TelemetryEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    if (this.currentSession) {
      this.currentSession.entries.push(fullEntry);
    }
    this.sessionEntries.push(fullEntry);

    if (this.sessionEntries.length > this.maxInMemoryEntries) {
      this.sessionEntries = this.sessionEntries.slice(-this.maxInMemoryEntries);
    }

    this.saveEntry(fullEntry);
  }

  private saveEntry(entry: TelemetryEntry): void {
    const filename = `entry_${entry.timestamp.replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(this.baseDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(entry, null, 2));
  }

  endSession(): TelemetrySession | null {
    if (!this.currentSession) return null;

    this.currentSession.endTime = new Date().toISOString();
    const session = this.currentSession;

    const sessionFile = path.join(this.baseDir, `${session.sessionId}.json`);
    fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));

    this.currentSession = null;
    return session;
  }

  getAllEntries(): TelemetryEntry[] {
    const entries: TelemetryEntry[] = [];
    const files = fs.readdirSync(this.baseDir).filter(f => f.startsWith('entry_') && f.endsWith('.json'));

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.baseDir, file), 'utf8');
        entries.push(JSON.parse(content));
      } catch {
        // Skip invalid files
      }
    }

    return entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  getEntriesForOperation(operation: string): TelemetryEntry[] {
    return this.getAllEntries().filter(e => e.operation === operation);
  }

  getEntriesForModule(module: string): TelemetryEntry[] {
    return this.getAllEntries().filter(e => e.module === module);
  }

  getEntriesForCourse(courseCode: string): TelemetryEntry[] {
    return this.getAllEntries().filter(e => e.courseCode === courseCode);
  }

  getRecentEntries(count: number = 100): TelemetryEntry[] {
    const all = this.getAllEntries();
    return all.slice(-count);
  }

  computeSummary(): TelemetrySummary {
    const entries = this.getAllEntries();

    if (entries.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        failureRate: 0,
        avgDuration: 0,
        durationVariance: 0,
        totalRetries: 0,
        retryRate: 0,
        emptyValidCount: 0,
        invalidCount: 0,
        validationStateDistribution: {},
        failureTypeDistribution: {},
        moduleSuccessRates: {},
        consistencyScore: 0,
        stabilityScore: 0,
        productionReadinessPercent: 0,
      };
    }

    const successful = entries.filter(e => e.success);
    const failed = entries.filter(e => !e.success);
    const durations = entries.map(e => e.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
    const totalRetries = entries.reduce((sum, e) => sum + e.retryCount, 0);

    const validationDist: Record<string, number> = {};
    const failureDist: Record<string, number> = {};
    const moduleStats: Record<string, { total: number; success: number }> = {};
    const emptyValidCount = entries.filter(e => e.validationState === 'EMPTY_VALID').length;
    const invalidCount = entries.filter(e => e.validationState === 'INVALID').length;

    for (const entry of entries) {
      validationDist[entry.validationState] = (validationDist[entry.validationState] || 0) + 1;
      if (entry.failureType) {
        failureDist[entry.failureType] = (failureDist[entry.failureType] || 0) + 1;
      }

      if (!moduleStats[entry.module]) {
        moduleStats[entry.module] = { total: 0, success: 0 };
      }
      moduleStats[entry.module].total++;
      if (entry.success) moduleStats[entry.module].success++;
    }

    const moduleSuccessRates: Record<string, { total: number; success: number; rate: number }> = {};
    for (const [mod, stats] of Object.entries(moduleStats)) {
      moduleSuccessRates[mod] = {
        ...stats,
        rate: stats.total > 0 ? stats.success / stats.total : 0,
      };
    }

    const consistencyScore = this.computeConsistencyScore(entries);
    const stabilityScore = this.computeStabilityScore(successful.length, entries.length, variance);
    const productionReadinessPercent = this.computeProductionReadiness(successful.length, entries.length, totalRetries, invalidCount);

    return {
      totalOperations: entries.length,
      successfulOperations: successful.length,
      failedOperations: failed.length,
      failureRate: entries.length > 0 ? failed.length / entries.length : 0,
      avgDuration,
      durationVariance: variance,
      totalRetries,
      retryRate: entries.length > 0 ? totalRetries / entries.length : 0,
      emptyValidCount,
      invalidCount,
      validationStateDistribution: validationDist,
      failureTypeDistribution: failureDist,
      moduleSuccessRates,
      consistencyScore,
      stabilityScore,
      productionReadinessPercent,
    };
  }

  private computeConsistencyScore(entries: TelemetryEntry[]): number {
    const buildKey = (e: TelemetryEntry): string => {
      if (e.courseCode) return `${e.operation}:${e.courseCode}`;
      return e.operation;
    };

    const byOp = new Map<string, TelemetryEntry[]>();
    for (const e of entries) {
      const key = buildKey(e);
      if (!byOp.has(key)) byOp.set(key, []);
      byOp.get(key)!.push(e);
    }

    let totalComparisons = 0;
    let consistentComparisons = 0;

    for (const [, opEntries] of byOp) {
      if (opEntries.length < 2) continue;

      const withFingerprints = opEntries.filter(e => e.outputFingerprint != null);
      if (withFingerprints.length < 2) {
        if (opEntries.every(e => e.success === opEntries[0].success)) {
          totalComparisons++;
          consistentComparisons++;
        } else {
          totalComparisons++;
        }
        continue;
      }

      const fingerprints = new Set(withFingerprints.map(e => e.outputFingerprint!));
      totalComparisons++;
      if (fingerprints.size === 1) {
        consistentComparisons++;
      }
    }

    return totalComparisons > 0 ? Math.round((consistentComparisons / totalComparisons) * 100) : 0;
  }

  private computeStabilityScore(successful: number, total: number, variance: number): number {
    if (total === 0) return 0;

    const successRate = successful / total;
    const variancePenalty = Math.min(variance / 10000, 0.3);
    const score = (successRate * 0.7 + (1 - variancePenalty) * 0.3) * 100;

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private computeProductionReadiness(successful: number, total: number, retries: number, invalid: number): number {
    if (total === 0) return 0;

    const successRate = successful / total;
    const retryPenalty = Math.min(retries / total * 0.1, 0.1);
    const invalidPenalty = Math.min(invalid / total * 0.2, 0.2);

    const score = (successRate - retryPenalty - invalidPenalty) * 100;
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  clear(): void {
    const files = fs.readdirSync(this.baseDir);
    for (const file of files) {
      fs.unlinkSync(path.join(this.baseDir, file));
    }
    this.sessionEntries = [];
  }

  prune(maxAgeHours: number = 24): number {
    const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;
    const files = fs.readdirSync(this.baseDir).filter(f => f.endsWith('.json'));
    let pruned = 0;

    for (const file of files) {
      const filepath = path.join(this.baseDir, file);
      try {
        const stat = fs.statSync(filepath);
        if (stat.mtimeMs < cutoff) {
          fs.unlinkSync(filepath);
          pruned++;
        }
      } catch {
        // Skip invalid files
      }
    }

    return pruned;
  }

  pruneToMaxEntries(maxEntries: number = 500): number {
    const entries = this.getAllEntries();
    if (entries.length <= maxEntries) return 0;

    const toRemove = entries.slice(0, entries.length - maxEntries);
    let pruned = 0;

    for (const entry of toRemove) {
      const filename = `entry_${entry.timestamp.replace(/[:.]/g, '-')}.json`;
      const filepath = path.join(this.baseDir, filename);
      try {
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
          pruned++;
        }
      } catch {
        // Skip
      }
    }

    return pruned;
  }

  getDiskUsage(): { fileCount: number; totalSizeBytes: number; totalSizeMb: number } {
    const files = fs.readdirSync(this.baseDir).filter(f => f.endsWith('.json'));
    let totalSize = 0;
    for (const file of files) {
      try {
        totalSize += fs.statSync(path.join(this.baseDir, file)).size;
      } catch {
        // Skip
      }
    }
    return {
      fileCount: files.length,
      totalSizeBytes: totalSize,
      totalSizeMb: Math.round(totalSize / 1024 / 1024 * 100) / 100,
    };
  }

  getSessionCount(): number {
    return fs.readdirSync(this.baseDir).filter(f => f.startsWith('SESSION_') && f.endsWith('.json')).length;
  }
}

export function createTelemetryStore(baseDir?: string): TelemetryStore {
  return new TelemetryStore(baseDir);
}

export function loadTelemetryFromDisk(baseDir: string = 'debug/telemetry'): TelemetryEntry[] {
  const store = new TelemetryStore(baseDir);
  return store.getAllEntries();
}