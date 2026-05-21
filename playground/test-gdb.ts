import { withLogin, printHeader, printDuration, C } from './utils';

async function main() {
  printHeader('VULMS GDB Test');
  const start = Date.now();

  const result = await withLogin(async (client) => {
    const courseCode = process.env.TEST_COURSE;

    const gdbs = courseCode ? await client.gdb.getGDBs(courseCode) : await client.gdb.getGDBs();

    if (gdbs.length === 0) {
      console.log(`${C.yellow}No GDBs found.${C.reset}`);
    } else {
      console.log(`${C.green}Found ${gdbs.length} GDBs:${C.reset}\n`);
      for (const g of gdbs) {
        const due = g.dueDate?.toLocaleDateString() || 'N/A';
        const sc = g.status === 'submitted' ? C.green : g.status === 'missed' ? C.red : C.yellow;
        console.log(`  [${sc}${g.status}${C.reset}] ${C.blue}${g.courseCode}${C.reset} | ${g.title} | Due: ${due}`);
        if (g.totalMarks) console.log(`    Marks: ${g.totalMarks}`);
        if (g.obtainedMarks !== undefined) console.log(`    Obtained: ${g.obtainedMarks}/${g.totalMarks}`);
      }
    }

    return gdbs;
  });

  if (result) printDuration(start);
}

main().catch((e) => {
  console.error(`${C.red}GDB test failed:${C.reset}`, e);
  process.exit(1);
});
