import 'package:html/dom.dart';
import 'package:html/parser.dart' as html_parser;

import '../models/gdb.dart';
import '../utils/date_parser.dart';
import '../utils/logger.dart';

/// Parses GDB (Graded Discussion Board) information from VULMS HTML.
class GdbParser {
  GdbParser._();

  /// Parse GDBs from the VULMS GDB page HTML.
  static List<Gdb> parse(String html, {VulmsLogger? logger}) {
    final doc = html_parser.parse(html);
    final seen = <String>{};
    final gdbs = <Gdb>[];

    logger?.debug('GdbParser.parse: HTML length=${html.length}');

    // Primary: tile repeater panels
    final tileResults = _parseTileRepeater(doc, logger);
    for (final gdb in tileResults) {
      final key = _deduplicationKey(gdb);
      if (!seen.contains(key)) {
        seen.add(key);
        gdbs.add(gdb);
      }
    }

    if (gdbs.isNotEmpty) {
      logger?.info('GdbParser: ${gdbs.length} GDBs from tile repeater');
      return gdbs;
    }

    // Fallback 1: class-based card elements
    final classResults = _parseClassBased(doc, logger);
    for (final gdb in classResults) {
      final key = _deduplicationKey(gdb);
      if (!seen.contains(key)) {
        seen.add(key);
        gdbs.add(gdb);
      }
    }

    if (gdbs.isNotEmpty) {
      logger?.info('GdbParser: ${gdbs.length} GDBs from class-based elements');
      return gdbs;
    }

    // Fallback 2: table rows
    final tableResults = _parseTable(doc, logger);
    for (final gdb in tableResults) {
      final key = _deduplicationKey(gdb);
      if (!seen.contains(key)) {
        seen.add(key);
        gdbs.add(gdb);
      }
    }

    logger?.info('GdbParser: ${gdbs.length} GDBs from table fallback');
    return gdbs;
  }

  /// Parse GDBs from tile repeater panels.
  ///
  /// Each GDB panel has an id starting with
  /// `MainContent_gvTileRepeaterGDB_pnl_`.
  static List<Gdb> _parseTileRepeater(Document doc, VulmsLogger? logger) {
    final gdbs = <Gdb>[];
    final panels =
        doc.querySelectorAll('[id^="MainContent_gvTileRepeaterGDB_pnl_"]');

    for (final panel in panels) {
      try {
        final gdb = _parseTilePanel(panel);
        if (gdb != null) {
          gdbs.add(gdb);
          logger?.debug('  Tile GDB: ${gdb.title} [${gdb.status}]');
        }
      } catch (e) {
        logger?.debug('  Tile panel parse error: $e');
      }
    }

    return gdbs;
  }

  /// Parse a single tile repeater panel into a [Gdb].
  static Gdb? _parseTilePanel(Element panel) {
    final title = _extractText(panel, [
      'h3',
      'h4',
      '.m-portlet__head-text',
      '[id*="lblTopic"]',
      '[id*="lblTitle"]',
    ]);
    if (title.isEmpty) return null;

    final courseCode = _extractCourseCodeFromPanel(panel) ?? '';

    final dueDateText = _extractText(panel, [
      '[id*="lblDueDate"]',
      '[id*="lblDate"]',
      '.m--font-bold',
    ]);
    final dueDate = VulmsDateParser.tryParse(dueDateText);

    final totalMarks = _extractDouble(panel, [
      '[id*="lblTotalMarks"]',
      '[id*="lblMarks"]',
    ]);

    final statusText = _extractStatusText(panel);
    final status = _normalizeStatus(statusText);

    return Gdb(
      courseCode: courseCode,
      courseTitle: '',
      title: title,
      dueDate: dueDate,
      totalMarks: totalMarks,
      status: status,
    );
  }

  /// Class-based fallback parser.
  ///
  /// Looks for h1-h4 heading groups, `.gdb-card`, and `.stu-gdb-box` elements.
  static List<Gdb> _parseClassBased(Document doc, VulmsLogger? logger) {
    final gdbs = <Gdb>[];

    // Strategy 1: sections defined by heading + content siblings
    final headings = doc.querySelectorAll('h1, h2, h3, h4');
    for (final heading in headings) {
      final headingText = heading.text.trim();
      if (headingText.isEmpty) continue;

      // Skip generic page headings
      if (RegExp(r'^(Graded\s+)?Discussion\s+Board', caseSensitive: false)
          .hasMatch(headingText)) {
        continue;
      }

      final container = heading.parent;
      if (container == null) continue;

      final gdb = _parseHeadingGroup(container, heading);
      if (gdb != null) {
        gdbs.add(gdb);
        logger?.debug('  Heading GDB: ${gdb.title}');
      }
    }

    // Strategy 2: card containers
    for (final selector in ['.gdb-card', '.stu-gdb-box', '.m-portlet']) {
      final cards = doc.querySelectorAll(selector);
      for (final card in cards) {
        final gdb = _parseCardElement(card);
        if (gdb != null) {
          gdbs.add(gdb);
          logger?.debug('  Card GDB: ${gdb.title}');
        }
      }
    }

    return gdbs;
  }

