import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });
import { VulmsSDK, type ExportedSession } from '../src';

const C = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
};

const SESSION_FILE = path.join(__dirname, 'session.json');

let passed = 0;
let failed = 0;

function log(msg: string) { console.log(msg); }
function pass(msg: string) { passed++; log(`  ${C.green}PASS${C.reset} ${msg}`); }
function fail(msg: string) { failed++; log(`  ${C.red}FAIL${C.reset} ${msg}`); }
function section(title: string) {
  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold} ${title}${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);
}

function checkCredentials(): { id: string; password: string } | null {
  const id = process.env.VULMS_ID;
  const password = process.env.VULMS_PASSWORD;
  if (!id || !password) {
    log(`${C.red}[ERROR] Set VULMS_ID and VULMS_PASSWORD in playground/.env${C.reset}`);
    log(`${C.dim}  Copy playground/.env.example to playground/.env and fill in credentials${C.reset}`);
    return null;
  }
  return { id, password };
}

function createClient(): VulmsSDK {
  const debug = process.env.DEBUG === 'true';
  return new VulmsSDK({ debug, traceRequests: debug });
}

// ─── Test 1: Export → Import → Validate ───────────────────────────
async function test1_exportImportValidate(creds: { id: string; password: string }) {
  section('Test 1 — Export → Import → Validate');

  log('Step 1: Login with browser...');
  const sdk1 = createClient();
  const loginResult = await sdk1.loginWithBrowser(creds.id, creds.password);
  if (!loginResult.success) {
    fail(`Login failed: ${loginResult.error}`);
    return;
  }
  pass('Login successful');

  log('Step 2: Export session...');
  const session = sdk1.exportSession();
  log(`  cookies length: ${session.cookies.length}`);
  log(`  username: ${session.username}`);
  log(`  sdkVersion: ${session.sdkVersion}`);
  if (session.cookies.length > 0) {
    pass('Session exported with cookies');
  } else {
    fail('Session exported but cookies empty');
    return;
  }

  log('Step 3: Create new SDK instance + import...');
  const sdk2 = createClient();
  await sdk2.importSession(session);
  pass('Session imported into new instance');

  log('Step 4: Validate imported session...');
  const result = await sdk2.validateImportedSession();
  log(`  result: ${JSON.stringify(result)}`);

  if (result.valid === true) {
    pass('validateImportedSession() returned { valid: true }');
  } else {
    fail(`Expected valid=true, got valid=${result.valid} reason=${result.reason}`);
  }
}

// ─── Test 2: Use Data Without Re-Login ────────────────────────────
async function test2_dataWithoutReLogin(creds: { id: string; password: string }) {
  section('Test 2 — Use Data Without Re-Login (Most Important)');

  log('Step 1: Login + export...');
  const sdk1 = createClient();
  const loginResult = await sdk1.loginWithBrowser(creds.id, creds.password);
  if (!loginResult.success) {
    fail(`Login failed: ${loginResult.error}`);
    return;
  }
  const session = sdk1.exportSession();
  pass('Logged in and exported');

  log('Step 2: New instance + import...');
  const sdk2 = createClient();
  await sdk2.importSession(session);
  pass('Imported');

  log('Step 3: Fetch assignments (should NOT launch Playwright)...');
  log(`${C.dim}  If you see Chromium launch or login prompt, this test FAILS${C.reset}`);

  try {
    const agg = await sdk2.assignments.getAll();
    const total = agg.assignments.length;
    log(`  assignments fetched: ${total}`);

    if (total > 0) {
      pass(`Got ${total} assignments without re-login`);
      log(`  first: ${agg.assignments[0].title} (${agg.assignments[0].courseCode})`);
    } else {
      pass('Got 0 assignments (may be normal if no assignments exist)');
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes('login') || msg.toLowerCase().includes('playwright')) {
      fail(`Request triggered login flow: ${msg}`);
    } else {
      fail(`Request failed: ${msg}`);
    }
  }

  log('Step 4: Fetch quizzes...');
  try {
    const quizzes = await sdk2.quizzes.getQuizzes();
    pass(`Got ${quizzes.length} quizzes without re-login`);
  } catch (e) {
    fail(`Quizzes failed: ${e instanceof Error ? e.message : e}`);
  }
}

