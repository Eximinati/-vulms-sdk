import { VulmsSDK } from 'vulms-sdk';

const sdk = new VulmsSDK({
  cache: true,
  cacheTtlMs: 5 * 60 * 1000,
  logger: 'warn',
});

await sdk.loginWithBrowser('BC000000000', 'password');

// First call — fetches from VULMS
const assignments1 = await sdk.assignments.getAssignments();
console.log(`Fetched ${assignments1.length} assignments`);

// Second call — returns cached data (no network request)
const assignments2 = await sdk.assignments.getAssignments();
console.log(`Cached ${assignments2.length} assignments`);

// Force refresh
const assignments3 = await sdk.assignments.getAssignments(undefined, { forceRefresh: true });
console.log(`Refreshed ${assignments3.length} assignments`);

// Release memory when done
sdk.releaseMemory();
