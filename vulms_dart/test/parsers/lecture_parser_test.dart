import 'dart:io';
import 'package:test/test.dart';
import 'package:vulms_dart/src/parsers/lecture_parser.dart';
import 'package:vulms_dart/src/models/lecture.dart';

void main() {
  final fixture = File('test/fixtures/lectures_table.html').readAsStringSync();
  final emptyFixture = File('test/fixtures/empty_page.html').readAsStringSync();

  group('LectureParser.parse()', () {
    group('table layout', () {
      test('parses 3 lectures', () {
        final result = LectureParser.parse(fixture);
        expect(result, hasLength(3));
      });

      test('extracts OOP Introduction details', () {
        final result = LectureParser.parse(fixture);
        final l1 = result.firstWhere(
          (l) => l.title.contains('OOP Introduction'),
        );
        expect(l1.courseCode, 'CS101');
        expect(l1.title, 'OOP Introduction');
        expect(l1.type, 'Video');
        expect(l1.duration, '45 min');
        expect(l1.week, 1);
      });

      test('extracts Data Types lecture details', () {
        final result = LectureParser.parse(fixture);
        final l2 = result.firstWhere(
          (l) => l.title.contains('Data Types'),
        );
        expect(l2.title, 'Data Types and Variables');
        expect(l2.type, 'Video');
        expect(l2.duration, '30 min');
        expect(l2.week, 1);
      });

      test('extracts Control Structures lecture details', () {
        final result = LectureParser.parse(fixture);
        final l3 = result.firstWhere(
          (l) => l.title.contains('Control'),
        );
        expect(l3.title, 'Control Structures');
        expect(l3.type, 'Video');
        expect(l3.duration, '55 min');
        expect(l3.week, 2);
      });
    });

    group('status determination', () {
      test('Watched maps to watched', () {
        final result = LectureParser.parse(fixture);
        final l1 = result.firstWhere(
          (l) => l.title.contains('OOP Introduction'),
        );
        expect(l1.status, LectureStatus.watched);
      });

      test('New maps to newLecture', () {
        final result = LectureParser.parse(fixture);
        final l2 = result.firstWhere(
          (l) => l.title.contains('Data Types'),
        );
        expect(l2.status, LectureStatus.newLecture);
      });

      test('Not yet viewed maps to unwatched', () {
        final result = LectureParser.parse(fixture);
        final l3 = result.firstWhere(
          (l) => l.title.contains('Control'),
        );
        expect(l3.status, LectureStatus.unwatched);
      });
    });

    group('week number extraction', () {
      test('extracts week number from "Week 1"', () {
        final result = LectureParser.parse(fixture);
        final l1 = result.firstWhere(
          (l) => l.title.contains('OOP Introduction'),
        );
        expect(l1.week, 1);
      });

      test('extracts week number from "Week 2"', () {
        final result = LectureParser.parse(fixture);
        final l3 = result.firstWhere(
          (l) => l.title.contains('Control'),
        );
        expect(l3.week, 2);
      });
    });

    group('deduplication', () {
      test('removes duplicate lectures', () {
        const html = '<html><body>'
            '<h3 class="m-subheader__title">CS101</h3>'
            '<table>'
            '<tr><th>Title</th><th>Type</th><th>Duration</th><th>Week</th><th>Status</th></tr>'
            '<tr><td>OOP Intro</td><td>Video</td><td>45 min</td><td>Week 1</td><td>Watched</td></tr>'
            '<tr><td>OOP Intro</td><td>Video</td><td>45 min</td><td>Week 1</td><td>Watched</td></tr>'
            '</table></body></html>';
        final result = LectureParser.parse(html);
        expect(result, hasLength(1));
      });
    });

    group('empty page', () {
      test('returns empty list for page with no lectures', () {
        final result = LectureParser.parse(emptyFixture);
        expect(result, isEmpty);
      });
    });
  });
}
