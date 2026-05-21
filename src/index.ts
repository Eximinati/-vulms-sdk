export { VulmsSDK } from './vulms-sdk';
export type { SDKConfig } from './vulms-sdk';
export { HttpClient } from './client/http-client';
export { PostBackEngine } from './client/postback-engine';
export { loginWithBrowser } from './client/browser-login';
export type {
  PostBackOptions,
  BrowserLoginOptions,
  RequestOptions,
  PostRequestOptions,
  RequestTrace,
  RetryConfig,
} from './client';
export { SessionManager } from './core/session';
export { AssignmentModule } from './modules/assignments';
export { CourseModule } from './modules/courses';
export { QuizModule } from './modules/quizzes';
export { GDBModule } from './modules/gdb';
export { LectureModule } from './modules/lectures';
export { ActivityModule } from './modules/activities';
export { VulmsError, VulmsAuthError, VulmsParsingError } from './core/errors';
export {
  ActivityStatusSchema,
  CourseSchema,
  AssignmentSchema,
  AspNetWebFormDataSchema,
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
export type {
  ActivityStatus,
  Course,
  Assignment,
  AspNetWebFormData,
  SessionState,
  LoginResult,
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
} from './types';
export {
  parseAssignments,
  parseCoursesFromHome,
  parseQuizzes,
  parseGDBs,
  parseLectures,
} from './parsers';
export type {
  ParseAssignmentsOptions,
  ParseAssignmentsResult,
} from './parsers';
export type { ParseConfidence, ParseWarning } from './utils/confidence';
export type { AssignmentSummary, AssignmentAggregate, TraversalStep, TraversalReport } from './modules/assignments';
export {
  generateIntegrationReport,
  saveIntegrationReport,
  listReports,
  loadReport,
  printReportSummary,
} from './utils/report';
export type { IntegrationReport } from './utils/report';
export {
  dedupe,
  dedupeAssignments,
  dedupeQuizzes,
  dedupeGDBs,
  dedupeLectures,
  dedupeUnifiedActivities,
} from './utils/dedupe';
export { checkSessionHealth, isSessionExpired, SessionRecovery } from './core/session-recovery';
export type { SessionHealth } from './core/session-recovery';
