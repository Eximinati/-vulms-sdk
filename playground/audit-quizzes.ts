import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '.env') });
import { VulmsSDK } from '../src';

const STUDENT_ID = process.env.VULMS_ID!;
const PASSWORD = process.env.VULMS_PASSWORD!;

async function main() {
  console.log('=== Quiz Completeness Audit ===\n');

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

  // Get all quizzes
  console.log('\n--- Quiz Traversal ---\n');
  const agg = await sdk.quizzes.getAll();

  console.log(`\nTotal quizzes: ${agg.summary.total}`);
  console.log(`By course:`);
  for (const [code, quizzes] of agg.byCourse) {
    console.log(`  ${code}: ${quizzes.length} quizzes`);
  }

  console.log(`\nSummary:`);
  console.log(`  Total: ${agg.summary.total}`);
  console.log(`  Submitted: ${agg.summary.submitted}`);
  console.log(`  Pending: ${agg.summary.pending}`);
  console.log(`  Open: ${agg.summary.open}`);
  console.log(`  Closed: ${agg.summary.closed}`);
  console.log(`  Result Declared: ${agg.summary.resultDeclared}`);

  // Check traversal report
  const report = await sdk.quizzes.getTraversalReport();
  console.log('\nTraversal steps:');
  for (const step of report.steps) {
    const status = step.success ? 'OK' : 'FAIL';
    console.log(`  ${step.courseCode}: ${status} (${step.quizzesFound} found) ${step.error || ''}`);
  }

  // Find courses without quizzes
  const coursesWithQuizzes = new Set(agg.byCourse.keys());
  const coursesWithoutQuizzes = courses.filter(c => !coursesWithQuizzes.has(c.code));
  if (coursesWithoutQuizzes.length > 0) {
    console.log('\nCourses without quizzes:');
    for (const c of coursesWithoutQuizzes) {
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
