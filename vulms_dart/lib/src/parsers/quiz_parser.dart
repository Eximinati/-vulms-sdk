import 'package:html/parser.dart' as html_parser;
import 'package:html/dom.dart';

import '../models/quiz.dart';
import '../utils/date_parser.dart';
import '../utils/logger.dart';

/// Parses quiz data from VULMS HTML pages.
///
/// Primary parser targets the tile repeater layout (`gvTileRepeaterQuiz_`
/// elements). Falls back to table-based parsing when tiles are absent.
class QuizParser {
  QuizParser._();

  static final _marksRegex = RegExp(r'(\d+(?:\.\d+)?)');
  static final _codeRegex = RegExp(r'([A-Z]{2,4}\d{3}[A-Z]?)', caseSensitive: false);
  static final _submitDateRegex = RegExp(r'Submit Date:\s*([^<]+)', caseSensitive: false);
  static final _tileIndexRegex = RegExp(r'_(\d+)$');

  /// Parse quizzes from [html].
  ///
  /// If [courseCode] is provided it overrides extraction from the page.
  static List<Quiz> parse(
    String html, {
    String? courseCode,
    VulmsLogger? logger,
  }) {
    logger?.debug('QuizParser: parsing HTML, length=${html.length}');

    final doc = html_parser.parse(html);
    final forcedCode = courseCode;

    final primary = _tryParseTileRepeater(doc, logger, forcedCode);
    if (primary.isNotEmpty) {
      logger?.info('QuizParser: ${primary.length} from tile repeater');
      return primary;
    }

    final fallback = _tryParseTable(doc, logger, forcedCode);
    if (fallback.isNotEmpty) {
      logger?.info('QuizParser: ${fallback.length} from table');
      return fallback;
    }

    logger?.warn('QuizParser: no quizzes found');
    return const [];
  }

  // ---------------------------------------------------------------------------
  // Tile repeater parser
  // ---------------------------------------------------------------------------

  static List<Quiz> _tryParseTileRepeater(
    Document doc,
    VulmsLogger? logger,
    String? forcedCourseCode,
  ) {
    final courseCode = forcedCourseCode ?? _extractCourseCode(doc);
    final quizzes = <Quiz>[];
    final seen = <String>{};
    var skipped = 0;

    final tileElements = doc.querySelectorAll('[id*="MainContent_gvTileRepeaterQuiz_"]');
    final tileIds = <int>{};

    for (final el in tileElements) {
      final id = el.attributes['id'] ?? '';
      final match = _tileIndexRegex.firstMatch(id);
      if (match != null) {
        tileIds.add(int.parse(match.group(1)!));
      }
    }

    logger?.debug('QuizParser: found ${tileIds.length} tile indices');

    if (tileIds.isEmpty) return const [];

    final sortedIndices = tileIds.toList()..sort();

    for (final idx in sortedIndices) {
      final titleEl =
          doc.querySelector('#MainContent_gvTileRepeaterQuiz_lblTitle_$idx');
      final title = (titleEl?.text ?? '').trim();
      if (title.isEmpty || title.contains('Quiz Title:')) {
        skipped++;
        logger?.debug('QuizParser: skipping idx=$idx — no title or helper label');
        continue;
      }

      final key = '$courseCode|$title|${_extractStartDateKey(doc, idx)}';
      if (seen.contains(key)) {
        logger?.debug('QuizParser: duplicate skipped idx=$idx: "$title"');
        skipped++;
        continue;
      }
      seen.add(key);

      final startDateStr =
          (doc.querySelector('#MainContent_gvTileRepeaterQuiz_lblStartDate_$idx')?.text ?? '').trim();
      final endDateStr =
          (doc.querySelector('#MainContent_gvTileRepeaterQuiz_lblEndDate_$idx')?.text ?? '').trim();
      final totalMarksStr =
          (doc.querySelector('#MainContent_gvTileRepeaterQuiz_lblTotalMarks_$idx')?.text ?? '').trim();
      final availabilityStr =
          (doc.querySelector('#MainContent_gvTileRepeaterQuiz_lblStatus_$idx')?.text ?? '').trim();
      final submissionEl =
          doc.querySelector('#MainContent_gvTileRepeaterQuiz_lblSubmitted_$idx');
      final submissionHtml = submissionEl?.innerHtml ?? '';
      final submissionStr = (submissionEl?.text ?? '').trim();
      final resultStr =
          (doc.querySelector('#MainContent_gvTileRepeaterQuiz_lblGetMarks_$idx')?.text ?? '').trim();

      final startDate = _parseDateSafe(startDateStr);
      final endDate = _parseDateSafe(endDateStr);
      final totalMarks = _parseMarks(totalMarksStr);

      final availabilityStatus = _normalizeAvailability(availabilityStr);
      final submission = _normalizeSubmissionWithDate(submissionStr, submissionHtml);
      final resultStatus = _normalizeResult(resultStr);
      final obtainedMarks =
          resultStatus == QuizResultStatus.declared ? _parseMarks(resultStr) : null;

      logger?.debug(
        'QuizParser: idx=$idx title="$title" avail=$availabilityStatus sub=${submission.status} result=$resultStatus',
      );

      quizzes.add(Quiz(
        courseCode: courseCode,
        courseTitle: '',
        title: title,
        startDate: startDate,
        endDate: endDate,
        totalMarks: totalMarks,
        obtainedMarks: obtainedMarks,
        availabilityStatus: availabilityStatus,
        submissionStatus: submission.status,
        resultStatus: resultStatus,
        submitDate: submission.submitDate,
      ));
    }

    logger?.info(
      'QuizParser: extracted ${quizzes.length}, skipped $skipped, total rows ${sortedIndices.length}',
    );
    return quizzes;
  }

