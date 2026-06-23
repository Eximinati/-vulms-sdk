import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '.env') });
import { VulmsSDK } from '../src';

const STUDENT_ID = process.env.VULMS_ID!;
const PASSWORD = process.env.VULMS_PASSWORD!;
const AFFECTED_COURSES = ['CS301', 'CS302', 'MTH202', 'PHY101'];

async function main() {
  console.log('=== Assignment Investigation ===\n');

  const sdk = new VulmsSDK({ debug: false });
  const loginResult = await sdk.loginWithBrowser(STUDENT_ID, PASSWORD);
  if (!loginResult.success) {
    console.log('Login failed:', loginResult.error);
    return;
  }
  console.log('Login OK\n');

  // Get all courses to see what VULMS reports
  const courses = await sdk.getCourses();
  console.log(`Enrolled courses: ${courses.length}`);
  for (const c of courses) {
    console.log(`  ${c.code} - ${c.title}`);
  }

  // Get home page HTML to check dashboard indicators
  const homeHtml = await sdk.getDashboardHtml();
  const indicatorMatch = homeHtml.match(/Assignments\s*<span[^>]*>(\d+)<\/span>/gi);
  console.log('\nDashboard assignment indicators:', indicatorMatch);

  // Try to get assignments for each affected course individually
  console.log('\n--- Affected Course Investigation ---\n');

  for (const code of AFFECTED_COURSES) {
    console.log(`\n=== ${code} ===`);

    // Check if course exists in enrolled list
    const course = courses.find(c => c.code === code);
    if (!course) {
      console.log(`  Course ${code} NOT FOUND in enrolled courses`);
      continue;
    }
    console.log(`  Course exists: ${course.title}`);

    // Try individual assignment fetch
    try {
      const assignments = await sdk.assignments.getAssignments(code);
      console.log(`  Assignments returned: ${assignments.length}`);
      for (const a of assignments) {
        console.log(`    - ${a.title} (${a.status})`);
      }
    } catch (err) {
      console.log(`  Error fetching assignments: ${(err as Error).message}`);
    }
  }

  // Get full traversal report
  console.log('\n--- Full Assignment Traversal ---\n');
  const agg = await sdk.assignments.getAll();
  console.log(`Total assignments: ${agg.summary.total}`);
  console.log(`By course:`);
  for (const [code, assignments] of agg.byCourse) {
    console.log(`  ${code}: ${assignments.length} assignments`);
  }

  // Check traversal report
  const report = await sdk.assignments.getTraversalReport();
  console.log('\nTraversal steps:');
  for (const step of report.steps) {
    const status = step.success ? 'OK' : 'FAIL';
    console.log(`  ${step.courseCode}: ${status} (${step.assignmentsFound} found) ${step.error || ''}`);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
