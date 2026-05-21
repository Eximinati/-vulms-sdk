import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { TelemetryStore } from '../src/utils/telemetry-store';

const C = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

function log(msg: string) { console.log(msg); }
function pass(msg: string) { log(`${C.green}[PASS]${C.reset} ${msg}`); }
function fail(msg: string) { log(`${C.red}[FAIL]${C.reset} ${msg}`); }
function warn(msg: string) { log(`${C.yellow}[WARN]${C.reset} ${msg}`); }
function info(msg: string) { log(`${C.blue}[INFO]${C.reset} ${msg}`); }

interface ReleaseGate {
  name: string;
  passed: boolean;
  value: string;
  threshold: string;
  critical: boolean;
}

async function main() {
  const telemetryDir = path.join(process.cwd(), 'debug', 'telemetry');

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  RELEASE GATE VALIDATION${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);

  const gates: ReleaseGate[] = [];

  if (!fs.existsSync(telemetryDir)) {
    fail('No telemetry data found. Run collect-telemetry first.');
    log('\nGates cannot be evaluated without telemetry data.');
    return;
  }

  const store = new TelemetryStore(telemetryDir);
  const entries = store.getAllEntries();
  const summary = store.computeSummary();
  const sessionCount = store.getSessionCount();

  info(`Telemetry entries: ${entries.length}`);
  info(`Sessions: ${sessionCount}`);

  if (entries.length < 10) {
    fail('Insufficient telemetry data. Need at least 10 entries.');
    log('\nRun collect-telemetry and/or stress-test first.');
    return;
  }

  log(`\n${C.blue}── GATE 1: Consistency > 95% ──${C.reset}`);
  const consistency = summary.consistencyScore;
  const consistencyPass = consistency >= 95;
  gates.push({
    name: 'Consistency > 95%',
    passed: consistencyPass,
    value: `${consistency}%`,
    threshold: '>= 95%',
    critical: true,
  });
  if (consistencyPass) {
    pass(`Consistency: ${consistency}% >= 95%`);
  } else {
    fail(`Consistency: ${consistency}% < 95%`);
  }

  log(`\n${C.blue}── GATE 2: Failure Rate < 3% ──${C.reset}`);
  const failureRate = summary.failureRate * 100;
  const failureRatePass = failureRate < 3;
  gates.push({
    name: 'Failure Rate < 3%',
    passed: failureRatePass,
    value: `${failureRate.toFixed(1)}%`,
    threshold: '< 3%',
    critical: true,
  });
  if (failureRatePass) {
    pass(`Failure rate: ${failureRate.toFixed(1)}% < 3%`);
  } else {
    fail(`Failure rate: ${failureRate.toFixed(1)}% >= 3%`);
  }

  log(`\n${C.blue}── GATE 3: Bounded Retries ──${C.reset}`);
  const retryRate = summary.retryRate;
  const retryPass = retryRate < 0.5;
  gates.push({
    name: 'Bounded Retries',
    passed: retryPass,
    value: `${retryRate.toFixed(2)} per op`,
    threshold: '< 0.5 per op',
    critical: true,
  });
  if (retryPass) {
    pass(`Retry rate: ${retryRate.toFixed(2)} < 0.5 per operation`);
  } else {
    fail(`Retry rate: ${retryRate.toFixed(2)} >= 0.5 per operation`);
  }

  log(`\n${C.blue}── GATE 4: Lecture Traversal Stability ──${C.reset}`);
  const lectureEntries = entries.filter(e => e.module === 'lectures');
  const lectureSuccess = lectureEntries.length > 0
    ? lectureEntries.filter(e => e.success).length / lectureEntries.length
    : 0;
  const lecturePass = lectureSuccess >= 0.9 || lectureEntries.length === 0;
  gates.push({
    name: 'Lecture Traversal Stability',
    passed: lecturePass,
    value: lectureEntries.length > 0 ? `${(lectureSuccess * 100).toFixed(0)}% (${lectureEntries.length} ops)` : 'No data',
    threshold: '>= 90%',
    critical: true,
  });
  if (lecturePass) {
    if (lectureEntries.length > 0) {
      pass(`Lecture success rate: ${(lectureSuccess * 100).toFixed(0)}% >= 90%`);
    } else {
      warn('No lecture telemetry data available');
    }
  } else {
    fail(`Lecture success rate: ${(lectureSuccess * 100).toFixed(0)}% < 90%`);
  }

  log(`\n${C.blue}── GATE 5: No Memory Growth ──${C.reset}`);
  const memEntries = entries.filter(e => e.memoryUsageMb != null);
  let memoryPass = true;
  let memoryValue = 'No data';
  if (memEntries.length >= 5) {
    const first3 = memEntries.slice(0, 3).map(e => e.memoryUsageMb!);
    const last3 = memEntries.slice(-3).map(e => e.memoryUsageMb!);
    const avgFirst = first3.reduce((a, b) => a + b, 0) / first3.length;
    const avgLast = last3.reduce((a, b) => a + b, 0) / last3.length;
    const growth = avgLast - avgFirst;
    memoryPass = growth < 100;
    memoryValue = `${growth > 0 ? '+' : ''}${growth.toFixed(0)}MB (${avgFirst.toFixed(0)} -> ${avgLast.toFixed(0)})`;
  }
  gates.push({
    name: 'No Memory Growth',
    passed: memoryPass,
    value: memoryValue,
    threshold: '< 100MB growth',
    critical: true,
  });
  if (memoryPass) {
    pass(`Memory growth: ${memoryValue} < 100MB`);
  } else {
    fail(`Memory growth: ${memoryValue} >= 100MB`);
  }

  log(`\n${C.blue}── GATE 6: No Critical Safety Issues ──${C.reset}`);
  const invalidEntries = entries.filter(e => e.validationState === 'INVALID');
  const criticalFailures = invalidEntries.filter(e =>
    e.failureType && (
      e.failureType.includes('credential') ||
      e.failureType.includes('password') ||
      e.failureType.includes('token') ||
      e.failureType.includes('secret')
    )
  );
  const safetyPass = criticalFailures.length === 0;
  gates.push({
    name: 'No Critical Safety Issues',
    passed: safetyPass,
    value: `${criticalFailures.length} critical failures`,
    threshold: '0',
    critical: true,
  });
  if (safetyPass) {
    pass('No credential/token/secret exposure in failures');
  } else {
    fail(`${criticalFailures.length} critical safety failures detected`);
  }

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  log(`${C.blue}${C.bold}  GATE SUMMARY${C.reset}`);
  log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);

  log(`  ${'Gate'.padEnd(35)} ${'Result'.padEnd(10)} ${'Value'.padEnd(30)} ${'Threshold'}`);
  log(`  ${'─'.repeat(85)}`);
  for (const g of gates) {
    const result = g.passed ? `${C.green}PASS${C.reset}` : `${C.red}FAIL${C.reset}`;
    log(`  ${g.name.padEnd(35)} ${result.padEnd(10)} ${g.value.padEnd(30)} ${g.threshold}`);
  }

  const passedGates = gates.filter(g => g.passed).length;
  const totalGates = gates.length;
  const criticalGates = gates.filter(g => g.critical);
  const criticalPassed = criticalGates.filter(g => g.passed).length;

  log(`\n  Gates passed: ${passedGates}/${totalGates}`);
  log(`  Critical gates: ${criticalPassed}/${criticalGates.length}`);

  const allCriticalPassed = criticalPassed === criticalGates.length;

  log(`\n${C.blue}${'═'.repeat(60)}${C.reset}`);
  if (allCriticalPassed) {
    log(`${C.green}${C.bold}  RELEASE GATE: PASSED${C.reset}`);
    log(`${C.green}${C.bold}  SDK STATUS: BETA READY${C.reset}`);
  } else {
    log(`${C.red}${C.bold}  RELEASE GATE: FAILED${C.reset}`);
    log(`${C.red}${C.bold}  SDK STATUS: NOT READY FOR BETA${C.reset}`);
  }
  log(`${C.blue}${'═'.repeat(60)}${C.reset}\n`);

  const reportPath = path.join(process.cwd(), 'debug', 'reports', `release-gate-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    gates,
    passedGates,
    totalGates,
    criticalPassed,
    criticalGates: criticalGates.length,
    betaReady: allCriticalPassed,
    telemetrySummary: summary,
  }, null, 2));

  log(`Report saved to: ${reportPath}`);
}

main().catch(e => {
  console.error('Release gate error:', e);
  process.exit(1);
});