  // ---------------------------------------------------------------------------
  // Table fallback parser
  // ---------------------------------------------------------------------------

  static List<Quiz> _tryParseTable(
    Document doc,
    VulmsLogger? logger,
    String? forcedCourseCode,
  ) {
    final courseCode = forcedCourseCode ?? _extractCourseCode(doc);
    final quizzes = <Quiz>[];
    final seen = <String>{};
    var skipped = 0;

    final tables = doc.querySelectorAll('table');
    if (tables.isEmpty) return const [];

    var headerCourse = '';

    for (final table in tables) {
      final rows = table.querySelectorAll('tr');
      for (final row in rows) {
        // Header row – try to extract course code
        if (row.querySelectorAll('th').isNotEmpty) {
          final code = _extractCodeFromText(row.text.trim());
          if (code != null) headerCourse = code;
          continue;
        }

        final tds = row.querySelectorAll('td');
        if (tds.length < 2) continue;

        final cells = tds.map((td) => td.text.trim()).toList();

        final title = cells[0];
        if (title.isEmpty || title.contains('Quiz Title:')) {
          skipped++;
          continue;
        }

        final code = headerCourse.isNotEmpty ? headerCourse : courseCode;
        final key = '$code|$title';
        if (seen.contains(key)) {
          skipped++;
          continue;
        }
        seen.add(key);

        final startDateStr = cells.length > 1 ? cells[1] : '';
        final endDateStr = cells.length > 2 ? cells[2] : '';
        final totalMarksStr = cells.length > 3 ? cells[3] : '';

        quizzes.add(Quiz(
          courseCode: code,
          courseTitle: '',
          title: title,
          startDate: _parseDateSafe(startDateStr),
          endDate: _parseDateSafe(endDateStr),
          totalMarks: _parseMarks(totalMarksStr),
          availabilityStatus: QuizAvailabilityStatus.unknown,
          submissionStatus: QuizSubmissionStatus.unknown,
          resultStatus: QuizResultStatus.unknown,
        ));
      }
    }

    logger?.info('QuizParser: table fallback extracted ${quizzes.length} (skipped $skipped)');
    return quizzes;
  }

