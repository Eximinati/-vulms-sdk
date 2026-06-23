import 'package:html/parser.dart' as html_parser;

import '../auth/session_manager.dart';
import '../models/profile.dart';
import '../utils/logger.dart';

class _CacheEntry<T> {
  final T data;
  final DateTime createdAt;
  _CacheEntry(this.data) : createdAt = DateTime.now();
}

class ProfileService {
  final SessionManager _session;
  final VulmsLogger _logger;
  static const _ttl = Duration(hours: 1);

  _CacheEntry<Profile?>? _cache;

  ProfileService({
    required SessionManager session,
    required VulmsLogger logger,
  })  : _session = session,
        _logger = logger.child('profile');

  Future<Profile?> getAll({bool forceRefresh = false}) async {
    if (!forceRefresh && _cache != null) {
      if (DateTime.now().difference(_cache!.createdAt) < _ttl) {
        _logger.debug('[CACHE HIT] profile');
        return _cache!.data;
      }
      _logger.debug('[CACHE EXPIRED] profile');
    }

    _logger.info('Fetching profile');
    _session.ensureAuthenticated();

    final html = await _session.httpClient.get(path: '/StudentProfile.aspx');
    final profile = _parseProfile(html);

    _cache = _CacheEntry(profile);
    if (profile != null) {
      _logger.info('Profile loaded: ${profile.name ?? profile.studentId}');
    } else {
      _logger.warn('Failed to parse profile');
    }

    return profile;
  }

  Profile? _parseProfile(String html) {
    final doc = html_parser.parse(html);

    final studentId = _extractField(doc, [
      '#MainContent_lblStudentID',
      '[id*="StudentID"]',
      '[id*="studentId"]',
    ]);

    final name = _extractField(doc, [
      '#MainContent_lblStudentName',
      '[id*="StudentName"]',
      '[id*="studentName"]',
      '.student-name',
    ]);

    final email = _extractField(doc, [
      '#MainContent_lblEmail',
      '[id*="Email"]',
      '[id*="email"]',
    ]);

    final program = _extractField(doc, [
      '#MainContent_lblProgram',
      '[id*="Program"]',
      '[id*="program"]',
    ]);

    final session = _extractField(doc, [
      '#MainContent_lblSession',
      '[id*="Session"]',
      '[id*="session"]',
    ]);

    final imageEl = doc.querySelector(
        '#MainContent_imgStudent, [id*="StudentPhoto"], [id*="studentImage"]');
    final imageUrl = imageEl?.attributes['src'];

    if (studentId == null && name == null) {
      final additionalFields = _extractAdditionalFields(doc);
      if (additionalFields.isNotEmpty) {
        return Profile(additionalFields: additionalFields);
      }
      return null;
    }

    return Profile(
      studentId: studentId,
      name: name,
      email: email,
      program: program,
      session: session,
      imageUrl: imageUrl,
      additionalFields: _extractAdditionalFields(doc),
    );
  }

  String? _extractField(dynamic doc, List<String> selectors) {
    for (final selector in selectors) {
      final el = doc.querySelector(selector);
      if (el != null) {
        final text = el.text.trim();
        if (text.isNotEmpty && text != '-' && text != 'N/A') return text;
      }
    }
    return null;
  }

  Map<String, String> _extractAdditionalFields(dynamic doc) {
    final fields = <String, String>{};

    final rows = doc.querySelectorAll('table tr, .profile-field, .info-row');
    for (final row in rows) {
      final cells = row.querySelectorAll('td, th');
      if (cells.length >= 2) {
        final key = cells[0].text.trim();
        final value = cells[1].text.trim();
        if (key.isNotEmpty && value.isNotEmpty && key != '-' && value != '-') {
          fields[key] = value;
        }
      }
    }

    return fields;
  }

  void invalidateCache() {
    _cache = null;
  }
}
