import 'package:test/test.dart';
import 'package:vulms_dart/src/models/course.dart';

void main() {
  group('Course', () {
    const course = Course(code: 'CS101', title: 'Object Oriented Programming');

    group('fromJson', () {
      test('parses valid JSON', () {
        final json = {'code': 'CS101', 'title': 'Object Oriented Programming'};
        final result = Course.fromJson(json);

        expect(result.code, equals('CS101'));
        expect(result.title, equals('Object Oriented Programming'));
      });

      test('roundtrip fromJson(toJson()) equals original', () {
        final json = course.toJson();
        final result = Course.fromJson(json);

        expect(result, equals(course));
      });
    });

    group('toJson', () {
      test('produces correct keys', () {
        final json = course.toJson();

        expect(json.keys, containsAll(['code', 'title']));
        expect(json['code'], equals('CS101'));
        expect(json['title'], equals('Object Oriented Programming'));
      });

      test('produces correct values', () {
        final json = course.toJson();

        expect(json['code'], isA<String>());
        expect(json['title'], isA<String>());
      });
    });

    group('copyWith', () {
      test('creates new instance with changed code', () {
        final copied = course.copyWith(code: 'MATH201');

        expect(copied.code, equals('MATH201'));
        expect(copied.title, equals('Object Oriented Programming'));
        expect(copied, isNot(same(course)));
      });

      test('creates new instance with changed title', () {
        final copied = course.copyWith(title: 'Data Structures');

        expect(copied.code, equals('CS101'));
        expect(copied.title, equals('Data Structures'));
      });

      test('creates new instance with both fields changed', () {
        final copied = course.copyWith(code: 'MATH201', title: 'Linear Algebra');

        expect(copied.code, equals('MATH201'));
        expect(copied.title, equals('Linear Algebra'));
      });

      test('returns equal instance when no arguments provided', () {
        final copied = course.copyWith();

        expect(copied, equals(course));
        expect(copied, isNot(same(course)));
      });
    });

    group('equality', () {
      test('two courses with same fields are equal', () {
        const other = Course(code: 'CS101', title: 'Object Oriented Programming');

        expect(course, equals(other));
        expect(course.hashCode, equals(other.hashCode));
      });

      test('two courses with different code are not equal', () {
        const other = Course(code: 'MATH201', title: 'Object Oriented Programming');

        expect(course, isNot(equals(other)));
      });

      test('two courses with different title are not equal', () {
        const other = Course(code: 'CS101', title: 'Data Structures');

        expect(course, isNot(equals(other)));
      });
    });

    group('toString', () {
      test('returns a string representation', () {
        final str = course.toString();

        expect(str, isA<String>());
        expect(str, isNotEmpty);
        expect(str, contains('CS101'));
        expect(str, contains('Object Oriented Programming'));
      });
    });
  });
}
