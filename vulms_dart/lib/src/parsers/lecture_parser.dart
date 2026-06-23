import 'package:html/dom.dart';
import 'package:html/parser.dart' as html_parser;

import '../models/lecture.dart';
import '../utils/logger.dart';

/// Parses lecture information from VULMS HTML.
class LectureParser {
  LectureParser._();

  /// Parse lectures from VULMS lecture page HTML.
  static List<Lecture> parse(String html, {VulmsLogger? logger}) {
    final doc = html_parser.parse(html);
    final seen = <String>{};
    final lectures = <Lecture>[];

    logger?.debug('LectureParser.parse: HTML length=${html.length}');

    // Primary: table-based extraction
    final tableResults = _parseTables(doc, logger);
    for (final lecture in tableResults) {
      final key = _deduplicationKey(lecture);
      if (!seen.contains(key)) {
        seen.add(key);
        lectures.add(lecture);
      }
    }

    if (lectures.isNotEmpty) {
      logger?.info(
          'LectureParser: ${lectures.length} lectures from tables');
      return lectures;
    }

    // Fallback 1: class-based card/row elements
    final classResults = _parseClassBased(doc, logger);
    for (final lecture in classResults) {
      final key = _deduplicationKey(lecture);
      if (!seen.contains(key)) {
        seen.add(key);
        lectures.add(lecture);
      }
    }

    if (lectures.isNotEmpty) {
      logger?.info(
          'LectureParser: ${lectures.length} lectures from class-based elements');
      return lectures;
    }

    // Fallback 2: heading-based grouping
    final headingResults = _parseHeadings(doc, logger);
    for (final lecture in headingResults) {
      final key = _deduplicationKey(lecture);
      if (!seen.contains(key)) {
        seen.add(key);
        lectures.add(lecture);
      }
    }

    logger?.info('LectureParser: ${lectures.length} lectures total');
    return lectures;
  }

  /// Parse lectures from all tables in the document.
  static List<Lecture> _parseTables(Document doc, VulmsLogger? logger) {
    final lectures = <Lecture>[];
    final tables = doc.querySelectorAll('table');

    for (final table in tables) {
      final rows = table.querySelectorAll('tr');
      if (rows.length < 2) continue;

      // Determine column layout from header row
      final headerCells = rows.first.querySelectorAll('th, td');
      final columnMap = _mapColumns(headerCells);
      if (columnMap.isEmpty) continue;

      // Determine course code from nearest heading
      final courseCode = _extractCourseCodeNearElement(table) ?? '';

      // Parse data rows (skip header)
      for (var i = 1; i < rows.length; i++) {
        final lecture =
            _parseTableRow(rows[i], columnMap, courseCode);
        if (lecture != null) {
          lectures.add(lecture);
          logger?.debug(
              '  Table lecture: ${lecture.title} [week ${lecture.week}]');
        }
      }
    }

    return lectures;
  }

  /// Map header cells to column indices.
  static Map<String, int> _mapColumns(List<Element> headerCells) {
    final map = <String, int>{};
    for (var i = 0; i < headerCells.length; i++) {
      final text = headerCells[i].text.trim().toLowerCase();
      if (text.contains('title') || text.contains('name') || text.contains('topic')) {
        map['title'] = i;
      } else if (text.contains('type') || text.contains('kind')) {
        map['type'] = i;
      } else if (text.contains('duration') || text.contains('length')) {
        map['duration'] = i;
      } else if (text.contains('week') || text.contains('module')) {
        map['week'] = i;
      } else if (text.contains('status') || text.contains('progress')) {
        map['status'] = i;
      } else if (text.contains('link') || text.contains('url') || text.contains('watch')) {
        map['url'] = i;
      }
    }
    return map;
  }

  /// Parse a single table row into a [Lecture].
  static Lecture? _parseTableRow(
    Element row,
    Map<String, int> columnMap,
    String courseCode,
  ) {
    final cells = row.querySelectorAll('td');
    if (cells.isEmpty) return null;

    final titleIdx = columnMap['title'];
    if (titleIdx == null || titleIdx >= cells.length) return null;

    final title = cells[titleIdx].text.trim();
    if (title.isEmpty) return null;

    // Extract type
    String? type;
    final typeIdx = columnMap['type'];
    if (typeIdx != null && typeIdx < cells.length) {
      type = cells[typeIdx].text.trim();
    }

    // Extract duration
    String? duration;
    final durationIdx = columnMap['duration'];
    if (durationIdx != null && durationIdx < cells.length) {
      duration = cells[durationIdx].text.trim();
    }

    // Extract week number
    int? week;
    final weekIdx = columnMap['week'];
    if (weekIdx != null && weekIdx < cells.length) {
      week = _parseWeekNumber(cells[weekIdx].text.trim());
    }

    // Extract status
    LectureStatus status = LectureStatus.unwatched;
    final statusIdx = columnMap['status'];
    if (statusIdx != null && statusIdx < cells.length) {
      status = _determineStatus(cells[statusIdx]);
    }

    // Extract URL
    String? url;
    final urlIdx = columnMap['url'];
    if (urlIdx != null && urlIdx < cells.length) {
      url = _extractUrlFromElement(cells[urlIdx]);
    } else {
      // Try finding URL in the title cell or anywhere in the row
      url = _extractUrlFromElement(row);
    }

    return Lecture(
      courseCode: courseCode,
      courseTitle: '',
      title: title,
      type: _emptyToNull(type),
      duration: _emptyToNull(duration),
      week: week,
      status: status,
      url: _emptyToNull(url),
    );
  }

