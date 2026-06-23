import 'package:html/parser.dart' as html_parser;

import '../models/course.dart';
import '../utils/logger.dart';
import '../utils/dom_helper.dart';

/// Parses course information from VULMS HTML.
class CourseParser {
  CourseParser._();

  /// Parse enrolled courses from Home.aspx HTML.
  static List<Course> parseFromHome(String html, {VulmsLogger? logger}) {
    final doc = html_parser.parse(html);
    final seen = <String>{};
    final courses = <Course>[];

    logger?.debug('parseCoursesFromHome: HTML length=${html.length}');

    // Try course links first
    final links = doc.querySelectorAll('a[href*="Course.aspx"]');
    for (final el in links) {
      final href = el.attributes['href'] ?? '';
      final text = el.text.trim();
      if (text.isEmpty && href.isEmpty) continue;

      final code = _extractCodeFromHref(href) ?? _extractCodeFromText(text);
      if (code == null || seen.contains(code)) continue;

      seen.add(code);
      courses.add(Course(code: code, title: _extractTitle(text, code)));
      logger?.debug('  Course from link: $code - ${_extractTitle(text, code)}');
    }

    if (courses.isNotEmpty) {
      logger?.info('parseCoursesFromHome: ${courses.length} courses from links');
      return courses;
    }

    // Fallback: course cards from dashboard
    final assignmentButtons =
        doc.querySelectorAll('[id^="MainContent_gvCourseList_ibtnAssignments_"]');
    for (final el in assignmentButtons) {
      final card = closest(el, '.m-portlet');
      if (card == null) continue;
      final h3 = card.querySelector('h3');
      if (h3 == null) continue;
      final h3Text = h3.text.trim();
      final code = _extractCodeFromText(h3Text);
      if (code != null && !seen.contains(code)) {
        seen.add(code);
        courses.add(Course(code: code, title: _extractTitle(h3Text, code)));
        logger?.debug(
            '  Course from portlet: $code - ${_extractTitle(h3Text, code)}');
      }
    }

    logger?.info(
        'parseCoursesFromHome: ${courses.length} courses from portlets');
    return courses;
  }

  static String? _extractCodeFromHref(String href) {
    final match = RegExp(r'[?&]code=([^&]+)', caseSensitive: false)
        .firstMatch(href);
    return match?.group(1)?.toUpperCase();
  }

  static String? _extractCodeFromText(String text) {
    final match = RegExp(r'^([A-Z]{2,4}\d{3}[A-Z]?)\b').firstMatch(text);
    return match?.group(1)?.toUpperCase();
  }

  static String _extractTitle(String fullText, String code) {
    final escaped = code.replaceAll(RegExp(r'[.*+?^${}()|[\]\\]'), r'\\$&');
    final title = fullText
        .replaceFirst(RegExp('^$escaped\\s*-?\\s*', caseSensitive: false), '')
        .trim();
    final firstLine = title.split('\n').first.trim();
    return firstLine.isEmpty ? code : firstLine;
  }
}
