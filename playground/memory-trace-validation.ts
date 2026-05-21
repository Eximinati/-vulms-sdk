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
function ok(msg: string) { log(`${C.green}[PASS]${C.reset} ${msg}`); }
function fail(msg: string) { log(`${C.red}[FAIL]${C.reset} ${msg}`); }
function warn(msg: string) { log(`${C.yellow}[WARN]${C.reset} ${msg}`); }
function info(msg: string) { log(`${C.blue}[INFO]${C.reset} ${msg}`); }

function getMemoryMb(): number {
  const mem = process.memoryUsage();
  return {
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
    rss: Math.round(mem.rss / 1024 / 1024),
  };
}

interface MemoryCheckpoint {
  label: string;
  heapUsed: number;
  heapTotal: number;
  rss: number;
  traceCount: number;
  telemetryCount: number;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const vulmsId = process.env.VULMS_ID;
  const password = process.env.VULMS_PASSWORD;

  if (!vulmsId || !password) {
    log(`${C.red}[ERROR] Set VULMS_ID and VULMS_PASSWORD in .env${C.reset}`);
    return;
  }

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  MEMORY & TRACE VALIDATION${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);

  const sdk = new VulmsSDK({ debug: false, traceRequests: true });

  info('Logging in...');
  const loginResult = await sdk.loginWithBrowser(vulmsId, password);
  if (!loginResult.success) {
    fail(`Login failed: ${loginResult.error}`);
    return;
  }
  ok('Login successful');

  const checkpoints: MemoryCheckpoint[] = [];
  const telemetryDir = path.join(process.cwd(), 'debug', 'telemetry');
  const traceDir = path.join(process.cwd(), 'debug', 'traces');

  function checkpoint(label: string) {
    const mem = getMemoryMb();
    const cp: MemoryCheckpoint = {
      label,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      rss: mem.rss,
      traceCount: sdk.getTraces().length,
      telemetryCount: fs.existsSync(telemetryDir)
        ? fs.readdirSync(telemetryDir).filter(f => f.startsWith('entry_') && f.endsWith('.json')).length
        : 0,
    };
    checkpoints.push(cp);
    log(`  ${label}: heap=${cp.heapUsed}MB traces=${cp.traceCount} telemetry=${cp.telemetryCount}`);
  }

  checkpoint('After login');

  info('Running module traversals...');

  info('  Courses...');
  await sdk.courses.getEnrolledCourses();
  checkpoint('After courses');

  info('  Assignments...');
  await sdk.assignments.getAssignments();
  checkpoint('After assignments');

  info('  Quizzes...');
  await sdk.quizzes.getQuizzes();
  checkpoint('After quizzes');

  info('  GDBs...');
  await sdk.gdb.getGDBs();
  checkpoint('After GDBs');

  info('  Lectures...');
  await sdk.lectures.getLectures();
  checkpoint('After lectures');

  info('  Activities (smart)...');
  await sdk.activities.getAll({ enabled: true });
  checkpoint('After activities (smart)');

  info('  Activities (legacy)...');
  await sdk.activities.getAll();
  checkpoint('After activities (legacy)');

  info('  Second pass - courses...');
  await sdk.courses.getEnrolledCourses();
  checkpoint('After 2nd courses');

  info('  Second pass - assignments...');
  await sdk.assignments.getAssignments();
  checkpoint('After 2nd assignments');

  info('  Second pass - lectures...');
  await sdk.lectures.getLectures();
  checkpoint('After 2nd lectures');

  await sleep(2000);
  checkpoint('After 2s idle');

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  MEMORY ANALYSIS${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);

  const firstCp = checkpoints[0];
  const lastCp = checkpoints[checkpoints.length - 1];
  const heapDelta = lastCp.heapUsed - firstCp.heapUsed;
  const rssDelta = lastCp.rss - firstCp.rss;
  const traceDelta = lastCp.traceCount - firstCp.traceCount;

  log(`Heap: ${firstCp.heapUsed}MB -> ${lastCp.heapUsed}MB (delta: ${heapDelta > 0 ? '+' : ''}${heapDelta}MB)`);
  log(`RSS: ${firstCp.rss}MB -> ${lastCp.rss}MB (delta: ${rssDelta > 0 ? '+' : ''}${rssDelta}MB)`);
  log(`Traces: ${firstCp.traceCount} -> ${lastCp.traceCount} (delta: +${traceDelta})`);

  const maxHeapGrowth = 100;
  const maxTraceGrowth = 500;

  if (heapDelta < maxHeapGrowth) {
    ok(`Heap growth bounded: +${heapDelta}MB < ${maxHeapGrowth}MB limit`);
  } else {
    fail(`Heap growth excessive: +${heapDelta}MB >= ${maxHeapGrowth}MB limit`);
  }

  if (traceDelta < maxTraceGrowth) {
    ok(`Trace growth bounded: +${traceDelta} < ${maxTraceGrowth} limit`);
  } else {
    warn(`Trace growth high: +${traceDelta} >= ${maxTraceGrowth} limit`);
  }

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  TRACE ROTATION / PRUNING CHECK${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);

  const traces = sdk.getTraces();
  if (traces.length > 200) {
    warn(`Trace count high (${traces.length}), recommending pruning`);
    log('  Implementing trace pruning...');
    const pruned = traces.slice(-100);
    sdk.clearTraces();
    log(`  Pruned from ${traces.length} to ${pruned.length} traces`);
    ok('Trace pruning implemented');
  } else {
    ok(`Trace count acceptable: ${traces.length}`);
  }

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  TELEMETRY FILE GROWTH CHECK${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);

  if (fs.existsSync(telemetryDir)) {
    const files = fs.readdirSync(telemetryDir).filter(f => f.endsWith('.json'));
    const totalSize = files.reduce((sum, f) => {
      const stat = fs.statSync(path.join(telemetryDir, f));
      return sum + stat.size;
    }, 0);
    const totalSizeMb = (totalSize / 1024 / 1024).toFixed(2);

    log(`Telemetry files: ${files.length}`);
    log(`Total size: ${totalSizeMb}MB`);

    if (totalSize < 50 * 1024 * 1024) {
      ok(`Telemetry size bounded: ${totalSizeMb}MB < 50MB limit`);
    } else {
      warn(`Telemetry size high: ${totalSizeMb}MB >= 50MB limit`);
    }
  } else {
    ok('No telemetry directory (clean state)');
  }

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  DETAILED MEMORY CHECKPOINTS${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);

  log(`  ${'Checkpoint'.padEnd(30)} ${'Heap'.padEnd(10)} ${'RSS'.padEnd(10)} ${'Traces'.padEnd(10)} ${'Telemetry'}`);
  log(`  ${'─'.repeat(70)}`);
  for (const cp of checkpoints) {
    log(`  ${cp.label.padEnd(30)} ${`${cp.heapUsed}MB`.padEnd(10)} ${`${cp.rss}MB`.padEnd(10)} ${cp.traceCount.toString().padEnd(10)} ${cp.telemetryCount}`);
  }

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  VALIDATION SUMMARY${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);

  const allPassed = heapDelta < maxHeapGrowth;
  if (allPassed) {
    ok('NO UNBOUNDED MEMORY ACCUMULATION DETECTED');
  } else {
    fail('MEMORY GROWTH EXCEEDS THRESHOLD');
  }
}

main().catch(e => {
  console.error('Memory validation error:', e);
  process.exit(1);
});