  /// Class-based fallback parser.
  ///
  /// Looks for lecture-card, lecture-row, and similar elements.
  static List<Lecture> _parseClassBased(Document doc, VulmsLogger? logger) {
    final lectures = <Lecture>[];

    for (final selector in [
      '.lecture-card',
      '.lecture-row',
      '.m-portlet.lecture',
      '[class*="lecture-item"]',
      '[class*="video-item"]',
      '.list-group-item',
    ]) {
      final cards = doc.querySelectorAll(selector);
      for (final card in cards) {
        final lecture = _parseCardElement(card);
        if (lecture != null) {
          lectures.add(lecture);
          logger?.debug('  Card lecture: ${lecture.title}');
        }
      }
    }

    return lectures;
  }

  /// Parse a card/row element into a [Lecture].
  static Lecture? _parseCardElement(Element card) {
    final title = _extractText(card, [
      'h3',
      'h4',
      '.card-title',
      '.m-portlet__head-text',
      '.list-group-item-heading',
      'a',
    ]);
    if (title.isEmpty) return null;

    final courseCode = _extractCourseCodeFromElement(card) ?? '';

    final type = _emptyToNull(_extractText(card, [
      '.badge',
      '.label',
      '[class*="type"]',
      '[class*="category"]',
    ]));

    final duration = _emptyToNull(_extractText(card, [
      '.text-muted',
      '[class*="duration"]',
      '[class*="length"]',
    ]));

    int? week;
    final weekText = _extractText(card, [
      '[class*="week"]',
      '[class*="module"]',
    ]);
    if (weekText.isNotEmpty) {
      week = _parseWeekNumber(weekText);
    }

    // Determine status from the card
    final status = _determineStatus(card);

    // Extract URL
    final url = _emptyToNull(_extractUrlFromElement(card));

    return Lecture(
      courseCode: courseCode,
      courseTitle: '',
      title: title,
      type: type,
      duration: duration,
      week: week,
      status: status,
      url: url,
    );
  }

  /// Heading-based fallback parser.
  ///
  /// Groups content under h1-h4 headings as lectures.
  static List<Lecture> _parseHeadings(Document doc, VulmsLogger? logger) {
    final lectures = <Lecture>[];
    final headings = doc.querySelectorAll('h1, h2, h3, h4');

    for (final heading in headings) {
      final headingText = heading.text.trim();
      if (headingText.isEmpty) continue;

      // Skip top-level page headings
      if (RegExp(r'^(Lectures?|Videos?|Course\s+Content)',
              caseSensitive: false)
          .hasMatch(headingText)) {
        continue;
      }

      final container = heading.parent;
      if (container == null) continue;

      final courseCode = _extractCourseCodeFromElement(container) ?? '';
      final week = _parseWeekNumber(headingText);
      final status = _determineStatus(container);
      final url = _emptyToNull(_extractUrlFromElement(container));

      lectures.add(Lecture(
        courseCode: courseCode,
        courseTitle: '',
        title: headingText,
        week: week,
        status: status,
        url: url,
      ));

      logger?.debug('  Heading lecture: $headingText');
    }

    return lectures;
  }

  /// Determine lecture status from an element.
  ///
  /// Checks text content and CSS classes for status signals:
  /// - "unwatched" from text content
  /// - "watched" from text content
  /// - "new" from class names or text
  static LectureStatus _determineStatus(Element element) {
    final text = element.text.toLowerCase();
    final classes = element.className.toLowerCase();

    // Check for "new" status (class or text)
    if (classes.contains('new') ||
        classes.contains('unread') ||
        text.contains('new')) {
      return LectureStatus.newLecture;
    }

    // Check for "watched" / "completed" status
    if (classes.contains('watched') ||
        classes.contains('completed') ||
        classes.contains('done') ||
        text.contains('watched') ||
        text.contains('completed') ||
        text.contains('done')) {
      return LectureStatus.watched;
    }

    // Check for "unwatched" / "unread" status
    if (classes.contains('unwatched') ||
        classes.contains('unread') ||
        classes.contains('pending') ||
        text.contains('unwatched') ||
        text.contains('unread')) {
      return LectureStatus.unwatched;
    }

    // Check for specific VULMS indicators
    if (text.contains('not yet viewed') || text.contains('not viewed')) {
      return LectureStatus.unwatched;
    }
    if (text.contains('viewed') || text.contains('watched')) {
      return LectureStatus.watched;
    }

    // Check for icon-based indicators
    final icons = element.querySelectorAll('i, span.glyphicon, span.fa');
    for (final icon in icons) {
      final iconClasses = icon.className.toLowerCase();
      if (iconClasses.contains('check') || iconClasses.contains('done')) {
        return LectureStatus.watched;
      }
      if (iconClasses.contains('play') || iconClasses.contains('new')) {
        return LectureStatus.newLecture;
      }
    }

    return LectureStatus.unwatched;
  }