// ─── Test 3: Process Restart Simulation ───────────────────────────
async function test3_processRestartSimulation(creds: { id: string; password: string }) {
  section('Test 3 — Process Restart Simulation');

  log('Step 1: Login + export + write to disk...');
  const sdk1 = createClient();
  const loginResult = await sdk1.loginWithBrowser(creds.id, creds.password);
  if (!loginResult.success) {
    fail(`Login failed: ${loginResult.error}`);
    return;
  }

  const session = sdk1.exportSession();
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
  pass(`Session written to ${SESSION_FILE}`);

  log(`${C.dim}  (In real scenario, process stops here)${C.reset}`);
  log(`${C.dim}  (Simulating restart by creating fresh SDK instance)${C.reset}`);

  log('Step 2: Simulate restart — read from disk + import...');
  const raw = fs.readFileSync(SESSION_FILE, 'utf8');
  const restoredSession: ExportedSession = JSON.parse(raw);

  log(`  Read ${raw.length} bytes from ${SESSION_FILE}`);
  log(`  cookies length: ${restoredSession.cookies.length}`);
  log(`  username: ${restoredSession.username}`);
  log(`  exportedAt: ${new Date(restoredSession.exportedAt).toISOString()}`);

  const sdk2 = createClient();
  await sdk2.importSession(restoredSession);
  pass('Session imported after simulated restart');

  log('Step 3: Validate...');
  const validation = await sdk2.validateImportedSession();
  if (validation.valid) {
    pass('Session valid after restart');
  } else {
    fail(`Session invalid after restart: ${validation.reason}`);
    return;
  }

  log('Step 4: Fetch assignments...');
  try {
    const agg = await sdk2.assignments.getAll();
    pass(`Got ${agg.assignments.length} assignments after restart`);
  } catch (e) {
    fail(`Assignments failed after restart: ${e instanceof Error ? e.message : e}`);
  }

  // Cleanup
  try { fs.unlinkSync(SESSION_FILE); } catch { /* ignore */ }
}

// ─── Test 4: Expired / Invalid Session ────────────────────────────
async function test4_expiredSession(creds: { id: string; password: string }) {
  section('Test 4 — Expired / Invalid Session');

  log('Step 1: Login + export...');
  const sdk1 = createClient();
  const loginResult = await sdk1.loginWithBrowser(creds.id, creds.password);
  if (!loginResult.success) {
    fail(`Login failed: ${loginResult.error}`);
    return;
  }
  const session = sdk1.exportSession();
  pass('Logged in and exported');

  log('Step 2: Tamper with cookies...');
  session.cookies = 'fakecookie1=fakevalue1; fakecookie2=fakevalue2';
  log(`  cookies now: "${session.cookies}"`);

  log('Step 3: Import tampered session...');
  const sdk2 = createClient();
  await sdk2.importSession(session);
  pass('Tampered session imported');

  log('Step 4: Validate (should be invalid)...');
  const result = await sdk2.validateImportedSession();
  log(`  result: ${JSON.stringify(result)}`);

  if (result.valid === false) {
    pass('validateImportedSession() returned { valid: false }');
  } else {
    fail(`Expected valid=false, got valid=${result.valid}`);
  }
}

