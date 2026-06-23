import 'package:html/parser.dart' as html_parser;

import '../auth/session_manager.dart';
import '../models/course.dart';
import '../parsers/course_parser.dart';
import '../utils/logger.dart';
import '../utils/constants.dart';

class _CacheEntry<T> {
  final T data;
  final DateTime createdAt;
  _CacheEntry(this.data) : createdAt = DateTime.now();
}

class CoursesService {
  final SessionManager _session;
  final VulmsLogger _logger;
  static const _ttl = Duration(minutes: 30);

  _CacheEntry<List<Course>>? _cache;

  CoursesService({
    required SessionManager session,
    required VulmsLogger logger,
  })  : _session = session,
        _logger = logger.child('courses');

  Future<List<Course>> getAll({String? courseCode, bool forceRefresh = false}) async {
    if (!forceRefresh && _cache != null) {
      if (DateTime.now().difference(_cache!.createdAt) < _ttl) {
        _logger.debug('[CACHE HIT] courses');
        final cached = _cache!.data;
        if (courseCode != null) {
          return cached.where((c) => c.code == courseCode.toUpperCase()).toList();
        }
        return cached;
      }
      _logger.debug('[CACHE EXPIRED] courses');
    }

    _logger.info('Fetching enrolled courses');
    _session.ensureAuthenticated();

    final html = await _session.httpClient.get(path: VulmsUrls.home);
    final doc = html_parser.parse(html);

    if (doc.body?.text.contains('Login.aspx') == true) {
      _logger.warn('Session expired during courses fetch');
      return [];
    }

    final courses = CourseParser.parseFromHome(html, logger: _logger);

    _cache = _CacheEntry(courses);
    _logger.info('Found ${courses.length} enrolled courses');

    if (courseCode != null) {
      return courses.where((c) => c.code == courseCode.toUpperCase()).toList();
    }
    return courses;
  }

  void invalidateCache() {
    _cache = null;
  }
}
