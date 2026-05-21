import { withLogin, printHeader, printDuration, C } from './utils';

async function main() {
  printHeader('VULMS Activities Test');
  const start = Date.now();

  const result = await withLogin(async (client) => {
    console.log('Fetching all activities (parallel)...\n');

    const agg = await client.activities.getAll();

    const total = agg.pending.length + agg.submitted.length + agg.missed.length + agg.resultDeclared.length;
    console.log(`${C.green}Total activities: ${total}${C.reset}\n`);

    console.log(`  ${C.yellow}Pending:${C.reset}       ${agg.pending.length}`);
    for (const a of agg.pending.slice(0, 3)) {
      console.log(`    [${a.type}] ${C.blue}${a.courseCode}${C.reset} | ${a.title}`);
    }
    if (agg.pending.length > 3) console.log(`    ... and ${agg.pending.length - 3} more`);

    console.log(`\n  ${C.green}Submitted:${C.reset}     ${agg.submitted.length}`);
    for (const a of agg.submitted.slice(0, 3)) {
      console.log(`    [${a.type}] ${C.blue}${a.courseCode}${C.reset} | ${a.title}`);
    }
    if (agg.submitted.length > 3) console.log(`    ... and ${agg.submitted.length - 3} more`);

    console.log(`\n  ${C.red}Missed:${C.reset}         ${agg.missed.length}`);
    for (const a of agg.missed.slice(0, 3)) {
      console.log(`    [${a.type}] ${C.blue}${a.courseCode}${C.reset} | ${a.title}`);
    }
    if (agg.missed.length > 3) console.log(`    ... and ${agg.missed.length - 3} more`);

    console.log(`\n  ${C.blue}Results:${C.reset}        ${agg.resultDeclared.length}`);
    for (const a of agg.resultDeclared.slice(0, 3)) {
      console.log(`    [${a.type}] ${C.blue}${a.courseCode}${C.reset} | ${a.title}`);
      if (a.obtainedMarks !== undefined) console.log(`      Obtained: ${a.obtainedMarks}/${a.totalMarks}`);
    }
    if (agg.resultDeclared.length > 3) console.log(`    ... and ${agg.resultDeclared.length - 3} more`);

    const traces = client.getTraces();
    console.log(`\n${C.yellow}HTTP Traces: ${traces.length} requests${C.reset}`);

    return agg;
  });

  if (result) printDuration(start);
}

main().catch((e) => {
  console.error(`${C.red}Activities test failed:${C.reset}`, e);
  process.exit(1);
});
