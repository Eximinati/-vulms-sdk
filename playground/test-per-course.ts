import 'dotenv/config';
import { VulmsSDK } from '../src';
import type { Quiz } from '../src/types/quizzes';
import type { Assignment } from '../src/types/assignments';
import type { GDB } from '../src/types/gdb';
import type { Lecture } from '../src/types/lectures';

const C = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
};

const statusColor = (s: string) => {
  if (s === 'submitted' || s === 'declared') return C.green;
  if (s === 'missed' || s === 'closed') return C.red;
  if (s === 'open' || s === 'pending') return C.yellow;
  return C.blue;
};

function checkCredentials() {
  const id = process.env.VULMS_ID;
  const password = process.env.VULMS_PASSWORD;
  if (!id || !password) {
    console.log(`${C.red}[ERROR] Set VULMS_ID and VULMS_PASSWORD in .env${C.reset}`);
    process.exit(1);
  }
  return { id, password };
}

async function main() {
  const { id, password } = checkCredentials();
  const debug = process.env.DEBUG === 'true';
  const sdk = new VulmsSDK({ debug, snapshots: debug });

  console.log(`\n${C.blue}=== VULMS Per-Course Report ===${C.reset}\n`);

  const useBrowser = process.env.USE_BROWSER === 'true';
  console.log(`Logging in as ${id}...`);
  const loginResult = useBrowser
    ? await sdk.loginWithBrowser(id, password)
    : await sdk.login(id, password);

  if (!loginResult.success) {
    console.log(`${C.red}[ERROR] Login failed: ${loginResult.error}${C.reset}`);
    process.exit(1);
  }
  console.log(`${C.green}[OK] Logged in${C.reset}\n`);

  console.log(`${C.bold}${C.blue}${'─'.repeat(60)}${C.reset}`);
  console.log(`${C.bold}${C.blue} Fetching all data...${C.reset}`);
  console.log(`${C.bold}${C.blue}${'─'.repeat(60)}${C.reset}\n`);

  const [courses, allAssignments, allQuizzes, allGDBs, allLectures] = await Promise.all([
    sdk.courses.getEnrolledCourses(),
    sdk.assignments.getAssignments(),
    sdk.quizzes.getQuizzes(),
    sdk.gdb.getGDBs(),
    sdk.lectures.getLectures(),
  ]);

  for (const course of courses) {
    const code = course.code;
    const assignments = allAssignments.filter((a) => a.courseCode === code);
    const quizzes = allQuizzes.filter((q) => q.courseCode === code);
    const gdbs = allGDBs.filter((g) => g.courseCode === code);
    const lectures = allLectures.filter((l) => l.courseCode === code);

    const total = assignments.length + quizzes.length + gdbs.length + lectures.length;
    if (total === 0) continue;

    console.log(`${C.bold}${C.blue}══ ${code} ══ ${course.title}${C.reset}`);
    console.log(`${C.dim}${'─'.repeat(50)}${C.reset}`);

    if (assignments.length > 0) {
      console.log(`\n  ${C.bold}Assignments${C.reset} (${assignments.length})`);
      for (const a of assignments) {
        const sc = statusColor(a.status);
        const due = a.dueDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || 'N/A';
        const obtained = a.obtainedMarks !== undefined ? `${a.obtainedMarks}/${a.totalMarks}` : `${a.totalMarks || '?'} marks`;
        console.log(`    [${sc}${a.status}${C.reset}] ${a.title}`);
        console.log(`      Due: ${due} | ${obtained}`);
        if (a.submitDate) console.log(`      Submitted: ${a.submitDate.toLocaleDateString()}`);
      }
    }

    if (quizzes.length > 0) {
      console.log(`\n  ${C.bold}Quizzes${C.reset} (${quizzes.length})`);
      for (const q of quizzes) {
        const availSc = statusColor(q.availabilityStatus);
        const subSc = statusColor(q.submissionStatus);
        const endDate = q.endDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || 'N/A';
        const resultStr = q.resultStatus === 'declared' && q.obtainedMarks !== undefined
          ? `${q.obtainedMarks}/${q.totalMarks}`
          : q.availabilityStatus === 'open' ? 'Open' : 'No result';
        console.log(`    ${C.blue}${q.title}${C.reset}`);
        console.log(`      Availability: ${availSc}${q.availabilityStatus}${C.reset} | End: ${endDate}`);
        console.log(`      Submission: ${subSc}${q.submissionStatus}${C.reset} | Result: ${q.resultStatus === 'declared' ? C.green + resultStr + C.reset : C.dim + 'pending' + C.reset}`);
      }
    }

    if (gdbs.length > 0) {
      console.log(`\n  ${C.bold}GDBs${C.reset} (${gdbs.length})`);
      for (const g of gdbs) {
        const sc = statusColor(g.status);
        console.log(`    [${sc}${g.status}${C.reset}] ${g.title}`);
        if (g.dueDate) console.log(`      Due: ${g.dueDate.toLocaleDateString()}`);
      }
    }

    if (lectures.length > 0) {
      console.log(`\n  ${C.bold}Lectures${C.reset} (${lectures.length})`);
      const watched = lectures.filter((l) => l.status === 'watched').length;
      const sc = statusColor('submitted');
      console.log(`    ${sc}${watched}${C.reset}/${C.dim}${lectures.length}${C.reset} watched`);
    }

    console.log('');
  }

  const totalActivities = allAssignments.length + allQuizzes.length + allGDBs.length + allLectures.length;
  console.log(`${C.bold}${C.blue}${'═'.repeat(60)}${C.reset}`);
  console.log(`${C.bold} Summary${C.reset}`);
  console.log(`${C.bold}${C.blue}${'═'.repeat(60)}${C.reset}`);
  console.log(`  Courses:     ${C.blue}${courses.length}${C.reset}`);
  console.log(`  Assignments: ${allAssignments.length}`);
  console.log(`  Quizzes:     ${allQuizzes.length}`);
  console.log(`  GDBs:        ${allGDBs.length}`);
  console.log(`  Lectures:    ${allLectures.length}`);
  console.log(`  ──────────────────`);
  console.log(`  Total:       ${C.bold}${totalActivities}${C.reset}`);

  const traces = sdk.getTraces();
  console.log(`\n${C.dim}HTTP Requests: ${traces.length} | Duration: ${traces.reduce((s, t) => s + t.duration, 0)}ms${C.reset}`);
  console.log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);
}

main().catch((e) => {
  console.error(`${C.red}Fatal error:${C.reset}`, e);
  process.exit(1);
});