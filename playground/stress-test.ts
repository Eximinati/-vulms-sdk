import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { VulmsSDK } from '../src';
import { TelemetryStore, type TelemetryEntry } from '../src/utils/telemetry-store';

const C = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

function log(msg: string) { console.log(msg); }
function ok(msg: string) { log(`${C.green}[OK]${C.reset} ${msg}`); }
function fail(msg: string) { log(`${C.red}[FAIL]${C.reset} ${msg}`); }
function info(msg: string) { log(`${C.blue}[INFO]${C.reset} ${msg}`); }
function warn(msg: string) { log(`${C.yellow}[WARN]${C.reset} ${msg}`); }

function getMemoryMb(): number {
  const mem = process.memoryUsage();
  return Math.round(mem.heapUsed / 1024 / 1024);
}

interface StressIteration {
  iteration: number;
  operation: string;
  success: boolean;
  duration: number;
  itemCount: number;
  requestCount: number;
  memoryMb: number;
  error?: string;
}

interface DriftDetection {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

async function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function runSingleOperation(
  sdk: VulmsSDK,
  operation: string,
  courseCode?: string,
): Promise<{ success: boolean; itemCount: number; error?: string }> {
  try {
    let result: unknown;
    switch (operation) {
      case 'courses':
        result = await sdk.courses.getEnrolledCourses();
        break;
      case 'assignments':
        result = courseCode ? await sdk.assignments.getAssignments(courseCode) : await sdk.assignments.getAssignments();
        break;
      case 'quizzes':
        result = courseCode ? await sdk.quizzes.getQuizzes(courseCode) : await sdk.quizzes.getQuizzes();
        break;
      case 'gdb':
        result = courseCode ? await sdk.gdb.getGDBs(courseCode) : await sdk.gdb.getGDBs();
        break;
      case 'lectures':
        result = courseCode ? await sdk.lectures.getLectures(courseCode) : await sdk.lectures.getLectures();
        break;
      case 'activities':
        result = await sdk.activities.getAll({ enabled: true });
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    const itemCount = Array.isArray(result) ? result.length : 0;
    return { success: true, itemCount };
  } catch (e) {
    return { success: false, itemCount: 0, error: e instanceof Error ? e.message : String(e) };
  }
}

async function runStressSuite(
  iterations: number,
  operations: string[],
  useSameSession: boolean,
  courseCodes: string[],
  telemetryStore: TelemetryStore,
): Promise<{ iterations: StressIteration[]; drifts: DriftDetection[] }> {
  const allIterations: StressIteration[] = [];
  const drifts: DriftDetection[] = [];

  let sdk: VulmsSDK | null = null;
  const vulmsId = process.env.VULMS_ID!;
  const password = process.env.VULMS_PASSWORD!;

  if (useSameSession) {
    sdk = new VulmsSDK({ debug: false, traceRequests: true });
    const loginResult = await sdk.loginWithBrowser(vulmsId, password);
    if (!loginResult.success) {
      throw new Error(`Login failed: ${loginResult.error}`);
    }
    ok('Stress test login successful (shared session)');
  }

  const memoryHistory: number[] = [];
  const durationHistory: Record<string, number[]> = {};
  const successHistory: Record<string, boolean[]> = {};

  for (let i = 0; i < iterations; i++) {
    const iterationLabel = `${i + 1}/${iterations}`;
    log(`\n  --- Iteration ${iterationLabel} ---`);

    for (const op of operations) {
      if (!useSameSession || !sdk) {
        sdk = new VulmsSDK({ debug: false, traceRequests: true });
        const loginResult = await sdk.loginWithBrowser(vulmsId, password);
        if (!loginResult.success) {
          fail(`Login failed iteration ${i + 1}: ${loginResult.error}`);
          continue;
        }
      }

      const courseCode = courseCodes.length > 0 ? courseCodes[i % courseCodes.length] : undefined;
      const start = Date.now();
      const memBefore = getMemoryMb();
      const tracesBefore = sdk.getTraces().length;

      const result = await runSingleOperation(sdk, op, courseCode);
      const duration = Date.now() - start;
      const memAfter = getMemoryMb();
      const tracesAfter = sdk.getTraces().length;

      const iter: StressIteration = {
        iteration: i + 1,
        operation: op,
        success: result.success,
        duration,
        itemCount: result.itemCount,
        requestCount: tracesAfter - tracesBefore,
        memoryMb: memAfter,
        error: result.error,
      };
      allIterations.push(iter);

      if (!durationHistory[op]) durationHistory[op] = [];
      if (!successHistory[op]) successHistory[op] = [];
      durationHistory[op].push(duration);
      successHistory[op].push(result.success);
      memoryHistory.push(memAfter);

      const status = result.success ? `${C.green}OK${C.reset}` : `${C.red}FAIL${C.reset}`;
      const courseInfo = courseCode ? ` [${courseCode}]` : '';
      log(`    ${status} ${op}${courseInfo} | ${duration}ms | ${result.itemCount} items | ${memAfter}MB`);

      telemetryStore.recordEntry({
        operation: `stress_${op}`,
        module: 'stress-test',
        courseCode,
        success: result.success,
        duration,
        retryCount: 0,
        validationState: result.success ? (result.itemCount === 0 ? 'EMPTY_VALID' : 'VALID') : 'INVALID',
        failureType: result.error,
        requestCount: tracesAfter - tracesBefore,
        skippedCount: 0,
        memoryUsageMb: memAfter,
      });

      if (!useSameSession && sdk) {
        sdk = null;
      }

      await sleep(300);
    }

    if (!useSameSession) {
      await sleep(1000);
    }
  }

  for (const [op, durations] of Object.entries(durationHistory)) {
    if (durations.length < 3) continue;
    const firstHalf = durations.slice(0, Math.floor(durations.length / 2));
    const secondHalf = durations.slice(Math.floor(durations.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (avgSecond > avgFirst * 1.5) {
      drifts.push({
        type: 'latency_drift',
        description: `${op}: avg latency increased from ${avgFirst.toFixed(0)}ms to ${avgSecond.toFixed(0)}ms (${((avgSecond / avgFirst - 1) * 100).toFixed(0)}% increase)`,
        severity: avgSecond > avgFirst * 2 ? 'high' : 'medium',
      });
    }
  }

  for (const [op, successes] of Object.entries(successHistory)) {
    if (successes.length < 5) continue;
    const firstHalf = successes.slice(0, Math.floor(successes.length / 2));
    const secondHalf = successes.slice(Math.floor(successes.length / 2));
    const rateFirst = firstHalf.filter(Boolean).length / firstHalf.length;
    const rateSecond = secondHalf.filter(Boolean).length / secondHalf.length;

    if (rateSecond < rateFirst * 0.8) {
      drifts.push({
        type: 'success_rate_degradation',
        description: `${op}: success rate dropped from ${(rateFirst * 100).toFixed(0)}% to ${(rateSecond * 100).toFixed(0)}%`,
        severity: rateSecond < 0.5 ? 'high' : 'medium',
      });
    }
  }

  if (memoryHistory.length >= 5) {
    const firstMem = memoryHistory.slice(0, 3);
    const lastMem = memoryHistory.slice(-3);
    const avgFirst = firstMem.reduce((a, b) => a + b, 0) / firstMem.length;
    const avgLast = lastMem.reduce((a, b) => a + b, 0) / lastMem.length;

    if (avgLast > avgFirst + 50) {
      drifts.push({
        type: 'memory_growth',
        description: `Heap grew from ${avgFirst.toFixed(0)}MB to ${avgLast.toFixed(0)}MB (+${(avgLast - avgFirst).toFixed(0)}MB)`,
        severity: avgLast > avgFirst + 100 ? 'high' : 'medium',
      });
    }
  }

  return { iterations: allIterations, drifts };
}

async function main() {
  const vulmsId = process.env.VULMS_ID;
  const password = process.env.VULMS_PASSWORD;

  if (!vulmsId || !password) {
    log(`${C.red}[ERROR] Set VULMS_ID and VULMS_PASSWORD in .env${C.reset}`);
    return;
  }

  const args = process.argv.slice(2);
  const iterations = parseInt(args.find(a => a.startsWith('--iter='))?.split('=')[1] || '25');
  const sameSession = !args.includes('--fresh-sessions');
  const operations = args.filter(a => a.startsWith('--op=')).map(a => a.split('=')[1]);
  const defaultOps = ['courses', 'assignments', 'quizzes', 'gdb', 'lectures'];
  const ops = operations.length > 0 ? operations : defaultOps;

  const telemetryDir = path.join(process.cwd(), 'debug', 'telemetry');
  if (!fs.existsSync(telemetryDir)) fs.mkdirSync(telemetryDir, { recursive: true });
  const store = new TelemetryStore(telemetryDir);

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  LONG-RUN STRESS TEST${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`Iterations: ${iterations}`);
  log(`Operations: ${ops.join(', ')}`);
  log(`Session mode: ${sameSession ? 'SAME SESSION' : 'FRESH SESSIONS'}`);
  log(`Start memory: ${getMemoryMb()}MB\n`);

  const sdk = new VulmsSDK({ debug: false, traceRequests: true });
  const loginResult = await sdk.loginWithBrowser(vulmsId, password);
  if (!loginResult.success) {
    fail(`Login failed: ${loginResult.error}`);
    return;
  }

  const courses = await sdk.courses.getEnrolledCourses();
  const courseCodes = courses.map(c => c.code);
  log(`Courses: ${courseCodes.join(', ') || '(none)'}\n`);

  const start = Date.now();
  const { iterations: results, drifts } = await runStressSuite(iterations, ops, sameSession, courseCodes, store);

  const totalDuration = Date.now() - start;
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const durations = results.map(r => r.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const failureRate = failed.length / results.length;

  const memValues = results.map(r => r.memoryMb);
  const minMem = Math.min(...memValues);
  const maxMem = Math.max(...memValues);

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  STRESS TEST RESULTS${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`Total iterations: ${results.length}`);
  log(`Successful: ${C.green}${successful.length}${C.reset}`);
  log(`Failed: ${failed.length > 0 ? C.red : C.green}${failed.length}${C.reset}`);
  log(`Failure rate: ${failureRate > 0.05 ? C.red : C.green}${(failureRate * 100).toFixed(1)}%${C.reset}`);
  log(`Duration: avg=${avgDuration.toFixed(0)}ms min=${minDuration}ms max=${maxDuration}ms`);
  log(`Total time: ${(totalDuration / 1000).toFixed(0)}s`);
  log(`Memory: min=${minMem}MB max=${maxMem}MB delta=${maxMem - minMem}MB`);

  if (drifts.length > 0) {
    log(`\n${C.yellow}DRIFT DETECTED (${drifts.length}):${C.reset}`);
    for (const d of drifts) {
      const icon = d.severity === 'high' ? C.red : C.yellow;
      log(`  ${icon}[${d.severity.toUpperCase()}]${C.reset} ${d.description}`);
    }
  } else {
    log(`\n${C.green}NO DRIFT DETECTED${C.reset}`);
  }

  const hasRetryStorm = results.filter(r => r.duration > avgDuration * 3).length > results.length * 0.1;
  if (hasRetryStorm) {
    warn('POTENTIAL RETRY STORM: >10% of operations took >3x average duration');
  }

  log(`\nTelemetry entries recorded. Run collect-telemetry for summary.`);
}

main().catch(e => {
  console.error('Stress test error:', e);
  process.exit(1);
});