  /// Parse a heading group (heading + following content) into a [Gdb].
  static Gdb? _parseHeadingGroup(Element container, Element heading) {
    final title = heading.text.trim();
    if (title.isEmpty) return null;

    final contentArea = container;
    final courseCode = _extractCourseCodeFromElement(contentArea) ?? '';

    final allText = contentArea.text;
    final dueDate = _extractDateFromText(allText);
    final totalMarks = _extractMarksFromText(allText);
    final status = _normalizeStatus(_extractStatusFromText(allText));

    return Gdb(
      courseCode: courseCode,
      courseTitle: '',
      title: title,
      dueDate: dueDate,
      totalMarks: totalMarks,
      status: status,
    );
  }

  /// Parse a card element into a [Gdb].
  static Gdb? _parseCardElement(Element card) {
    final title = _extractText(card, [
      'h3',
      'h4',
      '.card-title',
      '.m-portlet__head-text',
    ]);
    if (title.isEmpty) return null;

    final courseCode = _extractCourseCodeFromElement(card) ?? '';

    final dueDateText = _extractText(card, [
      '.text-muted',
      '.m--font-bold',
      '[class*="date"]',
    ]);
    final dueDate = VulmsDateParser.tryParse(dueDateText);

    final totalMarks = _extractDouble(card, [
      '[class*="marks"]',
      '[class*="total"]',
    ]);

    final allText = card.text;
    final status = _normalizeStatus(_extractStatusFromText(allText));

    return Gdb(
      courseCode: courseCode,
      courseTitle: '',
      title: title,
      dueDate: dueDate,
      totalMarks: totalMarks,
      status: status,
    );
  }

  /// Table fallback parser.
  static List<Gdb> _parseTable(Document doc, VulmsLogger? logger) {
    final gdbs = <Gdb>[];
    final tables = doc.querySelectorAll('table');

    for (final table in tables) {
      final rows = table.querySelectorAll('tr');
      if (rows.length < 2) continue;

      // Determine column indices from header row
      final headerCells = rows.first.querySelectorAll('th, td');
      final columnMap = _mapColumns(headerCells);
      if (columnMap.isEmpty) continue;

      // Skip header row, parse data rows
      for (var i = 1; i < rows.length; i++) {
        final gdb = _parseTableRow(rows[i], columnMap);
        if (gdb != null) {
          gdbs.add(gdb);
          logger?.debug('  Table GDB: ${gdb.title}');
        }
      }
    }

    return gdbs;
  }

  /// Map column headers to indices.
  static Map<String, int> _mapColumns(List<Element> headerCells) {
    final map = <String, int>{};
    for (var i = 0; i < headerCells.length; i++) {
      final text = headerCells[i].text.trim().toLowerCase();
      if (text.contains('topic') || text.contains('title')) {
        map['title'] = i;
      } else if (text.contains('due') || text.contains('date')) {
        map['date'] = i;
      } else if (text.contains('mark')) {
        map['marks'] = i;
      } else if (text.contains('status')) {
        map['status'] = i;
      }
    }
    return map;
  }

  /// Parse a table row into a [Gdb].
  static Gdb? _parseTableRow(Element row, Map<String, int> columnMap) {
    final cells = row.querySelectorAll('td');
    if (cells.isEmpty) return null;

    final titleIdx = columnMap['title'];
    if (titleIdx == null || titleIdx >= cells.length) return null;

    final title = cells[titleIdx].text.trim();
    if (title.isEmpty) return null;

    String? dateText;
    final dateIdx = columnMap['date'];
    if (dateIdx != null && dateIdx < cells.length) {
      dateText = cells[dateIdx].text.trim();
    }

    double? totalMarks;
    final marksIdx = columnMap['marks'];
    if (marksIdx != null && marksIdx < cells.length) {
      totalMarks = _parseDouble(cells[marksIdx].text.trim());
    }

    String? statusText;
    final statusIdx = columnMap['status'];
    if (statusIdx != null && statusIdx < cells.length) {
      statusText = cells[statusIdx].text.trim();
    }

    final courseCode = _extractCourseCodeFromElement(row) ?? '';

    return Gdb(
      courseCode: courseCode,
      courseTitle: '',
      title: title,
      dueDate: VulmsDateParser.tryParse(dateText),
      totalMarks: totalMarks,
      status: _normalizeStatus(statusText),
    );
  }

  /// Extract combined status text from lblStatus and lblSubmissionStatus.
  static String _extractStatusText(Element panel) {
    // Prefer submission status label
    final submissionStatus = _extractText(panel, [
      '[id*="lblSubmissionStatus"]',
      '[id*="SubmissionStatus"]',
    ]);
    if (submissionStatus.isNotEmpty) return submissionStatus;

    // Fall back to general status label
    return _extractText(panel, [
      '[id*="lblStatus"]',
      '[id*="Status"]',
    ]);
  }

