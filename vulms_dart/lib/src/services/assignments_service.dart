import 'package:html/parser.dart' as html_parser;

import '../auth/session_manager.dart';
import '../models/assignment.dart';
import '../utils/logger.dart';
import '../utils/constants.dart';
import '../utils/date_parser.dart';
import '../utils/dedupe.dart';
import '../utils/dom_helper.dart';

class _CacheEntry<T> {
  final T data;
  final DateTime createdAt;
  _CacheEntry(this.data) : createdAt = DateTime.now();
}

class AssignmentsService {
  final SessionManager _session;
  final VulmsLogger _logger;
  static const _ttl = Duration(minutes: 15);
  static final _codeRe = RegExp(r'^([A-Z]{2,4}\d{3}[A-Z]?)');
  static final _idxRe = RegExp(r'_(\d+)$');

  _CacheEntry<List<Assignment>>? _cache;

  AssignmentsService({
    required SessionManager session,
    required VulmsLogger logger,
  })  : _session = session,
        _logger = logger.child('assignments');

  Future<List<Assignment>> getAll({
    String? courseCode,
    bool forceRefresh = false,
  }) async {
    if (!forceRefresh && _cache != null) {
      if (DateTime.now().difference(_cache!.createdAt) < _ttl) {
        _logger.debug('[CACHE HIT] assignments');
        final c = _cache!.data;
        if (courseCode != null) {
          return c.where((a) => a.courseCode == courseCode.toUpperCase()).toList();
        }
        return c;
      }
    }

    _session.ensureAuthenticated();
    final homeHtml = await _session.httpClient.get(path: VulmsUrls.home);
    final courseIndices = _findAllCourseIndices(homeHtml);
    _logger.info('Found ${courseIndices.length} courses');

    final all = <Assignment>[];
    final seen = <String>{};

    for (final entry in courseIndices) {
      final (index, code) = entry;
      if (courseCode != null && code != courseCode.toUpperCase()) continue;

      final eventTarget =
          'ctl00\$MainContent\$gvCourseList\$ctl${index.toString().padLeft(2, '0')}\$ibtnAssignments';

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
      for (final a in parsed) {
        final key = Dedupe.assignmentKey(a.courseCode, a.title, a.dueDate, a.totalMarks);
        if (!seen.contains(key)) {
          seen.add(key);
          all.add(a);
        }
      }
    }

    _cache = _CacheEntry(all);
    if (courseCode != null) {
      return all.where((a) => a.courseCode == courseCode.toUpperCase()).toList();
    }
    return all;
  }

  List<Assignment> _parsePage(String html, String courseCode) {
    final doc = html_parser.parse(html);
    final assignments = <Assignment>[];
    final indices = _tileIndices(doc);

    if (indices.isEmpty) return _tableFallback(doc, courseCode);

    for (final idx in indices) {
      final titleEl =
          doc.querySelector('#MainContent_gvTileRepeaterAssignment_Label3_$idx') ??
          doc.querySelector('#MainContent_gvTileRepeaterAssignment_lblTitle_$idx');
      final title = titleEl?.text.trim() ?? '';
      if (title.isEmpty || title.contains('Title:')) continue;

      final lesson = _text(doc, '#MainContent_gvTileRepeaterAssignment_Label1_$idx');
      final dueDate = VulmsDateParser.tryParse(_text(doc, '#MainContent_gvTileRepeaterAssignment_Label2_$idx') ?? '');
      final totalMarks = _marks(_text(doc, '#MainContent_gvTileRepeaterAssignment_Label4_$idx') ?? '');
      final statusText = _text(doc, '#MainContent_gvTileRepeaterAssignment_Label5_$idx') ?? '';

      assignments.add(Assignment(
        courseCode: courseCode,
        courseTitle: '',
        title: title,
        lesson: lesson,
        dueDate: dueDate,
        totalMarks: totalMarks,
        status: _deriveStatus(statusText, dueDate),
      ));
    }
    return assignments;
  }

  List<Assignment> _tableFallback(dynamic doc, String courseCode) {
    final result = <Assignment>[];
    for (final row in doc.querySelectorAll('table tr')) {
      final cells = row.querySelectorAll('td');
      if (cells.length < 3) continue;
      final title = cells[0].text.trim();
      if (title.isEmpty || title.contains('Title:')) continue;
      result.add(Assignment(
        courseCode: courseCode,
        courseTitle: '',
        title: title,
        dueDate: VulmsDateParser.tryParse(cells[1].text.trim()),
        totalMarks: _marks(cells[2].text.trim()),
        status: AssignmentStatus.pending,
      ));
    }
    return result;
  }

  List<int> _tileIndices(dynamic doc) {
    final ids = <int>{};
    for (final el in doc.querySelectorAll(
        '[id^="MainContent_gvTileRepeaterAssignment_Label3_"]')) {
      final m = _idxRe.firstMatch(el.id);
      if (m != null) ids.add(int.parse(m.group(1)!));
    }
    return ids.toList()..sort();
  }

  List<(int, String)> _findAllCourseIndices(String html) {
    final doc = html_parser.parse(html);
    final results = <(int, String)>[];
    final seen = <String>{};

    for (final el
        in doc.querySelectorAll('[id^="MainContent_gvCourseList_ibtnAssignments_"]')) {
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

  String? _text(dynamic doc, String sel) {
    final t = doc.querySelector(sel)?.text.trim();
    return (t != null && t.isNotEmpty && t != '-') ? t : null;
  }

  double? _marks(String text) {
    final c = text.replaceAll(',', '').trim();
    return (c.isEmpty || c == '-') ? null : double.tryParse(c);
  }

  AssignmentStatus _deriveStatus(String raw, DateTime? dueDate) {
    final s = raw.toLowerCase();
    if (s.contains('not submitted') || s.contains('not attempted')) {
      return AssignmentStatus.missed;
    }
    if (s.contains('result') || s.contains('graded')) {
      return AssignmentStatus.resultDeclared;
    }
    if (s.contains('submitted')) return AssignmentStatus.submitted;
    if (dueDate != null && dueDate.isBefore(DateTime.now())) {
      return AssignmentStatus.missed;
    }
    return AssignmentStatus.pending;
  }

  void invalidateCache() {
    _cache = null;
  }
}
