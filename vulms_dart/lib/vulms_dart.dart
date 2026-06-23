/// VULMS Dart SDK
///
/// A Flutter-first SDK for Virtual University LMS (VULMS).
/// Fetch assignments, quizzes, GDBs, lectures, grades, and calendar events.
///
/// ## Quick Start
///
/// ```dart
/// import 'package:vulms_dart/vulms_dart.dart';
///
/// final vulms = VulmsClient();
/// await vulms.login(studentId: 'bc123456789', password: 'password');
///
/// final courses = await vulms.courses.getAll();
/// final assignments = await vulms.assignments.getAll();
/// final grades = await vulms.grades.getAll();
/// ```
library vulms_dart;

// ── Client ──
export 'src/client/vulms_client.dart' show VulmsClient, VulmsClientConfig;

// ── Models ──
export 'src/models/course.dart' show Course;
export 'src/models/assignment.dart' show Assignment, AssignmentStatus;
export 'src/models/quiz.dart'
    show Quiz, QuizAvailabilityStatus, QuizSubmissionStatus, QuizResultStatus;
export 'src/models/gdb.dart' show Gdb, GdbStatus;
export 'src/models/lecture.dart' show Lecture, LectureStatus;
export 'src/models/grade.dart' show Grade;
export 'src/models/calendar_event.dart' show CalendarEvent, CalendarEventType;
export 'src/models/announcement.dart' show Announcement;
export 'src/models/profile.dart' show Profile;
export 'src/models/activity.dart'
    show UnifiedActivity, ActivityAggregate, ActivityType, ActivityStatus;
export 'src/models/dashboard_course.dart'
    show DashboardCourse, DashboardActivityPreview;
export 'src/models/session.dart' show LoginResult, AspNetFormData, SessionState;

// ── Exceptions ──
export 'src/exceptions/exceptions.dart'
    show
        VulmsException,
        AuthException,
        SessionExpiredException,
        ParsingException,
        NetworkException,
        RateLimitException;

// ── Utils ──
export 'src/utils/logger.dart' show LogLevel, VulmsLogger, DefaultLogger;
export 'src/utils/date_parser.dart' show VulmsDateParser;
