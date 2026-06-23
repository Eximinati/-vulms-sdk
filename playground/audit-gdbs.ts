import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '.env') });
import { VulmsSDK } from '../src';

const STUDENT_ID = process.env.VULMS_ID!;
const PASSWORD = process.env.VULMS_PASSWORD!;

async function main() {
  console.log('=== GDB Completeness Audit ===\n');

  const sdk = new VulmsSDK({ debug: false });
  const loginResult = await sdk.loginWithBrowser(STUDENT_ID, PASSWORD);
  if (!loginResult.success) {
    console.log('Login failed:', loginResult.error);
    return;
  }
  console.log('Login OK\n');

  // Get all courses
  const courses = await sdk.getCourses();
  console.log(`Enrolled courses: ${courses.length}`);
  for (const c of courses) {
    console.log(`  ${c.code} - ${c.title}`);
  }

  // Get all GDBs
  console.log('\n--- GDB Traversal ---\n');
  const agg = await sdk.gdb.getAll();

  console.log(`\nTotal GDBs: ${agg.summary.total}`);
  console.log(`By course:`);
  for (const [code, gdbs] of agg.byCourse) {
    console.log(`  ${code}: ${gdbs.length} GDBs`);
  }

  console.log(`\nSummary:`);
  console.log(`  Total: ${agg.summary.total}`);
  console.log(`  Submitted: ${agg.summary.submitted}`);
  console.log(`  Pending: ${agg.summary.pending}`);
  console.log(`  Missed: ${agg.summary.missed}`);
  console.log(`  Result Declared: ${agg.summary.resultDeclared}`);

  // Check traversal report
  const report = await sdk.gdb.getTraversalReport();
  console.log('\nTraversal steps:');
  for (const step of report.steps) {
    const status = step.success ? 'OK' : 'FAIL';
    console.log(`  ${step.courseCode}: ${status} (${step.gdbsFound} found) ${step.error || ''}`);
  }

  // Find courses without GDBs
  const coursesWithGDBs = new Set(agg.byCourse.keys());
  const coursesWithoutGDBs = courses.filter(c => !coursesWithGDBs.has(c.code));
  if (coursesWithoutGDBs.length > 0) {
    console.log('\nCourses without GDBs:');
    for (const c of coursesWithoutGDBs) {
      console.log(`  ${c.code} - ${c.title}`);
    }
  }

  // Check for navigation failures
  const failedCourses = report.steps.filter(s => !s.success);
  if (failedCourses.length > 0) {
    console.log('\nNavigation failures:');
    for (const step of failedCourses) {
      console.log(`  ${step.courseCode}: ${step.error}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
