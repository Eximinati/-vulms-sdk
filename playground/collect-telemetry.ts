import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { VulmsSDK } from '../src';
import { TelemetryStore, type TelemetryEntry } from '../src/utils/telemetry-store';
import { computeOutputFingerprint } from '../src/utils/output-normalizer';

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

function getMemoryMb(): number {
  const mem = process.memoryUsage();
  return Math.round(mem.heapUsed / 1024 / 1024);
}

function getValidationState(success: boolean, itemCount: number): 'VALID' | 'EMPTY_VALID' | 'INVALID' {
  if (!success) return 'INVALID';
  if (itemCount === 0) return 'EMPTY_VALID';
  return 'VALID';
}

async function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function collectModuleTelemetry(
  store: TelemetryStore,
  sdk: VulmsSDK,
  moduleName: string,
  operation: string,
  fn: () => Promise<unknown[]>,
  courseCode?: string,
): Promise<void> {
  const start = Date.now();
  const memBefore = getMemoryMb();
  let success = false;
  let itemCount = 0;
  let retryCount = 0;
  let requestCount = 0;
  let skippedCount = 0;
  let failureType: string | undefined;
  let outputFingerprint: string | undefined;

  try {
    const tracesBefore = sdk.getTraces().length;
    const result = await fn();
    const tracesAfter = sdk.getTraces().length;
    requestCount = tracesAfter - tracesBefore;

    if (Array.isArray(result)) {
      itemCount = result.length;
      outputFingerprint = computeOutputFingerprint(result);
    }
    success = true;
  } catch (e) {
    failureType = e instanceof Error ? e.message : String(e);
    retryCount = 1;
  }

  const duration = Date.now() - start;
  const memAfter = getMemoryMb();

  const entry: Omit<TelemetryEntry, 'timestamp'> = {
    operation,
    module: moduleName,
    courseCode,
    success,
    duration,
    retryCount,
    validationState: getValidationState(success, itemCount),
    failureType,
    requestCount,
    skippedCount,
    memoryUsageMb: memAfter,
    outputFingerprint,
  };

  store.recordEntry(entry);

  const status = success ? `${C.green}OK${C.reset}` : `${C.red}FAIL${C.reset}`;
  const courseInfo = courseCode ? ` [${courseCode}]` : '';
  log(`  ${status} ${operation}${courseInfo} | ${duration}ms | ${itemCount} items | ${requestCount} reqs | ${memAfter}MB`);
}

