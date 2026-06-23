import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '.env') });

const BASE_URL = 'http://localhost:3000';
const STUDENT_ID = process.env.VULMS_ID!;
const PASSWORD = process.env.VULMS_PASSWORD!;

let JWT_TOKEN = '';

async function login(): Promise<boolean> {
  console.log('1. Login...');
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: STUDENT_ID, password: PASSWORD }),
  });
  const data = await res.json();
  if (!data.token) {
    console.log('   FAIL:', data);
    return false;
  }
  JWT_TOKEN = data.token;
  console.log('   OK');
  return true;
}

async function testEndpoint(name: string, url: string): Promise<void> {
  console.log(`\n${name}:`);
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { Authorization: `Bearer ${JWT_TOKEN}` },
  });
  const data = await res.json();
  console.log(`  Status: ${res.status}`);
  if (data.data) {
    console.log(`  Count: ${data.data.length}`);
    if (data.data.length > 0) {
      console.log(`  Sample:`, JSON.stringify(data.data[0], null, 2));
    }
  } else if (data.summary) {
    console.log(`  Summary:`, JSON.stringify(data.summary, null, 2));
  } else if (data.error) {
    console.log(`  Error:`, data.error, data.message);
  }
}

async function test401(name: string, url: string): Promise<void> {
  console.log(`\n${name} (no token):`);
  const res = await fetch(`${BASE_URL}${url}`);
  const data = await res.json();
  console.log(`  Status: ${res.status} (expected 401)`);
  console.log(`  Response:`, data.error || data.message);
}

async function logout(): Promise<void> {
  console.log('\n7. Logout...');
  await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${JWT_TOKEN}` },
  });
  console.log('   OK');
}

async function main() {
  console.log('=== GDBs API Test ===\n');

  if (!await login()) return;

  await testEndpoint('2. GET /api/gdbs', '/api/gdbs');
  await testEndpoint('3. GET /api/gdbs?courseCode=CS301', '/api/gdbs?courseCode=CS301');
  await testEndpoint('4. GET /api/gdbs/summary', '/api/gdbs/summary');
  await testEndpoint('5. GET /api/gdbs/pending', '/api/gdbs/pending');
  await testEndpoint('6. GET /api/gdbs/results', '/api/gdbs/results');

  await logout();

  console.log('\n8. Verify 401:');
  await test401('GET /api/gdbs', '/api/gdbs');
  await test401('GET /api/gdbs/summary', '/api/gdbs/summary');
  await test401('GET /api/gdbs/pending', '/api/gdbs/pending');
  await test401('GET /api/gdbs/results', '/api/gdbs/results');

  console.log('\n=== Test Complete ===');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
