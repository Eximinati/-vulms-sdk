import { describe, it, expect } from 'vitest';
import { generateIntegrationReport, printReportSummary } from '../../src/utils/report';

describe('generateIntegrationReport', () => {
  it('creates empty report', () => {
    const report = generateIntegrationReport();
    expect(report.login.success).toBe(false);
    expect(report.courses.count).toBe(0);
    expect(report.assignments.count).toBe(0);
    expect(report.quizzes.count).toBe(0);
    expect(report.gdb.count).toBe(0);
    expect(report.lectures.count).toBe(0);
    expect(report.duplicatesRemoved).toBe(0);
    expect(report.traces.total).toBe(0);
    expect(report.warnings).toEqual([]);
  });
});

describe('printReportSummary', () => {
  it('renders report summary', () => {
    const report = generateIntegrationReport();
    report.login.success = true;
    report.login.method = 'browser';
    report.courses.count = 7;
    report.courses.codes = ['CS301', 'CS302'];
    report.assignments.count = 5;
    report.assignments.submitted = 3;
    report.assignments.pending = 1;
    report.assignments.missed = 1;
    report.assignments.resultDeclared = 0;
    report.quizzes.count = 3;
    report.gdb.count = 2;
    report.lectures.count = 50;
    report.traces.total = 10;
    report.traces.errors = 0;
    report.traces.totalDuration = 500;

    const summary = printReportSummary(report);
    expect(summary).toContain('Courses:  7');
    expect(summary).toContain('Assign:   5 total | 3 submitted');
    expect(summary).toContain('Quizzes:  3');
    expect(summary).toContain('GDBs:     2');
    expect(summary).toContain('Lectures: 50');
    expect(summary).toContain('Traces:   10 requests');
  });

  it('renders failed login', () => {
    const report = generateIntegrationReport();
    report.login.success = false;
    report.login.method = 'http';
    report.login.error = 'reCAPTCHA blocked';

    const summary = printReportSummary(report);
    expect(summary).toContain('FAILED');
    expect(summary).toContain('reCAPTCHA blocked');
  });
});
