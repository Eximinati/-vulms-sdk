import 'dart:io';
import 'package:test/test.dart';
import 'package:vulms_dart/src/parsers/assignment_parser.dart';
import 'package:vulms_dart/src/models/assignment.dart';

void main() {
  final standardFixture =
      File('test/fixtures/assignments_standard.html').readAsStringSync();
  final legacyFixture =
      File('test/fixtures/assignments_legacy.html').readAsStringSync();
  final emptyFixture =
      File('test/fixtures/assignments_empty.html').readAsStringSync();
  final emptyPageFixture =
      File('test/fixtures/empty_page.html').readAsStringSync();

  group('AssignmentParser.parse()', () {
    group('standard layout (Label3 IDs)', () {
      test('parses 2 assignments', () {
        final result = AssignmentParser.parse(standardFixture);
        expect(result, hasLength(2));
      });

      test('extracts assignment 1 details', () {
        final result = AssignmentParser.parse(standardFixture);
        final a1 = result.firstWhere((a) => a.title.contains('OOP'));
        expect(a1.courseCode, 'CS101');
        expect(a1.title, 'Assignment 1: OOP Concepts');
        expect(a1.lesson, 'Lesson 5');
        expect(a1.totalMarks, 20.0);
        expect(a1.status, AssignmentStatus.submitted);
        expect(a1.fileSize, '2.5 MB');
        expect(a1.obtainedMarks, 18.0);
      });

      test('extracts assignment 2 details', () {
        final result = AssignmentParser.parse(standardFixture);
        final a2 = result.firstWhere((a) => a.title.contains('Data'));
        expect(a2.title, 'Assignment 2: Data Structures');
        expect(a2.lesson, 'Lesson 8');
        expect(a2.totalMarks, 25.0);
        expect(a2.status, AssignmentStatus.missed);
        expect(a2.fileSize, '-');
        expect(a2.obtainedMarks, isNull);
      });
    });

    group('legacy layout (lblTitle IDs)', () {
      test('parses 1 assignment', () {
        final result = AssignmentParser.parse(legacyFixture);
        expect(result, hasLength(1));
      });

      test('extracts assignment details from legacy layout', () {
        final result = AssignmentParser.parse(legacyFixture);
        final a = result.first;
        expect(a.courseCode, 'MGT301');
        expect(a.title, 'Assignment 1: Management Principles');
        expect(a.lesson, 'Lesson 3');
        expect(a.totalMarks, 15.0);
        expect(a.status, AssignmentStatus.resultDeclared);
        expect(a.fileSize, '1.2 MB');
        expect(a.obtainedMarks, 12.0);
      });
    });

    group('empty assignments page', () {
      test('returns empty list', () {
        final result = AssignmentParser.parse(emptyFixture);
        expect(result, isEmpty);
      });

      test('returns empty list for page with no repeater', () {
        final result = AssignmentParser.parse(emptyPageFixture);
        expect(result, isEmpty);
      });
    });

    group('status derivation', () {
      test('Submitted results in submitted status', () {
        const html = '<html><body>'
            '<h3 class="m-subheader__title">CS101</h3>'
            '<div id="MainContent_gvTileRepeaterAssignment">'
            '<span id="MainContent_gvTileRepeaterAssignment_Label3_0">Test</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblPayableAmount_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">15-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">20</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0">Submitted</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblSubmitDate_0">14-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblFilesize_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblObtainedMarks_0"></span>'
            '</div></body></html>';
        final result = AssignmentParser.parse(html);
        expect(result.first.status, AssignmentStatus.submitted);
      });

      test('Not Submitted results in missed status when due date is past', () {
        const html = '<html><body>'
            '<h3 class="m-subheader__title">CS101</h3>'
            '<div id="MainContent_gvTileRepeaterAssignment">'
            '<span id="MainContent_gvTileRepeaterAssignment_Label3_0">Test</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblPayableAmount_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">01-Jan-2020</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">20</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0">Not Submitted</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblSubmitDate_0">-</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblFilesize_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblObtainedMarks_0"></span>'
            '</div></body></html>';
        final result = AssignmentParser.parse(html);
        expect(result.first.status, AssignmentStatus.missed);
      });

      test('Result results in resultDeclared status', () {
        final result = AssignmentParser.parse(legacyFixture);
        expect(result.first.status, AssignmentStatus.resultDeclared);
      });
    });

    group('marks parsing', () {
      test('parses marks with comma as 1500.0', () {
        const html = '<html><body>'
            '<h3 class="m-subheader__title">CS101</h3>'
            '<div id="MainContent_gvTileRepeaterAssignment">'
            '<span id="MainContent_gvTileRepeaterAssignment_Label3_0">Test</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblPayableAmount_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">15-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">1,500</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblSubmitDate_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblFilesize_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblObtainedMarks_0"></span>'
            '</div></body></html>';
        final result = AssignmentParser.parse(html);
        expect(result.first.totalMarks, 1500.0);
      });

      test('dash marks return null', () {
        const html = '<html><body>'
            '<h3 class="m-subheader__title">CS101</h3>'
            '<div id="MainContent_gvTileRepeaterAssignment">'
            '<span id="MainContent_gvTileRepeaterAssignment_Label3_0">Test</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblPayableAmount_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">15-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">-</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblSubmitDate_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblFilesize_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblObtainedMarks_0"></span>'
            '</div></body></html>';
        final result = AssignmentParser.parse(html);
        expect(result.first.totalMarks, isNull);
      });
    });

    group('deduplication', () {
      test('removes duplicate assignments with same title', () {
        const html = '<html><body>'
            '<h3 class="m-subheader__title">CS101</h3>'
            '<div id="MainContent_gvTileRepeaterAssignment">'
            '<span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment 1</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblPayableAmount_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">15-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">20</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblSubmitDate_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblFilesize_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblObtainedMarks_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_Label3_1">Assignment 1</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblPayableAmount_1"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblDueDate_1">15-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_1">20</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_1"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblSubmitDate_1"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblFilesize_1"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblObtainedMarks_1"></span>'
            '</div></body></html>';
        final result = AssignmentParser.parse(html);
        expect(result, hasLength(1));
      });
    });

    group('empty titles', () {
      test('skips assignments with empty titles', () {
        const html = '<html><body>'
            '<h3 class="m-subheader__title">CS101</h3>'
            '<div id="MainContent_gvTileRepeaterAssignment">'
            '<span id="MainContent_gvTileRepeaterAssignment_Label3_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblPayableAmount_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">15-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">20</span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblSubmitDate_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblFilesize_0"></span>'
            '<span id="MainContent_gvTileRepeaterAssignment_lblObtainedMarks_0"></span>'
            '</div></body></html>';
        final result = AssignmentParser.parse(html);
        expect(result, isEmpty);
      });
    });

    group('course code extraction', () {
      test('extracts course code from h3.m-subheader__title', () {
        final result = AssignmentParser.parse(standardFixture);
        expect(result.first.courseCode, 'CS101');
      });

      test('extracts course code from title element', () {
        final result = AssignmentParser.parse(legacyFixture);
        expect(result.first.courseCode, 'MGT301');
      });
    });

    group('table fallback', () {
      test('falls back to table when no tile elements', () {
        const html = '<html><body>'
            '<table>'
            '<tr><th>Title</th><th>Due Date</th><th>Marks</th><th>Status</th></tr>'
            '<tr><td>Assignment 1</td><td>15-Jan-2024</td><td>20</td><td>Submitted</td></tr>'
            '</table></body></html>';
        final result = AssignmentParser.parse(html);
        expect(result, hasLength(1));
        expect(result.first.title, 'Assignment 1');
      });
    });

    test('accepts explicit courseCode parameter', () {
      final result = AssignmentParser.parse(standardFixture, courseCode: 'XX999');
      expect(result.every((a) => a.courseCode == 'XX999'), isTrue);
    });
  });
}
