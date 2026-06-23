import 'package:html/dom.dart';
import 'package:html/parser.dart' as html_parser;

import '../models/calendar_event.dart';
import '../utils/date_parser.dart';
import '../utils/dom_helper.dart';
import '../utils/logger.dart';

/// Parses calendar events from VULMS Activity Calendar HTML.
///
/// Handles both month-view grid layouts and list/table views from
/// `/ActivityCalendar/ActivityCalendar.aspx`.
class CalendarParser {
  CalendarParser._();

  /// Parse calendar events from the Activity Calendar page HTML.
  static List<CalendarEvent> parse(
    String html, {
    VulmsLogger? logger,
  }) {
    final doc = html_parser.parse(html);
    final events = <CalendarEvent>[];

    logger?.debug('CalendarParser.parse: HTML length=${html.length}');

    // Try table row layout first (list view)
    _parseTableRows(doc, events, logger);

    // Try calendar grid layout (month view) as fallback
    if (events.isEmpty) {
      _parseCalendarGrid(doc, events, logger);
    }

    // Try generic event card/panel layout
    if (events.isEmpty) {
      _parseEventCards(doc, events, logger);
    }

    logger?.info('CalendarParser.parse: ${events.length} events found');
    return events;
  }

  /// Parse events from `<tr>` rows inside a table.
  ///
  /// VULMS list views typically render events as table rows with columns
  /// for course, title, date, type, and sometimes description.
  static void _parseTableRows(
    Document doc,
    List<CalendarEvent> events,
    VulmsLogger? logger,
  ) {
    final rows = doc.querySelectorAll('table tr');
    for (final row in rows) {
      final cells = row.querySelectorAll('td');
      if (cells.length < 3) continue;

      final texts = cells.map((c) => c.text.trim()).toList();

      // Skip header rows or rows with no real content
      if (_isHeaderRow(texts)) continue;

      final event = _buildEventFromCells(texts);
      if (event != null) {
        events.add(event);
        logger?.trace('  Table event: ${event.courseCode} - ${event.title}');
      }
    }

    if (events.isNotEmpty) {
      logger?.debug('  Parsed ${events.length} events from table rows');
    }
  }

  /// Parse events from calendar grid cells (month view).
  ///
  /// In month view, each day cell may contain one or more event links
  /// or spans with event info and a title/tooltip.
  static void _parseCalendarGrid(
    Document doc,
    List<CalendarEvent> events,
    VulmsLogger? logger,
  ) {
    // Look for day cells — VULMS uses td with class containing "calendar" or
    // cells inside a grid with day numbers.
    final cells = doc.querySelectorAll(
      'td.calendarDay, td.day, td[class*="Day"], '
      'div.calendar-day, div[class*="calendarday"]',
    );

    for (final cell in cells) {
      final dayText = _extractDayNumber(cell);
      if (dayText == null) continue;

      // Look for event elements within the cell
      final eventEls = cell.querySelectorAll(
        'a[href*="Activity"], span.event, div.event, '
        'a[class*="event"], span[class*="Event"], '
        'a[title], span[title]',
      );

      for (final el in eventEls) {
        final title = _cleanText(
          el.attributes['title'] ?? el.text,
        );
        if (title == null || title.isEmpty) continue;

        final event = _buildEventFromElement(el, title, dayText);
        if (event != null) {
          events.add(event);
          logger?.trace(
            '  Grid event: ${event.courseCode} - ${event.title}',
          );
        }
      }
    }

    if (events.isNotEmpty) {
      logger?.debug('  Parsed ${events.length} events from calendar grid');
    }
  }

