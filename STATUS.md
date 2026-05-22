# vulms-sdk Status — 2026-05-22

## Goal
Production-grade TypeScript npm SDK (`vulms-sdk`) for VULMS with fixture-driven parsing.

## Constraints & Preferences
- TypeScript, Node.js, axios, tough-cookie, cheerio, playwright, tsup, zod, vitest
- Cookie-based session with ASP.NET form state (PostBack)
- Playwright `loginWithBrowser()` only — reCAPTCHA v3 blocks raw HTTP
- All navigation via `/Home.aspx` PostBack with course-indexed `ibtn*` events
- No hardcoded credentials — `.env` only

---

## What's Done

### V1 PreLaunch — Public Beta (NEW)
- **README overhaul** — badges, feature comparison, architecture diagram, cache behavior, navigation pattern, error reference, FAQ, troubleshooting table, roadmap
- **Benchmark suite** — `playground/benchmark.ts` now generates markdown reports to `benchmarks/`
- **Observability mode** — `config.debugDashboard: true` exposes cache hits, traversal metrics, memory, timing via `sdk.getDebugDashboard()`
- **Release automation** — `.github/workflows/release.yml` on tags `v*` (test → build → GH release → npm publish beta/stable)
- **Multi-session stress test** — `playground/multi-session-stress.ts` simulates 3+ concurrent SDK sessions, 25 iterations each
- **Docs website** — VitePress structure in `docs/` with architecture, FAQ, API reference
- **Security audit** — verified: no credentials logged, no secrets in telemetry/traces, bounded memory retention
- **npm pack** — clean tarball: 10 files (dist/*, README, LICENSE, CHANGELOG, package.json)

### V1 Launch Engineering
- **Package.json hardened** — keywords, repository, homepage, bugs, funding, publishConfig, sideEffects, prepack script
- **Version** — `0.1.0-beta.1`
- **Error system** — `AuthenticationError`, `SessionExpiredError`, `NavigationError`, `ValidationError`, `RateLimitError`, `ParsingError` with code, operation, recoverable flag
- **Logger levels** — `silent`, `error`, `warn`, `info`, `debug`, `trace`; defaults to `warn`
- **Config system** — `cache`, `cacheTtlMs`, `logger` added to SDKConfig
- **Examples** — `examples/assignments.ts`, `quizzes.ts`, `gdb.ts`, `activities.ts`, `caching.ts`
- **GitHub CI** — `.github/workflows/ci.yml` (Node 18/20/22, typecheck, test, build)
- **NPM readiness** — `.npmignore`, `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md`
- **Clean tarball** — `npm pack` produces 10 files (dist/*, README, LICENSE, CHANGELOG, package.json)

### V1 Hardening — Release Gate Stabilization
- **Output fingerprinting** — `computeOutputFingerprint()` for deterministic output comparison
- **Consistency rewritten** — groups by `operation:courseCode` for granular comparison; compares fingerprints not success rates
- **Hardened normalization** — strips ALL dynamic fields: timestamps, IDs, memory, duration, retries, cache stats, validation state
- **Deep-copy cache isolation** — `getCache()` returns `JSON.parse(JSON.stringify(...))` to prevent mutation
- **Deterministic sorting** — all arrays sorted by JSON stringification; object keys sorted alphabetically
- **Telemetry fingerprinting** — `collect-telemetry.ts` and `stress-test.ts` capture output fingerprints per operation
- **Bounded trace retention** — HttpClient limits traces to 200 entries (evicts oldest)
- **Bounded telemetry retention** — TelemetryStore limits in-memory entries to 200 (evicts oldest)
- **Memory release** — `sdk.releaseMemory()` clears dashboard HTML, cookies, traces, and cache
- **Stress test memory management** — calls `releaseMemory()` after each operation
- **Clean public API** — removed internal exports (PostBackEngine, SessionManager, parsers, dedupe, reports)
- **Production README** — install, quickstart, features, API, performance, troubleshooting, development

### V1 Performance Optimization
- `RuntimeState` — shared state across SDK lifecycle with `dashboardHtml`, `dashboardIndicators`, `cache`, `telemetry`
- Single login per SDK lifecycle; dashboard HTML cached once after login
- Smart dashboard cache: `extractDashboardIndicators()` maps course codes to button indices
- Request reduction: modules skip empty traversals based on dashboard indicators
- Cache helpers: `getCache()`, `setCache()`, `isCacheValid()` with 5-minute TTL
- All modules updated: `assignments`, `quizzes`, `gdb`, `lectures`, `courses`, `activities`
- `deriveAssignmentStatus()` — correct substring priority: `not submitted` > `result`/`graded` > `missed`/`expired` > `submitted` > `submittedAt` > `dueDate`
- Empty-state validation: `EMPTY_VALID` for pages with containers but no content
- Playground renderers show all enrolled courses with friendly empty messages
- Telemetry collection, stress testing, memory validation, benchmark, and release gate scripts

### Core SDK Infrastructure
- `VulmsSDK` config system with `{ debug, snapshots, traceRequests, retries, timeout }`, `mergeConfig()`, `snapshots` propagated to all modules
- `HttpClient` with retry engine (3 retries, 500ms base, 8000ms max), exponential backoff, `RequestTrace[]` for observability, `getTraces()/clearTraces()`
- `PostBackEngine` with ASP.NET form state management, image button support (`{ctlName, ctlName.x:10, ctlName.y:10}`), `performNavigation()` with repeater validation
- `SessionRecovery` with `checkSessionHealth()`, `isSessionExpired()`, `extractSessionExpiry()`

### Parser Layer (All module parsers)
- `parseCoursesFromHome()` — extracts courses from home page with code/title/link
- `parseAssignments()` — tile repeater (`gvTileRepeaterAssignment`) with exact field IDs
- `parseQuizzes()` — tile repeater (`gvTileRepeaterQuiz`) with exact field IDs, dual-strategy
- `parseGDBs()` — table parse with course grouping, fallback card parser
- `parseLectures()` — table parse with course grouping, fallback card parser
- `parseDashboard()` — dashboard course card parsing with activity indicators

### Telemetry & Validation Infrastructure (NEW)
- `TelemetryStore` — real-time telemetry collection with disk persistence (`debug/telemetry/`)
  - `recordEntry()`, `getAllEntries()`, `computeSummary()`
  - `prune(maxAgeHours)`, `pruneToMaxEntries(max)`, `getDiskUsage()`
- `collect-telemetry.ts` — populates telemetry from all modules (courses, assignments, quizzes, GDB, lectures, activities)
- `stress-test.ts` — 25x-50x long-run stress testing with drift detection
  - Same-session and fresh-session modes
  - Detects: latency drift, success rate degradation, memory growth, retry storms
- `memory-trace-validation.ts` — heap growth, trace accumulation, telemetry growth validation
- `benchmark.ts` — real benchmark reporting (cold login, warm traversal, smart vs legacy, per-course)
- `release-gate.ts` — release gate validation with 6 criteria:
  1. Consistency > 95%
  2. Failure rate < 3%
  3. Bounded retries
  4. Stable lecture traversal
  5. No memory growth
  6. No critical safety issues
- `beta-readiness.ts` — strictly empirical (no estimated fallbacks), reports "INSUFFICIENT DATA" when no telemetry

### Lecture Pipeline Hardening (NEW)
- Fresh state clearing before each course navigation
- Proper VIEWSTATE refresh per course
- Inter-course delay (200ms) to prevent ASP.NET state conflicts
- Semantic page validation before parsing
- Duplicate detection with stable keys

### Parser Confidence & Quality
- `buildConfidence()`, `fingerprintHtml()`, `isLowConfidence()` in `src/utils/confidence.ts`
- HTML structure fingerprints with table/form/VIEWSTATE/repeater counts
- `ParseConfidence` metadata on every parse result

### Centralized Deduplication
- `dedupe()`, `dedupeAssignments()`, `dedupeQuizzes()`, `dedupeGDBs()`, `dedupeLectures()`, `dedupeUnifiedActivities()` with stable keys
- All keyed by `courseCode|title|date` patterns

### Unified Activity System
- `toUnifiedActivity()` maps assignments/quizzes/GDBs/lectures to unified status
- Smart mode with dashboard-driven optimization (skips empty modules)
- Legacy mode (full traversal)

### Integration Report System
- `generateIntegrationReport()`, `saveIntegrationReport()`, `printReportSummary()`, `listReports()`, `loadReport()`
- Saves to `debug/reports/` with JSON + HTML snapshots

### Navigation Strategy
- `detectControlType()`, `isImageButton()`, `buildImageButtonFields()`, `hasQuizRepeater()`, `extractPageTitle()` in `src/utils/navigation.ts`
- Failed navigation auto-snapshots to `debug/navigation-failures/`

### Data Types
- `Assignment`, `Quiz`, `GDB`, `Lecture`, `UnifiedActivity`, `Course`, `SessionInfo`, `DashboardCourse`
- Zod schemas for all types

### Tests — 150 passing
- 16 test files, 0 TypeScript errors, clean build (CJS 145KB / ESM 141KB / DTS 26KB)

### Documentation
- `README.md` — full API examples, architecture, troubleshooting
- `LICENSE`, `CONTRIBUTING.md`, `CHANGELOG.md`
- Package.json with 16 `dev:*` npm scripts

### Playground Scripts
- `test-login.ts`, `test-courses.ts`, `test-assignments.ts`, `test-quizzes.ts`, `test-gdb.ts`, `test-lectures.ts`, `test-activities.ts`, `test-report.ts`, `test-per-course.ts`, `utils.ts`
- **NEW**: `collect-telemetry.ts`, `stress-test.ts`, `memory-trace-validation.ts`, `benchmark.ts`, `release-gate.ts`

---

## NPM Scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Build CJS + ESM + DTS |
| `npm run test` | Run 120 tests |
| `npm run typecheck` | TypeScript type check |
| `npm run dev:telemetry` | Collect real telemetry from all modules |
| `npm run dev:stress` | Run 25x stress test |
| `npm run dev:memory` | Memory & trace validation |
| `npm run dev:benchmark` | Benchmark suite |
| `npm run dev:release-gate` | Release gate validation |
| `npm run dev:readiness` | Beta readiness report |
| `npm run dev:activities` | Full activity aggregation test |
| `npm run dev:assignments` | Assignment module test |
| `npm run dev:quizzes` | Quiz module test |
| `npm run dev:gdb` | GDB module test |
| `npm run dev:lectures` | Lecture module test |
| `npm run dev:courses` | Course module test |
| `npm run dev:report` | Integration report test |

---

## Release Gate Criteria

| Gate | Threshold | Status |
|------|-----------|--------|
| Consistency | > 95% | Requires telemetry |
| Failure Rate | < 3% | Requires telemetry |
| Bounded Retries | < 0.5 per op | Requires telemetry |
| Lecture Stability | >= 90% | Requires telemetry |
| No Memory Growth | < 100MB delta | Requires telemetry |
| No Safety Issues | 0 critical | Requires telemetry |

**To evaluate gates**: Run `npm run dev:telemetry` then `npm run dev:release-gate`

---

## File Map

| File | Purpose |
|------|---------|
| `src/vulms-sdk.ts` | Core SDK class |
| `src/client/http-client.ts` | HTTP client with retry |
| `src/client/postback-engine.ts` | ASP.NET PostBack engine |
| `src/client/browser-login.ts` | Playwright browser login |
| `src/modules/assignments.ts` | Assignment module |
| `src/modules/quizzes.ts` | Quiz module |
| `src/modules/gdb.ts` | GDB module |
| `src/modules/lectures.ts` | Lecture module (hardened) |
| `src/modules/courses.ts` | Course module |
| `src/modules/activities.ts` | Activity aggregation (smart + legacy) |
| `src/modules/dashboard.ts` | Dashboard parsing |
| `src/parsers/` | All HTML parsers |
| `src/utils/telemetry-store.ts` | Telemetry collection & pruning with output fingerprinting |
| `src/utils/output-normalizer.ts` | Output normalization, semantic equality, fingerprinting |
| `src/utils/beta-readiness.ts` | Empirical readiness report |
| `src/utils/validation.ts` | Semantic page validation |
| `src/utils/tracing.ts` | Trace snapshots |
| `src/utils/stress-test.ts` | Stress testing utilities |
| `src/utils/performance.ts` | Performance tracking |
| `src/utils/report.ts` | Integration reports |
| `src/utils/confidence.ts` | Parse confidence scoring |
| `src/utils/dedupe.ts` | Centralized deduplication |
| `src/utils/activity.ts` | Unified activity mapping |
| `src/utils/navigation.ts` | Navigation strategy helpers |
| `src/utils/date.ts` | VULMS date parsing |
| `src/core/session.ts` | Session management |
| `src/core/runtime-state.ts` | Shared runtime state, cache, dashboard indicators |
| `src/core/session-recovery.ts` | Session health checking |
| `src/core/errors.ts` | Custom error types |
| `src/types/` | All type definitions |
| `src/constants/` | Selectors, URLs |
| `src/index.ts` | Full SDK exports |
| `playground/collect-telemetry.ts` | Telemetry collection runner |
| `playground/stress-test.ts` | Long-run stress testing |
| `playground/memory-trace-validation.ts` | Memory & trace validation |
| `playground/benchmark.ts` | Benchmark suite |
| `playground/release-gate.ts` | Release gate validation |
| `tests/` | 120 tests + HTML fixtures |
| `debug/telemetry/` | Telemetry data (generated) |
| `debug/navigation/` | Navigation snapshots |
| `debug/reports/` | Integration reports |
