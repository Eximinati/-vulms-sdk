import 'package:html/dom.dart';
import 'package:html/parser.dart' as html_parser;

import '../models/grade.dart';
import '../utils/date_parser.dart';
import '../utils/logger.dart';

/// Parses grade data from VULMS Grade Book HTML.
///
/// Handles per-course tables and aggregate grade views from
/// `/GradeBook/GradeBook.aspx`.
class GradeParser {
  GradeParser._();

  /// Parse grade entries from the Grade Book page HTML.
  static List<Grade> parse(
    String html, {
    VulmsLogger? logger,
  }) {
    final doc = html_parser.parse(html);
    final grades = <Grade>[];

    logger?.debug('GradeParser.parse: HTML length=${html.length}');

    // Try structured tables first (most common layout)
    _parseGradeTables(doc, grades, logger);

    // Fallback: list-style layouts
    if (grades.isEmpty) {
      _parseListLayout(doc, grades, logger);
    }

    logger?.info('GradeParser.parse: ${grades.length} grade entries found');
    return grades;
  }

  /// Parse grades from `<table>` elements.
  ///
  /// VULMS typically renders grades in one of these table structures:
  /// - Columns: Course | Assignment/Quiz | Title | Marks | Obtained | Date
  /// - Columns: Course | Title | Type | Total | Obtained | Percentage | Grade
  static void _parseGradeTables(
    Document doc,
    List<Grade> grades,
    VulmsLogger? logger,
  ) {
    final tables = doc.querySelectorAll('table');
    for (final table in tables) {
      final headerRow = table.querySelector('tr');
      if (headerRow == null) continue;

      final headers = _normalizeHeaders(headerRow);
      if (!_looksLikeGradeTable(headers)) continue;

      final mapping = _buildColumnMapping(headers);
      if (mapping == null) continue;

      // Walk data rows (skip the header row)
      final rows = table.querySelectorAll('tr');
      var currentCourseCode = '';
      var currentCourseTitle = '';

      for (var i = 1; i < rows.length; i++) {
        final cells = rows[i].querySelectorAll('td');
        if (cells.isEmpty) continue;

        final texts = cells.map((c) => c.text.trim()).toList();

        // Detect per-course sub-header rows (often contain course code + title)
        final subHeader = _detectSubHeader(texts);
        if (subHeader != null) {
          currentCourseCode = subHeader.$1 ?? currentCourseCode;
          currentCourseTitle = subHeader.$2 ?? currentCourseTitle;
          continue;
        }

        final grade = _buildGradeFromRow(
          texts,
          mapping,
          currentCourseCode,
          currentCourseTitle,
        );
        if (grade != null) {
          grades.add(grade);
          logger?.trace(
            '  Table grade: ${grade.courseCode} - ${grade.title}',
          );
        }
      }
    }

    if (grades.isNotEmpty) {
      logger?.debug('  Parsed ${grades.length} grades from tables');
    }
  }

  /// Parse grades from list/card layouts (divs, dl/dd, etc.).
  static void _parseListLayout(
    Document doc,
    List<Grade> grades,
    VulmsLogger? logger,
  ) {
    final items = doc.querySelectorAll(
      '.grade-item, .grade-row, .grade-entry, '
      '[class*="GradeItem"], [class*="gradeitem"], '
      'div[class*="grade-row"], dl.grade-list dd',
    );

    for (final item in items) {
      final fullText = item.text;
      final courseCode = _extractCourseCode(fullText);
      final courseTitle = _extractCourseTitle(item);

      final title = _cleanText(item.querySelector(
        '.grade-title, .title, .name, h4, h5, strong',
      )?.text);

      final typeText = _cleanText(item.querySelector(
        '.grade-type, .type, .activity-type',
      )?.text);

      final totalText = _cleanText(item.querySelector(
        '.total-marks, .total, [class*="total"]',
      )?.text);

      final obtainedText = _cleanText(item.querySelector(
        '.obtained-marks, .obtained, .marks, [class*="obtained"]',
      )?.text);

      final pctText = _cleanText(item.querySelector(
        '.percentage, .pct, [class*="percent"]',
      )?.text);

      final gradeText = _cleanText(item.querySelector(
        '.letter-grade, .grade, [class*="letterGrade"]',
      )?.text);

      final dateText = _cleanText(item.querySelector(
        '.date-posted, .date, time, [class*="date"]',
      )?.text);

      if (title == null || title.isEmpty) continue;

      grades.add(Grade(
        courseCode: courseCode ?? 'UNKNOWN',
        courseTitle: courseTitle ?? '',
        title: title,
        type: typeText,
        totalMarks: _parseDouble(totalText),
        obtainedMarks: _parseDouble(obtainedText),
        percentage: pctText,
        letterGrade: gradeText,
        datePosted: dateText != null ? VulmsDateParser.tryParse(dateText) : null,
      ));
    }

    if (grades.isNotEmpty) {
      logger?.debug('  Parsed ${grades.length} grades from list layout');
    }
  }

