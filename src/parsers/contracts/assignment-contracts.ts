export const ASSIGNMENT_LAYOUT = {
  STANDARD: 'standard',
  PRACTICAL: 'practical',
  LEGACY: 'legacy',
  UNKNOWN: 'unknown',
} as const;

export type AssignmentLayout = (typeof ASSIGNMENT_LAYOUT)[keyof typeof ASSIGNMENT_LAYOUT];

export interface AssignmentContractSelectors {
  titleLabel: string;
  lessonLabel: string;
  dueDateLabel: string;
  totalMarksLabel: string;
  submitStatusLabel: string;
  submitDateLabel: string;
  fileSizeLabel: string;
  obtainedMarksLabel: string;
}

export interface AssignmentContract {
  repeaterId: string;
  selectors: AssignmentContractSelectors;
  statusField: string;
  skipLabels: readonly string[];
}

export const ASSIGNMENT_CONTRACTS: Record<AssignmentLayout, AssignmentContract> = {
  standard: {
    repeaterId: 'MainContent_gvTileRepeaterAssignment',
    selectors: {
      titleLabel: '_Label3_',
      lessonLabel: '_lblPayableAmount_',
      dueDateLabel: '_lblDueDate_',
      totalMarksLabel: '_lblTotalMarks_',
      submitStatusLabel: '_lblsubmitted_',
      submitDateLabel: '_lblSubmitDate_',
      fileSizeLabel: '_lblFilesize_',
      obtainedMarksLabel: '_lblObtainedMarks_',
    },
    statusField: 'submitStatus',
    skipLabels: ['Title:', 'Lesson:', 'Due Date:', 'Total Marks:', 'Submit:', 'Result:', 'Discuss:', 'Assignment:'] as const,
  },
  practical: {
    repeaterId: 'MainContent_gvTileRepeaterAssignment',
    selectors: {
      titleLabel: '_Label3_',
      lessonLabel: '_lblPayableAmount_',
      dueDateLabel: '_lblDueDate_',
      totalMarksLabel: '_lblTotalMarks_',
      submitStatusLabel: '_lblsubmitted_',
      submitDateLabel: '_lblSubmitDate_',
      fileSizeLabel: '_lblFilesize_',
      obtainedMarksLabel: '_lblObtainedMarks_',
    },
    statusField: 'submitStatus',
    skipLabels: ['Title:', 'Lesson:', 'Due Date:', 'Total Marks:', 'Submit:', 'Result:', 'Discuss:', 'Assignment:'] as const,
  },
  legacy: {
    repeaterId: 'MainContent_gvTileRepeaterAssignment',
    selectors: {
      titleLabel: '_lblTitle_',
      lessonLabel: '_lblLesson_',
      dueDateLabel: '_lblDueDate_',
      totalMarksLabel: '_lblTotalMarks_',
      submitStatusLabel: '_lblStatus_',
      submitDateLabel: '_lblSubmitDate_',
      fileSizeLabel: '_lblFileSize_',
      obtainedMarksLabel: '_lblObtainedMarks_',
    },
    statusField: 'submitStatus',
    skipLabels: ['Title:', 'Lesson:', 'Due Date:', 'Total Marks:', 'Status:', 'Submitted:', 'Result:'] as const,
  },
  unknown: {
    repeaterId: 'MainContent_gvTileRepeaterAssignment',
    selectors: {
      titleLabel: '_Label3_',
      lessonLabel: '_lblPayableAmount_',
      dueDateLabel: '_lblDueDate_',
      totalMarksLabel: '_lblTotalMarks_',
      submitStatusLabel: '_lblsubmitted_',
      submitDateLabel: '_lblSubmitDate_',
      fileSizeLabel: '_lblFilesize_',
      obtainedMarksLabel: '_lblObtainedMarks_',
    },
    statusField: 'submitStatus',
    skipLabels: ['Title:', 'Lesson:', 'Due Date:', 'Total Marks:', 'Submit:', 'Result:', 'Discuss:'] as const,
  },
};

export type AssignmentContractStatus = 'pending' | 'submitted' | 'attempted' | 'missed' | 'result_declared' | 'unknown';

export function buildSelector(contract: AssignmentContract, selectorName: keyof AssignmentContractSelectors, index: number | string): string {
  const suffix = contract.selectors[selectorName];
  return `#${contract.repeaterId}${suffix}${index}`;
}

export function buildIdPattern(contract: AssignmentContract, selectorName: keyof AssignmentContractSelectors): string {
  const suffix = contract.selectors[selectorName];
  return `[id*="${contract.repeaterId}${suffix}"]`;
}

export function buildTilePanelPattern(contract: AssignmentContract): RegExp {
  return new RegExp(`${contract.repeaterId}_pnl_(\\d+)$`);
}