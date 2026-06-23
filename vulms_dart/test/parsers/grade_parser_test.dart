import 'dart:io';
import 'package:test/test.dart';
import 'package:vulms_dart/src/parsers/grade_parser.dart';

void main() {
  final fixture = File('test/fixtures/grades_table.html').readAsStringSync();
  final emptyFixture = File('test/fixtures/empty_page.html').readAsStringSync();

  group('GradeParser.parse()', () {
    group('table with sub-header rows', () {
      test('parses grades for 2 courses', () {
        final result = GradeParser.parse(fixture);
        expect(result, hasLength(3));
      });

      test('parses CS101 grades', () {
        final result = GradeParser.parse(fixture);
        final cs101Grades =
            result.where((g) => g.courseCode == 'CS101').toList();
        expect(cs101Grades, hasLength(2));
      });

      test('parses Assignment 1 grade for CS101', () {
        final result = GradeParser.parse(fixture);
        final a1 = result.firstWhere(
          (g) => g.title == 'Assignment 1' && g.courseCode == 'CS101',
        );
        expect(a1.courseTitle, 'Object Oriented Programming');
        expect(a1.type, 'Assignment');
        expect(a1.totalMarks, 20.0);
        expect(a1.obtainedMarks, 18.0);
        expect(a1.letterGrade, 'A');
        expect(a1.datePosted!.year, 2024);
        expect(a1.datePosted!.month, 1);
        expect(a1.datePosted!.day, 15);
      });

      test('parses Quiz 1 grade for CS101', () {
        final result = GradeParser.parse(fixture);
        final q1 = result.firstWhere(
          (g) => g.title == 'Quiz 1' && g.courseCode == 'CS101',
        );
        expect(q1.type, 'Quiz');
        expect(q1.totalMarks, 10.0);
        expect(q1.obtainedMarks, 8.0);
        expect(q1.letterGrade, 'B+');
      });

      test('parses MGT301 grade', () {
        final result = GradeParser.parse(fixture);
        final mgt = result.firstWhere(
          (g) => g.courseCode == 'MGT301',
        );
        expect(mgt.courseTitle, 'Principles of Management');
        expect(mgt.title, 'Assignment 1');
        expect(mgt.type, 'Assignment');
        expect(mgt.totalMarks, 25.0);
        expect(mgt.obtainedMarks, 20.0);
        expect(mgt.letterGrade, 'B');
      });
    });

    group('empty page', () {
      test('returns empty list for page with no grades', () {
        final result = GradeParser.parse(emptyFixture);
        expect(result, isEmpty);
      });
    });
  });
}
