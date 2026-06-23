import 'package:test/test.dart';
import 'package:vulms_dart/src/models/grade.dart';

void main() {
  group('Grade', () {
    group('fromJson', () {
      test('parses valid JSON with all fields', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'Assignment 1',
          'type': 'assignment',
          'totalMarks': 100.0,
          'obtainedMarks': 85.0,
          'percentage': '85.0',
          'letterGrade': 'A',
          'datePosted': '2026-07-10T12:00:00.000',
        };
        final result = Grade.fromJson(json);

        expect(result.courseCode, equals('CS101'));
        expect(result.courseTitle, equals('OOP'));
        expect(result.title, equals('Assignment 1'));
        expect(result.type, equals('assignment'));
        expect(result.totalMarks, equals(100.0));
        expect(result.obtainedMarks, equals(85.0));
        expect(result.percentage, equals('85.0'));
        expect(result.letterGrade, equals('A'));
        expect(result.datePosted, equals(DateTime.parse('2026-07-10T12:00:00.000')));
      });

      test('parses valid JSON with only required fields', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'Assignment 1',
        };
        final result = Grade.fromJson(json);

        expect(result.courseCode, equals('CS101'));
        expect(result.courseTitle, equals('OOP'));
        expect(result.title, equals('Assignment 1'));
        expect(result.type, isNull);
        expect(result.totalMarks, isNull);
        expect(result.obtainedMarks, isNull);
        expect(result.percentage, isNull);
        expect(result.letterGrade, isNull);
        expect(result.datePosted, isNull);
      });

      test('roundtrip fromJson(toJson()) equals original', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'Assignment 1',
          'type': 'assignment',
          'totalMarks': 100.0,
          'obtainedMarks': 85.0,
          'percentage': '85.0',
          'letterGrade': 'A',
          'datePosted': '2026-07-10T12:00:00.000',
        };
        final original = Grade.fromJson(json);
        final roundtripped = Grade.fromJson(original.toJson());

        expect(roundtripped, equals(original));
      });
    });

    group('toJson', () {
      test('produces correct keys', () {
        const grade = Grade(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );
        final json = grade.toJson();

        expect(
          json.keys,
          containsAll([
            'courseCode',
            'courseTitle',
            'title',
            'type',
            'totalMarks',
            'obtainedMarks',
            'percentage',
            'letterGrade',
            'datePosted',
          ]),
        );
      });

      test('serializes DateTime as ISO 8601 string', () {
        final datePosted = DateTime(2026, 7, 10, 12);
        final grade = Grade(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
          datePosted: datePosted,
        );
        final json = grade.toJson();

        expect(json['datePosted'], equals(datePosted.toIso8601String()));
      });

      test('null fields are included as null in JSON', () {
        const grade = Grade(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );
        final json = grade.toJson();

        expect(json['type'], isNull);
        expect(json['totalMarks'], isNull);
        expect(json['obtainedMarks'], isNull);
        expect(json['percentage'], isNull);
        expect(json['letterGrade'], isNull);
        expect(json['datePosted'], isNull);
      });
    });

    group('nullable fields', () {
      test('all nullable fields can be null', () {
        const grade = Grade(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );

        expect(grade.type, isNull);
        expect(grade.totalMarks, isNull);
        expect(grade.obtainedMarks, isNull);
        expect(grade.percentage, isNull);
        expect(grade.letterGrade, isNull);
        expect(grade.datePosted, isNull);
      });

      test('all nullable fields can be set', () {
        final now = DateTime.now();
        final grade = Grade(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
          type: 'quiz',
          totalMarks: 50.0,
          obtainedMarks: 45.0,
          percentage: '90.0',
          letterGrade: 'A+',
          datePosted: now,
        );

        expect(grade.type, equals('quiz'));
        expect(grade.totalMarks, equals(50.0));
        expect(grade.obtainedMarks, equals(45.0));
        expect(grade.percentage, equals('90.0'));
        expect(grade.letterGrade, equals('A+'));
        expect(grade.datePosted, equals(now));
      });
    });

    group('equality', () {
      test('two grades with same fields are equal', () {
        const a = Grade(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );
        const b = Grade(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );

        expect(a, equals(b));
        expect(a.hashCode, equals(b.hashCode));
      });

      test('two grades with different fields are not equal', () {
        const a = Grade(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );
        const b = Grade(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 2',
        );

        expect(a, isNot(equals(b)));
      });
    });

    group('toString', () {
      test('returns a non-empty string', () {
        const grade = Grade(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );
        final str = grade.toString();

        expect(str, isA<String>());
        expect(str, isNotEmpty);
        expect(str, contains('Assignment 1'));
      });
    });
  });
}
