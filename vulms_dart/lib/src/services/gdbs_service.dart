import 'package:html/parser.dart' as html_parser;

import '../auth/session_manager.dart';
import '../models/gdb.dart';
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

class GdbsService {
  final SessionManager _session;
  final VulmsLogger _logger;
  static const _ttl = Duration(minutes: 15);
  static final _codeRe = RegExp(r'^([A-Z]{2,4}\d{3}[A-Z]?)');
  static final _idxRe = RegExp(r'_(\d+)$');

  _CacheEntry<List<Gdb>>? _cache;

  GdbsService({
    required SessionManager session,
    required VulmsLogger logger,
  })  : _session = session,
        _logger = logger.child('gdbs');

  Future<List<Gdb>> getAll({
    String? courseCode,
    bool forceRefresh = false,
  }) async {
    if (!forceRefresh && _cache != null) {
      if (DateTime.now().difference(_cache!.createdAt) < _ttl) {
        _logger.debug('[CACHE HIT] gdbs');
        final c = _cache!.data;
        if (courseCode != null) {
          return c.where((g) => g.courseCode == courseCode.toUpperCase()).toList();
        }
        return c;
      }
    }

    _session.ensureAuthenticated();
    final homeHtml = await _session.httpClient.get(path: VulmsUrls.home);
    final courseIndices = _findAllCourseIndices(homeHtml);
    _logger.info('Found ${courseIndices.length} courses');

    final all = <Gdb>[];
    final seen = <String>{};

    for (final entry in courseIndices) {
      final (index, code) = entry;
      if (courseCode != null && code != courseCode.toUpperCase()) continue;

      final eventTarget =
          'ctl00\$MainContent\$gvCourseList\$ctl${index.toString().padLeft(2, '0')}\$ibtnGDB';

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
      for (final g in parsed) {
        final key = Dedupe.gdbKey(g.courseCode, g.title, g.dueDate);
        if (!seen.contains(key)) {
          seen.add(key);
          all.add(g);
        }
      }
    }

    _cache = _CacheEntry(all);
    if (courseCode != null) {
      return all.where((g) => g.courseCode == courseCode.toUpperCase()).toList();
    }
    return all;
  }

  List<Gdb> _parsePage(String html, String courseCode) {
    final doc = html_parser.parse(html);
    final panelIds = _panelIndices(doc);
    if (panelIds.isNotEmpty) return _parseTiles(doc, panelIds, courseCode);
    return _tableFallback(doc, courseCode);
  }

  List<Gdb> _parseTiles(dynamic doc, List<int> indices, String courseCode) {
    final gdbs = <Gdb>[];
    for (final idx in indices) {
      final title = _text(doc, '#MainContent_gvTileRepeaterGDB_lblTitle_$idx');
      if (title == null || title.contains('GDB Title:') || title.contains('Title:')) continue;

      final totalMarks = _marks(_text(doc, '#MainContent_gvTileRepeaterGDB_Label9_$idx') ?? '');
      final dueDate = VulmsDateParser.tryParse(
          _text(doc, '#MainContent_gvTileRepeaterGDB_Label3_$idx'));
      final status = _text(doc, '#MainContent_gvTileRepeaterGDB_lblStatus_$idx') ?? '';
      final sub = _text(doc, '#MainContent_gvTileRepeaterGDB_lblSubmissionStatus_$idx') ?? '';

      gdbs.add(Gdb(
        courseCode: courseCode,
        courseTitle: '',
        title: title,
        dueDate: dueDate,
        totalMarks: totalMarks,
        status: _deriveStatus(status, sub),
      ));
    }
    return gdbs;
  }

  List<Gdb> _tableFallback(dynamic doc, String courseCode) {
    final result = <Gdb>[];
    for (final row in doc.querySelectorAll('table tr')) {
      final cells = row.querySelectorAll('td');
      if (cells.length < 2) continue;
      final title = cells[0].text.trim();
      if (title.isEmpty) continue;
      result.add(Gdb(
        courseCode: courseCode,
        courseTitle: '',
        title: title,
        dueDate: cells.length > 2 ? VulmsDateParser.tryParse(cells[2].text.trim()) : null,
        status: GdbStatus.pending,
      ));
    }
    return result;
  }

  List<int> _panelIndices(dynamic doc) {
    final ids = <int>{};
    for (final el in doc
        .querySelectorAll('[id^="MainContent_gvTileRepeaterGDB_pnl_"]')) {
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
        in doc.querySelectorAll('[id^="MainContent_gvCourseList_ibtnGDB_"]')) {
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

  GdbStatus _deriveStatus(String statusStr, String submissionStr) {
    final sub = submissionStr.toLowerCase();
    if (sub.contains('submitted') || sub.contains('attempted')) return GdbStatus.submitted;
    if (sub.contains('result declared') || sub.contains('graded')) {
      return GdbStatus.resultDeclared;
    }
    final s = statusStr.toLowerCase();
    if (s == 'closed' || s == 'expired') return GdbStatus.missed;
    return GdbStatus.pending;
  }

  void invalidateCache() {
    _cache = null;
  }
}
