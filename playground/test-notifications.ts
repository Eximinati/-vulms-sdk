import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '.env') });
import { VulmsSDK } from '../src';
import { NotificationService } from '../backend/src/notifications/service.js';

const STUDENT_ID = process.env.VULMS_ID!;
const PASSWORD = process.env.VULMS_PASSWORD!;

async function main() {
  console.log('=== Notification Engine Test ===\n');

  // Login
  console.log('1. Login...');
  const sdk = new VulmsSDK({ debug: false });
  const loginResult = await sdk.loginWithBrowser(STUDENT_ID, PASSWORD);
  if (!loginResult.success) {
    console.log('   FAIL:', loginResult.error);
    return;
  }
  console.log('   OK\n');

  // Fetch activities
  console.log('2. Fetching activities...');
  const [assignAgg, quizAgg, gdbAgg] = await Promise.all([
    sdk.assignments.getAll(),
    sdk.quizzes.getAll(),
    sdk.gdb.getAll(),
  ]);

  const activities = [
    ...assignAgg.assignments.map(a => ({
      id: `assignment:${a.courseCode}:${a.title}:${a.dueDate instanceof Date ? a.dueDate.toISOString() : a.dueDate || ''}`,
      type: 'assignment' as const,
      courseCode: a.courseCode,
      courseTitle: a.courseTitle,
      title: a.title,
      dueDate: a.dueDate instanceof Date ? a.dueDate.toISOString() : a.dueDate,
      status: a.status,
      totalMarks: a.totalMarks,
      obtainedMarks: a.obtainedMarks,
    })),
    ...quizAgg.quizzes.map(q => ({
      id: `quiz:${q.courseCode}:${q.title}:${q.endDate instanceof Date ? q.endDate.toISOString() : q.endDate || ''}`,
      type: 'quiz' as const,
      courseCode: q.courseCode,
      courseTitle: q.courseTitle,
      title: q.title,
      dueDate: q.endDate instanceof Date ? q.endDate.toISOString() : q.endDate,
      status: q.submissionStatus === 'submitted' ? 'submitted' : q.resultStatus === 'declared' ? 'result_declared' : 'pending',
      totalMarks: q.totalMarks,
      obtainedMarks: q.obtainedMarks,
    })),
    ...gdbAgg.gdbs.map(g => ({
      id: `gdb:${g.courseCode}:${g.title}:${g.dueDate instanceof Date ? g.dueDate.toISOString() : g.dueDate || ''}`,
      type: 'gdb' as const,
      courseCode: g.courseCode,
      courseTitle: g.courseTitle,
      title: g.title,
      dueDate: g.dueDate instanceof Date ? g.dueDate.toISOString() : g.dueDate,
      status: g.status,
      totalMarks: g.totalMarks,
      obtainedMarks: g.obtainedMarks,
    })),
  ];

  console.log(`   Total activities: ${activities.length}\n`);

  // Initialize service
  const service = new NotificationService();

  // First run
  console.log('3. First run - generating candidates...');
  const result1 = service.generateCandidates(activities);
  console.log(`   New candidates: ${result1.newCount}`);
  console.log(`   Skipped: ${result1.skippedCount}`);
  console.log(`   Store size: ${service.getStoreSize()}\n`);

  // Show candidates
  console.log('   Candidates:');
  for (const c of result1.candidates) {
    console.log(`     ${c.type}: ${c.title} (${c.courseCode})`);
  }

  // Second run (should skip all)
  console.log('\n4. Second run - verifying deduplication...');
  const result2 = service.generateCandidates(activities);
  console.log(`   New candidates: ${result2.newCount}`);
  console.log(`   Skipped: ${result2.skippedCount}`);
  console.log(`   Store size: ${service.getStoreSize()}\n`);

  // Clear store
  console.log('5. Clearing store...');
  service.clearStore();
  console.log(`   Store size: ${service.getStoreSize()}\n`);

  // Third run (should generate again)
  console.log('6. Third run after clear - verifying candidates generated again...');
  const result3 = service.generateCandidates(activities);
  console.log(`   New candidates: ${result3.newCount}`);
  console.log(`   Skipped: ${result3.skippedCount}`);
  console.log(`   Store size: ${service.getStoreSize()}\n`);

  // Summary
  console.log('=== Summary ===\n');
  console.log(`Total activities processed: ${activities.length}`);
  console.log(`Candidates generated (first run): ${result1.newCount}`);
  console.log(`Deduplication working: ${result2.newCount === 0 ? 'YES' : 'NO'}`);
  console.log(`Store clear working: ${result3.newCount === result1.newCount ? 'YES' : 'NO'}`);

  // Categories
  console.log('\n=== Notification Categories ===\n');
  const categories = new Map<string, number>();
  for (const c of result1.candidates) {
    categories.set(c.type, (categories.get(c.type) || 0) + 1);
  }
  for (const [type, count] of categories) {
    console.log(`  ${type}: ${count}`);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
