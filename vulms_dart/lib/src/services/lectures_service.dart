import 'package:html/parser.dart' as html_parser;

import '../auth/session_manager.dart';
import '../models/lecture.dart';
import '../utils/logger.dart';
import '../utils/constants.dart';
import '../utils/dedupe.dart';
import '../utils/dom_helper.dart';

class _CacheEntry<T> {
  final T data;
  final DateTime createdAt;
  _CacheEntry(this.data) : createdAt = DateTime.now();
}

class LecturesService {
  final SessionManager _session;
  final VulmsLogger _logger;
  static const _ttl = Duration(minutes: 15);
  static final _codeRe = RegExp(r'^([A-Z]{2,4}\d{3}[A-Z]?)');
  static final _idxRe = RegExp(r'_(\d+)$');

  _CacheEntry<List<Lecture>>? _cache;

  LecturesService({
    required SessionManager session,
    required VulmsLogger logger,
  })  : _session = session,
        _logger = logger.child('lectures');

  Future<List<Lecture>> getAll({
    String? courseCode,
    bool forceRefresh = false,
  }) async {
    if (!forceRefresh && _cache != null) {
      if (DateTime.now().difference(_cache!.createdAt) < _ttl) {
        _logger.debug('[CACHE HIT] lectures');
        final c = _cache!.data;
        if (courseCode != null) {
          return c.where((l) => l.courseCode == courseCode.toUpperCase()).toList();
        }
        return c;
      }
    }

    _session.ensureAuthenticated();
    final homeHtml = await _session.httpClient.get(path: VulmsUrls.home);
    final courseIndices = _findAllCourseIndices(homeHtml);
    _logger.info('Found ${courseIndices.length} courses');

    final all = <Lecture>[];
    final seen = <String>{};

    for (final entry in courseIndices) {
      final (index, code) = entry;
      if (courseCode != null && code != courseCode.toUpperCase()) continue;

      final eventTarget =
          'ctl00\$MainContent\$gvCourseList\$ctl${index.toString().padLeft(2, '0')}\$ibtnActivitySession';

      String html;
      try {
        _session.postbackEngine.clearState();
        html = await _session.postbackEngine.performPostBack(
          page: VulmsUrls.home,
          eventTarget: eventTarget,
        );
      } catch (e) {
        _logger.warn('Navigation failed for $code: $e');
        continue;
      }

      final parsed = _parsePage(html, code);
      for (final l in parsed) {
        final key = Dedupe.lectureKey(l.courseCode, l.title, l.week, l.type);
        if (!seen.contains(key)) {
          seen.add(key);
          all.add(l);
        }
      }
    }

    _cache = _CacheEntry(all);
    if (courseCode != null) {
      return all.where((l) => l.courseCode == courseCode.toUpperCase()).toList();
    }
    return all;
  }

  List<Lecture> _parsePage(String html, String courseCode) {
    final doc = html_parser.parse(html);
    final lectures = <Lecture>[];

    for (final row in doc.querySelectorAll('table tr')) {
      if (row.querySelectorAll('th').isNotEmpty) continue;
      final cells = row.querySelectorAll('td');
      if (cells.length < 2) continue;

      final title = cells[0].text.trim();
      if (title.isEmpty) continue;

      final weekMatch = RegExp(r'[Ww]eek\s*(\d+)').firstMatch(title);
      final week = weekMatch != null ? int.tryParse(weekMatch.group(1)!) : null;
      final link = row.querySelector('a');
      final type = cells.length > 1 ? cells[1].text.trim() : null;
      final duration = cells.length > 2 ? cells[2].text.trim() : null;

      lectures.add(Lecture(
        courseCode: courseCode,
        courseTitle: '',
        week: week,
        title: title,
        type: type?.isNotEmpty == true ? type : null,
        duration: duration?.isNotEmpty == true ? duration : null,
        status: _deriveStatus(title, row.outerHtml),
        url: link?.attributes['href'],
      ));
    }
    return lectures;
  }

  List<(int, String)> _findAllCourseIndices(String html) {
    final doc = html_parser.parse(html);
    final results = <(int, String)>[];
    final seen = <String>{};
    for (final el in doc.querySelectorAll(
        '[id^="MainContent_gvCourseList_ibtnActivitySession_"]')) {
      final m = _idxRe.firstMatch(el.id);
      if (m == null) continue;
      final idx = int.parse(m.group(1)!);
      final h3 = (closest(el, '.m-portlet') ?? el.parent)?.querySelector('h3');
      final codeMatch = _codeRe.firstMatch(h3?.text.trim() ?? '');
      final code = codeMatch?.group(1)?.toUpperCase() ?? 'IDX_$idx';
      if (!seen.contains(code)) {
        seen.add(code);
        results.add((idx, code));
      }
    }
    return results;
  }

  LectureStatus _deriveStatus(String text, String html) {
    final lt = text.toLowerCase();
    final lh = html.toLowerCase();
    if (lt.contains('unwatched') || lt.contains('not watched')) {
      return LectureStatus.unwatched;
    }
    if (lh.contains('watched') || lt.contains('watched')) return LectureStatus.watched;
    return LectureStatus.newLecture;
  }

  void invalidateCache() {
    _cache = null;
  }
}
