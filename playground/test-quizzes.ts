import { withLogin, printHeader, printDuration, C } from './utils';

async function main() {
  printHeader('VULMS Quizzes Test');
  const start = Date.now();

  const result = await withLogin(async (client) => {
    const courseCode = process.env.TEST_COURSE;

    const quizzes = courseCode
      ? await client.quizzes.getQuizzes(courseCode)
      : await client.quizzes.getQuizzes();

    if (quizzes.length === 0) {
      console.log(`${C.yellow}No quizzes found.${C.reset}`);
    } else {
      console.log(`${C.green}Found ${quizzes.length} quizzes:${C.reset}\n`);
      for (const q of quizzes) {
        const due = q.dueDate?.toLocaleDateString() || 'N/A';
        const sc = q.status === 'submitted' ? C.green : q.status === 'missed' ? C.red : C.yellow;
        console.log(`  [${sc}${q.status}${C.reset}] ${C.blue}${q.courseCode}${C.reset} | ${q.title} | Due: ${due}`);
        if (q.totalMarks) console.log(`    Marks: ${q.totalMarks}`);
        if (q.obtainedMarks !== undefined) console.log(`    Obtained: ${q.obtainedMarks}/${q.totalMarks}`);
      }
    }

    return quizzes;
  });

  if (result) printDuration(start);
}

main().catch((e) => {
  console.error(`${C.red}Quizzes test failed:${C.reset}`, e);
  process.exit(1);
});
