import 'package:test/test.dart';
import 'package:vulms_dart/src/models/assignment.dart';

void main() {
  group('Assignment', () {
    group('fromJson', () {
      test('parses valid JSON with all fields', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'Assignment 1',
          'lesson': 'Lesson 1',
          'dueDate': '2026-07-01T23:59:00.000',
          'totalMarks': 100.0,
          'status': 'submitted',
          'submitDate': '2026-06-30T10:00:00.000',
          'fileSize': '2.5 MB',
          'obtainedMarks': 85.0,
        };
        final result = Assignment.fromJson(json);

        expect(result.courseCode, equals('CS101'));
        expect(result.courseTitle, equals('OOP'));
        expect(result.title, equals('Assignment 1'));
        expect(result.lesson, equals('Lesson 1'));
        expect(result.dueDate, equals(DateTime.parse('2026-07-01T23:59:00.000')));
        expect(result.totalMarks, equals(100.0));
        expect(result.status, equals(AssignmentStatus.submitted));
        expect(result.submitDate, equals(DateTime.parse('2026-06-30T10:00:00.000')));
        expect(result.fileSize, equals('2.5 MB'));
        expect(result.obtainedMarks, equals(85.0));
      });

      test('parses valid JSON with only required fields', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'Assignment 1',
        };
        final result = Assignment.fromJson(json);

        expect(result.courseCode, equals('CS101'));
        expect(result.courseTitle, equals('OOP'));
        expect(result.title, equals('Assignment 1'));
        expect(result.lesson, isNull);
        expect(result.dueDate, isNull);
        expect(result.totalMarks, isNull);
        expect(result.status, equals(AssignmentStatus.pending));
        expect(result.submitDate, isNull);
        expect(result.fileSize, isNull);
        expect(result.obtainedMarks, isNull);
      });

      test('roundtrip fromJson(toJson()) equals original', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'Assignment 1',
          'lesson': 'Lesson 1',
          'dueDate': '2026-07-01T23:59:00.000',
          'totalMarks': 100.0,
          'status': 'attempted',
          'submitDate': '2026-06-30T10:00:00.000',
          'fileSize': '2.5 MB',
          'obtainedMarks': 85.0,
        };
        final original = Assignment.fromJson(json);
        final roundtripped = Assignment.fromJson(original.toJson());

        expect(roundtripped, equals(original));
      });
    });

    group('toJson', () {
      test('produces correct keys', () {
        const assignment = Assignment(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );
        final json = assignment.toJson();

        expect(
          json.keys,
          containsAll([
            'courseCode',
            'courseTitle',
            'title',
            'lesson',
            'dueDate',
            'totalMarks',
            'status',
            'submitDate',
            'fileSize',
            'obtainedMarks',
          ]),
        );
      });

      test('serializes DateTime as ISO 8601 string', () {
        final dueDate = DateTime(2026, 7, 1, 23, 59);
        final assignment = Assignment(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
          dueDate: dueDate,
        );
        final json = assignment.toJson();

        expect(json['dueDate'], equals(dueDate.toIso8601String()));
      });

      test('serializes status as string', () {
        const assignment = Assignment(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
          status: AssignmentStatus.submitted,
        );
        final json = assignment.toJson();

        expect(json['status'], equals('submitted'));
      });

      test('null fields are included as null in JSON', () {
        const assignment = Assignment(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );
        final json = assignment.toJson();

        expect(json['lesson'], isNull);
        expect(json['dueDate'], isNull);
        expect(json['totalMarks'], isNull);
        expect(json['submitDate'], isNull);
        expect(json['fileSize'], isNull);
        expect(json['obtainedMarks'], isNull);
      });
    });

    group('default values', () {
      test('status defaults to pending', () {
        const assignment = Assignment(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );

        expect(assignment.status, equals(AssignmentStatus.pending));
      });

      test('status defaults to pending from minimal JSON', () {
        final assignment = Assignment.fromJson({
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'Assignment 1',
        });

        expect(assignment.status, equals(AssignmentStatus.pending));
      });
    });

    group('AssignmentStatus enum', () {
      test('all enum values exist', () {
        expect(AssignmentStatus.values, contains(AssignmentStatus.pending));
        expect(AssignmentStatus.values, contains(AssignmentStatus.submitted));
        expect(AssignmentStatus.values, contains(AssignmentStatus.attempted));
        expect(AssignmentStatus.values, contains(AssignmentStatus.missed));
        expect(AssignmentStatus.values, contains(AssignmentStatus.resultDeclared));
      });

      test('has exactly 5 values', () {
        expect(AssignmentStatus.values.length, equals(5));
      });

      test('fromJson parses all enum values', () {
        for (final status in AssignmentStatus.values) {
          final json = {
            'courseCode': 'CS101',
            'courseTitle': 'OOP',
            'title': 'Assignment 1',
            'status': status.name,
          };
          final assignment = Assignment.fromJson(json);
          expect(assignment.status, equals(status));
        }
      });
    });

    group('nullable fields', () {
      test('all nullable fields can be null', () {
        const assignment = Assignment(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );

        expect(assignment.lesson, isNull);
        expect(assignment.dueDate, isNull);
        expect(assignment.totalMarks, isNull);
        expect(assignment.submitDate, isNull);
        expect(assignment.fileSize, isNull);
        expect(assignment.obtainedMarks, isNull);
      });

      test('all nullable fields can be set', () {
        final now = DateTime.now();
        final assignment = Assignment(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
          lesson: 'Lesson 1',
          dueDate: now,
          totalMarks: 100.0,
          submitDate: now,
          fileSize: '5 MB',
          obtainedMarks: 90.0,
        );

        expect(assignment.lesson, equals('Lesson 1'));
        expect(assignment.dueDate, equals(now));
        expect(assignment.totalMarks, equals(100.0));
        expect(assignment.submitDate, equals(now));
        expect(assignment.fileSize, equals('5 MB'));
        expect(assignment.obtainedMarks, equals(90.0));
      });
    });

    group('equality', () {
      test('two assignments with same fields are equal', () {
        const a = Assignment(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );
        const b = Assignment(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );

        expect(a, equals(b));
        expect(a.hashCode, equals(b.hashCode));
      });

      test('two assignments with different fields are not equal', () {
        const a = Assignment(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );
        const b = Assignment(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 2',
        );

        expect(a, isNot(equals(b)));
      });
    });

    group('toString', () {
      test('returns a non-empty string', () {
        const assignment = Assignment(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Assignment 1',
        );
        final str = assignment.toString();

        expect(str, isA<String>());
        expect(str, isNotEmpty);
        expect(str, contains('Assignment 1'));
      });
    });
  });
}
