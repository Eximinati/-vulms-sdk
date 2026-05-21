import * as fs from 'fs';
import * as path from 'path';
import type { RequestTrace } from '../client/http-client';
import { validateLecturePage, validateQuizPage, validateAssignmentPage, validateGDBPage, type PageValidationResult } from '../utils/validation';

export interface TraceSnapshot {
  id: string;
  timestamp: string;
  operation: string;
  courseCode?: string;
  traces: RequestTrace[];
  validationResults: Record<string, PageValidationResult>;
  summary: TraceSummary;
}

export interface TraceSummary {
  totalRequests: number;
  totalDuration: number;
  successfulRequests: number;
  failedRequests: number;
  redirects: number;
  loginPages: number;
  homePages: number;
  validPages: number;
}

export function createTraceSnapshot(
  operation: string,
  courseCode: string | undefined,
  traces: RequestTrace[],
): TraceSnapshot {
  const snapshot: TraceSnapshot = {
    id: `SNAP_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    operation,
    courseCode,
    traces,
    validationResults: {},
    summary: analyzeTraces(traces),
  };

  for (const trace of traces) {
    if (trace.responseSize && trace.responseSize > 500) {
      const html = '[HTML available in trace]';
      const pageType = detectPageTypeFromTrace(trace);
      snapshot.validationResults[trace.id] = getValidationForType(pageType, html);
    }
  }

  return snapshot;
}

function detectPageTypeFromTrace(trace: RequestTrace): string {
  if (trace.hasLectureRepeater) return 'lecture';
  if (trace.hasQuizRepeater) return 'quiz';
  if (trace.hasAssignmentRepeater) return 'assignment';
  if (trace.hasGDBRepeater) return 'gdb';
  if (trace.hasCourseList) return 'courses';
  if (trace.hasLoginForm) return 'login';
  return 'unknown';
}

function getValidationForType(pageType: string, html: string): PageValidationResult {
  switch (pageType) {
    case 'lecture': return validateLecturePage(html);
    case 'quiz': return validateQuizPage(html);
    case 'assignment': return validateAssignmentPage(html);
    case 'gdb': return validateGDBPage(html);
    default: return { state: 'INVALID' as const, pageType: 'unknown' as const, indicators: [] };
  }
}

function analyzeTraces(traces: RequestTrace[]): TraceSummary {
  let redirects = 0;
  let loginPages = 0;
  let homePages = 0;
  let validPages = 0;

  for (const t of traces) {
    if (t.redirects && t.redirects.length > 0) redirects += t.redirects.length;
    if (t.hasLoginForm) loginPages++;
    if (t.hasCourseList) homePages++;
    if (t.hasLectureRepeater || t.hasQuizRepeater || t.hasAssignmentRepeater || t.hasGDBRepeater) validPages++;
  }

  return {
    totalRequests: traces.length,
    totalDuration: traces.reduce((sum, t) => sum + t.duration, 0),
    successfulRequests: traces.filter(t => t.status === 200).length,
    failedRequests: traces.filter(t => t.status !== 200).length,
    redirects,
    loginPages,
    homePages,
    validPages,
  };
}

export function saveTraceSnapshot(snapshot: TraceSnapshot, dir: string = 'debug/traces'): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = `${snapshot.operation}_${snapshot.courseCode || 'all'}_${snapshot.timestamp.replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
  console.log(`[TRACE] Saved snapshot to ${filepath}`);
}

export function detectRedirect(fromUrl: string, toUrl: string): { isRedirect: boolean; redirectType: string } {
  const fromPath = new URL(fromUrl).pathname;
  const toPath = new URL(toUrl).pathname;

  if (fromPath !== toPath) {
    if (toPath.includes('Home.aspx')) {
      return { isRedirect: true, redirectType: 'home_redirect' };
    }
    if (toPath.includes('Login')) {
      return { isRedirect: true, redirectType: 'login_redirect' };
    }
    return { isRedirect: true, redirectType: 'unknown_redirect' };
  }

  return { isRedirect: false, redirectType: 'none' };
}