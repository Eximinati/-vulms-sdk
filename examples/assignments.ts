import { VulmsSDK } from 'vulms-sdk';

const sdk = new VulmsSDK({ logger: 'warn' });

const result = await sdk.loginWithBrowser('BC000000000', 'password');
if (!result.success) throw new Error(result.error);

const assignments = await sdk.assignments.getAssignments();

for (const a of assignments) {
  console.log(`${a.courseCode} | ${a.title} | ${a.status} | due: ${a.dueDate?.toISOString()}`);
}