async function main() {
  const vulmsId = process.env.VULMS_ID;
  const password = process.env.VULMS_PASSWORD;

  if (!vulmsId || !password) {
    log(`${C.red}[ERROR] Set VULMS_ID and VULMS_PASSWORD in .env${C.reset}`);
    return;
  }

  const telemetryDir = path.join(process.cwd(), 'debug', 'telemetry');
  if (!fs.existsSync(telemetryDir)) {
    fs.mkdirSync(telemetryDir, { recursive: true });
  }

  const store = new TelemetryStore(telemetryDir);
  const sessionId = store.startSession();

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  TELEMETRY COLLECTION RUN${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`Session: ${sessionId}`);
  log(`Started: ${new Date().toISOString()}`);
  log(`Memory: ${getMemoryMb()}MB\n`);

  const sdk = new VulmsSDK({ debug: false, traceRequests: true });

  info('Logging in...');
  const loginStart = Date.now();
  let loginSuccess = false;
  let loginDuration = 0;

  try {
    const useBrowser = process.env.USE_BROWSER === 'true';
    const loginResult = useBrowser
      ? await sdk.loginWithBrowser(vulmsId, password)
      : await sdk.login(vulmsId, password);

    loginDuration = Date.now() - loginStart;

    if (loginResult.success) {
      loginSuccess = true;
      ok(`Login successful (${loginDuration}ms)`);
    } else {
      fail(`Login failed: ${loginResult.error}`);
      store.recordEntry({
        operation: 'login',
        module: 'auth',
        success: false,
        duration: loginDuration,
        retryCount: 0,
        validationState: 'INVALID',
        failureType: loginResult.error,
        requestCount: sdk.getTraces().length,
        skippedCount: 0,
        memoryUsageMb: getMemoryMb(),
      });
      return;
    }
  } catch (e) {
    loginDuration = Date.now() - loginStart;
    fail(`Login error: ${e instanceof Error ? e.message : String(e)}`);
    store.recordEntry({
      operation: 'login',
      module: 'auth',
      success: false,
      duration: loginDuration,
      retryCount: 0,
      validationState: 'INVALID',
      failureType: e instanceof Error ? e.message : String(e),
      requestCount: sdk.getTraces().length,
      skippedCount: 0,
      memoryUsageMb: getMemoryMb(),
    });
    return;
  }

  store.recordEntry({
    operation: 'login',
    module: 'auth',
    success: true,
    duration: loginDuration,
    retryCount: 0,
    validationState: 'VALID',
    requestCount: sdk.getTraces().length,
    skippedCount: 0,
    memoryUsageMb: getMemoryMb(),
  });

  info('Fetching enrolled courses...');
  let courseCodes: string[] = [];
  await collectModuleTelemetry(store, sdk, 'courses', 'getEnrolledCourses', async () => {
    const courses = await sdk.courses.getEnrolledCourses();
    courseCodes = courses.map(c => c.code);
    return courses;
  });

  log(`\n  Discovered courses: ${courseCodes.join(', ') || '(none)'}\n`);

  info('Collecting assignment telemetry...');
  await collectModuleTelemetry(store, sdk, 'assignments', 'getAllAssignments', async () => {
    return sdk.assignments.getAssignments();
  });

  for (const code of courseCodes.slice(0, 3)) {
    await collectModuleTelemetry(store, sdk, 'assignments', 'getAssignmentsForCourse', async () => {
      return sdk.assignments.getAssignments(code);
    }, code);
    await sleep(500);
  }

  info('Collecting quiz telemetry...');
  await collectModuleTelemetry(store, sdk, 'quizzes', 'getAllQuizzes', async () => {
    return sdk.quizzes.getQuizzes();
  });

  for (const code of courseCodes.slice(0, 3)) {
    await collectModuleTelemetry(store, sdk, 'quizzes', 'getQuizzesForCourse', async () => {
      return sdk.quizzes.getQuizzes(code);
    }, code);
    await sleep(500);
  }

  info('Collecting GDB telemetry...');
  await collectModuleTelemetry(store, sdk, 'gdb', 'getAllGDBs', async () => {
    return sdk.gdb.getGDBs();
  });

  for (const code of courseCodes.slice(0, 3)) {
    await collectModuleTelemetry(store, sdk, 'gdb', 'getGDBsForCourse', async () => {
      return sdk.gdb.getGDBs(code);
    }, code);
    await sleep(500);
  }

  info('Collecting lecture telemetry...');
  await collectModuleTelemetry(store, sdk, 'lectures', 'getAllLectures', async () => {
    return sdk.lectures.getLectures();
  });

  for (const code of courseCodes.slice(0, 3)) {
    await collectModuleTelemetry(store, sdk, 'lectures', 'getLecturesForCourse', async () => {
      return sdk.lectures.getLectures(code);
    }, code);
    await sleep(500);
  }

  info('Collecting smart activity telemetry...');
  await collectModuleTelemetry(store, sdk, 'activities', 'getAllSmart', async () => {
    const result = await sdk.activities.getAll({ enabled: true });
    if ('aggregate' in result) {
      return [...result.aggregate.pending, ...result.aggregate.submitted, ...result.aggregate.missed, ...result.aggregate.resultDeclared];
    }
    return [...result.pending, ...result.submitted, ...result.missed, ...result.resultDeclared];
  });

  info('Collecting legacy activity telemetry...');
  await collectModuleTelemetry(store, sdk, 'activities', 'getAllLegacy', async () => {
    const result = await sdk.activities.getAll();
    if ('aggregate' in result) {
      return [...result.aggregate.pending, ...result.aggregate.submitted, ...result.aggregate.missed, ...result.aggregate.resultDeclared];
    }
    return [...result.pending, ...result.submitted, ...result.missed, ...result.resultDeclared];
  });

  const sessionResult = store.endSession();
  const summary = store.computeSummary();

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  TELEMETRY COLLECTION SUMMARY${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`Total operations: ${summary.totalOperations}`);
  log(`Successful: ${C.green}${summary.successfulOperations}${C.reset}`);
  log(`Failed: ${summary.failedOperations > 0 ? C.red : C.green}${summary.failedOperations}${C.reset}`);
  log(`Failure rate: ${(summary.failureRate * 100).toFixed(1)}%`);
  log(`Avg duration: ${summary.avgDuration.toFixed(0)}ms`);
  log(`Total retries: ${summary.totalRetries}`);
  log(`Validation: VALID=${summary.validationStateDistribution['VALID'] || 0} EMPTY_VALID=${summary.validationStateDistribution['EMPTY_VALID'] || 0} INVALID=${summary.validationStateDistribution['INVALID'] || 0}`);
  log(`Memory: ${getMemoryMb()}MB`);
  log(`\nTelemetry saved to: ${telemetryDir}`);
  log(`Entries: ${store.getAllEntries().length}`);

  if (summary.failureRate > 0.1) {
    log(`\n${C.red}WARNING: High failure rate detected (${(summary.failureRate * 100).toFixed(1)}%)${C.reset}`);
  }
}

main().catch(e => {
  console.error('Telemetry collection error:', e);
  process.exit(1);
});
