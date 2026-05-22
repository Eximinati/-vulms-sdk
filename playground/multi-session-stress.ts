/**
 * Multi-session stress test — simulates real-world usage patterns:
 * - Multiple SDK instances
 * - Repeated traversals
 * - Session expiry + reconnect
 * - Cache invalidation
 * - Long runtime stability
 */
import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';
import { VulmsSDK } from '../src';
import { TelemetryStore } from '../src/utils/telemetry-store';

const C = {
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
  blue: '\x1b[36m', bold: '\x1b[1m', reset: '\x1b[0m',
};
function log(msg: string) { console.log(msg); }
function ok(msg: string) { log(`${C.green}[OK]${C.reset} ${msg}`); }
function fail(msg: string) { log(`${C.red}[FAIL]${C.reset} ${msg}`); }
function info(msg: string) { log(`${C.blue}[INFO]${C.reset} ${msg}`); }
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

interface Result {
  iteration: number; session: number; module: string; duration: number; success: boolean; items: number;
}

async function runSession(vulmsId: string, password: string, sessionId: number, iterations: number, store: TelemetryStore): Promise<Result[]> {
  const results: Result[] = [];
  const sdk = new VulmsSDK({ logger: 'error', cache: true, traceRequests: false });
  const loginResult = await sdk.loginWithBrowser(vulmsId, password);
  if (!loginResult.success) {
    fail(`Session ${sessionId}: login failed`);
    return results;
  }
  ok(`Session ${sessionId}: logged in`);

  for (let i = 0; i < iterations; i++) {
    const ops: { name: string; fn: () => Promise<unknown> }[] = [
      { name: 'courses', fn: () => sdk.courses.getEnrolledCourses() },
      { name: 'assignments', fn: () => sdk.assignments.getAssignments() },
      { name: 'quizzes', fn: () => sdk.quizzes.getQuizzes() },
      { name: 'gdb', fn: () => sdk.gdb.getGDBs() },
      { name: 'lectures', fn: () => sdk.lectures.getLectures() },
      { name: 'activities', fn: () => sdk.activities.getAll() },
    ];

    for (const op of ops) {
      const start = Date.now();
      let success = false;
      let items = 0;
      try {
        const r = await op.fn();
        items = Array.isArray(r) ? r.length : 0;
        success = true;
      } catch { success = false; }
      const duration = Date.now() - start;
      results.push({ iteration: i + 1, session: sessionId, module: op.name, duration, success, items });

      store.recordEntry({
        operation: `stress_ms_${op.name}`,
        module: 'multi-session-stress',
        success,
        duration,
        retryCount: 0,
        validationState: success ? (items === 0 ? 'EMPTY_VALID' : 'VALID') : 'INVALID',
        requestCount: 0,
        skippedCount: 0,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      });
    }

    sdk.releaseMemory();
    if ((i + 1) % 5 === 0) info(`Session ${sessionId}: ${i + 1}/${iterations} iterations`);
    await sleep(200);
  }

  info(`Session ${sessionId}: complete (${results.length} ops)`);
  return results;
}

async function main() {
  const vulmsId = process.env.VULMS_ID;
  const password = process.env.VULMS_PASSWORD;
  if (!vulmsId || !password) { log('Set VULMS_ID and VULMS_PASSWORD in .env'); return; }

  const sessions = parseInt(process.env.STRESS_SESSIONS || '3', 10);
  const iterations = parseInt(process.env.STRESS_ITERATIONS || '5', 10);

  const telemetryDir = path.join(process.cwd(), 'debug', 'telemetry');
  if (!fs.existsSync(telemetryDir)) fs.mkdirSync(telemetryDir, { recursive: true });
  const store = new TelemetryStore(telemetryDir);

  info(`Multi-session stress: ${sessions} sessions × ${iterations} iterations each`);

  const allResults: Result[] = [];
  const sessionPromises: Promise<Result[]>[] = [];

  for (let s = 0; s < sessions; s++) {
    sessionPromises.push(runSession(vulmsId, password, s + 1, iterations, store));
    await sleep(5000); // stagger sessions
  }

  const sessionResults = await Promise.all(sessionPromises);
  for (const r of sessionResults) allResults.push(...r);

  const success = allResults.filter(r => r.success).length;
  const failed = allResults.filter(r => !r.success).length;

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.bold}  MULTI-SESSION STRESS RESULTS${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`  Sessions: ${sessions}`);
  log(`  Iterations per session: ${iterations}`);
  log(`  Total operations: ${allResults.length}`);
  log(`  Success: ${C.green}${success}${C.reset}`);
  log(`  Failed: ${failed > 0 ? C.red : C.green}${failed}${C.reset}`);
  log(`  Success rate: ${(success / allResults.length * 100).toFixed(1)}%`);

  const byModule: Record<string, { total: number; success: number }> = {};
  for (const r of allResults) {
    if (!byModule[r.module]) byModule[r.module] = { total: 0, success: 0 };
    byModule[r.module].total++;
    if (r.success) byModule[r.module].success++;
  }
  for (const [mod, stats] of Object.entries(byModule)) {
    log(`  ${mod}: ${stats.success}/${stats.total} (${(stats.success / stats.total * 100).toFixed(0)}%)`);
  }

  const avgDuration = allResults.reduce((s, r) => s + r.duration, 0) / allResults.length;
  log(`  Avg duration: ${avgDuration.toFixed(0)}ms`);

  if (failed === 0) ok('Multi-session stress: PASS');
  else fail('Multi-session stress: SOME FAILURES');
}

main().catch(e => { console.error(e); process.exit(1); });
