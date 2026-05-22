import { VulmsSDK } from 'vulms-sdk';

const sdk = new VulmsSDK();

await sdk.loginWithBrowser('BC000000000', 'password');

const quizzes = await sdk.quizzes.getQuizzes();

for (const q of quizzes) {
  console.log(`${q.courseCode} | ${q.title} | ${q.status} | marks: ${q.obtainedMarks ?? 'N/A'}/${q.totalMarks}`);
}
