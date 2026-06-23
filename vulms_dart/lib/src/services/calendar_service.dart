import 'package:html/parser.dart' as html_parser;

import '../auth/session_manager.dart';
import '../models/calendar_event.dart';
import '../utils/logger.dart';
import '../utils/constants.dart';

class _CacheEntry<T> {
  final T data;
  final DateTime createdAt;
  _CacheEntry(this.data) : createdAt = DateTime.now();
}

class CalendarService {
  final SessionManager _session;
  final VulmsLogger _logger;
  static const _ttl = Duration(minutes: 30);

  _CacheEntry<List<CalendarEvent>>? _cache;

  CalendarService({
    required SessionManager session,
    required VulmsLogger logger,
  })  : _session = session,
        _logger = logger.child('calendar');

  Future<List<CalendarEvent>> getAll({String? courseCode, bool forceRefresh = false}) async {
    if (!forceRefresh && _cache != null) {
      if (DateTime.now().difference(_cache!.createdAt) < _ttl) {
        _logger.debug('[CACHE HIT] calendar');
        final cached = _cache!.data;
        if (courseCode != null) {
          return cached.where((e) => e.courseCode == courseCode.toUpperCase()).toList();
        }
        return cached;
      }
      _logger.debug('[CACHE EXPIRED] calendar');
    }

    _logger.info('Fetching activity calendar');
    _session.ensureAuthenticated();

    final html = await _session.httpClient.get(path: VulmsUrls.activityCalendar);
    final events = _parseCalendar(html);

    _cache = _CacheEntry(events);
    _logger.info('Found ${events.length} calendar events');

    if (courseCode != null) {
      return events
          .where((e) => e.courseCode == courseCode.toUpperCase())
          .toList();
    }
    return events;
  }

  List<CalendarEvent> _parseCalendar(String html) {
    final doc = html_parser.parse(html);
    final events = <CalendarEvent>[];

    final rows = doc.querySelectorAll('table tr, .calendar-event, .event-row');
    for (final row in rows) {
      final cells = row.querySelectorAll('td');
      if (cells.length < 2) continue;

      final dateText = cells[0].text.trim();
      final titleText = cells.length > 1 ? cells[1].text.trim() : '';
      final descText = cells.length > 2 ? cells[2].text.trim() : '';

      if (titleText.isEmpty || dateText.isEmpty) continue;

      final date = _parseVulmsDate(dateText);
      if (date == null) continue;

      final courseCodeMatch = RegExp(r'([A-Z]{2,4}\d{3}[A-Z]?)').firstMatch(titleText);
      final courseCode = courseCodeMatch?.group(1)?.toUpperCase() ?? '';

      final type = _determineEventType(titleText, descText);

      events.add(CalendarEvent(
        courseCode: courseCode,
        title: titleText,
        date: date,
        type: type,
        description: descText.isNotEmpty ? descText : null,
      ));
    }

    return events;
  }

  DateTime? _parseVulmsDate(String text) {
    if (text.isEmpty || text == '-' || text == 'N/A') return null;
    final match = RegExp(r'^(\d{1,2})\s*[-/.]\s*([A-Za-z]{3,9})\s*[-/.]\s*(\d{4})$')
        .firstMatch(text.trim());
    if (match != null) {
      final day = int.tryParse(match.group(1)!);
      final monthStr = match.group(2)!.toLowerCase().substring(0, 3);
      final year = int.tryParse(match.group(3)!);
      final months = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
      };
      final month = months[monthStr];
      if (day != null && month != null && year != null) return DateTime(year, month, day);
    }
    return DateTime.tryParse(text.trim());
  }

  CalendarEventType _determineEventType(String title, String description) {
    final combined = '$title $description'.toLowerCase();
    if (combined.contains('assignment')) return CalendarEventType.assignment;
    if (combined.contains('quiz')) return CalendarEventType.quiz;
    if (combined.contains('gdb') || combined.contains('discussion')) {
      return CalendarEventType.gdb;
    }
    if (combined.contains('lecture') || combined.contains('video')) {
      return CalendarEventType.lecture;
    }
    if (combined.contains('exam') || combined.contains('final')) {
      return CalendarEventType.exam;
    }
    return CalendarEventType.other;
  }

  void invalidateCache() {
    _cache = null;
  }
}
