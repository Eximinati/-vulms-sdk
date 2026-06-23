import 'package:test/test.dart';
import 'package:vulms_dart/src/models/gdb.dart';

void main() {
  group('Gdb', () {
    group('fromJson', () {
      test('parses valid JSON with all fields', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'GDB 1',
          'dueDate': '2026-07-05T23:59:00.000',
          'totalMarks': 50.0,
          'obtainedMarks': 40.0,
          'status': 'submitted',
        };
        final result = Gdb.fromJson(json);

        expect(result.courseCode, equals('CS101'));
        expect(result.courseTitle, equals('OOP'));
        expect(result.title, equals('GDB 1'));
        expect(result.dueDate, equals(DateTime.parse('2026-07-05T23:59:00.000')));
        expect(result.totalMarks, equals(50.0));
        expect(result.obtainedMarks, equals(40.0));
        expect(result.status, equals(GdbStatus.submitted));
      });

      test('parses valid JSON with only required fields', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'GDB 1',
        };
        final result = Gdb.fromJson(json);

        expect(result.courseCode, equals('CS101'));
        expect(result.courseTitle, equals('OOP'));
        expect(result.title, equals('GDB 1'));
        expect(result.dueDate, isNull);
        expect(result.totalMarks, isNull);
        expect(result.obtainedMarks, isNull);
        expect(result.status, equals(GdbStatus.pending));
      });

      test('roundtrip fromJson(toJson()) equals original', () {
        final json = {
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'GDB 1',
          'dueDate': '2026-07-05T23:59:00.000',
          'totalMarks': 50.0,
          'obtainedMarks': 40.0,
          'status': 'attempted',
        };
        final original = Gdb.fromJson(json);
        final roundtripped = Gdb.fromJson(original.toJson());

        expect(roundtripped, equals(original));
      });
    });

    group('toJson', () {
      test('produces correct keys', () {
        const gdb = Gdb(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'GDB 1',
        );
        final json = gdb.toJson();

        expect(
          json.keys,
          containsAll([
            'courseCode',
            'courseTitle',
            'title',
            'dueDate',
            'totalMarks',
            'obtainedMarks',
            'status',
          ]),
        );
      });

      test('serializes DateTime as ISO 8601 string', () {
        final dueDate = DateTime(2026, 7, 5, 23, 59);
        final gdb = Gdb(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'GDB 1',
          dueDate: dueDate,
        );
        final json = gdb.toJson();

        expect(json['dueDate'], equals(dueDate.toIso8601String()));
      });

      test('serializes status as string', () {
        const gdb = Gdb(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'GDB 1',
          status: GdbStatus.submitted,
        );
        final json = gdb.toJson();

        expect(json['status'], equals('submitted'));
      });

      test('null fields are included as null in JSON', () {
        const gdb = Gdb(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'GDB 1',
        );
        final json = gdb.toJson();

        expect(json['dueDate'], isNull);
        expect(json['totalMarks'], isNull);
        expect(json['obtainedMarks'], isNull);
      });
    });

    group('default values', () {
      test('status defaults to pending', () {
        const gdb = Gdb(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'GDB 1',
        );

        expect(gdb.status, equals(GdbStatus.pending));
      });

      test('status defaults to pending from minimal JSON', () {
        final gdb = Gdb.fromJson({
          'courseCode': 'CS101',
          'courseTitle': 'OOP',
          'title': 'GDB 1',
        });

        expect(gdb.status, equals(GdbStatus.pending));
      });
    });

    group('GdbStatus enum', () {
      test('all enum values exist', () {
        expect(GdbStatus.values, contains(GdbStatus.pending));
        expect(GdbStatus.values, contains(GdbStatus.submitted));
        expect(GdbStatus.values, contains(GdbStatus.attempted));
        expect(GdbStatus.values, contains(GdbStatus.missed));
        expect(GdbStatus.values, contains(GdbStatus.resultDeclared));
      });

      test('has exactly 5 values', () {
        expect(GdbStatus.values.length, equals(5));
      });

      test('fromJson parses all enum values', () {
        for (final status in GdbStatus.values) {
          final json = {
            'courseCode': 'CS101',
            'courseTitle': 'OOP',
            'title': 'GDB 1',
            'status': status.name,
          };
          final gdb = Gdb.fromJson(json);
          expect(gdb.status, equals(status));
        }
      });
    });

    group('nullable fields', () {
      test('all nullable fields can be null', () {
        const gdb = Gdb(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'GDB 1',
        );

        expect(gdb.dueDate, isNull);
        expect(gdb.totalMarks, isNull);
        expect(gdb.obtainedMarks, isNull);
      });

      test('all nullable fields can be set', () {
        final now = DateTime.now();
        final gdb = Gdb(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'GDB 1',
          dueDate: now,
          totalMarks: 50.0,
          obtainedMarks: 45.0,
        );

        expect(gdb.dueDate, equals(now));
        expect(gdb.totalMarks, equals(50.0));
        expect(gdb.obtainedMarks, equals(45.0));
      });
    });

    group('equality', () {
      test('two gdb with same fields are equal', () {
        const a = Gdb(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'GDB 1',
        );
        const b = Gdb(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'GDB 1',
        );

        expect(a, equals(b));
        expect(a.hashCode, equals(b.hashCode));
      });

      test('two gdb with different fields are not equal', () {
        const a = Gdb(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'GDB 1',
        );
        const b = Gdb(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'GDB 2',
        );

        expect(a, isNot(equals(b)));
      });
    });

    group('toString', () {
      test('returns a non-empty string', () {
        const gdb = Gdb(
          courseCode: 'CS101',
          courseTitle: 'OOP',
          title: 'GDB 1',
        );
        final str = gdb.toString();

        expect(str, isA<String>());
        expect(str, isNotEmpty);
        expect(str, contains('GDB 1'));
      });
    });
  });
}
