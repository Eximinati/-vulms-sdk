import 'package:html/dom.dart';
import 'package:html/parser.dart' as html_parser;

import '../models/assignment.dart';
import '../utils/date_parser.dart';
import '../utils/logger.dart';

/// Layout variants for the VULMS assignment page tile repeater.
enum _AssignmentLayout {
  standard,
  practical,
  legacy,
  unknown,
}

/// CSS selector suffixes for each field, keyed by layout.
class _AssignmentContract {
  const _AssignmentContract({
    required this.titleLabel,
    required this.lessonLabel,
    required this.dueDateLabel,
    required this.totalMarksLabel,
    required this.submitStatusLabel,
    required this.submitDateLabel,
    required this.fileSizeLabel,
    required this.obtainedMarksLabel,
    required this.skipLabels,
  });

  final String titleLabel;
  final String lessonLabel;
  final String dueDateLabel;
  final String totalMarksLabel;
  final String submitStatusLabel;
  final String submitDateLabel;
  final String fileSizeLabel;
  final String obtainedMarksLabel;
  final List<String> skipLabels;
}

const _repeaterId = 'MainContent_gvTileRepeaterAssignment';

const _contracts = <_AssignmentLayout, _AssignmentContract>{
  _AssignmentLayout.standard: _AssignmentContract(
    titleLabel: '_Label3_',
    lessonLabel: '_lblPayableAmount_',
    dueDateLabel: '_lblDueDate_',
    totalMarksLabel: '_lblTotalMarks_',
    submitStatusLabel: '_lblsubmitted_',
    submitDateLabel: '_lblSubmitDate_',
    fileSizeLabel: '_lblFilesize_',
    obtainedMarksLabel: '_lblObtainedMarks_',
    skipLabels: ['Title:', 'Lesson:', 'Due Date:', 'Total Marks:', 'Submit:', 'Result:', 'Discuss:', 'Assignment:'],
  ),
  _AssignmentLayout.practical: _AssignmentContract(
    titleLabel: '_Label3_',
    lessonLabel: '_lblPayableAmount_',
    dueDateLabel: '_lblDueDate_',
    totalMarksLabel: '_lblTotalMarks_',
    submitStatusLabel: '_lblsubmitted_',
    submitDateLabel: '_lblSubmitDate_',
    fileSizeLabel: '_lblFilesize_',
    obtainedMarksLabel: '_lblObtainedMarks_',
    skipLabels: ['Title:', 'Lesson:', 'Due Date:', 'Total Marks:', 'Submit:', 'Result:', 'Discuss:', 'Assignment:'],
  ),
  _AssignmentLayout.legacy: _AssignmentContract(
    titleLabel: '_lblTitle_',
    lessonLabel: '_lblLesson_',
    dueDateLabel: '_lblDueDate_',
    totalMarksLabel: '_lblTotalMarks_',
    submitStatusLabel: '_lblStatus_',
    submitDateLabel: '_lblSubmitDate_',
    fileSizeLabel: '_lblFileSize_',
    obtainedMarksLabel: '_lblObtainedMarks_',
    skipLabels: ['Title:', 'Lesson:', 'Due Date:', 'Total Marks:', 'Status:', 'Submitted:', 'Result:'],
  ),
  _AssignmentLayout.unknown: _AssignmentContract(
    titleLabel: '_Label3_',
    lessonLabel: '_lblPayableAmount_',
    dueDateLabel: '_lblDueDate_',
    totalMarksLabel: '_lblTotalMarks_',
    submitStatusLabel: '_lblsubmitted_',
    submitDateLabel: '_lblSubmitDate_',
    fileSizeLabel: '_lblFilesize_',
    obtainedMarksLabel: '_lblObtainedMarks_',
    skipLabels: ['Title:', 'Lesson:', 'Due Date:', 'Total Marks:', 'Submit:', 'Result:', 'Discuss:'],
  ),
};

/// Parses assignment data from VULMS HTML pages.
///
/// Extracts assignment tiles from the standard, practical, legacy, or unknown
/// layouts using contract-based selectors. Falls back to table parsing when no
/// tile elements are found.
class AssignmentParser {
  AssignmentParser._();

  /// Parse assignments from raw HTML.
  ///
  /// [html] is the full HTML of the VULMS assignment page.
  /// [courseCode] overrides automatic course code detection when provided.
  static List<Assignment> parse(
    String html, {
    String? courseCode,
    VulmsLogger? logger,
  }) {
    final doc = html_parser.parse(html);
    final log = logger;

    log?.debug('parseAssignments: HTML length=${html.length}');

    final layout = _detectLayout(doc);
    log?.debug('parseAssignments: layout="${layout.name}"');

    final contract = _contracts[layout]!;
    final code = courseCode ?? _extractCourseCode(doc);

    return _parseWithContract(doc, log, contract, code, layout);
  }

