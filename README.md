# vulms-sdk

TypeScript SDK for Virtual University LMS (VULMS). Scrapes real authenticated VULMS data using Playwright-based login, ASP.NET PostBack navigation, and HTML parsing.

## Features

- **Playwright-based login** — bypasses reCAPTCHA v3 with headless browser automation
- **ASP.NET PostBack navigation** — navigates course-specific pages via form state chain
- **Cheerio HTML parsing** — extracts assignments, quizzes, GDBs, lectures, and courses
- **Retry + exponential backoff** — transient error resilience
- **Session recovery** — detects expired sessions and suggests re-login
- **Deduplication** — stable key-based deduplication across multiple fetches
- **HTML snapshots** — optional debug captures of all response pages
- **Request tracing** — optional HTTP trace logging with timing

## Install

```bash
npm install vulms-sdk
```

## Quick Start

```typescript
import { VulmsSDK } from 'vulms-sdk';

const sdk = new VulmsSDK({ debug: true, snapshots: true });

// Login with Playwright (recommended — bypasses reCAPTCHA)
const result = await sdk.loginWithBrowser('BC000000000', 'password');
if (!result.success) throw new Error(result.error);

// Get all enrolled courses
const courses = await sdk.courses.getEnrolledCourses();

// Get assignments for a specific course
const assignments = await sdk.assignments.getAssignments('CS301');

// Get all activities (assignments + quizzes + GDBs + lectures)
const agg = await sdk.activities.getAll();
console.log(agg.pending.length, 'pending activities');
```

## SDK Configuration

```typescript
const sdk = new VulmsSDK({
  debug: false,           // Enable debug logging
  snapshots: false,      // Save HTML snapshots to debug/ directory
  traceRequests: false,   // Log every HTTP request/response
  retries: 3,             // Max retry attempts (default: 3)
  timeout: 30000,        // Request timeout in ms (default: 30000)
});
```

## API

### Authentication

```typescript
// Recommended: Playwright browser automation (bypasses reCAPTCHA v3)
await sdk.loginWithBrowser(username, password);

// Fallback: Raw HTTP login (may be blocked by reCAPTCHA)
await sdk.login(username, password);

// Check session validity
const state = sdk.session.getState();
const health = checkSessionHealth(state);

// Session recovery
const recovery = new SessionRecovery(state, async () => {
  const result = await sdk.loginWithBrowser(user, pass);
  return result.success;
});
await recovery.ensureValid();
```

### Courses

```typescript
const courses = await sdk.courses.getEnrolledCourses();
// [{ code: 'CS301', title: 'Data Structures' }, ...]
```

### Assignments

```typescript
// All assignments across all courses
const all = await sdk.assignments.getAssignments();

// Specific course
const cs301 = await sdk.assignments.getAssignments('CS301');
```

Each assignment:
```typescript
{
  courseCode: 'CS301',
  title: 'Assignment #1',
  lesson: 'Lesson 3',
  dueDate: Date,
  totalMarks: 10,
  status: 'submitted' | 'pending' | 'missed' | 'result_declared',
  submitDate?: Date,
  fileSize?: string,
  obtainedMarks?: number,
}
```

### Quizzes

```typescript
const quizzes = await sdk.quizzes.getQuizzes();
// [{ courseCode, title, dueDate, totalMarks, status, obtainedMarks }, ...]
```

### GDBs

```typescript
const gdbs = await sdk.gdb.getGDBs();
```

### Lectures

```typescript
const lectures = await sdk.lectures.getLectures();
// [{ courseCode, title, week, type, duration, status, url }, ...]
```

### Activities

```typescript
const agg = await sdk.activities.getAll();
const pending = await sdk.activities.getPending();
const missed = await sdk.activities.getMissed();
const submitted = await sdk.activities.getSubmitted();
const results = await sdk.activities.getResultDeclared();
```

## Utilities

### Deduplication

```typescript
import { dedupeAssignments, dedupeQuizzes, dedupeGDBs, dedupeLectures } from 'vulms-sdk';

const { unique, duplicates } = dedupeAssignments(assignments);
```

### Integration Report

```typescript
import { generateIntegrationReport, saveIntegrationReport, printReportSummary } from 'vulms-sdk';

// Generate after full fetch
const report = generateIntegrationReport();
report.courses.count = courses.length;
// ... populate all fields
const path = saveIntegrationReport(report, 'my-report');
console.log(printReportSummary(report));
```

### Request Traces

```typescript
const sdk = new VulmsSDK({ traceRequests: true });
// ... make requests ...
const traces = sdk.getTraces();
// [{ method: 'GET', url: '...', status: 200, duration: 123 }, ...]
sdk.clearTraces();
```

## Architecture

```
vulms-sdk
├── client/           HTTP + PostBack engine
├── core/            Session management + recovery
├── modules/         Assignment, Quiz, GDB, Lecture, Activity, Course
├── parsers/         HTML parsers per module
├── types/           Zod schemas + TypeScript types
├── utils/           Date, activity, logger, dedupe, confidence, report, snapshot
└── constants/       VULMS URLs
```

### Navigation Pattern

VULMS uses ASP.NET WebForms. Authenticated pages are accessed via PostBack:

1. GET `/Home.aspx` — get course list + ASP.NET form state
2. POST `/Home.aspx` with `__EVENTTARGET=ctl00$MainContent$gvCourseList$ctlXX$ibtnAssignments`
3. Server responds with 302 redirect to `StudentAssignmentListView.aspx`
4. Parse the redirected page with Cheerio

## Parser Limitations

- Parsers rely on ASP.NET-generated `id` attributes and CSS classes
- VULMS HTML structure may change between semesters — parsers may need updates
- reCAPTCHA v3 blocks raw HTTP login — use `loginWithBrowser()` for authentication
- Some VULMS pages use UpdatePanel AJAX — not all pages are directly scrapable

## Troubleshooting

**Login fails with reCAPTCHA error**: Use `loginWithBrowser()` instead of `login()`

**Assignments return empty**: VULMS may have changed the `gvTileRepeaterAssignment` tile IDs. Check HTML snapshots in `debug/assignments/`.

**Session expires frequently**: Use `SessionRecovery` helpers to detect and recover.

**HTTP 401 errors**: Session expired — call `loginWithBrowser()` again.

## Development

```bash
# Build
npm run build

# Test
npm run test

# Type check
npm run typecheck

# Integration (requires .env with VULMS_ID + VULMS_PASSWORD)
npm run dev:login
npm run dev:report

# All playground scripts
npm run dev:login
npm run dev:courses
npm run dev:assignments
npm run dev:quizzes
npm run dev:gdb
npm run dev:lectures
npm run dev:activities
npm run dev:report
```

## License

MIT
