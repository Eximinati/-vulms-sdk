import 'package:test/test.dart';
import 'package:vulms_dart/src/models/lecture.dart';

void main() {
  group('Lecture', () {
    group('fromJson', () {
      test('parses valid JSON with all fields', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'week': 3,
          'title': 'Inheritance',
          'type': 'video',
          'duration': '45:00',
          'status': 'watched',
          'url': 'https://example.com/lecture/1',
        };
        final result = Lecture.fromJson(json);

        expect(result.courseCode, equals('CS101'));
        expect(result.courseTitle, equals('OOP'));
        expect(result.week, equals(3));
        expect(result.title, equals('Inheritance'));
        expect(result.type, equals('video'));
        expect(result.duration, equals('45:00'));
        expect(result.status, equals(LectureStatus.watched));
        expect(result.url, equals('https://example.com/lecture/1'));
      });

      test('parses valid JSON with only required fields', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'Inheritance',
        };
        final result = Lecture.fromJson(json);

        expect(result.courseCode, equals('CS101'));
        expect(result.courseTitle, equals('OOP'));
        expect(result.title, equals('Inheritance'));
        expect(result.week, isNull);
        expect(result.type, isNull);
        expect(result.duration, isNull);
        expect(result.status, equals(LectureStatus.newLecture));
        expect(result.url, isNull);
      });

      test('roundtrip fromJson(toJson()) equals original', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'week': 3,
          'title': 'Inheritance',
          'type': 'video',
          'duration': '45:00',
          'status': 'unwatched',
          'url': 'https://example.com/lecture/1',
        };
        final original = Lecture.fromJson(json);
        final roundtripped = Lecture.fromJson(original.toJson());

        expect(roundtripped, equals(original));
      });
    });

    group('toJson', () {
      test('produces correct keys', () {
        const lecture = Lecture(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Inheritance',
        );
        final json = lecture.toJson();

        expect(
          json.keys,
          containsAll([
            'courseCode',
            'courseTitle',
            'week',
            'title',
            'type',
            'duration',
            'status',
            'url',
          ]),
        );
      });

      test('serializes week as int', () {
        const lecture = Lecture(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Inheritance',
          week: 3,
        );
        final json = lecture.toJson();

        expect(json['week'], equals(3));
        expect(json['week'], isA<int>());
      });

      test('serializes status as string', () {
        const lecture = Lecture(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Inheritance',
          status: LectureStatus.watched,
        );
        final json = lecture.toJson();

        expect(json['status'], equals('watched'));
      });

      test('null fields are included as null in JSON', () {
        const lecture = Lecture(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Inheritance',
        );
        final json = lecture.toJson();

        expect(json['week'], isNull);
        expect(json['type'], isNull);
        expect(json['duration'], isNull);
        expect(json['url'], isNull);
      });
    });

    group('default values', () {
      test('status defaults to newLecture', () {
        const lecture = Lecture(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Inheritance',
        );

        expect(lecture.status, equals(LectureStatus.newLecture));
      });

      test('status defaults to newLecture from minimal JSON', () {
        final lecture = Lecture.fromJson({
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'Inheritance',
        });

        expect(lecture.status, equals(LectureStatus.newLecture));
      });
    });

    group('LectureStatus enum', () {
      test('all enum values exist', () {
        expect(LectureStatus.values, contains(LectureStatus.newLecture));
        expect(LectureStatus.values, contains(LectureStatus.watched));
        expect(LectureStatus.values, contains(LectureStatus.unwatched));
      });

      test('has exactly 3 values', () {
        expect(LectureStatus.values.length, equals(3));
      });

      test('fromJson parses all enum values', () {
        for (final status in LectureStatus.values) {
          final json = {
            'courseCode': 'CS101',
            'courseTitle': 'OOP',
            'title': 'Inheritance',
            'status': status.name,
          };
          final lecture = Lecture.fromJson(json);
          expect(lecture.status, equals(status));
        }
      });
    });

    group('nullable fields', () {
      test('all nullable fields can be null', () {
        const lecture = Lecture(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Inheritance',
        );

        expect(lecture.week, isNull);
        expect(lecture.type, isNull);
        expect(lecture.duration, isNull);
        expect(lecture.url, isNull);
      });

      test('all nullable fields can be set', () {
        const lecture = Lecture(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Inheritance',
          week: 3,
          type: 'video',
          duration: '45:00',
          url: 'https://example.com/lecture/1',
        );

        expect(lecture.week, equals(3));
        expect(lecture.type, equals('video'));
        expect(lecture.duration, equals('45:00'));
        expect(lecture.url, equals('https://example.com/lecture/1'));
      });
    });

    group('equality', () {
      test('two lectures with same fields are equal', () {
        const a = Lecture(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Inheritance',
        );
        const b = Lecture(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Inheritance',
        );

        expect(a, equals(b));
        expect(a.hashCode, equals(b.hashCode));
      });

      test('two lectures with different fields are not equal', () {
        const a = Lecture(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Inheritance',
        );
        const b = Lecture(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Polymorphism',
        );

        expect(a, isNot(equals(b)));
      });
    });

    group('toString', () {
      test('returns a non-empty string', () {
        const lecture = Lecture(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'Inheritance',
        );
        final str = lecture.toString();

        expect(str, isA<String>());
        expect(str, isNotEmpty);
        expect(str, contains('Inheritance'));
      });
    });
  });
}
