import { withLogin, printHeader, printDuration, C } from './utils';
import {
  generateIntegrationReport,
  saveIntegrationReport,
  printReportSummary,
} from '../src/utils/report';
import type { IntegrationReport } from '../src/utils/report';

async function main() {
  printHeader('VULMS Integration Report');
  const start = Date.now();

  const result = await withLogin(async (client) => {
    const report: IntegrationReport = generateIntegrationReport();
    report.login = {
      success: true,
      method: process.env.USE_BROWSER === 'true' ? 'browser' : 'http',
    };

    console.log('Fetching courses...');
    const courses = await client.courses.getEnrolledCourses();
    report.courses = {
      count: courses.length,
      codes: courses.map((c) => c.code),
    };
    console.log(`  ${C.green}${courses.length} courses${C.reset}`);

    console.log('Fetching assignments...');
    const assignments = await client.assignments.getAssignments();
    report.assignments = {
      count: assignments.length,
      submitted: assignments.filter((a) => a.status === 'submitted').length,
      pending: assignments.filter((a) => a.status === 'pending').length,
      missed: assignments.filter((a) => a.status === 'missed').length,
      resultDeclared: assignments.filter((a) => a.status === 'result_declared').length,
    };
    console.log(`  ${C.green}${assignments.length} assignments${C.reset}`);

    console.log('Fetching quizzes...');
    const quizzes = await client.quizzes.getQuizzes();
    report.quizzes = { count: quizzes.length };
    console.log(`  ${C.green}${quizzes.length} quizzes${C.reset}`);

    console.log('Fetching GDBs...');
    const gdbs = await client.gdb.getGDBs();
    report.gdb = { count: gdbs.length };
    console.log(`  ${C.green}${gdbs.length} GDBs${C.reset}`);

    console.log('Fetching lectures...');
    const lectures = await client.lectures.getLectures();
    report.lectures = { count: lectures.length };
    console.log(`  ${C.green}${lectures.length} lectures${C.reset}`);

    const traces = client.getTraces();
    report.traces = {
      total: traces.length,
      errors: traces.filter((t) => t.error).length,
      totalDuration: traces.reduce((sum, t) => sum + t.duration, 0),
    };

    return report;
  });

  if (result) {
    printDuration(start);

    console.log(printReportSummary(result.result as IntegrationReport));

    const reportPath = saveIntegrationReport(result.result as IntegrationReport, 'full');
    console.log(`\n${C.blue}Report saved: ${reportPath}${C.reset}`);
  } else {
    console.log(`${C.red}[ERROR] Report generation failed${C.reset}`);
  }
}

main().catch((e) => {
  console.error(`${C.red}Report generation failed:${C.reset}`, e);
  process.exit(1);
});
