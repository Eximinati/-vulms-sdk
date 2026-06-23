import 'dart:io';
import 'package:test/test.dart';
import 'package:vulms_dart/src/parsers/gdb_parser.dart';
import 'package:vulms_dart/src/models/gdb.dart';

void main() {
  final fixture = File('test/fixtures/gdbs_tile.html').readAsStringSync();
  final emptyFixture = File('test/fixtures/empty_page.html').readAsStringSync();

  group('GdbParser.parse()', () {
    group('tile repeater', () {
      test('parses 2 GDBs', () {
        final result = GdbParser.parse(fixture);
        expect(result, hasLength(2));
      });

      test('extracts GDB 1 details', () {
        final result = GdbParser.parse(fixture);
        final g1 = result.firstWhere(
          (g) => g.title.contains('Data Privacy'),
        );
        expect(g1.title, 'Data Privacy Ethics');
        expect(g1.totalMarks, 10.0);
        expect(g1.status, GdbStatus.submitted);
      });

      test('extracts GDB 2 details', () {
        final result = GdbParser.parse(fixture);
        final g2 = result.firstWhere(
          (g) => g.title.contains('AI Ethics'),
        );
        expect(g2.title, 'AI Ethics in Modern Society');
        expect(g2.totalMarks, 15.0);
        expect(g2.status, GdbStatus.pending);
      });
    });

    group('status normalization', () {
      test('Submitted maps to submitted', () {
        final result = GdbParser.parse(fixture);
        final g1 = result.firstWhere(
          (g) => g.title.contains('Data Privacy'),
        );
        expect(g1.status, GdbStatus.submitted);
      });

      test('Open maps to pending', () {
        final result = GdbParser.parse(fixture);
        final g2 = result.firstWhere(
          (g) => g.title.contains('AI Ethics'),
        );
        expect(g2.status, GdbStatus.pending);
      });

      test('Closed maps to missed', () {
        const html = '<html><body>'
            '<div id="MainContent_gvTileRepeaterGDB_pnl_0">'
            '<span id="MainContent_gvTileRepeaterGDB_lblTitle_0">Test GDB</span>'
            '<span id="MainContent_gvTileRepeaterGDB_Label3_0">20-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterGDB_Label9_0">10</span>'
            '<span id="MainContent_gvTileRepeaterGDB_lblSubmissionStatus_0">Closed</span>'
            '</div></body></html>';
        final result = GdbParser.parse(html);
        expect(result.first.status, GdbStatus.missed);
      });
    });

    group('deduplication', () {
      test('removes duplicate GDBs', () {
        const html = '<html><body>'
            '<div id="MainContent_gvTileRepeaterGDB_pnl_0">'
            '<span id="MainContent_gvTileRepeaterGDB_lblTitle_0">Test GDB</span>'
            '<span id="MainContent_gvTileRepeaterGDB_Label3_0">20-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterGDB_Label9_0">10</span>'
            '<span id="MainContent_gvTileRepeaterGDB_lblSubmissionStatus_0">Submitted</span>'
            '</div>'
            '<div id="MainContent_gvTileRepeaterGDB_pnl_1">'
            '<span id="MainContent_gvTileRepeaterGDB_lblTitle_1">Test GDB</span>'
            '<span id="MainContent_gvTileRepeaterGDB_Label3_1">20-Jan-2024</span>'
            '<span id="MainContent_gvTileRepeaterGDB_Label9_1">10</span>'
            '<span id="MainContent_gvTileRepeaterGDB_lblSubmissionStatus_1">Submitted</span>'
            '</div></body></html>';
        final result = GdbParser.parse(html);
        expect(result, hasLength(1));
      });
    });

    group('empty page', () {
      test('returns empty list for page with no GDBs', () {
        final result = GdbParser.parse(emptyFixture);
        expect(result, isEmpty);
      });
    });
  });
}
