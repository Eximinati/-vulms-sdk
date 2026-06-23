# Migration Guide: vulms-sdk (TypeScript) → vulms_dart (Dart)

## Overview

This guide helps you migrate from the TypeScript `vulms-sdk` to the Dart `vulms_dart` package. The Dart version is a complete rewrite with a service-based architecture, strongly typed models, and Flutter-first design.

## Installation

### TypeScript (npm)

```bash
npm install vulms-sdk
```

```typescript
import VULMS from 'vulms-sdk';
```

### Dart

```yaml
dependencies:
  vulms_dart: ^0.1.0
```

```dart
import 'package:vulms_dart/vulms_dart.dart';
```

## API Comparison

### Creating a Client

**TypeScript:**
```typescript
import VULMS from 'vulms-sdk';

const vulms = new VULMS('your-vulms-cookie-string');
```

**Dart:**
```dart
import 'package:vulms_dart/vulms_dart.dart';

final vulms = VulmsClient();

// Login with credentials
final result = await vulms.login(
  studentId: 'bc123456789',
  password: 'your-password',
);

// OR set session from browser cookies
await vulms.setSessionFromCookies(
  cookies: 'ASP.NET_SessionId=abc123',
  studentId: 'bc123456789',
);
```

### Fetching Assignments

**TypeScript:**
```typescript
const assignments = await vulms.getAssignments('CS101');
// Returns: Assignment[] with fields like title, dueDate, status, etc.
```

**Dart:**
```dart
// All assignments across all courses
final assignments = await vulms.assignments.getAll();

// Specific course
final cs101Assignments = await vulms.assignments.getAll(courseCode: 'CS101');

// Force refresh (bypass cache)
final fresh = await vulms.assignments.getAll(forceRefresh: true);
```

### Fetching Courses

**TypeScript:**
```typescript
const courses = await vulms.getCourses();
```

**Dart:**
```dart
final courses = await vulms.courses.getAll();
```

### Fetching Grades

**TypeScript:**
```typescript
const grades = await vulms.getGrades();
```

**Dart:**
```dart
final grades = await vulms.grades.getAll();
```

### Fetching Calendar Events

**TypeScript:**
```typescript
const events = await vulms.getCalendarEvents();
```

**Dart:**
```dart
final events = await vulms.calendar.getEvents();
```

### Fetching Announcements

**TypeScript:**
```typescript
const announcements = await vulms.getAnnouncements();
```

**Dart:**
```dart
final announcements = await vulms.announcements.getAll();
```

### Fetching Profile

**TypeScript:**
```typescript
const profile = await vulms.getProfile();
```

**Dart:**
```dart
final profile = await vulms.profile.get();
```

## Model Differences

### Assignment

| TypeScript | Dart | Notes |
|-----------|------|-------|
| `title: string` | `title: String` | Same |
| `dueDate: Date \| null` | `dueDate: DateTime?` | Nullable |
| `status: string` | `status: AssignmentStatus` | Enum: pending, submitted, attempted, missed, resultDeclared |
| `totalMarks: number \| null` | `totalMarks: double?` | Nullable |
| `obtainedMarks: number \| null` | `obtainedMarks: double?` | Nullable |
| `submitDate: Date \| null` | `submitDate: DateTime?` | Nullable |
| `fileSize: string \| null` | `fileSize: String?` | Nullable |
| `lesson: string \| null` | `lesson: String?` | Nullable |

### Course

| TypeScript | Dart |
|-----------|------|
| `code: string` | `code: String` |
| `title: string` | `title: String` |

### Grade

| TypeScript | Dart | Notes |
|-----------|------|-------|
| `title: string` | `title: String` | Same |
| `type: string \| null` | `type: String?` | Nullable |
| `totalMarks: number \| null` | `totalMarks: double?` | Nullable |
| `obtainedMarks: number \| null` | `obtainedMarks: double?` | Nullable |
| `percentage: string \| null` | `percentage: String?` | Nullable |
| `letterGrade: string \| null` | `letterGrade: String?` | Nullable |
| `datePosted: Date \| null` | `datePosted: DateTime?` | Nullable |

