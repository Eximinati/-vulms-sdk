import { noopLogger, type Logger } from '../utils/logger';

export interface TimingEntry {
  name: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
}

export interface PerformanceReport {
  entries: TimingEntry[];
  totalDurationMs: number;
  requestCount: number;
  skipCount: number;
  optimizationSavingsPercent: number;
}

export class PerformanceTracker {
  private entries: TimingEntry[] = [];
  private currentEntry: TimingEntry | null = null;
  private requestCount = 0;
  private skipCount = 0;
  private startTime: number;
  private log: Logger;

  constructor(log: Logger = noopLogger) {
    this.startTime = Date.now();
    this.log = log;
  }

  start(name: string): void {
    this.currentEntry = { name, startTime: Date.now() };
    this.log.debug(`[PERF] Start: ${name}`);
  }

  end(name?: string): void {
    if (!this.currentEntry) return;

    const entry = this.currentEntry;
    entry.endTime = Date.now();
    entry.durationMs = entry.endTime - entry.startTime;

    if (name && entry.name !== name) {
      this.log.warn(`PerformanceTracker.end: expected "${name}" but got "${entry.name}"`);
    }

    this.entries.push(entry);
    this.log.debug(`[PERF] End: ${entry.name} (${entry.durationMs}ms)`);
    this.currentEntry = null;
  }

  incrementRequest(): void {
    this.requestCount++;
  }

  incrementSkipped(): void {
    this.skipCount++;
  }

  getReport(): PerformanceReport {
    const totalDurationMs = Date.now() - this.startTime;
    const totalRequests = this.requestCount + this.skipCount;
    const optimizationSavingsPercent = totalRequests > 0
      ? Math.round((this.skipCount / totalRequests) * 100)
      : 0;

    return {
      entries: [...this.entries],
      totalDurationMs,
      requestCount: this.requestCount,
      skipCount: this.skipCount,
      optimizationSavingsPercent,
    };
  }

  printReport(): void {
    const report = this.getReport();

    console.log('\n┌─────────────────────────────────────────────┐');
    console.log('│         PERFORMANCE REPORT                  │');
    console.log('├─────────────────────────────────────────────┤');

    for (const entry of report.entries) {
      const duration = entry.durationMs?.toFixed(1) || '0.0';
      console.log(`│ ${entry.name.padEnd(40)} ${duration.padStart(8)} ms │`);
    }

    console.log('├─────────────────────────────────────────────┤');
    const total = report.totalDurationMs.toFixed(1);
    console.log(`│ Total Duration: ${total.padStart(30)} ms │`);
    console.log(`│ Requests: ${report.requestCount.toString().padStart(35)} │`);
    console.log(`│ Skipped: ${report.skipCount.toString().padStart(36)} │`);
    console.log(`│ Optimization: ${report.optimizationSavingsPercent.toString().padStart(29)}% │`);
    console.log('└─────────────────────────────────────────────┘\n');
  }
}

export function createPerformanceTracker(log?: Logger): PerformanceTracker {
  return new PerformanceTracker(log);
}