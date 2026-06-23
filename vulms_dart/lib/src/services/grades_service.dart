import 'package:html/parser.dart' as html_parser;

import '../auth/session_manager.dart';
import '../models/grade.dart';
import '../utils/logger.dart';
import '../utils/constants.dart';

class _CacheEntry<T> {
  final T data;
  final DateTime createdAt;
  _CacheEntry(this.data) : createdAt = DateTime.now();
}

class GradesService {
  final SessionManager _session;
  final VulmsLogger _logger;
  static const _ttl = Duration(minutes: 30);

  _CacheEntry<List<Grade>>? _cache;

  GradesService({
    required SessionManager session,
    required VulmsLogger logger,
  })  : _session = session,
        _logger = logger.child('grades');

  Future<List<Grade>> getAll({String? courseCode, bool forceRefresh = false}) async {
    if (!forceRefresh && _cache != null) {
      if (DateTime.now().difference(_cache!.createdAt) < _ttl) {
        _logger.debug('[CACHE HIT] grades');
        final cached = _cache!.data;
        if (courseCode != null) {
          return cached.where((g) => g.courseCode == courseCode.toUpperCase()).toList();
        }
        return cached;
      }
      _logger.debug('[CACHE EXPIRED] grades');
    }

    _logger.info('Fetching grades');
    _session.ensureAuthenticated();

    final html = await _session.httpClient.get(path: VulmsUrls.gradeBook);
    final grades = _parseGrades(html);

    _cache = _CacheEntry(grades);
    _logger.info('Found ${grades.length} grade entries');

    if (courseCode != null) {
      return grades
          .where((g) => g.courseCode == courseCode.toUpperCase())
          .toList();
    }
    return grades;
  }

  List<Grade> _parseGrades(String html) {
    final doc = html_parser.parse(html);
    final grades = <Grade>[];
    String? currentCourseCode;
    String? currentCourseTitle;

    final tables = doc.querySelectorAll('table');
    for (final table in tables) {
      final headers = table.querySelectorAll('th');
      if (headers.isNotEmpty) {
        final headerText = headers.first.text.trim();
        final codeMatch = RegExp(r'^([A-Z]{2,4}\d{3}[A-Z]?)').firstMatch(headerText);
        if (codeMatch != null) {
          currentCourseCode = codeMatch.group(1)!.toUpperCase();
          currentCourseTitle = headerText.replaceFirst(
              RegExp(r'^[A-Z]{2,4}\d{3}[A-Z]?\s*-?\s*'), '').trim();
        }
      }

      final rows = table.querySelectorAll('tr');
      for (final row in rows) {
        if (row.querySelectorAll('th').isNotEmpty) continue;

        final cells = row.querySelectorAll('td');
        if (cells.length < 3) continue;

        final title = cells[0].text.trim();
        if (title.isEmpty || title.toLowerCase().contains('total')) continue;

        final typeText = cells.length > 1 ? cells[1].text.trim() : null;
        final totalMarks = cells.length > 2 ? _parseMarks(cells[2].text.trim()) : null;
        final obtainedMarks = cells.length > 3 ? _parseMarks(cells[3].text.trim()) : null;
        final percentage = cells.length > 4 ? cells[4].text.trim() : null;
        final letterGrade = cells.length > 5 ? cells[5].text.trim() : null;

        grades.add(Grade(
          courseCode: currentCourseCode ?? '',
          courseTitle: currentCourseTitle ?? '',
          title: title,
          type: typeText,
          totalMarks: totalMarks,
          obtainedMarks: obtainedMarks,
          percentage: percentage,
          letterGrade: letterGrade,
        ));
      }
    }

    return grades;
  }

  double? _parseMarks(String text) {
    final cleaned = text.replaceAll(',', '').trim();
    if (cleaned.isEmpty || cleaned == '-') return null;
    return double.tryParse(cleaned);
  }

  void invalidateCache() {
    _cache = null;
  }
}