  // ---------------------------------------------------------------------------
  // Table header parsing
  // ---------------------------------------------------------------------------

  /// Normalize header cell text to lowercase kebab-case identifiers.
  static List<String> _normalizeHeaders(Element headerRow) {
    final cells = headerRow.querySelectorAll('th, td');
    return cells.map((c) {
      var text = c.text.trim().toLowerCase();
      // Collapse whitespace
      text = text.replaceAll(RegExp(r'\s+'), ' ');
      return text;
    }).toList();
  }

  /// Heuristic check whether a table looks like a grade table.
  static bool _looksLikeGradeTable(List<String> headers) {
    final joined = headers.join(' ');
    final hasMarks = joined.contains('mark') || joined.contains('score');
    final hasGrade = joined.contains('grade');
    final hasCourse = joined.contains('course') || joined.contains('code');
    final hasTitle = joined.contains('title') || joined.contains('name') ||
        joined.contains('assignment') || joined.contains('quiz');
    return (hasMarks || hasGrade) && (hasCourse || hasTitle);
  }

  /// Build a column index mapping from normalized headers.
  ///
  /// Returns null if essential columns (title) are missing.
  static _ColumnMapping? _buildColumnMapping(List<String> headers) {
    int? courseCodeIdx;
    int? courseTitleIdx;
    int? titleIdx;
    int? typeIdx;
    int? totalIdx;
    int? obtainedIdx;
    int? pctIdx;
    int? letterIdx;
    int? dateIdx;

    for (var i = 0; i < headers.length; i++) {
      final h = headers[i];

      if (courseCodeIdx == null && _matchCol(h, const ['course code', 'code', 'course code'])) {
        courseCodeIdx = i;
      } else if (courseTitleIdx == null && _matchCol(h, const ['course title', 'course name'])) {
        courseTitleIdx = i;
      } else if (titleIdx == null && _matchCol(h, const ['title', 'name', 'activity', 'assignment', 'quiz', 'description'])) {
        titleIdx = i;
      } else if (typeIdx == null && _matchCol(h, const ['type', 'activity type', 'kind'])) {
        typeIdx = i;
      } else if (totalIdx == null && _matchCol(h, const ['total', 'total marks', 'full marks', 'max'])) {
        totalIdx = i;
      } else if (obtainedIdx == null && _matchCol(h, const ['obtained', 'marks', 'score', 'obtained marks', 'marks obtained'])) {
        obtainedIdx = i;
      } else if (pctIdx == null && _matchCol(h, const ['percentage', '%', 'pct'])) {
        pctIdx = i;
      } else if (letterIdx == null && _matchCol(h, const ['grade', 'letter', 'letter grade', 'gpa'])) {
        letterIdx = i;
      } else if (dateIdx == null && _matchCol(h, const ['date', 'date posted', 'posted', 'submitted on'])) {
        dateIdx = i;
      }
    }

    // Title is required
    if (titleIdx == null) return null;

    return _ColumnMapping(
      courseCodeIdx: courseCodeIdx,
      courseTitleIdx: courseTitleIdx,
      titleIdx: titleIdx,
      typeIdx: typeIdx,
      totalMarksIdx: totalIdx,
      obtainedMarksIdx: obtainedIdx,
      percentageIdx: pctIdx,
      letterGradeIdx: letterIdx,
      datePostedIdx: dateIdx,
    );
  }

  /// Check if a header string matches any of the candidates.
  static bool _matchCol(String header, List<String> candidates) {
    for (final c in candidates) {
      if (header.contains(c)) return true;
    }
    return false;
  }

