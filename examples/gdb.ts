import { VulmsSDK } from 'vulms-sdk';

const sdk = new VulmsSDK();

await sdk.loginWithBrowser('BC000000000', 'password');

const gdbs = await sdk.gdb.getGDBs();

for (const g of gdbs) {
  console.log(`${g.courseCode} | ${g.title} | ${g.status}`);
}
