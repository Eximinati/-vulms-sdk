import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { VulmsSDK } from '../src';
import { TelemetryStore } from '../src/utils/telemetry-store';

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
function info(msg: string) { log(`${C.blue}[INFO]${C.reset} ${msg}`); }

async function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

interface BenchmarkResult {
  name: string;
  duration: number;
  success: boolean;
  requestCount: number;
  itemCount: number;
  error?: string;
}

async function benchmarkOperation(
  sdk: VulmsSDK,
  name: string,
  op: () => Promise<unknown>,
): Promise<BenchmarkResult> {
  const tracesBefore = sdk.getTraces().length;
  const start = Date.now();
  try {
    const result = await op();
    const duration = Date.now() - start;
    const requestCount = sdk.getTraces().length - tracesBefore;
    const itemCount = Array.isArray(result) ? result.length : 0;
    return { name, duration, success: true, requestCount, itemCount };
  } catch (e) {
    return {
      name,
      duration: Date.now() - start,
      success: false,
      requestCount: sdk.getTraces().length - tracesBefore,
      itemCount: 0,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function main() {
  const vulmsId = process.env.VULMS_ID;
  const password = process.env.VULMS_PASSWORD;

  if (!vulmsId || !password) {
    log(`${C.red}[ERROR] Set VULMS_ID and VULMS_PASSWORD in .env${C.reset}`);
    return;
  }

  const telemetryDir = path.join(process.cwd(), 'debug', 'telemetry');
  if (!fs.existsSync(telemetryDir)) fs.mkdirSync(telemetryDir, { recursive: true });
  const store = new TelemetryStore(telemetryDir);

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  BENCHMARK SUITE${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);

  const results: BenchmarkResult[] = [];

  info('BENCHMARK 1: Cold Login');
  {
    const coldSdk = new VulmsSDK({ debug: false, traceRequests: true });
    const start = Date.now();
    const loginResult = await coldSdk.loginWithBrowser(vulmsId, password);
    const duration = Date.now() - start;
    results.push({
      name: 'Cold Login',
      duration,
      success: loginResult.success,
      requestCount: coldSdk.getTraces().length,
      itemCount: loginResult.success ? 1 : 0,
      error: loginResult.success ? undefined : loginResult.error,
    });
    log(`  ${loginResult.success ? C.green : C.red}${loginResult.success ? 'OK' : 'FAIL'}${C.reset} | ${duration}ms | ${coldSdk.getTraces().length} reqs`);

    store.recordEntry({
      operation: 'benchmark_cold_login',
      module: 'benchmark',
      success: loginResult.success,
      duration,
      retryCount: 0,
      validationState: loginResult.success ? 'VALID' : 'INVALID',
      failureType: loginResult.error,
      requestCount: coldSdk.getTraces().length,
      skippedCount: 0,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    });
  }

  await sleep(1000);

  info('BENCHMARK 2: Warm Traversal (single session, all modules)');
  {
    const warmSdk = new VulmsSDK({ debug: false, traceRequests: true });
    const loginResult = await warmSdk.loginWithBrowser(vulmsId, password);
    if (!loginResult.success) {
      fail(`Warm benchmark login failed: ${loginResult.error}`);
      return;
    }

    const modules = [
      { name: 'Warm: Courses', op: () => warmSdk.courses.getEnrolledCourses() },
      { name: 'Warm: Assignments', op: () => warmSdk.assignments.getAssignments() },
      { name: 'Warm: Quizzes', op: () => warmSdk.quizzes.getQuizzes() },
      { name: 'Warm: GDBs', op: () => warmSdk.gdb.getGDBs() },
      { name: 'Warm: Lectures', op: () => warmSdk.lectures.getLectures() },
    ];

    for (const m of modules) {
      const r = await benchmarkOperation(warmSdk, m.name, m.op);
      results.push(r);
      log(`  ${r.success ? C.green : C.red}${r.success ? 'OK' : 'FAIL'}${C.reset} ${r.name} | ${r.duration}ms | ${r.itemCount} items | ${r.requestCount} reqs`);

      store.recordEntry({
        operation: `benchmark_warm_${m.name.split(': ')[1].toLowerCase()}`,
        module: 'benchmark',
        success: r.success,
        duration: r.duration,
        retryCount: 0,
        validationState: r.success ? (r.itemCount === 0 ? 'EMPTY_VALID' : 'VALID') : 'INVALID',
        failureType: r.error,
        requestCount: r.requestCount,
        skippedCount: 0,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      });
    }
  }

  await sleep(1000);

  info('BENCHMARK 3: Smart Mode vs Legacy Mode');
  {
    const sdk = new VulmsSDK({ debug: false, traceRequests: true });
    const loginResult = await sdk.loginWithBrowser(vulmsId, password);
    if (!loginResult.success) {
      fail(`Smart benchmark login failed: ${loginResult.error}`);
      return;
    }

    const smartResult = await benchmarkOperation(sdk, 'Smart Activities', () => sdk.activities.getAll({ enabled: true }));
    results.push(smartResult);
    log(`  ${smartResult.success ? C.green : C.red}${smartResult.success ? 'OK' : 'FAIL'}${C.reset} Smart | ${smartResult.duration}ms | ${smartResult.itemCount} items | ${smartResult.requestCount} reqs`);

    store.recordEntry({
      operation: 'benchmark_smart_mode',
      module: 'benchmark',
      success: smartResult.success,
      duration: smartResult.duration,
      retryCount: 0,
      validationState: smartResult.success ? 'VALID' : 'INVALID',
      failureType: smartResult.error,
      requestCount: smartResult.requestCount,
      skippedCount: 0,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    });

    const legacyResult = await benchmarkOperation(sdk, 'Legacy Activities', () => sdk.activities.getAll());
    results.push(legacyResult);
    log(`  ${legacyResult.success ? C.green : C.red}${legacyResult.success ? 'OK' : 'FAIL'}${C.reset} Legacy | ${legacyResult.duration}ms | ${legacyResult.itemCount} items | ${legacyResult.requestCount} reqs`);

    store.recordEntry({
      operation: 'benchmark_legacy_mode',
      module: 'benchmark',
      success: legacyResult.success,
      duration: legacyResult.duration,
      retryCount: 0,
      validationState: legacyResult.success ? 'VALID' : 'INVALID',
      failureType: legacyResult.error,
      requestCount: legacyResult.requestCount,
      skippedCount: 0,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    });

    if (smartResult.success && legacyResult.success) {
      const savings = legacyResult.duration > 0
        ? ((legacyResult.duration - smartResult.duration) / legacyResult.duration * 100).toFixed(0)
        : 'N/A';
      log(`  Smart saved ${savings}% vs Legacy`);
    }
  }

  await sleep(1000);

  info('BENCHMARK 4: Per-Course Sequential');
  {
    const sdk = new VulmsSDK({ debug: false, traceRequests: true });
    const loginResult = await sdk.loginWithBrowser(vulmsId, password);
    if (!loginResult.success) {
      fail(`Per-course benchmark login failed: ${loginResult.error}`);
      return;
    }

    const courses = await sdk.courses.getEnrolledCourses();
    const courseCodes = courses.map(c => c.code).slice(0, 4);

    for (const code of courseCodes) {
      const r = await benchmarkOperation(sdk, `Course: ${code}`, () => sdk.assignments.getAssignments(code));
      results.push(r);
      log(`  ${r.success ? C.green : C.red}${r.success ? 'OK' : 'FAIL'}${C.reset} ${code} | ${r.duration}ms | ${r.itemCount} items`);

      store.recordEntry({
        operation: 'benchmark_per_course',
        module: 'benchmark',
        courseCode: code,
        success: r.success,
        duration: r.duration,
        retryCount: 0,
        validationState: r.success ? (r.itemCount === 0 ? 'EMPTY_VALID' : 'VALID') : 'INVALID',
        failureType: r.error,
        requestCount: r.requestCount,
        skippedCount: 0,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      });

      await sleep(300);
    }
  }

  const summary = store.computeSummary();

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  BENCHMARK REPORT${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);

  log(`  ${'Benchmark'.padEnd(35)} ${'Duration'.padEnd(12)} ${'Items'.padEnd(8)} ${'Reqs'.padEnd(8)} ${'Status'}`);
  log(`  ${'─'.repeat(70)}`);
  for (const r of results) {
    const status = r.success ? `${C.green}OK${C.reset}` : `${C.red}FAIL${C.reset}`;
    log(`  ${r.name.padEnd(35)} ${`${r.duration}ms`.padEnd(12)} ${r.itemCount.toString().padEnd(8)} ${r.requestCount.toString().padEnd(8)} ${status}`);
  }

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const avgDuration = results.reduce((s, r) => s + r.duration, 0) / results.length;

  log(`\n  Total: ${results.length} | Success: ${successful.length} | Failed: ${failed.length}`);
  log(`  Avg duration: ${avgDuration.toFixed(0)}ms`);
  log(`  Telemetry entries: ${store.getAllEntries().length}`);

  const smartResult = results.find(r => r.name === 'Smart Activities');
  const legacyResult = results.find(r => r.name === 'Legacy Activities');
  if (smartResult && legacyResult && smartResult.success && legacyResult.success) {
    const savings = ((legacyResult.duration - smartResult.duration) / legacyResult.duration * 100).toFixed(0);
    log(`  Smart optimization: ${savings}% faster than legacy`);
  }

  const reportDir = path.join(process.cwd(), 'benchmarks');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `benchmark-${new Date().toISOString().split('T')[0]}.md`);
  const mdLines: string[] = [];
  mdLines.push('# Benchmark Report');
  mdLines.push('');
  mdLines.push(`Generated: ${new Date().toISOString()}`);
  mdLines.push('');
  mdLines.push('## Results');
  mdLines.push('');
  mdLines.push('| Benchmark | Duration | Items | Requests | Status |');
  mdLines.push('|-----------|----------|-------|----------|--------|');
  for (const r of results) {
    const status = r.success ? '✅ PASS' : '❌ FAIL';
    mdLines.push(`| ${r.name} | ${r.duration}ms | ${r.itemCount} | ${r.requestCount} | ${status} |`);
  }
  mdLines.push('');
  mdLines.push(`**Total:** ${results.length} | **Avg Duration:** ${avgDuration.toFixed(0)}ms | **Pass:** ${successful.length} | **Fail:** ${failed.length}`);
  if (smartResult && legacyResult && smartResult.success && legacyResult.success) {
    const savings = ((legacyResult.duration - smartResult.duration) / legacyResult.duration * 100).toFixed(0);
    mdLines.push('');
    mdLines.push(`**Smart optimization:** ${savings}% faster than legacy mode`);
  }
  fs.writeFileSync(reportPath, mdLines.join('\n'), 'utf8');
  log(`\n  Report saved to: ${reportPath}`);
}

main().catch(e => {
  console.error('Benchmark error:', e);
  process.exit(1);
});
