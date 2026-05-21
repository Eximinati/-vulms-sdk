import { withLogin, printHeader, printDuration, C } from './utils';

async function main() {
  printHeader('VULMS Lectures Test');
  const start = Date.now();

  const result = await withLogin(async (client) => {
    const courseCode = process.env.TEST_COURSE;

    const lectures = courseCode
      ? await client.lectures.getLectures(courseCode)
      : await client.lectures.getLectures();

    if (lectures.length === 0) {
      console.log(`${C.yellow}No lectures found.${C.reset}`);
    } else {
      console.log(`${C.green}Found ${lectures.length} lectures:${C.reset}\n`);
      const byCourse: Record<string, typeof lectures> = {};
      for (const l of lectures) {
        if (!byCourse[l.courseCode]) byCourse[l.courseCode] = [];
        byCourse[l.courseCode].push(l);
      }

      for (const [code, items] of Object.entries(byCourse)) {
        console.log(`  ${C.blue}${code}${C.reset} (${items.length} lectures)`);
        for (const l of items.slice(0, 3)) {
          const sc = l.status === 'watched' ? C.green : C.yellow;
          console.log(`    [${sc}${l.status}${C.reset}] Week ${l.week || '?'} | ${l.title}`);
          if (l.type) console.log(`    Type: ${l.type} | Duration: ${l.duration || 'N/A'}`);
        }
        if (items.length > 3) console.log(`    ... and ${items.length - 3} more`);
      }
    }

    return lectures;
  });

  if (result) printDuration(start);
}

main().catch((e) => {
  console.error(`${C.red}Lectures test failed:${C.reset}`, e);
  process.exit(1);
});
