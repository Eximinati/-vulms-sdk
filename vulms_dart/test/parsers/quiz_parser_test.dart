import 'dart:io';
import 'package:test/test.dart';
import 'package:vulms_dart/src/parsers/quiz_parser.dart';
import 'package:vulms_dart/src/models/quiz.dart';

void main() {
  final fixture = File('test/fixtures/quizzes_tile.html').readAsStringSync();
  final emptyFixture = File('test/fixtures/empty_page.html').readAsStringSync();

  group('QuizParser.parse()', () {
    group('tile repeater', () {
      test('parses 2 quizzes', () {
        final result = QuizParser.parse(fixture);
        expect(result, hasLength(2));
      });

      test('extracts quiz 1 details', () {
        final result = QuizParser.parse(fixture);
        final q1 = result.firstWhere((q) => q.title.contains('OOP'));
        expect(q1.courseCode, 'CS101');
        expect(q1.title, 'Quiz 1: OOP Basics');
        expect(q1.totalMarks, 20.0);
        expect(q1.availabilityStatus, QuizAvailabilityStatus.closed);
      });

      test('extracts quiz 2 details', () {
        final result = QuizParser.parse(fixture);
        final q2 = result.firstWhere((q) => q.title.contains('Inheritance'));
        expect(q2.title, 'Quiz 2: Inheritance');
        expect(q2.totalMarks, 15.0);
        expect(q2.availabilityStatus, QuizAvailabilityStatus.open);
      });
    });

    group('submission status', () {
      test('Result Declared maps to submitted submission status', () {
        final result = QuizParser.parse(fixture);
        final q1 = result.firstWhere((q) => q.title.contains('OOP'));
        expect(q1.submissionStatus, QuizSubmissionStatus.submitted);
        expect(q1.resultStatus, QuizResultStatus.declared);
        expect(q1.obtainedMarks, 16.0);
      });

      test('Not Submitted maps to notSubmitted status', () {
        final result = QuizParser.parse(fixture);
        final q2 = result.firstWhere((q) => q.title.contains('Inheritance'));
        expect(q2.submissionStatus, QuizSubmissionStatus.notSubmitted);
        expect(q2.obtainedMarks, isNull);
      });
    });

    group('availability status', () {
      test('Open maps to open', () {
        final result = QuizParser.parse(fixture);
        final q2 = result.firstWhere((q) => q.title.contains('Inheritance'));
        expect(q2.availabilityStatus, QuizAvailabilityStatus.open);
      });

      test('Closed maps to closed', () {
        final result = QuizParser.parse(fixture);
        final q1 = result.firstWhere((q) => q.title.contains('OOP'));
        expect(q1.availabilityStatus, QuizAvailabilityStatus.closed);
      });
    });

    group('submit date extraction', () {
      test('extracts submit date from inner HTML with br tag', () {
        final result = QuizParser.parse(fixture);
        final q1 = result.firstWhere((q) => q.title.contains('OOP'));
        expect(q1.submitDate, isNotNull);
        expect(q1.submitDate!.year, 2024);
        expect(q1.submitDate!.month, 1);
        expect(q1.submitDate!.day, 14);
      });
    });

    group('marks with dash', () {
      test('dash marks return null', () {
        final result = QuizParser.parse(fixture);
        final q2 = result.firstWhere((q) => q.title.contains('Inheritance'));
        expect(q2.obtainedMarks, isNull);
      });
    });

    group('deduplication', () {
      test('removes duplicate quizzes with same title and start date', () {
        const html = '<html><body>'
            '<h3 class="m-subheader__title">CS101</h3>'
            '<div id="MainContent_gvTileRepeaterQuiz_0">'
            '<span id="MainContent_gvTileRepeaterQuiz_lblTitle_0">Quiz 1</span>'
            '<span id="MainContent_gvTileRepeaterQuiz_lblStartDate_0">10-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterQuiz_lblEndDate_0">15-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterQuiz_lblTotalMarks_0">20</span>'
            '<span id="MainContent_gvTileRepeaterQuiz_lblStatus_0">Closed</span>'
            '<span id="MainContent_gvTileRepeaterQuiz_lblSubmitted_0"></span>'
            '<span id="MainContent_gvTileRepeaterQuiz_lblGetMarks_0"></span>'
            '</div>'
            '<div id="MainContent_gvTileRepeaterQuiz_1">'
            '<span id="MainContent_gvTileRepeaterQuiz_lblTitle_1">Quiz 1</span>'
            '<span id="MainContent_gvTileRepeaterQuiz_lblStartDate_1">10-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterQuiz_lblEndDate_1">15-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterQuiz_lblTotalMarks_1">20</span>'
            '<span id="MainContent_gvTileRepeaterQuiz_lblStatus_1">Closed</span>'
            '<span id="MainContent_gvTileRepeaterQuiz_lblSubmitted_1"></span>'
            '<span id="MainContent_gvTileRepeaterQuiz_lblGetMarks_1"></span>'
            '</div></body></html>';
        final result = QuizParser.parse(html);
        expect(result, hasLength(1));
      });
    });

    group('table fallback', () {
      test('falls back to table when no tile elements', () {
        const html = '<html><body>'
            '<table>'
            '<tr><th>Title</th><th>Start</th><th>End</th><th>Marks</th></tr>'
            '<tr><td>Quiz 1</td><td>10-Jan-2024</td><td>15-Jan-2024</td><td>20</td></tr>'
            '</table></body></html>';
        final result = QuizParser.parse(html);
        expect(result, hasLength(1));
        expect(result.first.title, 'Quiz 1');
        expect(result.first.availabilityStatus, QuizAvailabilityStatus.unknown);
      });
    });

    test('returns empty list for page with no quizzes', () {
      final result = QuizParser.parse(emptyFixture);
      expect(result, isEmpty);
    });

    test('accepts explicit courseCode parameter', () {
      final result = QuizParser.parse(fixture, courseCode: 'XX999');
      expect(result.every((q) => q.courseCode == 'XX999'), isTrue);
    });
  });
}
