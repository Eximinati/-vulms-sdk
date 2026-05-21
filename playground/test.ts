import 'dotenv/config';
import { VulmsSDK } from '../src';

async function main() {
  const client = new VulmsSDK();

  console.log('=== VULMS SDK Playground ===\n');

  const studentId = process.env.VULMS_ID;
  const password = process.env.VULMS_PASSWORD;

  if (!studentId || !password) {
    console.log('Set VULMS_ID and VULMS_PASSWORD in .env first.');
    return;
  }

  console.log(`Logging in as ${studentId}...`);

  const loginResult = await client.loginWithBrowser(studentId, password);
  console.log('Login result:', loginResult);

  if (!loginResult.success) {
    console.log('Login failed:', loginResult.error);
    return;
  }

  console.log('\nSession state:', client.session.getState());
  console.log('Authenticated:', client.session.isAuthenticated());

  const http = client.session.getHttpClient();

  console.log('\nFetching assignments (CS301)...');
  try {
    const assignments = await client.assignments.getAssignments('CS301');
    console.log('Assignments count:', assignments.length);
    for (const a of assignments) {
      console.log(`  - [${a.status}] ${a.courseCode} | ${a.title} | due: ${a.dueDate?.toDateString() || 'N/A'} | marks: ${a.totalMarks}`);
    }
  } catch (e) {
    console.log('Assignments error:', e);
  }

  console.log('\nFetching course list...');
  try {
    const courses = await client.courses.getEnrolledCourses();
    console.log('Courses count:', courses.length);
    for (const c of courses) {
      console.log(`  - ${c.code}: ${c.title}`);
    }
  } catch (e) {
    console.log('Courses error:', e);
  }

  console.log('\nFetching activity aggregation...');
  try {
    const activities = await client.activities.getAll();
    console.log('Pending:', activities.pending.length);
    console.log('Submitted:', activities.submitted.length);
    console.log('Missed:', activities.missed.length);
    console.log('Result Declared:', activities.resultDeclared.length);
  } catch (e) {
    console.log('Activity aggregation error:', e);
  }

  console.log('\nDirect page navigation test:');
  const pages = [
    { name: 'Activity Calendar', path: '/ActivityCalendar/ActivityCalendar.aspx' },
    { name: 'Grade Book', path: '/GradeBook/GradeBook.aspx' },
    { name: 'Lecture Schedule', path: '/LectureSchedule/LectureSchedule.aspx' },
    { name: 'GDB', path: '/GDB/Default.aspx' },
    { name: 'Quiz List', path: '/Quiz/QuizList.aspx' },
  ];

  for (const pg of pages) {
    try {
      const html = await http.get({ path: pg.path }) as string;
      const hasContent = html.includes('__VIEWSTATE') && !html.includes('Login.aspx');
      console.log(`  ${pg.name}: ${hasContent ? 'OK' : 'NEEDS_AUTH'}`);
    } catch (e: any) {
      console.log(`  ${pg.name}: ERROR - ${e.message}`);
    }
  }
}

main().catch((e) => {
  console.error('Playground error:', e);
  process.exit(1);
});
