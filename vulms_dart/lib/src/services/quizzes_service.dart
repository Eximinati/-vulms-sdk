import 'package:html/parser.dart' as html_parser;

import '../auth/session_manager.dart';
import '../models/quiz.dart';
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

class QuizzesService {
  final SessionManager _session;
  final VulmsLogger _logger;
  static const _ttl = Duration(minutes: 15);
  static final _codeRe = RegExp(r'^([A-Z]{2,4}\d{3}[A-Z]?)');
  static final _idxRe = RegExp(r'_(\d+)$');

  _CacheEntry<List<Quiz>>? _cache;

  QuizzesService({
    required SessionManager session,
    required VulmsLogger logger,
  })  : _session = session,
        _logger = logger.child('quizzes');

  Future<List<Quiz>> getAll({
    String? courseCode,
    bool forceRefresh = false,
  }) async {
    if (!forceRefresh && _cache != null) {
      if (DateTime.now().difference(_cache!.createdAt) < _ttl) {
        _logger.debug('[CACHE HIT] quizzes');
        final c = _cache!.data;
        if (courseCode != null) {
          return c.where((q) => q.courseCode == courseCode.toUpperCase()).toList();
        }
        return c;
      }
    }

    _session.ensureAuthenticated();
    final homeHtml = await _session.httpClient.get(path: VulmsUrls.home);
    final courseIndices = _findAllCourseIndices(homeHtml);
    _logger.info('Found ${courseIndices.length} courses');

    final all = <Quiz>[];
    final seen = <String>{};

    for (final entry in courseIndices) {
      final (index, code) = entry;
      if (courseCode != null && code != courseCode.toUpperCase()) continue;

      final eventTarget =
          'ctl00\$MainContent\$gvCourseList\$ctl${index.toString().padLeft(2, '0')}\$ibtnQuizzes';

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
      for (final q in parsed) {
        final key = Dedupe.quizKey(q.courseCode, q.title, q.startDate);
        if (!seen.contains(key)) {
          seen.add(key);
          all.add(q);
        }
      }
    }

    _cache = _CacheEntry(all);
    if (courseCode != null) {
      return all.where((q) => q.courseCode == courseCode.toUpperCase()).toList();
    }
    return all;
  }

  List<Quiz> _parsePage(String html, String courseCode) {
    final doc = html_parser.parse(html);
    final quizzes = <Quiz>[];
    final indices = _tileIndices(doc);

    if (indices.isEmpty) return _tableFallback(doc, courseCode);

    for (final idx in indices) {
      final title = _text(doc, '#MainContent_gvTileRepeaterQuiz_lblTitle_$idx');
      if (title == null || title.contains('Quiz Title:')) continue;

      final startDate = VulmsDateParser.tryParse(
          _text(doc, '#MainContent_gvTileRepeaterQuiz_lblStartDate_$idx'));
      final endDate = VulmsDateParser.tryParse(
          _text(doc, '#MainContent_gvTileRepeaterQuiz_lblEndDate_$idx'));
      final totalMarks = _marks(
          _text(doc, '#MainContent_gvTileRepeaterQuiz_lblTotalMarks_$idx') ?? '');
      final avail = _normAvail(_text(doc, '#MainContent_gvTileRepeaterQuiz_lblStatus_$idx'));
      final subText = (_text(doc, '#MainContent_gvTileRepeaterQuiz_lblSubmitted_$idx') ?? '').toLowerCase();
      final resultStr = _text(doc, '#MainContent_gvTileRepeaterQuiz_lblGetMarks_$idx') ?? '';

      final subStatus = _normSubmission(subText);
      final resStatus = _normResult(resultStr);

      quizzes.add(Quiz(
        courseCode: courseCode,
        courseTitle: '',
        title: title,
        startDate: startDate,
        endDate: endDate,
        totalMarks: totalMarks,
        obtainedMarks: resStatus == QuizResultStatus.declared ? _marks(resultStr) : null,
        availabilityStatus: avail,
        submissionStatus: subStatus,
        resultStatus: resStatus,
      ));
    }
    return quizzes;
  }

  List<Quiz> _tableFallback(dynamic doc, String courseCode) {
    final result = <Quiz>[];
    for (final row in doc.querySelectorAll('table tr')) {
      final cells = row.querySelectorAll('td');
      if (cells.length < 2) continue;
      final title = cells[0].text.trim();
      if (title.isEmpty || title.contains('Quiz Title:')) continue;
      result.add(Quiz(
        courseCode: courseCode,
        courseTitle: '',
        title: title,
        startDate: VulmsDateParser.tryParse(cells[1].text.trim()),
        endDate: cells.length > 2 ? VulmsDateParser.tryParse(cells[2].text.trim()) : null,
        totalMarks: cells.length > 3 ? _marks(cells[3].text.trim()) : null,
        availabilityStatus: QuizAvailabilityStatus.unknown,
        submissionStatus: QuizSubmissionStatus.unknown,
        resultStatus: QuizResultStatus.unknown,
      ));
    }
    return result;
  }

  List<int> _tileIndices(dynamic doc) {
    final ids = <int>{};
    for (final el in doc
        .querySelectorAll('[id^="MainContent_gvTileRepeaterQuiz_lblTitle_"]')) {
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
        in doc.querySelectorAll('[id^="MainContent_gvCourseList_ibtnQuizzes_"]')) {
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

  QuizAvailabilityStatus _normAvail(String? text) {
    final l = (text ?? '').toLowerCase();
    if (l == 'open') return QuizAvailabilityStatus.open;
    if (l == 'closed') return QuizAvailabilityStatus.closed;
    if (l.isEmpty || l == '-') return QuizAvailabilityStatus.upcoming;
    return QuizAvailabilityStatus.unknown;
  }

  QuizSubmissionStatus _normSubmission(String text) {
    if (text.contains('submitted') || text.contains('attempted')) {
      return QuizSubmissionStatus.submitted;
    }
    return QuizSubmissionStatus.notSubmitted;
  }

  QuizResultStatus _normResult(String text) {
    final c = text.trim();
    return (c.isNotEmpty && c != '-' && c != 'pending')
        ? QuizResultStatus.declared
        : QuizResultStatus.pending;
  }

  void invalidateCache() {
    _cache = null;
  }
}
