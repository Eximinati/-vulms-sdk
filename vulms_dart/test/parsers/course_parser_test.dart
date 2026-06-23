import 'dart:io';
import 'package:test/test.dart';
import 'package:vulms_dart/src/parsers/course_parser.dart';

void main() {
  final fixture = File('test/fixtures/courses_links.html').readAsStringSync();
  final emptyFixture = File('test/fixtures/empty_page.html').readAsStringSync();

  group('CourseParser.parseFromHome()', () {
    group('link-based courses', () {
      test('parses 3 courses', () {
        final result = CourseParser.parseFromHome(fixture);
        expect(result, hasLength(3));
      });

      test('extracts CS101 course', () {
        final result = CourseParser.parseFromHome(fixture);
        final c1 = result.firstWhere((c) => c.code == 'CS101');
        expect(c1.code, 'CS101');
        expect(c1.title, 'Object Oriented Programming');
      });

      test('extracts MGT301 course', () {
        final result = CourseParser.parseFromHome(fixture);
        final c2 = result.firstWhere((c) => c.code == 'MGT301');
        expect(c2.code, 'MGT301');
        expect(c2.title, 'Principles of Management');
      });

      test('extracts ENG101 course', () {
        final result = CourseParser.parseFromHome(fixture);
        final c3 = result.firstWhere((c) => c.code == 'ENG101');
        expect(c3.code, 'ENG101');
        expect(c3.title, 'English Composition');
      });
    });

    group('portlet fallback', () {
      test('parses courses from portlet assignment buttons', () {
        const html = '<html><body>'
            '<div class="m-portlet">'
            '<h3>CS201 - Data Structures</h3>'
            '<input type="submit" id="MainContent_gvCourseList_ibtnAssignments_0" />'
            '</div>'
            '<div class="m-portlet">'
            '<h3>CS301 - Algorithms</h3>'
            '<input type="submit" id="MainContent_gvCourseList_ibtnAssignments_1" />'
            '</div>'
            '</body></html>';
        final result = CourseParser.parseFromHome(html);
        expect(result, hasLength(2));
        expect(result.any((c) => c.code == 'CS201'), isTrue);
        expect(result.any((c) => c.code == 'CS301'), isTrue);
      });
    });

    group('empty page', () {
      test('returns empty list for page with no courses', () {
        final result = CourseParser.parseFromHome(emptyFixture);
        expect(result, isEmpty);
      });
    });

    group('deduplication', () {
      test('removes duplicate courses by code', () {
        const html = '<html><body>'
            '<a href="/Course.aspx?code=CS101">CS101 - OOP</a>'
            '<a href="/Course.aspx?code=CS101">CS101 - OOP Again</a>'
            '<a href="/Course.aspx?code=MGT301">MGT301 - Mgmt</a>'
            '</body></html>';
        final result = CourseParser.parseFromHome(html);
        expect(result, hasLength(2));
        final cs101 = result.firstWhere((c) => c.code == 'CS101');
        expect(cs101.title, 'OOP');
      });
    });

    test('extracts course code from href query parameter', () {
      const html = '<html><body>'
          '<a href="/Course.aspx?code=CS401">Some Course</a>'
          '</body></html>';
      final result = CourseParser.parseFromHome(html);
      expect(result, hasLength(1));
      expect(result.first.code, 'CS401');
      expect(result.first.title, 'Some Course');
    });
  });
}
