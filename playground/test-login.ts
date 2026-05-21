import 'dotenv/config';
import { VulmsSDK } from '../src';
import { saveIntegrationReport, printReportSummary, type IntegrationReport } from '../src/utils/report';

const c = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[36m', reset: '\x1b[0m' };

async function main() {
  const studentId = process.env.VULMS_ID;
  const password = process.env.VULMS_PASSWORD;
  const debug = process.env.DEBUG === 'true';

  if (!studentId || !password) {
    console.log(`${c.red}[ERROR] Set VULMS_ID and VULMS_PASSWORD in .env${c.reset}`);
    return;
  }

  const client = new VulmsSDK({ debug, snapshots: debug, traceRequests: debug });
  const report = saveIntegrationReport({
    ...require('../src/utils/report').generateIntegrationReport(),
  } as IntegrationReport, 'login');

  console.log(`${c.blue}=== VULMS Login Test ===${c.reset}\n`);
  console.log(`Student ID: ${studentId}`);

  const method = process.env.USE_BROWSER === 'true' ? 'browser' : 'http';
  console.log(`Method: ${method}\n`);

  const start = Date.now();
  let loginResult;

  if (method === 'browser') {
    console.log('Attempting browser-based login...');
    loginResult = await client.loginWithBrowser(studentId, password);
  } else {
    console.log('Attempting HTTP login...');
    loginResult = await client.login(studentId, password);
  }

  const duration = Date.now() - start;

  console.log(`\n${c.blue}Result:${c.reset}`);
  console.log(`  Success: ${loginResult.success ? `${c.green}YES${c.reset}` : `${c.red}NO${c.reset}`}`);
  console.log(`  Duration: ${duration}ms`);
  if (loginResult.error) console.log(`  Error: ${c.red}${loginResult.error}${c.reset}`);
  if (loginResult.cookies) console.log(`  Cookies: ${loginResult.cookies.slice(0, 60)}...`);

  const health = client.session.getState();
  console.log(`\n${c.blue}Session:${c.reset}`);
  console.log(`  Authenticated: ${health.isValid ? `${c.green}YES${c.reset}` : `${c.red}NO${c.reset}`}`);
  console.log(`  Has Cookies: ${health.cookies ? `${c.green}YES${c.reset}` : `${c.red}NO${c.reset}`}`);
}

main().catch((e) => {
  console.error(`${c.red}Login test failed:${c.reset}`, e);
  process.exit(1);
});
