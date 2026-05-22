import { withLogin, printHeader, printDuration, C } from './utils';

async function main() {
  printHeader('VULMS GDB Report');
  const start = Date.now();

  const result = await withLogin(async (client) => {
    const courseCode = process.env.TEST_COURSE;

    if (courseCode) {
      const gdbs = await client.gdb.getGDBs(courseCode);

      console.log(`${C.cyan}=== ${courseCode.toUpperCase()} ===${C.reset}`);

      if (gdbs.length === 0) {
        console.log(`  ${C.yellow}No GDB Yet${C.reset}`);
      } else {
        for (const g of gdbs) {
          const statusColor = g.status === 'submitted' || g.status === 'attempted' ? C.green :
                             g.status === 'missed' ? C.red :
                             g.status === 'result_declared' ? C.blue : C.yellow;
          const statusLabel = g.status === 'result_declared' ? 'Result Declared' :
                             g.status.charAt(0).toUpperCase() + g.status.slice(1);

          console.log(`  ${C.bold}${g.title}${C.reset}`);
          console.log(`    Status: ${statusColor}${statusLabel}${C.reset}`);

          if (g.dueDate) {
            const dueStr = g.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            console.log(`    Due: ${dueStr}`);
          }

          if (g.totalMarks !== undefined) {
            if (g.obtainedMarks !== undefined) {
              console.log(`    Marks: ${C.green}${g.obtainedMarks}${C.reset} / ${g.totalMarks}`);
            } else {
              console.log(`    Marks: ${C.yellow}?${C.reset} / ${g.totalMarks}`);
            }
          }

          console.log();
        }
      }

      return gdbs;
    }

    const courses = await client.courses.getEnrolledCourses();
    const agg = await client.gdb.getAll();

    console.log(`${C.yellow}=== GDB SUMMARY ===${C.reset}\n`);
    console.log(`  Total GDBs: ${C.bold}${agg.summary.total}${C.reset}`);
    console.log(`  ${C.green}Submitted:${C.reset}       ${agg.summary.submitted}`);
    console.log(`  ${C.yellow}Pending:${C.reset}        ${agg.summary.pending}`);
    console.log(`  ${C.red}Missed:${C.reset}          ${agg.summary.missed}`);
    console.log(`  ${C.blue}Result Declared:${C.reset} ${agg.summary.resultDeclared}`);
    console.log();

    const allCourseCodes = courses.map(c => c.code).sort();

    for (const code of allCourseCodes) {
      const gdbs = agg.byCourse.get(code) || [];

      console.log(`${C.cyan}=== ${code} ===${C.reset}`);

      if (gdbs.length === 0) {
        console.log(`  ${C.yellow}No GDB Yet${C.reset}`);
        console.log();
        continue;
      }

      for (const g of gdbs) {
        const statusColor = g.status === 'submitted' || g.status === 'attempted' ? C.green :
                           g.status === 'missed' ? C.red :
                           g.status === 'result_declared' ? C.blue : C.yellow;
        const statusLabel = g.status === 'result_declared' ? 'Result Declared' :
                           g.status.charAt(0).toUpperCase() + g.status.slice(1);

        console.log(`  ${C.bold}${g.title}${C.reset}`);
        console.log(`    Status: ${statusColor}${statusLabel}${C.reset}`);

        if (g.dueDate) {
          const dueStr = g.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          console.log(`    Due: ${dueStr}`);
        }

        if (g.totalMarks !== undefined) {
          if (g.obtainedMarks !== undefined) {
            console.log(`    Marks: ${C.green}${g.obtainedMarks}${C.reset} / ${g.totalMarks}`);
          } else {
            console.log(`    Marks: ${C.yellow}?${C.reset} / ${g.totalMarks}`);
          }
        }

        console.log();
      }
    }

    console.log(`${C.yellow}=== SUMMARY ===${C.reset}\n`);
    console.log(`  Total GDBs: ${agg.summary.total}`);
    console.log(`  ${C.green}Submitted:${C.reset}       ${agg.summary.submitted}`);
    console.log(`  ${C.yellow}Pending:${C.reset}        ${agg.summary.pending}`);
    console.log(`  ${C.red}Missed:${C.reset}          ${agg.summary.missed}`);
    console.log(`  ${C.blue}Result Declared:${C.reset} ${agg.summary.resultDeclared}`);
    console.log(`  Courses: ${allCourseCodes.length}`);

    const traces = client.getTraces();
    console.log(`\n${C.yellow}HTTP Traces: ${traces.length} requests${C.reset}`);

    return agg.gdbs;
  });

  if (result) printDuration(start);
}

main().catch((e) => {
  console.error(`${C.red}GDB report failed:${C.reset}`, e);
  process.exit(1);
});
