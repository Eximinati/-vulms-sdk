import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '.env') });
import { VulmsSDK } from '../src';

const STUDENT_ID = process.env.VULMS_ID!;
const PASSWORD = process.env.VULMS_PASSWORD!;

interface ActivityAnalysis {
  type: string;
  courseCode: string;
  title: string;
  dueDate?: string;
  status: string;
  id: string;
}

function generateId(type: string, courseCode: string, title: string, dueDate?: string): string {
  const base = `${type}:${courseCode}:${title}`;
  return dueDate ? `${base}:${dueDate}` : base;
}

async function main() {
  console.log('=== Activity Count Analysis ===\n');

  const sdk = new VulmsSDK({ debug: false });
  const loginResult = await sdk.loginWithBrowser(STUDENT_ID, PASSWORD);
  if (!loginResult.success) {
    console.log('Login failed:', loginResult.error);
    return;
  }
  console.log('Login OK\n');

  // Fetch each data source separately
  console.log('--- Fetching Data Sources ---\n');

  const t0 = Date.now();
  const [assignAgg, quizAgg, gdbAgg] = await Promise.all([
    sdk.assignments.getAll(),
    sdk.quizzes.getAll(),
    sdk.gdb.getAll(),
  ]);
  console.log(`Fetch time: ${Date.now() - t0}ms\n`);

  console.log(`Assignments: ${assignAgg.assignments.length}`);
  console.log(`Quizzes: ${quizAgg.quizzes.length}`);
  console.log(`GDBs: ${gdbAgg.gdbs.length}`);
  console.log(`Total raw: ${assignAgg.assignments.length + quizAgg.quizzes.length + gdbAgg.gdbs.length}\n`);

  // Analyze assignments
  console.log('--- Assignments Analysis ---\n');
  const assignmentIds = new Map<string, number>();
  const assignmentDuplicates: string[] = [];

  for (const a of assignAgg.assignments) {
    const dueDate = a.dueDate instanceof Date ? a.dueDate.toISOString() : a.dueDate;
    const id = generateId('assignment', a.courseCode, a.title, dueDate);
    const count = (assignmentIds.get(id) || 0) + 1;
    assignmentIds.set(id, count);
    if (count > 1) {
      assignmentDuplicates.push(id);
    }
  }

  console.log(`Unique assignments: ${assignmentIds.size}`);
  console.log(`Duplicate IDs: ${assignmentDuplicates.length}`);
  if (assignmentDuplicates.length > 0) {
    console.log('Duplicates:');
    for (const id of assignmentDuplicates) {
      console.log(`  ${id}`);
    }
  }

  // Show all assignments
  console.log('\nAll assignments:');
  for (const a of assignAgg.assignments) {
    const dueDate = a.dueDate instanceof Date ? a.dueDate.toISOString() : a.dueDate;
    console.log(`  ${a.courseCode} | ${a.title} | ${dueDate || 'no date'} | ${a.status}`);
  }

  // Analyze quizzes
  console.log('\n--- Quizzes Analysis ---\n');
  const quizIds = new Map<string, number>();
  const quizDuplicates: string[] = [];

  for (const q of quizAgg.quizzes) {
    const dueDate = q.endDate instanceof Date ? q.endDate.toISOString() : q.endDate;
    const id = generateId('quiz', q.courseCode, q.title, dueDate);
    const count = (quizIds.get(id) || 0) + 1;
    quizIds.set(id, count);
    if (count > 1) {
      quizDuplicates.push(id);
    }
  }

  console.log(`Unique quizzes: ${quizIds.size}`);
  console.log(`Duplicate IDs: ${quizDuplicates.length}`);
  if (quizDuplicates.length > 0) {
    console.log('Duplicates:');
    for (const id of quizDuplicates) {
      console.log(`  ${id}`);
    }
  }

  // Show quizzes by course
  console.log('\nQuizzes by course:');
  for (const [code, quizzes] of quizAgg.byCourse) {
    console.log(`  ${code}: ${quizzes.length}`);
  }

  // Analyze GDBs
  console.log('\n--- GDBs Analysis ---\n');
  const gdbIds = new Map<string, number>();
  const gdbDuplicates: string[] = [];

  for (const g of gdbAgg.gdbs) {
    const dueDate = g.dueDate instanceof Date ? g.dueDate.toISOString() : g.dueDate;
    const id = generateId('gdb', g.courseCode, g.title, dueDate);
    const count = (gdbIds.get(id) || 0) + 1;
    gdbIds.set(id, count);
    if (count > 1) {
      gdbDuplicates.push(id);
    }
  }

  console.log(`Unique GDBs: ${gdbIds.size}`);
  console.log(`Duplicate IDs: ${gdbDuplicates.length}`);
  if (gdbDuplicates.length > 0) {
    console.log('Duplicates:');
    for (const id of gdbDuplicates) {
      console.log(`  ${id}`);
    }
  }

  // Show all GDBs
  console.log('\nAll GDBs:');
  for (const g of gdbAgg.gdbs) {
    const dueDate = g.dueDate instanceof Date ? g.dueDate.toISOString() : g.dueDate;
    console.log(`  ${g.courseCode} | ${g.title} | ${dueDate || 'no date'} | ${g.status}`);
  }

  // Combined analysis
  console.log('\n--- Combined Analysis ---\n');
  const allIds = new Map<string, number>();
  const allDuplicates: string[] = [];

  for (const id of assignmentIds.keys()) {
    const count = (allIds.get(id) || 0) + assignmentIds.get(id)!;
    allIds.set(id, count);
  }
  for (const id of quizIds.keys()) {
    const count = (allIds.get(id) || 0) + quizIds.get(id)!;
    allIds.set(id, count);
  }
  for (const id of gdbIds.keys()) {
    const count = (allIds.get(id) || 0) + gdbIds.get(id)!;
    allIds.set(id, count);
  }

  for (const [id, count] of allIds) {
    if (count > 1) {
      allDuplicates.push(`${id} (x${count})`);
    }
  }

  console.log(`Total unique activity IDs: ${allIds.size}`);
  console.log(`Cross-type duplicates: ${allDuplicates.length}`);
  if (allDuplicates.length > 0) {
    console.log('Duplicates:');
    for (const id of allDuplicates) {
      console.log(`  ${id}`);
    }
  }

  // Summary
  console.log('\n=== Summary ===\n');
  console.log('Expected: 9 + 43 + 4 = 56');
  console.log(`Actual: ${assignAgg.assignments.length} + ${quizAgg.quizzes.length} + ${gdbAgg.gdbs.length} = ${assignAgg.assignments.length + quizAgg.quizzes.length + gdbAgg.gdbs.length}`);
  console.log(`Unique IDs: ${allIds.size}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