  /// Parse events from card/panel/list-item layouts.
  static void _parseEventCards(
    Document doc,
    List<CalendarEvent> events,
    VulmsLogger? logger,
  ) {
    final cards = doc.querySelectorAll(
      '.event-item, .event-card, .calendar-event, '
      '[class*="EventItem"], [class*="eventitem"], '
      'li[class*="event"], div[class*="event-item"]',
    );

    for (final card in cards) {
      final title = _cleanText(card.querySelector(
        '.event-title, .title, h4, h5, strong',
      )?.text);

      final courseCode = _extractCourseCode(card.text);
      final dateText = _cleanText(card.querySelector(
        '.event-date, .date, time, span[class*="date"]',
      )?.text);

      final date = dateText != null ? VulmsDateParser.tryParse(dateText) : null;
      if (title == null || title.isEmpty) continue;

      events.add(CalendarEvent(
        courseCode: courseCode ?? 'UNKNOWN',
        title: title,
        date: date ?? DateTime.now(),
        type: _mapEventType(card.text),
        description: _cleanText(card.querySelector(
          '.event-description, .description, p',
        )?.text),
        time: _extractTime(card.text),
      ));
    }

    if (events.isNotEmpty) {
      logger?.debug('  Parsed ${events.length} events from cards');
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /// Build a [CalendarEvent] from a list of cell texts (table row).
  static CalendarEvent? _buildEventFromCells(List<String> texts) {
    // Heuristic: look for a course code pattern in any cell
    String? courseCode;
    int codeIndex = -1;
    for (var i = 0; i < texts.length; i++) {
      final code = _extractCourseCode(texts[i]);
      if (code != null) {
        courseCode = code;
        codeIndex = i;
        break;
      }
    }

    // Find a date cell
    DateTime? date;
    for (final t in texts) {
      final parsed = VulmsDateParser.tryParse(t);
      if (parsed != null) {
        date = parsed;
        break;
      }
    }

    // Title: prefer the cell after the course code, or the longest non-date cell
    String? title;
    if (codeIndex >= 0 && codeIndex + 1 < texts.length) {
      title = _cleanText(texts[codeIndex + 1]);
    }
    title ??= _longestNonDate(texts);

    if (title == null || title.isEmpty) return null;

    final allText = texts.join(' ');
    return CalendarEvent(
      courseCode: courseCode ?? _extractCourseCode(allText) ?? 'UNKNOWN',
      title: title,
      date: date ?? DateTime.now(),
      type: _mapEventType(allText),
      description: _extractDescription(texts),
      time: _extractTime(allText),
    );
  }

  /// Build a [CalendarEvent] from a grid cell element.
  static CalendarEvent? _buildEventFromElement(
    Element el,
    String title,
    String dayNumber,
  ) {
    final container = closest(el, 'td') ?? el.parent;
    final cellText = container?.text ?? '';
    final courseCode = _extractCourseCode(
      el.attributes['href'] ?? cellText,
    );

    // Try to find a full date from a parent attribute or nearby text
    DateTime? date;
    final parentRow = closest(el, 'tr');
    if (parentRow != null) {
      final rowDate = VulmsDateParser.tryParse(parentRow.text);
      if (rowDate != null) date = rowDate;
    }

    return CalendarEvent(
      courseCode: courseCode ?? 'UNKNOWN',
      title: title,
      date: date ?? DateTime.now(),
      type: _mapEventType(title + ' ' + cellText),
      time: _extractTime(cellText),
    );
  }

  /// Check if a row of cell texts looks like a header row.
  static bool _isHeaderRow(List<String> texts) {
    final joined = texts.join(' ').toLowerCase();
    return joined.contains('course') &&
        joined.contains('title') &&
        (joined.contains('date') || joined.contains('day'));
  }

  /// Extract a VULMS course code (e.g. "CS101", "MGT401") from text.
  static String? _extractCourseCode(String text) {
    final match = RegExp(r'\b([A-Z]{2,4}\d{3}[A-Z]?)\b').firstMatch(text);
    return match?.group(1);
  }

  /// Extract day number from a calendar cell element.
  static String? _extractDayNumber(Element cell) {
    // Look for a direct text node or a day-number child
    final dayEl = cell.querySelector(
      '.day-number, .dayNum, span[class*="day"], div[class*="day"]',
    );
    if (dayEl != null) {
      final num = dayEl.text.trim();
      if (RegExp(r'^\d{1,2}$').hasMatch(num)) return num;
    }
    // Fallback: first short numeric text in the cell
    for (final node in cell.nodes) {
      final text = node.text?.trim();
      if (text != null && RegExp(r'^\d{1,2}$').hasMatch(text)) return text;
    }
    return null;
  }

  /// Map free-text to a [CalendarEventType].
  static CalendarEventType? _mapEventType(String text) {
    final lower = text.toLowerCase();
    if (lower.contains('assignment') || lower.contains('assign')) {
      return CalendarEventType.assignment;
    }
    if (lower.contains('quiz') || lower.contains('mcq')) {
      return CalendarEventType.quiz;
    }
    if (lower.contains('gdb') || lower.contains('graded discussion')) {
      return CalendarEventType.gdb;
    }
    if (lower.contains('lecture') || lower.contains('lecture')) {
      return CalendarEventType.lecture;
    }
    if (lower.contains('exam') || lower.contains('mid') || lower.contains('final')) {
      return CalendarEventType.exam;
    }
    return null;
  }

  /// Extract a time string (e.g. "3:30 PM") from text.
  static String? _extractTime(String text) {
    final match = RegExp(
      r'(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))',
    ).firstMatch(text);
    return match?.group(1)?.trim();
  }

  /// Extract a description from the remaining cells.
  static String? _extractDescription(List<String> texts) {
    // Prefer the last cell if it's long enough
    if (texts.length >= 4) {
      final last = texts.last.trim();
      if (last.length > 10) return last;
    }
    return null;
  }

  /// Return the longest non-date, non-empty string from a list.
  static String? _longestNonDate(List<String> texts) {
    String? best;
    for (final t in texts) {
      final clean = _cleanText(t);
      if (clean == null || clean.isEmpty) continue;
      if (VulmsDateParser.tryParse(clean) != null) continue;
      if (best == null || clean.length > best.length) best = clean;
    }
    return best;
  }

  /// Trim and normalize whitespace.
  static String? _cleanText(String? text) {
    if (text == null) return null;
    final cleaned = text.trim().replaceAll(RegExp(r'\s+'), ' ');
    return cleaned.isEmpty ? null : cleaned;
  }
}