  /// Parse week number from text.
  ///
  /// Handles formats like "Week 5", "W5", "Module 3", or just "5".
  static int? _parseWeekNumber(String text) {
    // "Week 5" or "Week: 5"
    final weekMatch =
        RegExp(r'week\s*[:=]?\s*(\d+)', caseSensitive: false).firstMatch(text);
    if (weekMatch != null) return int.tryParse(weekMatch.group(1)!);

    // "W5" or "W05"
    final wMatch =
        RegExp(r'\bw(\d{1,3})\b', caseSensitive: false).firstMatch(text);
    if (wMatch != null) return int.tryParse(wMatch.group(1)!);

    // "Module 3"
    final moduleMatch = RegExp(r'module\s*(\d+)', caseSensitive: false)
        .firstMatch(text);
    if (moduleMatch != null) return int.tryParse(moduleMatch.group(1)!);

    // Plain number (if text is mostly numeric)
    final stripped = text.replaceAll(RegExp(r'[^0-9]'), '');
    if (stripped.isNotEmpty && stripped == text.trim()) {
      return int.tryParse(stripped);
    }

    return null;
  }

  /// Extract URL from an element or its children.
  static String? _extractUrlFromElement(Element element) {
    // Check for direct anchor
    final anchor = element.querySelector('a[href]');
    if (anchor != null) {
      final href = anchor.attributes['href'];
      if (href != null && href.isNotEmpty && !href.startsWith('#')) {
        return href;
      }
    }

    // Check for button/link with data attributes
    final btn = element.querySelector('[data-url], [data-href]');
    if (btn != null) {
      final dataUrl = btn.attributes['data-url'] ?? btn.attributes['data-href'];
      if (dataUrl != null && dataUrl.isNotEmpty) return dataUrl;
    }

    // Check if the element itself is an anchor
    if (element.localName == 'a') {
      final href = element.attributes['href'];
      if (href != null && href.isNotEmpty && !href.startsWith('#')) {
        return href;
      }
    }

    // Look for onclick handlers with URLs
    final allElements = element.querySelectorAll('[onclick]');
    for (final el in allElements) {
      final onclick = el.attributes['onclick'] ?? '';
      final urlMatch =
          RegExp(r"""(?:window\.)?(?:open|location)\s*[=(]\s*['"]([^'"]+)['"]""")
              .firstMatch(onclick);
      if (urlMatch != null) return urlMatch.group(1);
    }

    return null;
  }

  /// Extract course code from nearest heading to an element.
  static String? _extractCourseCodeNearElement(Element element) {
    // Walk up the DOM looking for a heading with a course code
    Element? current = element;
    for (var depth = 0; depth < 5; depth++) {
      if (current == null) break;

      // Check preceding siblings for headings
      final prev = current.previousElementSibling;
      if (prev != null) {
        final code = _extractCourseCodeFromElement(prev);
        if (code != null) return code;
      }

      // Check parent's headings
      final parent = current.parent;
      if (parent != null) {
        final code = _extractCourseCodeFromElement(parent);
        if (code != null) return code;
      }

      current = current.parent;
    }

    // Last resort: scan entire document headings
    return null;
  }

  /// Extract course code from any element.
  static String? _extractCourseCodeFromElement(Element element) {
    // Check for m-subheader__title h3
    final subheader = element.querySelector('h3.m-subheader__title');
    if (subheader != null) {
      final code = _extractCodeFromText(subheader.text);
      if (code != null) return code;
    }

    // Check headings
    for (final tag in ['h1', 'h2', 'h3', 'h4']) {
      final headings = element.querySelectorAll(tag);
      for (final h in headings) {
        final code = _extractCodeFromText(h.text);
        if (code != null) return code;
      }
    }

    return null;
  }

  /// Extract a course code pattern (e.g. `CS101`, `MGT301A`) from text.
  static String? _extractCodeFromText(String text) {
    final match =
        RegExp(r'\b([A-Z]{2,4}\d{3}[A-Z]?)\b').firstMatch(text.trim());
    return match?.group(1);
  }

  /// Extract text content using the first matching selector.
  static String _extractText(Element parent, List<String> selectors) {
    for (final selector in selectors) {
      final el = parent.querySelector(selector);
      if (el != null) {
        final text = el.text.trim();
        if (text.isNotEmpty) return text;
      }
    }
    return '';
  }

  /// Convert empty string to null.
  static String? _emptyToNull(String? text) {
    if (text == null || text.trim().isEmpty) return null;
    return text;
  }

  /// Build a deduplication key from a Lecture.
  static String _deduplicationKey(Lecture lecture) {
    return '${lecture.courseCode}|${lecture.title}|${lecture.week}|${lecture.type}'
        .toLowerCase();
  }
}