  // ---------------------------------------------------------------------------
  // Layout detection
  // ---------------------------------------------------------------------------

  static _AssignmentLayout _detectLayout(Document doc) {
    if (_hasId(doc, '${_repeaterId}_Label3_')) {
      return _AssignmentLayout.standard;
    }
    if (_hasId(doc, '${_repeaterId}_Label1_')) {
      return _AssignmentLayout.practical;
    }
    if (_hasId(doc, '${_repeaterId}_lblTitle_')) {
      return _AssignmentLayout.legacy;
    }
    if (_hasId(doc, _repeaterId)) {
      return _AssignmentLayout.unknown;
    }
    return _AssignmentLayout.unknown;
  }

  /// Check whether any element has an ID containing [idSubstring].
  static bool _hasId(Document doc, String idSubstring) {
    return doc.querySelector('[id*="$idSubstring"]') != null;
  }

  // ---------------------------------------------------------------------------
  // Contract-based tile parsing
  // ---------------------------------------------------------------------------

  static List<Assignment> _parseWithContract(
    Document doc,
    VulmsLogger? log,
    _AssignmentContract contract,
    String courseCode,
    _AssignmentLayout layout,
  ) {
    final titleSelector =
        '[id*="$_repeaterId${contract.titleLabel}"]';
    final titleElements = doc.querySelectorAll(titleSelector);

    log?.debug(
      'parseWithContract: ${titleElements.length} title elements '
      '(layout=${layout.name})',
    );

    // Collect unique repeater indices from title element IDs.
    final indexPattern = RegExp(r'_(\d+)$');
    final sortedIndices = <int>{};
    for (final el in titleElements) {
      final id = el.id;
      final match = indexPattern.firstMatch(id);
      if (match != null) {
        sortedIndices.add(int.parse(match.group(1)!));
      }
    }

    if (sortedIndices.isEmpty) {
      log?.debug(
        'parseWithContract: no tiles found, falling back to table parser',
      );
      return _tryParseTable(doc, log, courseCode, layout);
    }

    final indices = sortedIndices.toList()..sort();
    final assignments = <Assignment>[];
    final seen = <String>{};

    for (final idx in indices) {
      final title = _textFor(doc, contract.titleLabel, idx).trim();
      if (title.isEmpty || contract.skipLabels.contains(title)) {
        log?.debug('  skipping idx=$idx — title="$title"');
        continue;
      }

      final key = '$courseCode|$title';
      if (seen.contains(key)) {
        log?.debug('  duplicate skipped idx=$idx: "$title"');
        continue;
      }
      seen.add(key);

      final lesson = _textFor(doc, contract.lessonLabel, idx);
      final dueDateStr = _textFor(doc, contract.dueDateLabel, idx);
      final dueDate = _parseDateOrNull(dueDateStr);
      final totalMarks = _parseMarks(_textFor(doc, contract.totalMarksLabel, idx));
      final rawStatus = _textFor(doc, contract.submitStatusLabel, idx);
      final submitDateStr = _textFor(doc, contract.submitDateLabel, idx);
      final submitDate = _parseDateOrNull(submitDateStr);
      final fileSize = _textFor(doc, contract.fileSizeLabel, idx);
      final obtainedMarks = _parseMarks(_textFor(doc, contract.obtainedMarksLabel, idx));

      final status = _deriveStatus(
        rawStatus: rawStatus,
        submittedAt: submitDate,
        dueDate: dueDate,
      );

      log?.debug(
        '  idx=$idx title="$title" status=${status.name} '
        'raw="$rawStatus" due="$dueDateStr" submitted="$submitDateStr"',
      );

      assignments.add(Assignment(
        courseCode: courseCode,
        courseTitle: '',
        title: title,
        lesson: lesson.isEmpty ? null : lesson,
        dueDate: dueDate,
        totalMarks: totalMarks,
        status: status,
        submitDate: submitDate,
        fileSize: fileSize.isEmpty ? null : fileSize,
        obtainedMarks: obtainedMarks,
      ));
    }

    log?.info(
      'parseWithContract: extracted ${assignments.length} assignments '
      '(layout=${layout.name}, total rows=${indices.length})',
    );
    return assignments;
  }

  /// Get trimmed text of an element identified by [suffix] and [index].
  static String _textFor(Document doc, String suffix, int index) {
    final id = '$_repeaterId$suffix$index';
    final el = doc.getElementById(id);
    return el?.text.trim() ?? '';
  }

