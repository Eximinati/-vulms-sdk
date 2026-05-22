import { VulmsSDK } from 'vulms-sdk';

const sdk = new VulmsSDK();

await sdk.loginWithBrowser('BC000000000', 'password');

const agg = await sdk.activities.getAll();

console.log(`Pending: ${agg.pending.length}`);
console.log(`Submitted: ${agg.submitted.length}`);
console.log(`Missed: ${agg.missed.length}`);
console.log(`Results: ${agg.resultDeclared.length}`);
