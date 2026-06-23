import 'package:test/test.dart';
import 'package:vulms_dart/src/utils/dedupe.dart';

void main() {
  group('Dedupe.dedupe()', () {
    group('basic deduplication', () {
      test('removes duplicates by key', () {
        final items = ['apple', 'banana', 'apple', 'cherry', 'banana'];
        final result = Dedupe.dedupe(items, (item) => item);
        expect(result.unique, ['apple', 'banana', 'cherry']);
        expect(result.duplicates, 2);
      });

      test('preserves order of first occurrences', () {
        final items = ['cherry', 'apple', 'banana', 'apple', 'cherry'];
        final result = Dedupe.dedupe(items, (item) => item);
        expect(result.unique, ['cherry', 'apple', 'banana']);
      });

      test('returns empty list for empty input', () {
        final result = Dedupe.dedupe<String>([], (item) => item);
        expect(result.unique, isEmpty);
        expect(result.duplicates, 0);
      });

      test('returns same list when no duplicates', () {
        final items = ['a', 'b', 'c'];
        final result = Dedupe.dedupe(items, (item) => item);
        expect(result.unique, ['a', 'b', 'c']);
        expect(result.duplicates, 0);
      });

      test('handles single element', () {
        final result = Dedupe.dedupe(['only'], (item) => item);
        expect(result.unique, ['only']);
        expect(result.duplicates, 0);
      });

      test('handles all duplicates', () {
        final items = ['x', 'x', 'x'];
        final result = Dedupe.dedupe(items, (item) => item);
        expect(result.unique, ['x']);
        expect(result.duplicates, 2);
      });
    });

    group('with complex objects', () {
      test('deduplicates maps by custom key', () {
        final items = [
          {'id': 1, 'name': 'Alice'},
          {'id': 2, 'name': 'Bob'},
          {'id': 1, 'name': 'Alice Clone'},
          {'id': 3, 'name': 'Charlie'},
        ];
        final result = Dedupe.dedupe<Map<String, dynamic>>(
          items,
          (item) => item['id'].toString(),
        );
        expect(result.unique.length, 3);
        expect(result.unique[0]['name'], 'Alice');
        expect(result.unique[1]['name'], 'Bob');
        expect(result.unique[2]['name'], 'Charlie');
        expect(result.duplicates, 1);
      });
    });
  });

  group('Dedupe.dedupeResult()', () {
    test('returns DedupeResult with unique and duplicates count', () {
      final items = [1, 2, 2, 3, 3, 3];
      final result = Dedupe.dedupe(items, (item) => item.toString());
      expect(result, isA<DedupeResult<int>>());
      expect(result.unique, [1, 2, 3]);
      expect(result.duplicates, 3);
    });
  });

  group('Key generators', () {
    group('assignmentKey()', () {
      test('generates correct key with all parameters', () {
        final key = Dedupe.assignmentKey(
          'CS101',
          'Assignment 1',
          DateTime(2024, 1, 15),
          100.0,
        );
        expect(key, 'CS101|Assignment 1|2024-01-15|100.0');
      });

      test('generates key with null dueDate', () {
        final key = Dedupe.assignmentKey('CS101', 'Assignment 1', null, 50.0);
        expect(key, 'CS101|Assignment 1||50.0');
      });

      test('generates key with null totalMarks', () {
        final key = Dedupe.assignmentKey(
          'CS101',
          'Assignment 1',
          DateTime(2024, 1, 15),
          null,
        );
        expect(key, 'CS101|Assignment 1|2024-01-15|');
      });

      test('generates key with all nulls', () {
        final key = Dedupe.assignmentKey('CS101', 'Assignment 1', null, null);
        expect(key, 'CS101|Assignment 1||');
      });
    });

    group('quizKey()', () {
      test('generates correct key with all parameters', () {
        final key = Dedupe.quizKey(
          'CS101',
          'Quiz 1',
          DateTime(2024, 3, 20),
        );
        expect(key, 'CS101|Quiz 1|2024-03-20');
      });

      test('generates key with null startDate', () {
        final key = Dedupe.quizKey('CS101', 'Quiz 1', null);
        expect(key, 'CS101|Quiz 1|');
      });
    });

    group('gdbKey()', () {
      test('generates correct key with all parameters', () {
        final key = Dedupe.gdbKey(
          'CS101',
          'GDB 1',
          DateTime(2024, 5, 10),
        );
        expect(key, 'CS101|GDB 1|2024-05-10');
      });

      test('generates key with null dueDate', () {
        final key = Dedupe.gdbKey('CS101', 'GDB 1', null);
        expect(key, 'CS101|GDB 1|');
      });
    });

    group('lectureKey()', () {
      test('generates correct key with all parameters', () {
        final key = Dedupe.lectureKey('CS101', 'Week 1 Lecture', 1, 'video');
        expect(key, 'CS101|Week 1 Lecture|1|video');
      });

      test('generates key with null week', () {
        final key = Dedupe.lectureKey('CS101', 'Lecture', null, 'video');
        expect(key, 'CS101|Lecture||video');
      });

      test('generates key with null type', () {
        final key = Dedupe.lectureKey('CS101', 'Lecture', 1, null);
        expect(key, 'CS101|Lecture|1|');
      });

      test('generates key with all nulls', () {
        final key = Dedupe.lectureKey('CS101', 'Lecture', null, null);
        expect(key, 'CS101|Lecture||');
      });
    });
  });
}
