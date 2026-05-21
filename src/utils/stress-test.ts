import { VulmsSDK, type SDKConfig } from '../vulms-sdk';

export interface StressTestOptions {
  iterations: number;
  operation: 'courses' | 'assignments' | 'quizzes' | 'gdb' | 'lectures' | 'activities';
  useSmartMode?: boolean;
  delayBetweenRuns?: number;
}

export interface StressTestResult {
  iteration: number;
  success: boolean;
  duration: number;
  result?: unknown;
  error?: string;
  retryCount: number;
  validationState?: string;
}

export interface StressTestReport {
  totalIterations: number;
  successfulIterations: number;
  failedIterations: number;
  failureRate: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  durationVariance: number;
  retryCount: number;
  emptyValidCount: number;
  invalidCount: number;
  validationStateDistribution: Record<string, number>;
  consistencyScore: number;
}

export async function runStressTest(
  config: SDKConfig,
  options: StressTestOptions,
): Promise<StressTestReport> {
  const sdk = new VulmsSDK({ ...config, traceRequests: true });
  const results: StressTestResult[] = [];

  const credentials = loadCredentials();
  if (!credentials) {
    throw new Error('VULMS_ID and VULMS_PASSWORD required for stress testing');
  }

  await sdk.login(credentials.username, credentials.password);

  for (let i = 0; i < options.iterations; i++) {
    const start = Date.now();
    let result: StressTestResult = {
      iteration: i + 1,
      success: false,
      duration: 0,
      retryCount: 0,
    };

    try {
      const operationResult = await runOperation(sdk, options.operation, options.useSmartMode);
      result.success = true;
      result.duration = Date.now() - start;
      result.result = operationResult;
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
      result.duration = Date.now() - start;
    }

    results.push(result);
    if (options.delayBetweenRuns && i < options.iterations - 1) {
      await sleep(options.delayBetweenRuns);
    }
  }

  return generateReport(results);
}

async function runOperation(sdk: VulmsSDK, operation: string, useSmartMode?: boolean): Promise<unknown> {
  switch (operation) {
    case 'courses':
      return sdk.courses.getEnrolledCourses();
    case 'assignments':
      return sdk.assignments.getAssignments();
    case 'quizzes':
      return sdk.quizzes.getQuizzes();
    case 'gdb':
      return sdk.gdb.getGDBs();
    case 'lectures':
      return sdk.lectures.getLectures();
    case 'activities':
      return useSmartMode
        ? sdk.activities.getAll({ enabled: true })
        : sdk.activities.getAll();
    default:
      throw new Error('Unknown operation: ' + operation);
  }
}

function generateReport(results: StressTestResult[]): StressTestReport {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const durations = results.map(r => r.duration);

  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;

  const validationDistribution: Record<string, number> = {};
  let emptyValidCount = 0;
  let invalidCount = 0;

  for (const r of results) {
    if (r.validationState) {
      validationDistribution[r.validationState] = (validationDistribution[r.validationState] || 0) + 1;
      if (r.validationState === 'EMPTY_VALID') emptyValidCount++;
      if (r.validationState === 'INVALID') invalidCount++;
    }
  }

  const retryCount = results.reduce((sum, r) => sum + r.retryCount, 0);

  const consistencyScore = successful.length > 1
    ? calculateConsistencyScore(successful)
    : 1.0;

  return {
    totalIterations: results.length,
    successfulIterations: successful.length,
    failedIterations: failed.length,
    failureRate: results.length > 0 ? failed.length / results.length : 0,
    avgDuration,
    minDuration,
    maxDuration,
    durationVariance: variance,
    retryCount,
    emptyValidCount,
    invalidCount,
    validationStateDistribution: validationDistribution,
    consistencyScore,
  };
}

function calculateConsistencyScore(results: StressTestResult[]): number {
  if (results.length < 2) return 1.0;

  const outputs = results.map(r => JSON.stringify(r.result));
  const uniqueOutputs = new Set(outputs);
  const consistencyRatio = uniqueOutputs.size / outputs.length;

  return Math.round((1 - consistencyRatio + 0.5 * (results.length > 5 ? 0.2 : 0)) * 100) / 100;
}

function loadCredentials(): { username: string; password: string } | null {
  const id = process.env.VULMS_ID;
  const password = process.env.VULMS_PASSWORD;
  if (id && password) {
    return { username: id, password };
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatStressReport(report: StressTestReport): string {
  const lines: string[] = [];
  lines.push('\n╔═══════════════════════════════════════════════════════════════╗');
  lines.push('║               STRESS TEST REPORT                              ║');
  lines.push('╠═══════════════════════════════════════════════════════════════╣');
  lines.push(`║ Iterations:          ${String(report.totalIterations).padEnd(43)} ║`);
  lines.push(`║ Success:             ${String(report.successfulIterations).padEnd(43)} ║`);
  lines.push(`║ Failed:              ${String(report.failedIterations).padEnd(43)} ║`);
  lines.push(`║ Failure Rate:        ${(report.failureRate * 100).toFixed(2).padEnd(38)}% ║`);
  lines.push('╠═══════════════════════════════════════════════════════════════╣');
  lines.push(`║ Avg Duration:        ${report.avgDuration.toFixed(0).padEnd(43)}ms ║`);
  lines.push(`║ Min Duration:        ${report.minDuration.toFixed(0).padEnd(43)}ms ║`);
  lines.push(`║ Max Duration:        ${report.maxDuration.toFixed(0).padEnd(43)}ms ║`);
  lines.push(`║ Duration Variance:   ${report.durationVariance.toFixed(0).padEnd(43)} ║`);
  lines.push('╠═══════════════════════════════════════════════════════════════╣');
  lines.push(`║ Total Retries:        ${String(report.retryCount).padEnd(43)} ║`);
  lines.push(`║ Empty Valid Count:    ${String(report.emptyValidCount).padEnd(43)} ║`);
  lines.push(`║ Invalid Count:       ${String(report.invalidCount).padEnd(43)} ║`);
  lines.push(`║ Consistency Score:   ${(report.consistencyScore * 100).toFixed(0).padEnd(40)}% ║`);
  lines.push('╚═══════════════════════════════════════════════════════════════╝\n');
  return lines.join('\n');
}

export async function runConsistencyTest(
  config: SDKConfig,
  operation: 'courses' | 'assignments' | 'quizzes' | 'gdb' | 'lectures' | 'activities',
  runs: number = 5,
): Promise<{
  isConsistent: boolean;
  variance: number;
  uniqueOutputs: number;
  outputs: unknown[];
}> {
  const sdk = new VulmsSDK({ ...config, traceRequests: true });
  const credentials = loadCredentials();
  if (!credentials) {
    throw new Error('VULMS_ID and VULMS_PASSWORD required');
  }

  await sdk.login(credentials.username, credentials.password);

  const outputs: unknown[] = [];
  for (let i = 0; i < runs; i++) {
    const result = await runOperation(sdk, operation, false);
    outputs.push(result);
    if (i < runs - 1) await sleep(1000);
  }

  const uniqueSet = new Set(outputs.map(o => JSON.stringify(o)));
  const variance = 1 - (uniqueSet.size / runs);
  const isConsistent = uniqueSet.size === 1;

  return { isConsistent, variance, uniqueOutputs: uniqueSet.size, outputs };
}