  /// Detect sub-header rows that introduce a new course section.
  ///
  /// Returns `(courseCode, courseTitle)` if detected, null otherwise.
  static (String?, String?)? _detectSubHeader(List<String> texts) {
    if (texts.length > 3) return null; // sub-headers are usually short
    final joined = texts.join(' ').trim();
    final code = _extractCourseCode(joined);
    if (code == null) return null;
    // The rest of the joined text (minus the code) is the course title
    final title = joined
        .replaceFirst(RegExp(r'[A-Z]{2,4}\d{3}[A-Z]?'), '')
        .trim();
    return (code, title.isNotEmpty ? title : null);
  }

  // ---------------------------------------------------------------------------
  // Row → Grade construction
  // ---------------------------------------------------------------------------

  /// Build a [Grade] from a table row's cell texts using a column mapping.
  static Grade? _buildGradeFromRow(
    List<String> texts,
    _ColumnMapping mapping,
    String currentCourseCode,
    String currentCourseTitle,
  ) {
    final courseCode = _safeGet(texts, mapping.courseCodeIdx) ?? currentCourseCode;
    final courseTitle = _safeGet(texts, mapping.courseTitleIdx) ?? currentCourseTitle;
    final title = _safeGet(texts, mapping.titleIdx);

    if (title == null || title.isEmpty) return null;

    final type = _safeGet(texts, mapping.typeIdx);
    final totalMarks = _parseDouble(_safeGet(texts, mapping.totalMarksIdx));
    final obtainedMarks = _parseDouble(_safeGet(texts, mapping.obtainedMarksIdx));
    final percentage = _safeGet(texts, mapping.percentageIdx);
    final letterGrade = _safeGet(texts, mapping.letterGradeIdx);
    final dateText = _safeGet(texts, mapping.datePostedIdx);

    return Grade(
      courseCode: courseCode.isEmpty ? 'UNKNOWN' : courseCode,
      courseTitle: courseTitle,
      title: title,
      type: type,
      totalMarks: totalMarks,
      obtainedMarks: obtainedMarks,
      percentage: percentage,
      letterGrade: letterGrade,
      datePosted: dateText != null ? VulmsDateParser.tryParse(dateText) : null,
    );
  }

  // ---------------------------------------------------------------------------
  // Text extraction helpers
  // ---------------------------------------------------------------------------

  /// Safely get a list element by index, returning null for out-of-bounds.
  static String? _safeGet(List<String> list, int? index) {
    if (index == null || index < 0 || index >= list.length) return null;
    final text = list[index].trim();
    return text.isEmpty ? null : text;
  }

  /// Extract a VULMS course code from text.
  static String? _extractCourseCode(String text) {
    final match = RegExp(r'\b([A-Z]{2,4}\d{3}[A-Z]?)\b').firstMatch(text);
    return match?.group(1);
  }

  /// Try to extract a course title from an element or its parent context.
  static String? _extractCourseTitle(Element el) {
    // Look for sibling or parent heading
    final parent = el.parent;
    if (parent != null) {
      final heading = parent.querySelector('h3, h4, h5, .course-title, .courseName');
      if (heading != null) return _cleanText(heading.text);
    }
    return null;
  }

  /// Parse a double from a string, handling common VULMS formats.
  static double? _parseDouble(String? text) {
    if (text == null) return null;
    // Strip non-numeric characters except dot and minus
    final cleaned = text.replaceAll(RegExp(r'[^0-9.\-]'), '');
    if (cleaned.isEmpty) return null;
    return double.tryParse(cleaned);
  }

  /// Trim and normalize whitespace. Returns null for empty strings.
  static String? _cleanText(String? text) {
    if (text == null) return null;
    final cleaned = text.trim().replaceAll(RegExp(r'\s+'), ' ');
    return cleaned.isEmpty ? null : cleaned;
  }
}

/// Internal column index mapping for grade table parsing.
class _ColumnMapping {
  final int? courseCodeIdx;
  final int? courseTitleIdx;
  final int titleIdx;
  final int? typeIdx;
  final int? totalMarksIdx;
  final int? obtainedMarksIdx;
  final int? percentageIdx;
  final int? letterGradeIdx;
  final int? datePostedIdx;

  const _ColumnMapping({
    required this.titleIdx,
    this.courseCodeIdx,
    this.courseTitleIdx,
    this.typeIdx,
    this.totalMarksIdx,
    this.obtainedMarksIdx,
    this.percentageIdx,
    this.letterGradeIdx,
    this.datePostedIdx,
  });
}