  // ---------------------------------------------------------------------------
  // Table fallback
  // ---------------------------------------------------------------------------

  static List<Assignment> _tryParseTable(
    Document doc,
    VulmsLogger? log,
    String courseCode,
    _AssignmentLayout layout,
  ) {
    final tables = doc.querySelectorAll('table');
    if (tables.isEmpty) {
      log?.debug('tryParseTable: no tables found');
      return [];
    }

    final assignments = <Assignment>[];
    var headerCourse = courseCode;

    for (final table in tables) {
      final rows = table.querySelectorAll('tr');
      for (final row in rows) {
        final thElements = row.querySelectorAll('th');
        if (thElements.isNotEmpty) {
          // Header row — try to extract course code from header text.
          final headerCode = _extractCourseCodeFromText(row.text);
          if (headerCode != null) headerCourse = headerCode;
          continue;
        }

        final cells = row.querySelectorAll('td');
        if (cells.length < 2) continue;

        final cellTexts = cells.map((c) => c.text.trim()).toList();
        final title = cellTexts[0];
        if (title.isEmpty || title.contains('Title:')) continue;

        final dueDateStr = cellTexts.length > 1 ? cellTexts[1] : '';
        final dueDate = _parseDateOrNull(dueDateStr);
        final totalMarks = cellTexts.length > 2
            ? _parseMarks(cellTexts[2])
            : null;
        final rawStatus = cellTexts.length > 3 ? cellTexts[3] : '';
        final status = _deriveStatus(rawStatus: rawStatus, dueDate: dueDate);

        assignments.add(Assignment(
          courseCode: headerCourse,
          courseTitle: '',
          title: title,
          dueDate: dueDate,
          totalMarks: totalMarks,
          status: status,
        ));
      }
    }

    log?.info('tryParseTable: extracted ${assignments.length} assignments');
    return assignments;
  }

  // ---------------------------------------------------------------------------
  // Status derivation
  // ---------------------------------------------------------------------------

  static AssignmentStatus _deriveStatus({
    required String rawStatus,
    DateTime? submittedAt,
    DateTime? dueDate,
  }) {
    final raw = rawStatus.toLowerCase().trim();

    if (raw.contains('not submitted')) return AssignmentStatus.missed;
    if (raw.contains('not attempted')) return AssignmentStatus.missed;
    if (raw.contains('result')) return AssignmentStatus.resultDeclared;
    if (raw.contains('graded')) return AssignmentStatus.resultDeclared;
    if (raw.contains('checked')) return AssignmentStatus.resultDeclared;
    if (raw.contains('missed')) return AssignmentStatus.missed;
    if (raw.contains('expired')) return AssignmentStatus.missed;
    if (raw.contains('submitted')) return AssignmentStatus.submitted;

    if (submittedAt != null) {
      return AssignmentStatus.submitted;
    }

    if (dueDate != null) {
      if (dueDate.isBefore(DateTime.now())) return AssignmentStatus.missed;
      return AssignmentStatus.pending;
    }

    return AssignmentStatus.pending;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /// Parse a marks string (e.g. "15.0", "1,500") into a [double], or null.
  static double? _parseMarks(String text) {
    final cleaned = text.replaceAll(',', '').trim();
    if (cleaned.isEmpty || cleaned == '-') return null;
    final value = double.tryParse(cleaned);
    return value?.isNaN == true ? null : value;
  }

  /// Parse a date string via [VulmsDateParser], returning null on failure or
  /// when the string is a dash placeholder.
  static DateTime? _parseDateOrNull(String text) {
    final trimmed = text.trim();
    if (trimmed.isEmpty || trimmed == '-') return null;
    return VulmsDateParser.tryParse(trimmed);
  }

  /// Extract a course code from the page's sub-header or title element.
  static String _extractCourseCode(Document doc) {
    final codePattern = RegExp(r'([A-Z]{2,4}\d{3}[A-Z]?)', caseSensitive: false);

    final subheader = doc.querySelector('h3.m-subheader__title');
    if (subheader != null) {
      final match = codePattern.firstMatch(subheader.text);
      if (match != null) return match.group(1)!.toUpperCase();
    }

    final title = doc.querySelector('title');
    if (title != null) {
      final match = codePattern.firstMatch(title.text);
      if (match != null) return match.group(1)!.toUpperCase();
    }

    return '';
  }

  /// Extract a course code from arbitrary text (e.g. a table header).
  static String? _extractCourseCodeFromText(String text) {
    final match = RegExp(r'([A-Z]{2,4}\d{3}[A-Z]?)', caseSensitive: false)
        .firstMatch(text);
    return match?.group(1)?.toUpperCase();
  }
}
