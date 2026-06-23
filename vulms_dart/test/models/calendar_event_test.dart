import 'package:test/test.dart';
import 'package:vulms_dart/src/models/calendar_event.dart';

void main() {
  group('CalendarEvent', () {
    final baseDate = DateTime(2026, 7, 15, 10, 0);

    group('fromJson', () {
      test('parses valid JSON with all fields', () {
        final json = {
          'courseCode': 'CS101',
          'title': 'Assignment 1 Due',
          'date': '2026-07-15T10:00:00.000',
          'type': 'assignment',
          'description': 'Submit via VULMS portal',
          'time': '23:59',
        };
        final result = CalendarEvent.fromJson(json);

        expect(result.courseCode, equals('CS101'));
        expect(result.title, equals('Assignment 1 Due'));
        expect(result.date, equals(DateTime.parse('2026-07-15T10:00:00.000')));
        expect(result.type, equals(CalendarEventType.assignment));
        expect(result.description, equals('Submit via VULMS portal'));
        expect(result.time, equals('23:59'));
      });

      test('parses valid JSON with only required fields', () {
        final json = {
          'courseCode': 'CS101',
          'title': 'Assignment 1 Due',
          'date': '2026-07-15T10:00:00.000',
        };
        final result = CalendarEvent.fromJson(json);

        expect(result.courseCode, equals('CS101'));
        expect(result.title, equals('Assignment 1 Due'));
        expect(result.date, equals(DateTime.parse('2026-07-15T10:00:00.000')));
        expect(result.type, isNull);
        expect(result.description, isNull);
        expect(result.time, isNull);
      });

      test('roundtrip fromJson(toJson()) equals original', () {
        final json = {
          'courseCode': 'CS101',
          'title': 'Quiz 1',
          'date': '2026-07-15T10:00:00.000',
          'type': 'quiz',
          'description': 'Quiz on OOP basics',
          'time': '14:00',
        };
        final original = CalendarEvent.fromJson(json);
        final roundtripped = CalendarEvent.fromJson(original.toJson());

        expect(roundtripped, equals(original));
      });
    });

    group('toJson', () {
      test('produces correct keys', () {
        final event = CalendarEvent(
          courseCode: 'CS101',
          title: 'Assignment 1 Due',
          date: baseDate,
        );
        final json = event.toJson();

        expect(
          json.keys,
          containsAll([
            'courseCode',
            'title',
            'date',
            'type',
            'description',
            'time',
          ]),
        );
      });

      test('serializes DateTime as ISO 8601 string', () {
        final event = CalendarEvent(
          courseCode: 'CS101',
          title: 'Assignment 1 Due',
          date: baseDate,
        );
        final json = event.toJson();

        expect(json['date'], equals(baseDate.toIso8601String()));
      });

      test('serializes type as string', () {
        final event = CalendarEvent(
          courseCode: 'CS101',
          title: 'Assignment 1 Due',
          date: baseDate,
          type: CalendarEventType.quiz,
        );
        final json = event.toJson();

        expect(json['type'], equals('quiz'));
      });

      test('null type is included as null in JSON', () {
        final event = CalendarEvent(
          courseCode: 'CS101',
          title: 'Assignment 1 Due',
          date: baseDate,
        );
        final json = event.toJson();

        expect(json['type'], isNull);
        expect(json['description'], isNull);
        expect(json['time'], isNull);
      });
    });

    group('CalendarEventType enum', () {
      test('all enum values exist', () {
        expect(CalendarEventType.values, contains(CalendarEventType.assignment));
        expect(CalendarEventType.values, contains(CalendarEventType.quiz));
        expect(CalendarEventType.values, contains(CalendarEventType.gdb));
        expect(CalendarEventType.values, contains(CalendarEventType.lecture));
        expect(CalendarEventType.values, contains(CalendarEventType.exam));
        expect(CalendarEventType.values, contains(CalendarEventType.other));
      });

      test('has exactly 6 values', () {
        expect(CalendarEventType.values.length, equals(6));
      });

      test('fromJson parses all enum values', () {
        for (final type in CalendarEventType.values) {
          final json = {
            'courseCode': 'CS101',
            'title': 'Event',
            'date': '2026-07-15T10:00:00.000',
            'type': type.name,
          };
          final event = CalendarEvent.fromJson(json);
          expect(event.type, equals(type));
        }
      });
    });

    group('nullable fields', () {
      test('type, description, and time can be null', () {
        final event = CalendarEvent(
          courseCode: 'CS101',
          title: 'Event',
          date: baseDate,
        );

        expect(event.type, isNull);
        expect(event.description, isNull);
        expect(event.time, isNull);
      });

      test('type, description, and time can be set', () {
        final event = CalendarEvent(
          courseCode: 'CS101',
          title: 'Event',
          date: baseDate,
          type: CalendarEventType.exam,
          description: 'Final exam',
          time: '09:00',
        );

        expect(event.type, equals(CalendarEventType.exam));
        expect(event.description, equals('Final exam'));
        expect(event.time, equals('09:00'));
      });
    });

    group('equality', () {
      test('two events with same fields are equal', () {
        final a = CalendarEvent(
          courseCode: 'CS101',
          title: 'Event',
          date: baseDate,
        );
        final b = CalendarEvent(
          courseCode: 'CS101',
          title: 'Event',
          date: baseDate,
        );

        expect(a, equals(b));
        expect(a.hashCode, equals(b.hashCode));
      });

      test('two events with different fields are not equal', () {
        final a = CalendarEvent(
          courseCode: 'CS101',
          title: 'Event 1',
          date: baseDate,
        );
        final b = CalendarEvent(
          courseCode: 'CS101',
          title: 'Event 2',
          date: baseDate,
        );

        expect(a, isNot(equals(b)));
      });
    });

    group('toString', () {
      test('returns a non-empty string', () {
        final event = CalendarEvent(
          courseCode: 'CS101',
          title: 'Assignment Due',
          date: baseDate,
        );
        final str = event.toString();

        expect(str, isA<String>());
        expect(str, isNotEmpty);
        expect(str, contains('Assignment Due'));
      });
    });
  });
}
