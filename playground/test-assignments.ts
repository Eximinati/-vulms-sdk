import { withLogin, printHeader, printDuration, C } from './utils';

async function main() {
  printHeader('VULMS Assignment Report');
  const start = Date.now();

  const result = await withLogin(async (client) => {
    console.log('Fetching all assignments across all courses...\n');

    const courses = await client.courses.getEnrolledCourses();
    const agg = await client.assignments.getAll();

    console.log(`${C.yellow}=== ASSIGNMENT SUMMARY ===${C.reset}\n`);
    console.log(`  Total Assignments: ${C.bold}${agg.summary.total}${C.reset}`);
    console.log(`  ${C.green}Submitted:${C.reset}       ${agg.summary.submitted}`);
    console.log(`  ${C.yellow}Pending:${C.reset}        ${agg.summary.pending}`);
    console.log(`  ${C.red}Missed:${C.reset}          ${agg.summary.missed}`);
    console.log(`  ${C.blue}Result Declared:${C.reset} ${agg.summary.resultDeclared}`);
    console.log();

    const allCourseCodes = courses.map(c => c.code).sort();

    for (const courseCode of allCourseCodes) {
      const assignments = agg.byCourse.get(courseCode) || [];

      console.log(`${C.cyan}=== ${courseCode} ===${C.reset}`);

      if (assignments.length === 0) {
        console.log(`  ${C.yellow}No Assignment Yet${C.reset}`);
        console.log();
        continue;
      }

      console.log(`  (${assignments.length} assignment${assignments.length !== 1 ? 's' : ''})`);

      for (const a of assignments) {
        const statusColor = a.status === 'submitted' ? C.green :
                           a.status === 'pending' ? C.yellow :
                           a.status === 'missed' ? C.red :
                           a.status === 'result_declared' ? C.blue : C.reset;
        const statusLabel = a.status === 'result_declared' ? 'Result Declared' : a.status.charAt(0).toUpperCase() + a.status.slice(1);

        console.log(`  ${C.bold}${a.title}${C.reset}`);
        console.log(`    Status: ${statusColor}${statusLabel}${C.reset}`);

        if (a.lesson) {
          console.log(`    Lesson: ${a.lesson}`);
        }

        if (a.dueDate) {
          const dueStr = a.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const isPast = a.dueDate < new Date();
          console.log(`    Due: ${isPast ? C.red : C.reset}${dueStr}${C.reset}`);
        }

        if (a.submitDate) {
          const submitStr = a.submitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          console.log(`    Submitted: ${submitStr}`);
        }

        if (a.totalMarks !== undefined) {
          if (a.obtainedMarks !== undefined) {
            console.log(`    Marks: ${C.green}${a.obtainedMarks}${C.reset} / ${a.totalMarks}`);
          } else if (a.status === 'result_declared') {
            console.log(`    Marks: ${C.yellow}Pending/${C.reset} ${a.totalMarks}`);
          } else {
            console.log(`    Marks: ${C.yellow}?${C.reset} / ${a.totalMarks}`);
          }
        }

        if (a.fileSize) {
          console.log(`    File: ${a.fileSize}`);
        }

        console.log();
      }
    }

    console.log(`${C.yellow}=== SUMMARY ===${C.reset}\n`);
    console.log(`  Total Assignments: ${agg.summary.total}`);
    console.log(`  ${C.green}Submitted:${C.reset}       ${agg.summary.submitted}`);
    console.log(`  ${C.yellow}Pending:${C.reset}        ${agg.summary.pending}`);
    console.log(`  ${C.red}Missed:${C.reset}          ${agg.summary.missed}`);
    console.log(`  ${C.blue}Result Declared:${C.reset} ${agg.summary.resultDeclared}`);
    console.log(`  Courses: ${allCourseCodes.length}`);

    const traces = client.getTraces();
    console.log(`\n${C.yellow}HTTP Traces: ${traces.length} requests${C.reset}`);

    return agg;
  });

  if (result) printDuration(start);
}

main().catch((e) => {
  console.error(`${C.red}Assignment report failed:${C.reset}`, e);
  process.exit(1);
});
