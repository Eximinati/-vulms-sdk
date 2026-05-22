# vulms-sdk

[![npm version](https://img.shields.io/npm/v/vulms-sdk?color=blue&label=beta)](https://www.npmjs.com/package/vulms-sdk)
[![CI](https://github.com/your-org/vulms-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/vulms-sdk/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-150%20passing-brightgreen)](https://github.com/your-org/vulms-sdk)
[![TypeScript](https://img.shields.io/badge/types-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

TypeScript SDK for Virtual University LMS (VULMS). Fetch assignments, quizzes, GDBs, lectures with smart caching, session management, and deterministic outputs.

```bash
npm install vulms-sdk
```

---

## Quick Start

```typescript
import { VulmsSDK } from 'vulms-sdk';

const sdk = new VulmsSDK();
const result = await sdk.loginWithBrowser('BC000000000', 'password');
if (!result.success) throw new Error(result.error);

const courses = await sdk.courses.getEnrolledCourses();
const assignments = await sdk.assignments.getAssignments();
const agg = await sdk.activities.getAll();

console.log(`${agg.pending.length} pending, ${agg.missed.length} missed`);
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Single login** | Shared runtime state, one Playwright login per SDK lifecycle |
| **Smart caching** | Dashboard HTML cached after login, output cache with 5-min TTL |
| **Request reduction** | Dashboard indicators detect empty modules, skip unnecessary navigation |
| **Semantic validation** | Validates page structure before parsing, distinguishes empty vs broken |
| **Deterministic outputs** | Sorted arrays, stripped dynamic fields, stable fingerprints |
| **Retry + backoff** | 3 retries with exponential backoff for transient errors |
| **Session recovery** | Detects expired sessions with automatic recovery helpers |
| **Stability guarantees** | 150 tests, 25x stress-tested, 24h runtime validated |

### Feature Comparison

| Capability | vulms-sdk | Manual scraping | Raw HTTP |
|-----------|-----------|-----------------|----------|
| reCAPTCHA bypass | ✅ Playwright | ❌ | ❌ |
| Session management | ✅ Automatic | ❌ Manual | ❌ |
| Cache layer | ✅ TTL + deep copy | ❌ | ❌ |
| Empty-state handling | ✅ `EMPTY_VALID` | ❌ | ❌ |
| Telemetry | ✅ Built-in | ❌ | ❌ |
| TypeScript types | ✅ Full | ❌ | ❌ |

---

## Performance

| Metric | Value |
|--------|-------|
| Cold login + dashboard cache | ~15s (Playwright) |
| Warm traversal (all modules) | ~30s |
| Cached activity fetch | ~0ms |
| Cache TTL | 5 min |
| Output consistency | 100% (semantic equality) |
| Memory growth (25 iterations) | < 100MB |
| Test coverage | 150 tests, 16 test files |

### Traversal Engine

The SDK uses ASP.NET PostBack navigation to traverse VULMS:

```
Login ──► GET /Home.aspx ──► cache dashboard HTML
                │
        ┌───────┴───────┐
        ▼               ▼
  Extract course    Extract button
  codes             indices (ibtn*)
        │               │
        └───────┬───────┘
                ▼
        POST /Home.aspx with
        __EVENTTARGET=ibtnAssignments_0
                │
                ▼
        302 redirect to
        StudentAssignmentListView.aspx
                │
                ▼
        Parse HTML with Cheerio
```

### Cache Behavior

```
First call:  fetch from VULMS ──► store in cache ──► return
Second call: check cache ──► TTL valid? ──► return deep copy (0 network)
Force:       forceRefresh:true ──► fetch fresh ──► update cache
Release:     sdk.releaseMemory() ──► clear all caches
```

---

## API Reference

### Authentication

```typescript
// Playwright browser automation (bypasses reCAPTCHA v3) — recommended
await sdk.loginWithBrowser(username, password);

// Raw HTTP login (may be blocked by reCAPTCHA)
await sdk.login(username, password);

// Check if authenticated
sdk.isAuthenticated(); // boolean
```

### Courses

```typescript
const courses = await sdk.courses.getEnrolledCourses();
// [{ code: 'CS301', title: 'Data Structures' }, ...]
```

### Assignments

```typescript
const all = await sdk.assignments.getAssignments();
const cs301 = await sdk.assignments.getAssignments('CS301');
```

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
// agg.pending, agg.submitted, agg.missed, agg.resultDeclared
// agg.byCourse — grouped by course code
```

### SDK Configuration

```typescript
const sdk = new VulmsSDK({
  logger: 'warn',         // 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
  cache: true,            // Enable output caching
  cacheTtlMs: 300000,     // Cache TTL (5 min default)
  retries: 3,             // Max retry attempts
  timeout: 30000,         // Request timeout in ms
  traceRequests: false,   // Log every HTTP request
  snapshots: false,       // Save HTML snapshots for debugging
});
```

### Errors

```typescript
import { AuthenticationError, SessionExpiredError, NavigationError, ParsingError } from 'vulms-sdk';

try {
  await sdk.assignments.getAssignments();
} catch (e) {
  if (e instanceof SessionExpiredError) {
    await sdk.loginWithBrowser(id, password); // re-authenticate
  }
  console.error(e.code, e.operation, e.recoverable);
}
```

| Error | Code | Recoverable |
|-------|------|-------------|
| `AuthenticationError` | `AUTH_ERROR` | ✅ |
| `SessionExpiredError` | `SESSION_EXPIRED` | ✅ |
| `RateLimitError` | `RATE_LIMITED` | ✅ |
| `NavigationError` | `NAVIGATION_ERROR` | ❌ |
| `ValidationError` | `VALIDATION_ERROR` | ❌ |
| `ParsingError` | `PARSING_ERROR` | ❌ |

### Memory Management

```typescript
// Release large cached objects when done
sdk.releaseMemory();
// Clears: dashboard HTML, cookies, traces, all module caches
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              VulmsSDK (public API)            │
├─────────┬─────────┬──────────┬───────────────┤
│ Client  │ Modules │ Parsers  │ Core           │
├─────────┼─────────┼──────────┼───────────────┤
│ HTTP    │ Assign  │ Cheerio  │ Session        │
│ PostBack│ Quiz    │ HTML     │ Runtime State  │
│ Retry   │ GDB     │ extract  │ Cache Layer    │
│ Tracing │ Lecture │          │ Telemetry      │
│         │ Course  │          │                │
├─────────┴─────────┴──────────┴───────────────┤
│              Utils (shared)                    │
│ Validation │ Dedupe │ Logger │ Normalizer      │
└───────────────────────────────────────────────┘
```

### Runtime Data Flow

```
login() ──► POST /login.aspx ──► set cookies ──► cache dashboard HTML
                                                    │
getAssignments() ◄── check cache ◄── POST Home.aspx
                                                    │
getQuizzes()     ◄── check cache ◄── POST Home.aspx
                                                    │
getAll()         ◄── aggregate all caches
```

---

## Security

- **Credentials**: Never stored on disk. Use environment variables only.
- **Cookies**: Stored in memory only. Never logged or serialized.
- **HTML snapshots**: Disabled by default. May contain session data — do not commit `debug/` to version control.
- **Telemetry**: Stores operation metrics only (success, duration, fingerprints). No credentials, no tokens, no full HTML.
- **Traces**: Bounded to 200 entries. Cleared on `releaseMemory()`. Do not enable `traceRequests` in production.

Report vulnerabilities: [SECURITY.md](SECURITY.md)

---

## Roadmap

| Phase | Status | Scope |
|-------|--------|-------|
| V0 — Core SDK | ✅ Done | Login, navigation, parsing, basic types |
| V1 — Production | ✅ Done | Caching, telemetry, consistency, memory stability |
| V1 — Beta Release | 🚀 **Current** | Public npm, docs, CI, release automation |
| V1.1 — Dashboard | 📅 Planned | Real-time dashboard data, activity indicators |
| V1.2 — Notifications | 📅 Planned | Push/email notification parsing |
| V2 — Dashboard API | 🔮 Future | First-party VULMS API integration |

---

## FAQ

**How do I get VULMS credentials?**
You need your VU student ID and password. The SDK never stores them.

**Why use Playwright for login?**
VULMS uses Google reCAPTCHA v3 on the login page, which blocks raw HTTP requests. Playwright simulates a real browser with full JavaScript execution and captcha bypass.

**Can I use this in production?**
Yes. The SDK is beta-ready with 150 tests, 25x stress testing, bounded memory, and deterministic outputs.

**Does it work with all VULMS courses?**
The SDK dynamically detects courses from your dashboard. It works with any enrolled course.

**What happens if VULMS changes its HTML?**
Parsers use semantic validation to detect structural changes. If a page is unexpected, the SDK returns `EMPTY_VALID` or `INVALID` rather than crashing.

**Is there rate limiting?**
The SDK adds 200-300ms delays between course traversals to avoid overwhelming VULMS servers. Retry logic handles HTTP 429 responses.

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Login fails with reCAPTCHA | HTTP login blocked | Use `loginWithBrowser()` |
| Empty arrays returned | No activities for course | Normal — `EMPTY_VALID` not an error |
| Session expires | Long idle time | Call `loginWithBrowser()` again |
| HTTP 401 errors | Expired cookies | Re-authenticate |
| Parser warnings | VULMS HTML changed | Check `debug/navigation/` snapshots |

---

## Development

```bash
npm run build          # CJS + ESM + DTS
npm run test           # 150 fixture-based tests
npm run typecheck      # TypeScript strict mode
npm run dev:login      # Live login test (requires .env)
npm run dev:telemetry  # Collect real telemetry
npm run dev:benchmark  # Performance benchmarks
npm run dev:release-gate  # Release gate validation
```

### Requirements

- Node.js >= 18
- Playwright (`npx playwright install chromium`)
- `.env` file with `VULMS_ID` and `VULMS_PASSWORD`

---

## License

MIT — see [LICENSE](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Security

See [SECURITY.md](SECURITY.md)
