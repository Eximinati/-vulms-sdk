import 'dart:async';

import '../auth/session_manager.dart';
import '../networking/vulms_http_client.dart';
import '../services/assignments_service.dart';
import '../services/quizzes_service.dart';
import '../services/gdbs_service.dart';
import '../services/lectures_service.dart';
import '../services/courses_service.dart';
import '../services/grades_service.dart';
import '../services/calendar_service.dart';
import '../services/announcements_service.dart';
import '../services/profile_service.dart';
import '../services/activities_service.dart';
import '../utils/logger.dart';
import '../exceptions/exceptions.dart';
import '../models/session.dart';

/// Configuration for [VulmsClient].
class VulmsClientConfig {
  /// Log level for SDK output.
  final LogLevel logLevel;

  /// Enable output caching.
  final bool enableCache;

  /// Cache time-to-live duration.
  final Duration cacheTtl;

  /// Maximum number of retry attempts.
  final int retries;

  /// Request timeout duration.
  final Duration timeout;

  /// Custom user agent string.
  final String? userAgent;

  /// Enable request tracing.
  final bool traceRequests;

  const VulmsClientConfig({
    this.logLevel = LogLevel.warn,
    this.enableCache = true,
    this.cacheTtl = const Duration(minutes: 5),
    this.retries = 3,
    this.timeout = const Duration(seconds: 30),
    this.userAgent,
    this.traceRequests = false,
  });
}

/// The main entry point for the VULMS Dart SDK.
///
/// Provides access to all VULMS features through service-based namespaces.
///
/// ```dart
/// final vulms = VulmsClient();
/// await vulms.login(studentId: 'bc123456789', password: 'password');
/// final courses = await vulms.courses.getAll();
/// final assignments = await vulms.assignments.getAll();
/// ```
class VulmsClient {
  late final VulmsHttpClient _httpClient;
  late final SessionManager _session;
  late final VulmsLogger _logger;
  final VulmsClientConfig _config;

  /// Service for fetching courses.
  late final CoursesService courses;

  /// Service for fetching assignments.
  late final AssignmentsService assignments;

  /// Service for fetching quizzes.
  late final QuizzesService quizzes;

  /// Service for fetching Graded Discussion Boards.
  late final GdbsService gdbs;

  /// Service for fetching lectures.
  late final LecturesService lectures;

  /// Service for fetching grades.
  late final GradesService grades;

  /// Service for fetching calendar events.
  late final CalendarService calendar;

  /// Service for fetching announcements.
  late final AnnouncementsService announcements;

  /// Service for fetching student profile.
  late final ProfileService profile;

  /// Service for fetching and aggregating activities.
  late final ActivitiesService activities;

  /// Create a new VULMS client.
  VulmsClient([VulmsClientConfig? config])
      : _config = config ?? const VulmsClientConfig() {
    _logger = DefaultLogger(level: _config.logLevel);

    _httpClient = VulmsHttpClient(
      logger: _logger,
      timeoutMs: _config.timeout.inMilliseconds,
      traceRequests: _config.traceRequests,
      userAgent: _config.userAgent,
    );

    _session = SessionManager(
      httpClient: _httpClient,
      logger: _logger,
    );

    courses = CoursesService(session: _session, logger: _logger);
    assignments = AssignmentsService(session: _session, logger: _logger);
    quizzes = QuizzesService(session: _session, logger: _logger);
    gdbs = GdbsService(session: _session, logger: _logger);
    lectures = LecturesService(session: _session, logger: _logger);
    grades = GradesService(session: _session, logger: _logger);
    calendar = CalendarService(session: _session, logger: _logger);
    announcements = AnnouncementsService(session: _session, logger: _logger);
    profile = ProfileService(session: _session, logger: _logger);
    activities = ActivitiesService(session: _session, logger: _logger);
  }

  /// Authenticate with VULMS using student ID and password.
  ///
  /// Returns a [LoginResult] indicating success or failure.
  /// On failure, check [LoginResult.error] for details.
  ///
  /// Throws [AuthException] on unexpected errors.
  Future<LoginResult> login({
    required String studentId,
    required String password,
  }) async {
    if (_session.isAuthenticated) {
      _logger.debug('[SDK] Already authenticated, skipping login');
      return const LoginResult(success: true);
    }

    final result = await _session.login(studentId, password);

    if (result.success) {
      await _postLoginSetup(studentId);
    }

    return result;
  }

  /// Set session from browser-obtained cookies.
  ///
  /// Use this when you've obtained cookies through a browser-based
  /// login flow (e.g., Playwright, Puppeteer, or manual browser login).
  Future<void> setSessionFromCookies({
    required String cookies,
    required String studentId,
  }) async {
    await _session.setFromBrowserCookies(
      cookies: cookies,
      username: studentId,
    );
    await _postLoginSetup(studentId);
  }

  /// Whether the client is currently authenticated.
  bool get isAuthenticated => _session.isAuthenticated;

  /// Check if the session is still valid with the server.
  Future<bool> validateSession() => _session.validateSession();

  /// Invalidate all caches.
  void invalidateCache() {
    courses.invalidateCache();
    assignments.invalidateCache();
    quizzes.invalidateCache();
    gdbs.invalidateCache();
    lectures.invalidateCache();
    grades.invalidateCache();
    calendar.invalidateCache();
    announcements.invalidateCache();
    profile.invalidateCache();
  }

  /// Release memory held by cached data.
  void releaseMemory() {
    invalidateCache();
    _httpClient.clearTraces();
    _httpClient.clearCookies();
  }

  /// Get request traces (for debugging).
  List<dynamic> getTraces() => _httpClient.getTraces();

  /// Clear request traces.
  void clearTraces() => _httpClient.clearTraces();

  /// Dispose of the client and release resources.
  void dispose() {
    _httpClient.dispose();
  }

  Future<void> _postLoginSetup(String username) async {
    _logger.info('[SDK] Post-login: fetching dashboard');
    // Prefetch dashboard to cache it
    await courses.getAll(forceRefresh: true);
  }
}
