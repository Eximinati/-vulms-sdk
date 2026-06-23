# vulms_dart

A Flutter-first Dart SDK for Virtual University LMS (VULMS).

Fetch assignments, quizzes, GDBs, lectures, grades, calendar events, and more with smart caching, session management, and typed exceptions.

## Features

- **10 service modules** — courses, assignments, quizzes, GDBs, lectures, grades, calendar, announcements, profile, activities
- **ASP.NET form handling** — automatic `__VIEWSTATE`, `__EVENTVALIDATION`, and PostBack management
- **Smart caching** — TTL-based in-memory cache with per-service invalidation
- **Session management** — login, cookie persistence, session validation, expiration detection
- **Typed exceptions** — `AuthException`, `SessionExpiredException`, `ParsingException`, `NetworkException`, `RateLimitException`
- **Freezed models** — immutable, copyable, equatable data classes with JSON serialization
- **Request tracing** — optional HTTP request logging for debugging
- **Retry with backoff** — automatic retry on transient failures (408, 429, 500-504)

## Installation

```yaml
dependencies:
  vulms_dart: ^0.1.0
```

```bash
dart pub get
```

## Quick Start

```dart
import 'package:vulms_dart/vulms_dart.dart';

final vulms = VulmsClient();

// Login
final result = await vulms.login(
  studentId: 'bc123456789',
  password: 'your-password',
);

if (result.success) {
  // Fetch courses
  final courses = await vulms.courses.getAll();
  for (final course in courses) {
    print('${course.code} - ${course.title}');
  }

  // Fetch assignments
  final assignments = await vulms.assignments.getAll();
  for (final a in assignments) {
    print('${a.title} | ${a.status} | Due: ${a.dueDate}');
  }

  // Fetch grades
  final grades = await vulms.grades.getAll();
  for (final g in grades) {
    print('${g.title} | ${g.obtainedMarks}/${g.totalMarks} | ${g.letterGrade}');
  }
}

vulms.dispose();
```

## Configuration

```dart
final vulms = VulmsClient(VulmsClientConfig(
  logLevel: LogLevel.info,        // silent, error, warn, info, debug, trace
  enableCache: true,              // TTL-based response caching
  cacheTtl: Duration(minutes: 5), // Cache duration
  retries: 3,                     // Max retry attempts
  timeout: Duration(seconds: 30), // Request timeout
  userAgent: 'My App/1.0',       // Custom User-Agent
  traceRequests: false,           // Enable request tracing
));
```

## Services

### Courses

```dart
final courses = await vulms.courses.getAll();
// Returns List<Course> — each with code and title
```

### Assignments

```dart
// All assignments across all courses
final all = await vulms.assignments.getAll();

// Assignments for a specific course
final cs101 = await vulms.assignments.getAll(courseCode: 'CS101');

// Force refresh (bypass cache)
final fresh = await vulms.assignments.getAll(forceRefresh: true);
```

### Quizzes

```dart
final quizzes = await vulms.quizzes.getAll();
// Each Quiz has: title, startDate, endDate, totalMarks, obtainedMarks,
//   availabilityStatus, submissionStatus, resultStatus, submitDate
```

### GDBs (Graded Discussion Boards)

```dart
final gdbs = await vulms.gdbs.getAll();
// Each Gdb has: title, dueDate, totalMarks, obtainedMarks, status
```

### Lectures

```dart
final lectures = await vulms.lectures.getAll();
// Each Lecture has: title, week, type, duration, status, url
```

### Grades

```dart
final grades = await vulms.grades.getAll();
// Each Grade has: title, type, totalMarks, obtainedMarks, percentage, letterGrade
```

### Calendar

```dart
final events = await vulms.calendar.getEvents();
// Each CalendarEvent has: courseCode, title, date, type, description
```

### Announcements

```dart
final announcements = await vulms.announcements.getAll();
// Each Announcement has: courseCode, title, body, date, author
```

### Profile

```dart
final profile = await vulms.profile.get();
// Profile has: studentId, name, email, program, session, imageUrl
```

### Activities (Aggregated)

```dart
final aggregate = await vulms.activities.getAll();
// ActivityAggregate has: pending, submitted, missed, resultDeclared
// Each is a List<UnifiedActivity> combining assignments, quizzes, GDBs, lectures
```

## Browser Cookie Login

When VULMS has reCAPTCHA enabled, use browser-obtained cookies:

