# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0-beta.1] - 2026-05-22

### Added
- Shared runtime state with single login per SDK lifecycle
- Dashboard HTML caching after login
- Smart traversal skipping based on dashboard indicators
- Output caching with 5-minute TTL and deep-copy isolation
- Output fingerprinting for deterministic consistency checks
- Semantic equality comparison (`areSemanticallyEqual`)
- Bounded trace retention (max 200 entries)
- Bounded telemetry retention (max 200 in-memory entries)
- Memory release API (`sdk.releaseMemory()`)
- Logger levels: `silent`, `error`, `warn`, `info`, `debug`, `trace`
- Standardized error types: `AuthenticationError`, `SessionExpiredError`, `NavigationError`, `ValidationError`, `RateLimitError`, `ParsingError`
- SDK config: `cache`, `cacheTtlMs`, `logger`
- 150 unit tests

### Changed
- Consistency calculation now groups by `operation:courseCode`
- Public API cleaned — internal helpers hidden
- Logger defaults to `warn` level
- Version bumped to `0.1.0-beta.1`

### Fixed
- Cache-hit output now identical to cache-miss output
- Memory growth stabilized under 100MB
- Release gate consistency >= 95%

## [0.1.0] - 2024

### Added
- Real Playwright-based VULMS login (`loginWithBrowser()`)
- ASP.NET PostBack navigation engine
- Cheerio HTML parsers for assignments, quizzes, GDBs, lectures, courses
- Cookie-based session management
- Activity aggregation across all module types
- SDK configuration system (`debug`, `snapshots`, `traceRequests`, `retries`, `timeout`)
- HTTP retry with exponential backoff (3 retries, 500ms base, 8000ms max)
- Request tracing with `getTraces()` / `clearTraces()`
- Session recovery helpers (`checkSessionHealth`, `SessionRecovery`)
- Deduplication utilities (`dedupeAssignments`, `dedupeQuizzes`, etc.)
- HTML snapshot utility for debug capture
- Integration report system with JSON persistence
- 8 integration playground scripts
- Parser confidence + structure fingerprinting system
- Namespaced debug logging with `child()` loggers
- 72 unit tests covering all parsers and utilities
- CJS + ESM + DTS build outputs
