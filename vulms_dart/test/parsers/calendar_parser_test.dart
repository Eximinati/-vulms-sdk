import 'dart:io';
import 'package:test/test.dart';
import 'package:vulms_dart/src/parsers/calendar_parser.dart';
import 'package:vulms_dart/src/models/calendar_event.dart';

void main() {
  final fixture =
      File('test/fixtures/calendar_table.html').readAsStringSync();
  final emptyFixture = File('test/fixtures/empty_page.html').readAsStringSync();

  group('CalendarParser.parse()', () {
    group('table view', () {
      test('parses 2 events', () {
        final result = CalendarParser.parse(fixture);
        expect(result, hasLength(2));
      });

      test('extracts first event details', () {
        final result = CalendarParser.parse(fixture);
        final e1 = result.firstWhere(
          (e) => e.title.contains('Assignment 1'),
        );
        expect(e1.courseCode, 'CS101');
        expect(e1.title, 'Assignment 1 Due');
        expect(e1.date.year, 2024);
        expect(e1.date.month, 1);
        expect(e1.date.day, 15);
      });

      test('extracts second event details', () {
        final result = CalendarParser.parse(fixture);
        final e2 = result.firstWhere(
          (e) => e.title.contains('Quiz 2'),
        );
        expect(e2.courseCode, 'MGT301');
        expect(e2.title, 'Quiz 2');
        expect(e2.date.year, 2024);
        expect(e2.date.month, 1);
        expect(e2.date.day, 20);
      });

      test('detects assignment event type', () {
        final result = CalendarParser.parse(fixture);
        final e1 = result.firstWhere(
          (e) => e.title.contains('Assignment 1'),
        );
        expect(e1.type, CalendarEventType.assignment);
      });

      test('detects quiz event type', () {
        final result = CalendarParser.parse(fixture);
        final e2 = result.firstWhere(
          (e) => e.title.contains('Quiz 2'),
        );
        expect(e2.type, CalendarEventType.quiz);
      });

      test('extracts time from date string', () {
        final result = CalendarParser.parse(fixture);
        final e1 = result.firstWhere(
          (e) => e.title.contains('Assignment 1'),
        );
        expect(e1.time, '3:30 PM');
      });
    });

    group('empty page', () {
      test('returns empty list for page with no events', () {
        final result = CalendarParser.parse(emptyFixture);
        expect(result, isEmpty);
      });
    });
  });
}
