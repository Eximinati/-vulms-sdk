import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '.env') });
import { VulmsSDK } from '../src';

const RUNS = 10;
const studentId = process.env.VULMS_ID!;
const password = process.env.VULMS_PASSWORD!;

interface RunResult {
  run: number;
  loginSuccess: boolean;
  loginMs: number;
  exportSuccess: boolean;
  importSuccess: boolean;
  validateSuccess: boolean;
  exportImportMs: number;
  assignmentsSuccess: boolean;
  assignmentsMs: number;
  coursesSuccess: boolean;
  coursesMs: number;
  error?: string;
}

const results: RunResult[] = [];

async function runTest(run: number): Promise<RunResult> {
  const result: RunResult = {
    run,
    loginSuccess: false,
    loginMs: 0,
    exportSuccess: false,
    importSuccess: false,
    validateSuccess: false,
    exportImportMs: 0,
    assignmentsSuccess: false,
    assignmentsMs: 0,
    coursesSuccess: false,
    coursesMs: 0,
  };

  try {
    // Test A: loginWithBrowser
    const client = new VulmsSDK({ debug: false });
    const loginStart = Date.now();
    const loginResult = await client.loginWithBrowser(studentId, password);
    result.loginMs = Date.now() - loginStart;
    result.loginSuccess = loginResult.success;

    if (!loginResult.success) {
      result.error = loginResult.error;
      return result;
    }

    // Test B: exportSession → importSession → validateImportedSession
    const eiStart = Date.now();
    const exported = client.exportSession();
    result.exportSuccess = true;

    const client2 = new VulmsSDK({ debug: false });
    await client2.importSession(exported);
    result.importSuccess = true;

    const validation = await client2.validateImportedSession();
    result.validateSuccess = validation.valid;
    result.exportImportMs = Date.now() - eiStart;

    if (!validation.valid) {
      result.error = `Validation failed: ${validation.reason}`;
      return result;
    }

    // Test C: getAssignments
    const assignStart = Date.now();
    const assignments = await client2.assignments.getAll();
    result.assignmentsMs = Date.now() - assignStart;
    result.assignmentsSuccess = Array.isArray(assignments);

    // Test D: getCourses
    const courseStart = Date.now();
    const courses = await client2.getCourses();
    result.coursesMs = Date.now() - courseStart;
    result.coursesSuccess = Array.isArray(courses);

  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  }

  return result;
}

function printResults(): void {
  console.log('\n' + '='.repeat(80));
  console.log('LOGIN OPTIMIZATION TEST RESULTS (10 RUNS)');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.loginSuccess);
  const failed = results.filter(r => !r.loginSuccess);

  console.log(`\nTotal runs: ${RUNS}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  if (successful.length > 0) {
    const loginTimes = successful.map(r => r.loginMs);
    const avgLogin = loginTimes.reduce((a, b) => a + b, 0) / loginTimes.length;
    const minLogin = Math.min(...loginTimes);
    const maxLogin = Math.max(...loginTimes);

    console.log('\n--- LOGIN PERFORMANCE ---');
    console.log(`Average: ${avgLogin.toFixed(0)}ms`);
    console.log(`Fastest: ${minLogin}ms`);
    console.log(`Slowest: ${maxLogin}ms`);

    const exportImportTimes = successful.map(r => r.exportImportMs);
    const avgEI = exportImportTimes.reduce((a, b) => a + b, 0) / exportImportTimes.length;
    console.log(`\nExport+Import+Validate avg: ${avgEI.toFixed(0)}ms`);

    const assignTimes = successful.filter(r => r.assignmentsSuccess).map(r => r.assignmentsMs);
    if (assignTimes.length > 0) {
      const avgAssign = assignTimes.reduce((a, b) => a + b, 0) / assignTimes.length;
      console.log(`Assignments avg: ${avgAssign.toFixed(0)}ms`);
    }

    const courseTimes = successful.filter(r => r.coursesSuccess).map(r => r.coursesMs);
    if (courseTimes.length > 0) {
      const avgCourses = courseTimes.reduce((a, b) => a + b, 0) / courseTimes.length;
      console.log(`Courses avg: ${avgCourses.toFixed(0)}ms`);
    }

    console.log('\n--- ALL RUNS ---');
    for (const r of results) {
      const status = r.loginSuccess ? 'PASS' : 'FAIL';
      const extras = r.loginSuccess
        ? `export=${r.exportSuccess ? 'OK' : 'FAIL'} import=${r.importSuccess ? 'OK' : 'FAIL'} valid=${r.validateSuccess ? 'OK' : 'FAIL'} assign=${r.assignmentsSuccess ? 'OK' : 'FAIL'} courses=${r.coursesSuccess ? 'OK' : 'FAIL'}`
        : `error=${r.error}`;
      console.log(`  Run ${r.run.toString().padStart(2)}: ${status} ${r.loginMs}ms ${extras}`);
    }
  }

  if (failed.length > 0) {
    console.log('\n--- FAILURES ---');
    for (const r of failed) {
      console.log(`  Run ${r.run}: ${r.error}`);
    }
  }
}

async function main() {
  if (!studentId || !password) {
    console.log('Set VULMS_ID and VULMS_PASSWORD in .env');
    process.exit(1);
  }

  console.log(`Running login optimization test: ${RUNS} iterations`);
  console.log(`Student: ${studentId}\n`);

  for (let i = 1; i <= RUNS; i++) {
    console.log(`--- Run ${i}/${RUNS} ---`);
    const result = await runTest(i);
    results.push(result);
    console.log(`  ${result.loginSuccess ? 'PASS' : 'FAIL'} login=${result.loginMs}ms`);
  }

  printResults();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
