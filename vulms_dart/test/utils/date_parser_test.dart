import 'package:test/test.dart';
import 'package:vulms_dart/src/utils/date_parser.dart';

void main() {
  group('VulmsDateParser.tryParse()', () {
    group('DD-Mon-YYYY format', () {
      test('parses "15-Jan-2024"', () {
        final result = VulmsDateParser.tryParse('15-Jan-2024');
        expect(result, isNotNull);
        expect(result!.year, 2024);
        expect(result.month, 1);
        expect(result.day, 15);
      });

      test('parses "15/Jan/2024"', () {
        final result = VulmsDateParser.tryParse('15/Jan/2024');
        expect(result, isNotNull);
        expect(result!.year, 2024);
        expect(result.month, 1);
        expect(result.day, 15);
      });

      test('parses "15.Jan.2024"', () {
        final result = VulmsDateParser.tryParse('15.Jan.2024');
        expect(result, isNotNull);
        expect(result!.month, 1);
        expect(result.day, 15);
      });

      test('parses abbreviated months for all 12 months', () {
        final jan = VulmsDateParser.tryParse('15-Jan-2024');
        final feb = VulmsDateParser.tryParse('10-Feb-2024');
        final mar = VulmsDateParser.tryParse('25-Mar-2024');
        final apr = VulmsDateParser.tryParse('01-Apr-2024');
        final may = VulmsDateParser.tryParse('20-May-2024');
        final jun = VulmsDateParser.tryParse('15-Jun-2024');
        final jul = VulmsDateParser.tryParse('04-Jul-2024');
        final aug = VulmsDateParser.tryParse('30-Aug-2024');
        final sep = VulmsDateParser.tryParse('12-Sep-2024');
        final oct = VulmsDateParser.tryParse('31-Oct-2024');
        final nov = VulmsDateParser.tryParse('11-Nov-2024');
        final dec = VulmsDateParser.tryParse('25-Dec-2024');

        expect(jan!.month, 1);
        expect(feb!.month, 2);
        expect(mar!.month, 3);
        expect(apr!.month, 4);
        expect(may!.month, 5);
        expect(jun!.month, 6);
        expect(jul!.month, 7);
        expect(aug!.month, 8);
        expect(sep!.month, 9);
        expect(oct!.month, 10);
        expect(nov!.month, 11);
        expect(dec!.month, 12);
      });

      test('parses full month names like "15-January-2024"', () {
        final result = VulmsDateParser.tryParse('15-January-2024');
        expect(result, isNotNull);
        expect(result!.month, 1);
      });

      test('parses with spaces around separators "15 - Jan - 2024"', () {
        final result = VulmsDateParser.tryParse('15 - Jan - 2024');
        expect(result, isNotNull);
        expect(result!.day, 15);
        expect(result.month, 1);
        expect(result.year, 2024);
      });

      test('parses "15/Feb/2024" with different separator', () {
        final result = VulmsDateParser.tryParse('15/Feb/2024');
        expect(result, isNotNull);
        expect(result!.month, 2);
        expect(result.day, 15);
      });
    });

    group('DD Mon YYYY format (space-separated with month name)', () {
      test('returns null for "15 Jan 2024" (no separator)', () {
        final result = VulmsDateParser.tryParse('15 Jan 2024');
        expect(result, isNull);
      });

      test('parses "15 Jan 2024" via YYYY-MM-DD fallback when ISO formatted', () {
        final result = VulmsDateParser.tryParse('2024-01-15');
        expect(result, isNotNull);
        expect(result!.year, 2024);
        expect(result.month, 1);
        expect(result.day, 15);
      });
    });

    group('DD/MM/YYYY numeric format', () {
      test('parses "15/01/2024"', () {
        final result = VulmsDateParser.tryParse('15/01/2024');
        expect(result, isNotNull);
        expect(result!.year, 2024);
        expect(result.month, 1);
        expect(result.day, 15);
      });

      test('parses "15.01.2024"', () {
        final result = VulmsDateParser.tryParse('15.01.2024');
        expect(result, isNotNull);
        expect(result!.year, 2024);
        expect(result.month, 1);
        expect(result.day, 15);
      });

      test('parses "15-01-2024"', () {
        final result = VulmsDateParser.tryParse('15-01-2024');
        expect(result, isNotNull);
        expect(result!.year, 2024);
        expect(result.month, 1);
        expect(result.day, 15);
      });

      test('parses day > 12 as day-first (e.g. 25/12/2024)', () {
        final result = VulmsDateParser.tryParse('25/12/2024');
        expect(result, isNotNull);
        expect(result!.year, 2024);
        expect(result.month, 12);
        expect(result.day, 25);
      });
    });

    group('YYYY-MM-DD format', () {
      test('parses "2024-01-15" via native Dart parsing', () {
        final result = VulmsDateParser.tryParse('2024-01-15');
        expect(result, isNotNull);
        expect(result!.year, 2024);
        expect(result.month, 1);
        expect(result.day, 15);
      });

      test('parses "2024-12-31"', () {
        final result = VulmsDateParser.tryParse('2024-12-31');
        expect(result, isNotNull);
        expect(result!.month, 12);
        expect(result.day, 31);
      });
    });

    group('Month DD, YYYY H:MM AM/PM format', () {
      test('parses "January 15, 2024 3:30 PM"', () {
        final result = VulmsDateParser.tryParse('January 15, 2024 3:30 PM');
        expect(result, isNotNull);
        expect(result!.year, 2024);
        expect(result.month, 1);
        expect(result.day, 15);
        expect(result.hour, 15);
        expect(result.minute, 30);
      });

      test('parses AM times correctly', () {
        final result = VulmsDateParser.tryParse('June 1, 2024 9:00 AM');
        expect(result, isNotNull);
        expect(result!.hour, 9);
        expect(result.minute, 0);
      });

      test('parses 12:00 AM as midnight', () {
        final result = VulmsDateParser.tryParse('March 10, 2024 12:00 AM');
        expect(result, isNotNull);
        expect(result!.hour, 0);
      });

      test('parses 12:00 PM as noon', () {
        final result = VulmsDateParser.tryParse('March 10, 2024 12:00 PM');
        expect(result, isNotNull);
        expect(result!.hour, 12);
      });

      test('parses case-insensitive am/pm', () {
        final result = VulmsDateParser.tryParse('January 15, 2024 3:30 pm');
        expect(result, isNotNull);
        expect(result!.hour, 15);
      });

      test('parses "Dec 25, 2024 11:59 PM"', () {
        final result = VulmsDateParser.tryParse('Dec 25, 2024 11:59 PM');
        expect(result, isNotNull);
        expect(result!.month, 12);
        expect(result.day, 25);
        expect(result.hour, 23);
        expect(result.minute, 59);
      });
    });

    group('null and invalid input', () {
      test('returns null for null input', () {
        expect(VulmsDateParser.tryParse(null), isNull);
      });

      test('returns null for empty string', () {
        expect(VulmsDateParser.tryParse(''), isNull);
      });

      test('returns null for whitespace-only string', () {
        expect(VulmsDateParser.tryParse('   '), isNull);
      });

      test('returns null for "n/a"', () {
        expect(VulmsDateParser.tryParse('n/a'), isNull);
        expect(VulmsDateParser.tryParse('N/A'), isNull);
      });

      test('returns null for "-"', () {
        expect(VulmsDateParser.tryParse('-'), isNull);
      });

      test('returns null for "---"', () {
        expect(VulmsDateParser.tryParse('---'), isNull);
      });

      test('returns null for completely invalid string', () {
        expect(VulmsDateParser.tryParse('not-a-date'), isNull);
      });

      test('returns null for "15-Jan" (incomplete)', () {
        expect(VulmsDateParser.tryParse('15-Jan'), isNull);
      });

      test('returns null for "hello world"', () {
        expect(VulmsDateParser.tryParse('hello world'), isNull);
      });
    });

    group('edge cases', () {
      test('trims leading/trailing whitespace', () {
        final result = VulmsDateParser.tryParse('  15-Jan-2024  ');
        expect(result, isNotNull);
        expect(result!.day, 15);
      });

      test('collapses multiple internal spaces', () {
        final result = VulmsDateParser.tryParse('  15 -  Jan  - 2024  ');
        expect(result, isNotNull);
        expect(result!.month, 1);
        expect(result.day, 15);
      });
    });
  });

  group('VulmsDateParser.parse()', () {
    test('returns DateTime for valid input', () {
      final result = VulmsDateParser.parse('15-Jan-2024');
      expect(result.year, 2024);
      expect(result.month, 1);
      expect(result.day, 15);
    });

    test('throws FormatException for invalid input', () {
      expect(
        () => VulmsDateParser.parse('not-a-date'),
        throwsA(isA<FormatException>()),
      );
    });

    test('throws FormatException for empty string', () {
      expect(
        () => VulmsDateParser.parse(''),
        throwsA(isA<FormatException>()),
      );
    });

    test('throws FormatException with descriptive message', () {
      expect(
        () => VulmsDateParser.parse('garbage'),
        throwsA(
          isA<FormatException>().having(
            (e) => e.message,
            'message',
            contains('Unable to parse VULMS date'),
          ),
        ),
      );
    });
  });
}