```dart
final vulms = VulmsClient();

// Obtain cookies from a browser session (Playwright, Puppeteer, etc.)
await vulms.setSessionFromCookies(
  cookies: 'ASP.NET_SessionId=abc123; other=value',
  studentId: 'bc123456789',
);

final courses = await vulms.courses.getAll();
```

## Error Handling

```dart
try {
  final assignments = await vulms.assignments.getAll();
} on SessionExpiredException catch (e) {
  // Re-login required
  print('Session expired: ${e.message}');
  await vulms.login(studentId: '...', password: '...');
} on AuthException catch (e) {
  // Authentication error
  print('Auth error: ${e.message}');
} on NetworkException catch (e) {
  // Network error (check e.statusCode)
  print('Network error: ${e.message} (status: ${e.statusCode})');
} on RateLimitException catch (e) {
  // Rate limited — check e.retryAfter
  print('Rate limited, retry after: ${e.retryAfter}');
} on VulmsException catch (e) {
  // Any other SDK error
  print('SDK error: ${e.code} - ${e.message}');
}
```

## Models

All models are generated with [freezed](https://pub.dev/packages/freezed) and support:

```dart
// Immutability
final a = Assignment(courseCode: 'CS101', title: 'HW1', status: AssignmentStatus.pending);

// copyWith
final b = a.copyWith(status: AssignmentStatus.submitted);

// Equality
print(a == b); // false

// JSON serialization
final json = a.toJson();
final fromJson = Assignment.fromJson(json);
```

### Model Reference

| Model | Key Fields |
|-------|------------|
| `Course` | code, title |
| `Assignment` | courseCode, title, lesson, dueDate, totalMarks, status, obtainedMarks |
| `Quiz` | title, startDate, endDate, totalMarks, availabilityStatus, submissionStatus |
| `Gdb` | title, dueDate, totalMarks, status |
| `Lecture` | title, week, type, duration, status, url |
| `Grade` | title, type, totalMarks, obtainedMarks, percentage, letterGrade |
| `CalendarEvent` | courseCode, title, date, type, description |
| `Announcement` | courseCode, title, body, date, author |
| `Profile` | studentId, name, email, program, session, imageUrl |
| `UnifiedActivity` | type, courseCode, title, dueDate, status |

## Custom Logger

```dart
class MyAppLogger implements VulmsLogger {
  @override
  void debug(String message) => print('[DEBUG] $message');
  @override
  void info(String message) => print('[INFO] $message');
  @override
  void warn(String message) => print('[WARN] $message');
  @override
  void error(String message) => print('[ERROR] $message');
  @override
  void trace(String message) => print('[TRACE] $message');
  @override
  VulmsLogger child(String prefix) => this;
}

final vulms = VulmsClient(VulmsClientConfig(
  logLevel: LogLevel.debug,
));
```

## Architecture

```
lib/
├── vulms_dart.dart              # Public API barrel file
└── src/
    ├── client/
    │   ├── vulms_client.dart    # Main facade
    │   └── postback_engine.dart # ASP.NET PostBack handling
    ├── auth/
    │   └── session_manager.dart # Authentication & session lifecycle
    ├── services/                # 10 service modules
    │   ├── assignments_service.dart
    │   ├── quizzes_service.dart
    │   ├── gdbs_service.dart
    │   ├── lectures_service.dart
    │   ├── courses_service.dart
    │   ├── grades_service.dart
    │   ├── calendar_service.dart
    │   ├── announcements_service.dart
    │   ├── profile_service.dart
    │   └── activities_service.dart
    ├── models/                  # 12 freezed data classes
    ├── parsers/                 # 8 HTML parsers (ASP.NET, tiles, tables)
    ├── networking/
    │   └── vulms_http_client.dart # Dio wrapper with cookies & retry
    ├── exceptions/              # 6 typed exceptions
    └── utils/                   # Logger, date parser, validators, dedup
```

## Migration from vulms-sdk (TypeScript)

See [MIGRATION.md](MIGRATION.md) for a detailed guide.

**Key differences:**
- `VulmsClient` replaces the flat SDK exports
- Services are accessed via namespaces (`vulms.assignments`, `vulms.courses`, etc.)
- All models are strongly typed (no `Map<String, dynamic>` in public APIs)
- Exceptions are typed (no generic `Error` or `Exception`)
- Caching is built-in and per-service

## Testing

```bash
dart test
```

## License

MIT
