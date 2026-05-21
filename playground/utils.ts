import 'dotenv/config';
import { VulmsSDK } from '../src';
import type { IntegrationReport } from '../src/utils/report';

export const C = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

export function checkCredentials(): { id: string; password: string } | null {
  const id = process.env.VULMS_ID;
  const password = process.env.VULMS_PASSWORD;
  if (!id || !password) {
    console.log(`${C.red}[ERROR] Set VULMS_ID and VULMS_PASSWORD in .env${C.reset}`);
    return null;
  }
  return { id, password };
}

export function createClient(): VulmsSDK {
  const debug = process.env.DEBUG === 'true';
  return new VulmsSDK({ debug, snapshots: debug, traceRequests: debug });
}

export async function withLogin<T>(
  fn: (client: VulmsSDK) => Promise<T>,
): Promise<{ client: VulmsSDK; result: T } | null> {
  const creds = checkCredentials();
  if (!creds) return null;

  const client = createClient();
  const useBrowser = process.env.USE_BROWSER === 'true';

  console.log(`Logging in as ${creds.id}...`);
  const loginResult = useBrowser
    ? await client.loginWithBrowser(creds.id, creds.password)
    : await client.login(creds.id, creds.password);

  if (!loginResult.success) {
    console.log(`${C.red}[ERROR] Login failed: ${loginResult.error}${C.reset}`);
    return null;
  }

  console.log(`${C.green}[OK] Logged in${C.reset}\n`);
  const result = await fn(client);
  return { client, result };
}

export function printHeader(title: string): void {
  console.log(`${C.blue}${'═'.repeat(50)}${C.reset}`);
  console.log(`${C.blue}${C.bold} ${title}${C.reset}`);
  console.log(`${C.blue}${'═'.repeat(50)}${C.reset}\n`);
}

export function printDuration(start: number): void {
  console.log(`\n${C.yellow}Completed in ${Date.now() - start}ms${C.reset}`);
}