  /// Normalize a status string into a [GdbStatus].
  static GdbStatus _normalizeStatus(String? text) {
    if (text == null || text.trim().isEmpty) return GdbStatus.pending;

    final lower = text.toLowerCase();

    if (lower.contains('submitted') || lower.contains('attempted')) {
      return GdbStatus.submitted;
    }
    if (lower.contains('missed') ||
        lower.contains('closed') ||
        lower.contains('expired')) {
      return GdbStatus.missed;
    }
    if (lower.contains('result') || lower.contains('declared')) {
      return GdbStatus.resultDeclared;
    }
    if (lower.contains('open') || lower.contains('pending')) {
      return GdbStatus.pending;
    }

    return GdbStatus.pending;
  }

  /// Extract course code from a tile panel by scanning nearby h3 elements.
  static String? _extractCourseCodeFromPanel(Element panel) {
    // Look for h3 with course code pattern inside or near the panel
    final h3s = panel.querySelectorAll('h3');
    for (final h3 in h3s) {
      final code = _extractCodeFromText(h3.text);
      if (code != null) return code;
    }

    // Check id attribute for course code hints
    final id = panel.id;
    final idMatch = RegExp(r'code[=_\-]([A-Z]{2,4}\d{3}[A-Z]?)', caseSensitive: false)
        .firstMatch(id);
    if (idMatch != null) return idMatch.group(1)?.toUpperCase();

    return null;
  }

  /// Extract course code from any element by scanning headings.
  static String? _extractCourseCodeFromElement(Element element) {
    // Check for m-subheader__title h3 first
    final subheader = element.querySelector('h3.m-subheader__title');
    if (subheader != null) {
      final code = _extractCodeFromText(subheader.text);
      if (code != null) return code;
    }

    // Check all h3 elements
    final h3s = element.querySelectorAll('h3');
    for (final h3 in h3s) {
      final code = _extractCodeFromText(h3.text);
      if (code != null) return code;
    }

    // Check h4 elements
    final h4s = element.querySelectorAll('h4');
    for (final h4 in h4s) {
      final code = _extractCodeFromText(h4.text);
      if (code != null) return code;
    }

    return null;
  }

  /// Extract a course code pattern (e.g. `CS101`, `MGT301A`) from text.
  static String? _extractCodeFromText(String text) {
    final match = RegExp(r'\b([A-Z]{2,4}\d{3}[A-Z]?)\b').firstMatch(text.trim());
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

  /// Extract a double value using the first matching selector.
  static double? _extractDouble(Element parent, List<String> selectors) {
    for (final selector in selectors) {
      final el = parent.querySelector(selector);
      if (el != null) {
        final value = _parseDouble(el.text.trim());
        if (value != null) return value;
      }
    }
    return null;
  }

  /// Safely parse a double from a string, stripping non-numeric characters.
  static double? _parseDouble(String text) {
    final cleaned = text.replaceAll(RegExp(r'[^0-9.\-]'), '');
    return double.tryParse(cleaned);
  }

  /// Extract a date from raw text using common VULMS patterns.
  static DateTime? _extractDateFromText(String text) {
    // Try to find a date-like substring in the text
    final patterns = [
      RegExp(r'\d{1,2}\s*[-/.]\s*[A-Za-z]{3,}\s*[-/.]\s*\d{4}'),
      RegExp(r'[A-Za-z]+\s+\d{1,2},?\s+\d{4}'),
      RegExp(r'\d{1,2}\s*[-/.]\s*\d{1,2}\s*[-/.]\s*\d{4}'),
    ];
    for (final pattern in patterns) {
      final match = pattern.firstMatch(text);
      if (match != null) {
        return VulmsDateParser.tryParse(match.group(0)!);
      }
    }
    return null;
  }

  /// Extract total marks from raw text.
  static double? _extractMarksFromText(String text) {
    final match = RegExp(r'(\d+(?:\.\d+)?)\s*(?:marks?|total)',
            caseSensitive: false)
        .firstMatch(text);
    if (match != null) return double.tryParse(match.group(1)!);

    // Look for "Total: X" pattern
    final totalMatch =
        RegExp(r'total\s*[:=]\s*(\d+(?:\.\d+)?)', caseSensitive: false)
            .firstMatch(text);
    return totalMatch != null ? double.tryParse(totalMatch.group(1)!) : null;
  }

  /// Extract status from raw text by keyword matching.
  static String? _extractStatusFromText(String text) {
    final lower = text.toLowerCase();
    if (lower.contains('submitted')) return 'Submitted';
    if (lower.contains('missed') || lower.contains('closed')) return 'Missed';
    if (lower.contains('expired')) return 'Missed';
    if (lower.contains('open')) return 'Open';
    if (lower.contains('pending')) return 'Pending';
    return null;
  }

  /// Build a deduplication key from a GDB.
  static String _deduplicationKey(Gdb gdb) {
    final dateStr = gdb.dueDate?.toIso8601String() ?? '';
    return '${gdb.courseCode}|${gdb.title}|$dateStr'.toLowerCase();
  }
}
