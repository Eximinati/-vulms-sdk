# Changelog

All notable changes to `vulms_dart` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-23

### Added

- **VulmsClient** — main entry point with service-based architecture
- **10 service modules**: courses, assignments, quizzes, GDBs, lectures, grades, calendar, announcements, profile, activities
- **12 freezed models**: Course, Assignment, Quiz, Gdb, Lecture, Grade, CalendarEvent, Announcement, Profile, UnifiedActivity, ActivityAggregate, DashboardCourse
- **8 HTML parsers**: ASP.NET form data, assignment tiles/tables, quiz tiles/tables, GDB tiles/tables/heading groups, lecture tables/cards, course links/portlets, calendar grid/table/cards, grade tables/lists
- **Session management** — login, cookie persistence, session validation, expiration detection
- **ASP.NET PostBack engine** — automatic __VIEWSTATE, __EVENTVALIDATION, and form state management
- **Typed exceptions** — VulmsException, AuthException, SessionExpiredException, ParsingException, NetworkException, RateLimitException
- **Smart caching** — TTL-based per-service in-memory cache with invalidation
- **Request tracing** — optional HTTP request logging
- **Retry with exponential backoff** — automatic retry on transient failures (408, 429, 500-504)
- **Custom logging** — VulmsLogger interface with DefaultLogger and NoopLogger implementations
- **Date parsing** — VulmsDateParser supporting DD-Mon-YYYY, YYYY-MM-DD, Month DD YYYY, and more
- **Deduplication** — Dedupe utility with key generators for assignments, quizzes, GDBs, lectures
- **DOM helpers** — closest() function for the html package
- **Page validators** — validate assignment, quiz, GDB, lecture, and course list pages
- **399 tests** — parser tests, utility tests, model tests, networking tests, auth tests
- **11 HTML fixtures** — realistic VULMS page samples for testing
- **README** — comprehensive documentation with examples
- **MIGRATION.md** — TypeScript to Dart migration guide
