export { VulmsSDK } from './vulms-sdk';
export type { SDKConfig } from './vulms-sdk';

export {
  VulmsError,
  AuthenticationError,
  SessionExpiredError,
  NavigationError,
  ValidationError,
  RateLimitError,
  ParsingError,
} from './core/errors';
export type { VulmsErrorOptions } from './core/errors';

export type { LogLevel } from './utils/logger';

export type {
  Course,
  Assignment,
  Quiz,
  QuizStatus,
  QuizAvailabilityStatus,
  QuizSubmissionStatus,
  QuizResultStatus,
  GDB,
  GDBStatus,
  Lecture,
  LectureStatus,
  UnifiedActivity,
  ActivityAggregate,
  ActivityType,
  ActivityStatus,
  SessionState,
  LoginResult,
} from './types';

export {
  ActivityStatusSchema,
  CourseSchema,
  AssignmentSchema,
  QuizSchema,
  QuizStatusSchema,
  QuizAvailabilityStatusSchema,
  QuizSubmissionStatusSchema,
  QuizResultStatusSchema,
  GDBSchema,
  GDBStatusSchema,
  LectureSchema,
  LectureStatusSchema,
} from './types';

export type { AssignmentSummary, AssignmentAggregate } from './modules/assignments';

export type { DashboardCourse, DashboardResult, DashboardMetrics } from './types/dashboard';

export type { SmartFetchOptions } from './types/dashboard';
export type { SmartActivityResult } from './modules/activities';

export { areSemanticallyEqual, getSemanticDiff, computeOutputFingerprint } from './utils/output-normalizer';
export type { NormalizedOutput } from './utils/output-normalizer';
