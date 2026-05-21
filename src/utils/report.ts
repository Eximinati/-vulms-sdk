import * as fs from 'fs';
import * as path from 'path';

export interface IntegrationReport {
  timestamp: string;
  login: { success: boolean; method: string; error?: string };
  courses: { count: number; codes: string[] };
  assignments: { count: number; submitted: number; pending: number; missed: number; resultDeclared: number };
  quizzes: { count: number };
  gdb: { count: number };
  lectures: { count: number };
  duplicatesRemoved: number;
  unknownStatuses: number;
  traces: { total: number; errors: number; totalDuration: number };
  warnings: string[];
  fingerprint: string;
}

const REPORTS_DIR = path.join(process.cwd(), 'debug', 'reports');

export function generateIntegrationReport(): IntegrationReport {
  return {
    timestamp: new Date().toISOString(),
    login: { success: false, method: 'unknown' },
    courses: { count: 0, codes: [] },
    assignments: { count: 0, submitted: 0, pending: 0, missed: 0, resultDeclared: 0 },
    quizzes: { count: 0 },
    gdb: { count: 0 },
    lectures: { count: 0 },
    duplicatesRemoved: 0,
    unknownStatuses: 0,
    traces: { total: 0, errors: 0, totalDuration: 0 },
    warnings: [],
    fingerprint: '',
  };
}

export function saveIntegrationReport(report: IntegrationReport, label = 'integration'): string {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${label}-${timestamp}.json`;
  const filepath = path.join(REPORTS_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf-8');
  return filepath;
}

export function listReports(): string[] {
  if (!fs.existsSync(REPORTS_DIR)) return [];
  return fs.readdirSync(REPORTS_DIR).filter((f) => f.endsWith('.json')).sort().reverse();
}

export function loadReport(filename: string): IntegrationReport | null {
  const filepath = path.join(REPORTS_DIR, filename);
  if (!fs.existsSync(filepath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as IntegrationReport;
  } catch {
    return null;
  }
}

export function printReportSummary(report: IntegrationReport): string {
  const lines: string[] = [];
  lines.push('');
  lines.push('═'.repeat(50));
  lines.push(` Integration Report — ${report.timestamp}`);
  lines.push('═'.repeat(50));

  lines.push('');
  lines.push(` Login:    ${report.login.success ? '✓ OK' : `✗ FAILED (${report.login.method})`}${report.login.error ? ` — ${report.login.error}` : ''}`);
  lines.push(` Courses:  ${report.courses.count} (${report.courses.codes.join(', ')})`);
  lines.push(` Assign:   ${report.assignments.count} total | ${report.assignments.submitted} submitted | ${report.assignments.pending} pending | ${report.assignments.missed} missed | ${report.assignments.resultDeclared} results`);
  lines.push(` Quizzes:  ${report.quizzes.count}`);
  lines.push(` GDBs:     ${report.gdb.count}`);
  lines.push(` Lectures: ${report.lectures.count}`);
  lines.push(` Dupes:    ${report.duplicatesRemoved} removed`);
  lines.push(` Unknown:  ${report.unknownStatuses}`);

  if (report.warnings.length > 0) {
    lines.push('');
    lines.push(` Warnings: ${report.warnings.length}`);
    for (const w of report.warnings.slice(0, 5)) {
      lines.push(`   • ${w}`);
    }
    if (report.warnings.length > 5) {
      lines.push(`   ... and ${report.warnings.length - 5} more`);
    }
  }

  lines.push('');
  lines.push(` Traces:   ${report.traces.total} requests | ${report.traces.errors} errors | ${report.traces.totalDuration}ms total`);
  lines.push('');
  lines.push('═'.repeat(50));

  return lines.join('\n');
}