// ─── Test 5: Cache After Import ───────────────────────────────────
async function test5_cacheAfterImport(creds: { id: string; password: string }) {
  section('Test 5 — Cache After Import');

  log('Step 1: Login + export + import...');
  const sdk1 = createClient();
  const loginResult = await sdk1.loginWithBrowser(creds.id, creds.password);
  if (!loginResult.success) {
    fail(`Login failed: ${loginResult.error}`);
    return;
  }
  const session = sdk1.exportSession();

  const sdk2 = createClient();
  await sdk2.importSession(session);
  pass('Session imported');

  log('Step 2: getCourses()...');
  try {
    const courses = await sdk2.getCourses();
    log(`  courses: ${courses.length}`);
    for (const c of courses) {
      log(`    ${c.code} — ${c.title}`);
    }
    pass(`getCourses() returned ${courses.length} courses`);
  } catch (e) {
    fail(`getCourses() failed: ${e instanceof Error ? e.message : e}`);
  }

  log('Step 3: getAssignments()...');
  try {
    const agg = await sdk2.assignments.getAll();
    pass(`getAssignments() returned ${agg.assignments.length} assignments`);
  } catch (e) {
    fail(`getAssignments() failed: ${e instanceof Error ? e.message : e}`);
  }

  log('Step 4: Check runtime state integrity...');
  const state = sdk2.getRuntimeState();
  const issues: string[] = [];

  if (state.username === undefined) issues.push('username is undefined');
  if (!state.loggedIn) issues.push('loggedIn is false');
  if (!sdk2.isAuthenticated()) issues.push('isAuthenticated() returns false');

  if (issues.length === 0) {
    pass('Runtime state intact — no undefined username, no missing login');
  } else {
    for (const issue of issues) {
      fail(`Runtime issue: ${issue}`);
    }
  }

  log('Step 5: Cache telemetry...');
  const telemetry = sdk2.getCacheTelemetry();
  log(`  cacheHits: ${telemetry.cacheHits}`);
  log(`  cacheMisses: ${telemetry.cacheMisses}`);
  log(`  skippedTraversals: ${telemetry.skippedTraversals}`);
  log(`  requestsSaved: ${telemetry.requestsSaved}`);
  pass('Cache telemetry accessible');
}

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  log(`${C.blue}${C.bold}VULMS SDK — Session Persistence Test Suite${C.reset}\n`);

  const creds = checkCredentials();
  if (!creds) process.exit(1);

  log(`Student ID: ${creds.id}`);
  log(`Method: browser (loginWithBrowser)`);
  log(`Session file: ${SESSION_FILE}\n`);

  const start = Date.now();

  // Parse --test flag
  const testArg = process.argv.find(a => a.startsWith('--test='));
  const testNum = testArg ? parseInt(testArg.split('=')[1]) : 0;

  const tests: Array<{ num: number; fn: () => Promise<void> }> = [
    { num: 1, fn: () => test1_exportImportValidate(creds) },
    { num: 2, fn: () => test2_dataWithoutReLogin(creds) },
    { num: 3, fn: () => test3_processRestartSimulation(creds) },
    { num: 4, fn: () => test4_expiredSession(creds) },
    { num: 5, fn: () => test5_cacheAfterImport(creds) },
  ];

  const toRun = testNum > 0 ? tests.filter(t => t.num === testNum) : tests;

  for (const test of toRun) {
    try {
      await test.fn();
    } catch (e) {
      fail(`Test ${test.num} threw: ${e instanceof Error ? e.message : e}`);
    }
  }

  // Summary
  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold} RESULTS${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);
  log(`  ${C.green}Passed: ${passed}${C.reset}`);
  log(`  ${C.red}Failed: ${failed}${C.reset}`);
  log(`  Total:  ${passed + failed}`);
  log(`\n  Duration: ${Date.now() - start}ms\n`);

  if (failed > 0) {
    log(`${C.red}SOME TESTS FAILED${C.reset}`);
    process.exit(1);
  } else {
    log(`${C.green}ALL TESTS PASSED${C.reset}`);
  }
}

main().catch((e) => {
  console.error(`${C.red}Test suite crashed:${C.reset}`, e);
  process.exit(1);
});
