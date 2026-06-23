import 'package:test/test.dart';
import 'package:vulms_dart/src/models/quiz.dart';

void main() {
  group('Quiz', () {
    group('fromJson', () {
      test('parses valid JSON with all fields', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'Quiz 1',
          'startDate': '2026-06-25T10:00:00.000',
          'endDate': '2026-06-25T11:00:00.000',
          'totalMarks': 30.0,
          'obtainedMarks': 25.0,
          'availabilityStatus': 'open',
          'submissionStatus': 'submitted',
          'resultStatus': 'declared',
          'submitDate': '2026-06-25T10:30:00.000',
        };
        final result = Quiz.fromJson(json);

        expect(result.courseCode, equals('CS101'));
        expect(result.courseTitle, equals('OOP'));
        expect(result.title, equals('Quiz 1'));
        expect(result.startDate, equals(DateTime.parse('2026-06-25T10:00:00.000')));
        expect(result.endDate, equals(DateTime.parse('2026-06-25T11:00:00.000')));
        expect(result.totalMarks, equals(30.0));
        expect(result.obtainedMarks, equals(25.0));
        expect(result.availabilityStatus, equals(QuizAvailabilityStatus.open));
        expect(result.submissionStatus, equals(QuizSubmissionStatus.submitted));
        expect(result.resultStatus, equals(QuizResultStatus.declared));
        expect(result.submitDate, equals(DateTime.parse('2026-06-25T10:30:00.000')));
      });

      test('parses valid JSON with only required fields', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'Quiz 1',
        };
        final result = Quiz.fromJson(json);

        expect(result.courseCode, equals('CS101'));
        expect(result.courseTitle, equals('OOP'));
        expect(result.title, equals('Quiz 1'));
        expect(result.startDate, isNull);
        expect(result.endDate, isNull);
        expect(result.totalMarks, isNull);
        expect(result.obtainedMarks, isNull);
        expect(result.availabilityStatus, equals(QuizAvailabilityStatus.unknown));
        expect(result.submissionStatus, equals(QuizSubmissionStatus.unknown));
        expect(result.resultStatus, equals(QuizResultStatus.unknown));
        expect(result.submitDate, isNull);
      });

      test('roundtrip fromJson(toJson()) equals original', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'Quiz 1',
          'startDate': '2026-06-25T10:00:00.000',
          'endDate': '2026-06-25T11:00:00.000',
          'totalMarks': 30.0,
          'obtainedMarks': 25.0,
          'availabilityStatus': 'closed',
          'submissionStatus': 'notSubmitted',
          'resultStatus': 'pending',
          'submitDate': '2026-06-25T10:30:00.000',
        };
        final original = Quiz.fromJson(json);
        final roundtripped = Quiz.fromJson(original.toJson());

        expect(roundtripped, equals(original));
      });
    });

    group('toJson', () {
      test('produces correct keys', () {
        const quiz = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 1',
        );
        final json = quiz.toJson();

        expect(
          json.keys,
          containsAll([
            'courseCode',
            'courseTitle',
            'title',
            'startDate',
            'endDate',
            'totalMarks',
            'obtainedMarks',
            'availabilityStatus',
            'submissionStatus',
            'resultStatus',
            'submitDate',
          ]),
        );
      });

      test('serializes DateTime as ISO 8601 string', () {
        final startDate = DateTime(2026, 6, 25, 10);
        final endDate = DateTime(2026, 6, 25, 11);
        final quiz = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 1',
          startDate: startDate,
          endDate: endDate,
        );
        final json = quiz.toJson();

        expect(json['startDate'], equals(startDate.toIso8601String()));
        expect(json['endDate'], equals(endDate.toIso8601String()));
      });

      test('serializes enums as strings', () {
        const quiz = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 1',
          availabilityStatus: QuizAvailabilityStatus.open,
          submissionStatus: QuizSubmissionStatus.submitted,
          resultStatus: QuizResultStatus.declared,
        );
        final json = quiz.toJson();

        expect(json['availabilityStatus'], equals('open'));
        expect(json['submissionStatus'], equals('submitted'));
        expect(json['resultStatus'], equals('declared'));
      });

      test('null fields are included as null in JSON', () {
        const quiz = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 1',
        );
        final json = quiz.toJson();

        expect(json['startDate'], isNull);
        expect(json['endDate'], isNull);
        expect(json['totalMarks'], isNull);
        expect(json['obtainedMarks'], isNull);
        expect(json['submitDate'], isNull);
      });
    });

    group('default values', () {
      test('availabilityStatus defaults to unknown', () {
        const quiz = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 1',
        );

        expect(quiz.availabilityStatus, equals(QuizAvailabilityStatus.unknown));
      });

      test('submissionStatus defaults to unknown', () {
        const quiz = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 1',
        );

        expect(quiz.submissionStatus, equals(QuizSubmissionStatus.unknown));
      });

      test('resultStatus defaults to unknown', () {
        const quiz = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 1',
        );

        expect(quiz.resultStatus, equals(QuizResultStatus.unknown));
      });
    });

    group('QuizAvailabilityStatus enum', () {
      test('all enum values exist', () {
        expect(QuizAvailabilityStatus.values, contains(QuizAvailabilityStatus.open));
        expect(QuizAvailabilityStatus.values, contains(QuizAvailabilityStatus.closed));
        expect(QuizAvailabilityStatus.values, contains(QuizAvailabilityStatus.upcoming));
        expect(QuizAvailabilityStatus.values, contains(QuizAvailabilityStatus.unknown));
      });

      test('has exactly 4 values', () {
        expect(QuizAvailabilityStatus.values.length, equals(4));
      });

      test('fromJson parses all enum values', () {
        for (final status in QuizAvailabilityStatus.values) {
          final json = {
            'courseCode': 'CS101',
            'courseTitle': 'OOP',
            'title': 'Quiz 1',
            'availabilityStatus': status.name,
          };
          final quiz = Quiz.fromJson(json);
          expect(quiz.availabilityStatus, equals(status));
        }
      });
    });

    group('QuizSubmissionStatus enum', () {
      test('all enum values exist', () {
        expect(QuizSubmissionStatus.values, contains(QuizSubmissionStatus.submitted));
        expect(QuizSubmissionStatus.values, contains(QuizSubmissionStatus.notSubmitted));
        expect(QuizSubmissionStatus.values, contains(QuizSubmissionStatus.unknown));
      });

      test('has exactly 3 values', () {
        expect(QuizSubmissionStatus.values.length, equals(3));
      });

      test('fromJson parses all enum values', () {
        for (final status in QuizSubmissionStatus.values) {
          final json = {
            'courseCode': 'CS101',
            'courseTitle': 'OOP',
            'title': 'Quiz 1',
            'submissionStatus': status.name,
          };
          final quiz = Quiz.fromJson(json);
          expect(quiz.submissionStatus, equals(status));
        }
      });
    });

    group('QuizResultStatus enum', () {
      test('all enum values exist', () {
        expect(QuizResultStatus.values, contains(QuizResultStatus.declared));
        expect(QuizResultStatus.values, contains(QuizResultStatus.pending));
        expect(QuizResultStatus.values, contains(QuizResultStatus.unknown));
      });

      test('has exactly 3 values', () {
        expect(QuizResultStatus.values.length, equals(3));
      });

      test('fromJson parses all enum values', () {
        for (final status in QuizResultStatus.values) {
          final json = {
            'courseCode': 'CS101',
            'courseTitle': 'OOP',
            'title': 'Quiz 1',
            'resultStatus': status.name,
          };
          final quiz = Quiz.fromJson(json);
          expect(quiz.resultStatus, equals(status));
        }
      });
    });

    group('nullable fields', () {
      test('all nullable fields can be null', () {
        const quiz = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 1',
        );

        expect(quiz.startDate, isNull);
        expect(quiz.endDate, isNull);
        expect(quiz.totalMarks, isNull);
        expect(quiz.obtainedMarks, isNull);
        expect(quiz.submitDate, isNull);
      });

      test('all nullable fields can be set', () {
        final now = DateTime.now();
        final quiz = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 1',
          startDate: now,
          endDate: now.add(const Duration(hours: 1)),
          totalMarks: 50.0,
          obtainedMarks: 42.0,
          submitDate: now.add(const Duration(minutes: 30)),
        );

        expect(quiz.startDate, equals(now));
        expect(quiz.endDate, equals(now.add(const Duration(hours: 1))));
        expect(quiz.totalMarks, equals(50.0));
        expect(quiz.obtainedMarks, equals(42.0));
        expect(quiz.submitDate, equals(now.add(const Duration(minutes: 30))));
      });
    });

    group('equality', () {
      test('two quizzes with same fields are equal', () {
        const a = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 1',
        );
        const b = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 1',
        );

        expect(a, equals(b));
        expect(a.hashCode, equals(b.hashCode));
      });

      test('two quizzes with different fields are not equal', () {
        const a = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 1',
        );
        const b = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 2',
        );

        expect(a, isNot(equals(b)));
      });
    });

    group('toString', () {
      test('returns a non-empty string', () {
        const quiz = Quiz(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Quiz 1',
        );
        final str = quiz.toString();

        expect(str, isA<String>());
        expect(str, isNotEmpty);
        expect(str, contains('Quiz 1'));
      });
    });
  });
}
