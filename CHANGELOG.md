# Changelog

All notable changes to this project will be documented in this file.

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