  // ---------------------------------------------------------------------------
  // Course code extraction
  // ---------------------------------------------------------------------------

  static String _extractCourseCode(Document doc) {
    // Try h3.m-subheader__title first
    final subheader = doc.querySelector('h3.m-subheader__title');
    if (subheader != null) {
      final match = _codeRegex.firstMatch(subheader.text);
      if (match != null) return match.group(1)!.toUpperCase();
    }

    // Fallback to <title>
    final titleEl = doc.querySelector('title');
    if (titleEl != null) {
      final match = _codeRegex.firstMatch(titleEl.text);
      if (match != null) return match.group(1)!.toUpperCase();
    }

    return '';
  }

  // ---------------------------------------------------------------------------
  // Normalizers
  // ---------------------------------------------------------------------------

  static QuizAvailabilityStatus _normalizeAvailability(String text) {
    final lower = text.toLowerCase().trim();
    if (lower == 'open') return QuizAvailabilityStatus.open;
    if (lower == 'closed') return QuizAvailabilityStatus.closed;
    if (lower.isEmpty || lower == '-' || lower == 'upcoming') {
      return QuizAvailabilityStatus.upcoming;
    }
    return QuizAvailabilityStatus.unknown;
  }

  static _SubmissionResult _normalizeSubmissionWithDate(String text, String html) {
    final lower = text.toLowerCase().trim();
    var status = QuizSubmissionStatus.notSubmitted;
    DateTime? submitDate;

    if (lower == 'not submitted' || lower == 'not attempted') {
      status = QuizSubmissionStatus.notSubmitted;
    } else if (lower.contains('result declared')) {
      status = QuizSubmissionStatus.submitted;
      submitDate = _extractSubmitDate(html);
    } else if (lower == 'submitted' || lower == 'attempted') {
      status = QuizSubmissionStatus.submitted;
      submitDate = _extractSubmitDate(html);
    } else if (lower.contains('submitted') || lower.contains('attempted')) {
      status = QuizSubmissionStatus.submitted;
      submitDate = _extractSubmitDate(html);
    } else if (lower == '-' || lower.isEmpty) {
      status = QuizSubmissionStatus.notSubmitted;
    } else {
      status = QuizSubmissionStatus.unknown;
    }

    return _SubmissionResult(status: status, submitDate: submitDate);
  }

  static QuizResultStatus _normalizeResult(String text) {
    final lower = text.toLowerCase().trim();
    if (lower.isNotEmpty && lower != '-' && lower != 'pending') {
      return QuizResultStatus.declared;
    }
    return QuizResultStatus.pending;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  static DateTime? _extractSubmitDate(String html) {
    final match = _submitDateRegex.firstMatch(html);
    if (match == null) return null;
    final dateStr = match.group(1)!.trim();
    return VulmsDateParser.tryParse(dateStr);
  }

  static DateTime? _parseDateSafe(String text) {
    final trimmed = text.trim();
    if (trimmed.isEmpty || trimmed == '-') return null;
    return VulmsDateParser.tryParse(trimmed);
  }

  static double? _parseMarks(String text) {
    final match = _marksRegex.firstMatch(text.trim());
    return match != null ? double.tryParse(match.group(1)!) : null;
  }

  static String? _extractCodeFromText(String text) {
    final match = _codeRegex.firstMatch(text);
    return match?.group(1)?.toUpperCase();
  }

  /// Extract the raw start date text for deduplication key building.
  static String _extractStartDateKey(Document doc, int idx) {
    final el = doc.querySelector('#MainContent_gvTileRepeaterQuiz_lblStartDate_$idx');
    return (el?.text ?? '').trim();
  }
}

/// Internal holder for submission normalization results.
class _SubmissionResult {
  final QuizSubmissionStatus status;
  final DateTime? submitDate;

  const _SubmissionResult({required this.status, this.submitDate});
}
