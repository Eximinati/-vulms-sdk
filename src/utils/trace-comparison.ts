import type { RequestTrace } from '../client/http-client';

export interface TraceDiff {
  field: string;
  before: string | number | boolean | string[] | undefined;
  after: string | number | boolean | string[] | undefined;
  change: 'added' | 'removed' | 'changed' | 'same';
}

export interface TraceComparison {
  id: string;
  timestamp: string;
  operation: string;
  successTrace?: RequestTrace;
  failureTrace?: RequestTrace;
  differences: TraceDiff[];
  summary: {
    timingDiff: number;
    viewStateDiff: number;
    eventValidationDiff: number;
    redirectCountDiff: number;
  };
}

export function compareTraces(
  operation: string,
  successTrace: RequestTrace | undefined,
  failureTrace: RequestTrace | undefined,
): TraceComparison {
  const diffs: TraceDiff[] = [];

  if (successTrace && failureTrace) {
    const fields: (keyof RequestTrace)[] = [
      'url', 'status', 'duration', 'responseSize',
      'viewStateSize', 'eventValidationSize',
      'hasLoginForm', 'hasCourseList',
      'hasLectureRepeater', 'hasQuizRepeater',
      'hasAssignmentRepeater', 'hasGDBRepeater',
    ];

    for (const field of fields) {
      const before = successTrace[field];
      const after = failureTrace[field];
      const change = getChange(before, after);
      if (change !== 'same') {
        diffs.push({ field, before, after, change });
      }
    }
  }

  return {
    id: `DIFF_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    operation,
    successTrace,
    failureTrace,
    differences: diffs,
    summary: {
      timingDiff: failureTrace && successTrace ? failureTrace.duration - successTrace.duration : 0,
      viewStateDiff: failureTrace && successTrace
        ? (failureTrace.viewStateSize || 0) - (successTrace.viewStateSize || 0)
        : 0,
      eventValidationDiff: failureTrace && successTrace
        ? (failureTrace.eventValidationSize || 0) - (successTrace.eventValidationSize || 0)
        : 0,
      redirectCountDiff: failureTrace && successTrace
        ? (failureTrace.redirects?.length || 0) - (successTrace.redirects?.length || 0)
        : 0,
    },
  };
}

function getChange<T>(before: T, after: T): 'added' | 'removed' | 'changed' | 'same' {
  if (before === undefined && after !== undefined) return 'added';
  if (before !== undefined && after === undefined) return 'removed';
  if (before !== after) return 'changed';
  return 'same';
}

export function formatDiffReport(comparison: TraceComparison): string {
  const lines: string[] = [];
  lines.push('\n┌────────────────────────────────────────────────────────────────┐');
  lines.push('│                    TRACE COMPARISON REPORT                      │');
  lines.push('├────────────────────────────────────────────────────────────────┤');
  lines.push(`│ Operation: ${comparison.operation.padEnd(48)} │`);
  lines.push(`│ ID: ${comparison.id.padEnd(53)} │`);
  lines.push('├────────────────────────────────────────────────────────────────┤');

  if (comparison.differences.length === 0) {
    lines.push('│ No significant differences found                              │');
  } else {
    lines.push('│ Changes:                                                       │');
    for (const diff of comparison.differences) {
      const changeStr = `${diff.field}: ${String(diff.before || 'N/A')} → ${String(diff.after || 'N/A')} (${diff.change})`;
      lines.push(`│   ${changeStr.padEnd(60)} │`);
    }
  }

  lines.push('├────────────────────────────────────────────────────────────────┤');
  const s = comparison.summary;
  lines.push(`│ Timing Δ: ${String(s.timingDiff + 'ms').padEnd(50)} │`);
  lines.push(`│ VIEWSTATE Δ: ${String(s.viewStateDiff + 'b').padEnd(45)} │`);
  lines.push(`│ EVENTVALIDATION Δ: ${String(s.eventValidationDiff + 'b').padEnd(40)} │`);
  lines.push(`│ Redirects Δ: ${String(s.redirectCountDiff).padEnd(47)} │`);
  lines.push('└────────────────────────────────────────────────────────────────┘\n');

  return lines.join('\n');
}

export function findStateCoupling(traces: RequestTrace[]): {
  viewStatePatterns: string[];
  eventValidationPatterns: string[];
  hiddenFieldCount: number;
  potentialDependencies: string[];
} {
  const viewStates = traces.map(t => t.viewStateSize || 0);
  const eventValidations = traces.map(t => t.eventValidationSize || 0);

  const vsIncreasing = viewStates.every((v, i) => i === 0 || v >= viewStates[i - 1]);
  const vsDecreasing = viewStates.every((v, i) => i === 0 || v <= viewStates[i - 1]);
  const vsStable = new Set(viewStates).size === 1;

  const evIncreasing = eventValidations.every((v, i) => i === 0 || v >= eventValidations[i - 1]);
  const evDecreasing = eventValidations.every((v, i) => i === 0 || v <= eventValidations[i - 1]);
  const evStable = new Set(eventValidations).size === 1;

  const viewStatePatterns: string[] = [];
  if (vsIncreasing) viewStatePatterns.push('monotonically_increasing');
  if (vsDecreasing) viewStatePatterns.push('monotonically_decreasing');
  if (vsStable) viewStatePatterns.push('stable');

  const eventValidationPatterns: string[] = [];
  if (evIncreasing) eventValidationPatterns.push('monotonically_increasing');
  if (evDecreasing) eventValidationPatterns.push('monotonically_decreasing');
  if (evStable) eventValidationPatterns.push('stable');

  const potentialDependencies: string[] = [];
  if (!vsStable && !evStable) {
    potentialDependencies.push('viewstate_eventvalidation_coupled');
  }
  if (vsStable && !evStable) {
    potentialDependencies.push('eventvalidation_depends_on_interaction');
  }
  if (!vsStable && evStable) {
    potentialDependencies.push('viewstate_depends_on_interaction');
  }

  return {
    viewStatePatterns,
    eventValidationPatterns,
    hiddenFieldCount: traces.length,
    potentialDependencies,
  };
}