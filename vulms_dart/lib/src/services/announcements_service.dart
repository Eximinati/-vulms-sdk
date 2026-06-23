import 'package:html/parser.dart' as html_parser;

import '../auth/session_manager.dart';
import '../models/announcement.dart';
import '../utils/logger.dart';

class _CacheEntry<T> {
  final T data;
  final DateTime createdAt;
  _CacheEntry(this.data) : createdAt = DateTime.now();
}

class AnnouncementsService {
  final SessionManager _session;
  final VulmsLogger _logger;
  static const _ttl = Duration(minutes: 30);

  _CacheEntry<List<Announcement>>? _cache;

  AnnouncementsService({
    required SessionManager session,
    required VulmsLogger logger,
  })  : _session = session,
        _logger = logger.child('announcements');

  Future<List<Announcement>> getAll({String? courseCode, bool forceRefresh = false}) async {
    if (!forceRefresh && _cache != null) {
      if (DateTime.now().difference(_cache!.createdAt) < _ttl) {
        _logger.debug('[CACHE HIT] announcements');
        final cached = _cache!.data;
        if (courseCode != null) {
          return cached.where((a) => a.courseCode == courseCode.toUpperCase()).toList();
        }
        return cached;
      }
      _logger.debug('[CACHE EXPIRED] announcements');
    }

    _logger.info('Fetching announcements');
    _session.ensureAuthenticated();

    final html = await _session.httpClient.get(path: '/Home.aspx');
    final announcements = _parseAnnouncements(html);

    _cache = _CacheEntry(announcements);
    _logger.info('Found ${announcements.length} announcements');

    if (courseCode != null) {
      return announcements
          .where((a) => a.courseCode == courseCode.toUpperCase())
          .toList();
    }
    return announcements;
  }

  List<Announcement> _parseAnnouncements(String html) {
    final doc = html_parser.parse(html);
    final announcements = <Announcement>[];

    final containers = doc.querySelectorAll(
        '.m-portlet, .announcement, [class*="announce"], [id*="announce"]');

    for (final container in containers) {
      final titleEl = container.querySelector(
          'h3, h4, .m-portlet__head-text, [class*="title"]');
      final title = titleEl?.text.trim() ?? '';
      if (title.isEmpty) continue;

      final bodyEl = container.querySelector(
          '.m-portlet__body, .announcement-body, [class*="body"], [class*="content"]');
      final body = bodyEl?.text.trim() ?? '';

      final dateEl = container.querySelector(
          '.m-portlet__head, [class*="date"], [class*="time"]');
      final dateText = dateEl?.text.trim() ?? '';
      final date = _parseVulmsDate(dateText);

      final courseCodeMatch = RegExp(r'([A-Z]{2,4}\d{3}[A-Z]?)').firstMatch(title);
      final courseCode = courseCodeMatch?.group(1)?.toUpperCase() ?? '';

      announcements.add(Announcement(
        courseCode: courseCode,
        title: title,
        body: body.isNotEmpty ? body : null,
        date: date,
      ));
    }

    if (announcements.isEmpty) {
      final tables = doc.querySelectorAll('table');
      for (final table in tables) {
        final rows = table.querySelectorAll('tr');
        for (final row in rows) {
          final cells = row.querySelectorAll('td');
          if (cells.length < 2) continue;

          final title = cells[0].text.trim();
          final body = cells.length > 1 ? cells[1].text.trim() : '';
          final dateText = cells.length > 2 ? cells[2].text.trim() : '';

          if (title.isEmpty) continue;

          final courseCodeMatch = RegExp(r'([A-Z]{2,4}\d{3}[A-Z]?)').firstMatch(title);
          final courseCode = courseCodeMatch?.group(1)?.toUpperCase() ?? '';

          announcements.add(Announcement(
            courseCode: courseCode,
            title: title,
            body: body.isNotEmpty ? body : null,
            date: _parseVulmsDate(dateText),
          ));
        }
      }
    }

    return announcements;
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

  void invalidateCache() {
    _cache = null;
  }
}