### Quiz

| TypeScript | Dart | Notes |
|-----------|------|-------|
| `title: string` | `title: String` | Same |
| `startDate: Date \| null` | `startDate: DateTime?` | Nullable |
| `endDate: Date \| null` | `endDate: DateTime?` | Nullable |
| `totalMarks: number \| null` | `totalMarks: double?` | Nullable |
| `obtainedMarks: number \| null` | `obtainedMarks: double?` | Nullable |
| `availabilityStatus: string` | `availabilityStatus: QuizAvailabilityStatus` | Enum |
| `submissionStatus: string` | `submissionStatus: QuizSubmissionStatus` | Enum |
| `resultStatus: string` | `resultStatus: QuizResultStatus` | Enum |

## Error Handling

**TypeScript:**
```typescript
try {
  const assignments = await vulms.getAssignments('CS101');
} catch (error) {
  console.error(error);
}
```

**Dart:**
```dart
try {
  final assignments = await vulms.assignments.getAll();
} on SessionExpiredException catch (e) {
  // Session expired, re-login required
  print('Session expired: ${e.message}');
} on AuthException catch (e) {
  // Authentication error
  print('Auth error: ${e.message}');
} on NetworkException catch (e) {
  // Network error (check e.statusCode)
  print('Network error: ${e.message} (status: ${e.statusCode})');
} on RateLimitException catch (e) {
  // Rate limited (check e.retryAfter)
  print('Rate limited: ${e.message}');
} on VulmsException catch (e) {
  // Any other SDK error
  print('SDK error: ${e.code} - ${e.message}');
}
```

## Caching

The Dart SDK has built-in per-service caching with TTL:

```dart
// Default: 5-minute cache
final assignments = await vulms.assignments.getAll(); // hits network
final cached = await vulms.assignments.getAll();     // returns cached

// Force refresh
final fresh = await vulms.assignments.getAll(forceRefresh: true);

// Invalidate all caches
vulms.invalidateCache();

// Configure cache TTL
final vulms = VulmsClient(VulmsClientConfig(
  cacheTtl: Duration(minutes: 10),
));
```

## Session Management

**TypeScript:**
```typescript
const vulms = new VULMS(cookieString);
```

**Dart:**
```dart
// Option 1: Login with credentials
await vulms.login(studentId: 'bc123456789', password: 'password');

// Option 2: Set from browser cookies (for reCAPTCHA scenarios)
await vulms.setSessionFromCookies(
  cookies: 'ASP.NET_SessionId=abc123',
  studentId: 'bc123456789',
);

// Validate session
final isValid = await vulms.validateSession();

// Check authentication
if (vulms.isAuthenticated) {
  // ...
}
```

## New Features in Dart

1. **Service-based architecture** — clean namespaces for each feature
2. **Freezed models** — immutable, equatable, with `copyWith()` and JSON serialization
3. **Typed exceptions** — 6 specific exception types instead of generic errors
4. **Built-in caching** — per-service TTL cache with invalidation
5. **Request tracing** — optional HTTP request logging for debugging
6. **Retry with backoff** — automatic retry on transient failures
7. **Custom logging** — implement `VulmsLogger` to integrate with your logging system
8. **Flutter-first** — works in Flutter mobile, desktop, and web

## Breaking Changes

1. **Constructor** — No longer takes a cookie string. Use `login()` or `setSessionFromCookies()`.
2. **Method names** — Changed from `getAssignments()` to `assignments.getAll()`
3. **Return types** — All models are now strongly typed (no dynamic maps)
4. **Error handling** — Errors are now typed exceptions, not generic errors
5. **Date types** — `Date` → `DateTime`
6. **Null handling** — Nullable fields use Dart's `?` syntax
