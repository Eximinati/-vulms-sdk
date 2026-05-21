import { withLogin, printHeader, printDuration, C } from './utils';

async function main() {
  printHeader('VULMS Courses Test');
  const start = Date.now();

  const result = await withLogin(async (client) => {
    const courses = await client.courses.getEnrolledCourses();
    console.log(`${C.green}Found ${courses.length} enrolled courses:${C.reset}\n`);

    for (const c of courses) {
      console.log(`  ${C.blue}${c.code}${C.reset} — ${c.title}`);
    }

    const traces = client.getTraces();
    console.log(`\n${C.yellow}HTTP Traces: ${traces.length} requests${C.reset}`);
    if (traces.length > 0) {
      for (const t of traces.slice(0, 5)) {
        console.log(`  ${t.method} ${t.url} -> ${t.status || 'ERR'} (${t.duration}ms)`);
      }
    }

    return courses;
  });

  if (result) printDuration(start);
}

main().catch((e) => {
  console.error(`${C.red}Courses test failed:${C.reset}`, e);
  process.exit(1);
});
