import 'dart:io';
import 'package:test/test.dart';
import 'package:vulms_dart/src/parsers/aspnet_parser.dart';
import 'package:vulms_dart/src/exceptions/parsing_exception.dart';

void main() {
  final fixture = File('test/fixtures/aspnet_form.html').readAsStringSync();

  group('AspNetParser.extractFormData()', () {
    test('extracts valid form data with all hidden fields', () {
      final data = AspNetParser.extractFormData(fixture);
      expect(data.viewState, isNotEmpty);
      expect(data.eventValidation, isNotEmpty);
      expect(data.viewStateGenerator, 'CA0B0334');
      expect(data.previousPage, '/Default.aspx');
    });

    test('falls back to name selectors when id selectors fail', () {
      const html = '<html><body>'
          '<form>'
          '<input type="hidden" name="__VIEWSTATE" value="test-vs" />'
          '<input type="hidden" name="__EVENTVALIDATION" value="test-ev" />'
          '<input type="hidden" name="__VIEWSTATEGENERATOR" value="test-vsg" />'
          '</form>'
          '</body></html>';
      final data = AspNetParser.extractFormData(html);
      expect(data.viewState, 'test-vs');
      expect(data.eventValidation, 'test-ev');
      expect(data.viewStateGenerator, 'test-vsg');
    });

    test('throws ParsingException when __VIEWSTATE is missing', () {
      const html = '<html><body><form></form></body></html>';
      expect(
        () => AspNetParser.extractFormData(html),
        throwsA(isA<ParsingException>()),
      );
    });

    test('throws ParsingException when __VIEWSTATE is empty', () {
      const html = '<html><body>'
          '<form>'
          '<input type="hidden" id="__VIEWSTATE" value="" />'
          '</form>'
          '</body></html>';
      expect(
        () => AspNetParser.extractFormData(html),
        throwsA(isA<ParsingException>()),
      );
    });
  });

  group('AspNetParser.isLoginSuccess()', () {
    test('returns true when page has __VIEWSTATE and no error indicators', () {
      const html = '<html><body>'
          '<input type="hidden" id="__VIEWSTATE" value="test" />'
          '</body></html>';
      expect(AspNetParser.isLoginSuccess(html), isTrue);
    });

    test('returns false when page contains Incorrect', () {
      expect(AspNetParser.isLoginSuccess('Incorrect password'), isFalse);
    });

    test('returns false when page contains Invalid', () {
      expect(AspNetParser.isLoginSuccess('Invalid credentials'), isFalse);
    });

    test('returns false when page contains Login.aspx', () {
      expect(AspNetParser.isLoginSuccess('Login.aspx redirect'), isFalse);
    });
  });

  group('AspNetParser.isLoginError()', () {
    test('returns true when page contains Incorrect', () {
      expect(AspNetParser.isLoginError('Incorrect password'), isTrue);
    });

    test('returns true when page contains Invalid', () {
      expect(AspNetParser.isLoginError('Invalid credentials'), isTrue);
    });

    test('returns true when page contains alert-danger', () {
      expect(
        AspNetParser.isLoginError('<div class="alert-danger">Error</div>'),
        isTrue,
      );
    });

    test('returns false for clean page', () {
      expect(AspNetParser.isLoginError(fixture), isFalse);
    });
  });

  group('AspNetParser.buildLoginData()', () {
    test('builds login form data from extracted fields', () {
      final formData = AspNetParser.extractFormData(fixture);
      final data = AspNetParser.buildLoginData(
        formData,
        'bc123456789',
        'password123',
      );
      expect(data['__VIEWSTATE'], formData.viewState);
      expect(data['__EVENTVALIDATION'], formData.eventValidation);
      expect(data['__VIEWSTATEGENERATOR'], formData.viewStateGenerator);
      expect(data['txtStudentID'], 'bc123456789');
      expect(data['txtPassword'], 'password123');
      expect(data['ibtnLogin'], 'Sign In');
    });
  });

  group('AspNetParser.buildPostbackData()', () {
    test('builds postback data with extra fields', () {
      final formData = AspNetParser.extractFormData(fixture);
      final data = AspNetParser.buildPostbackData(
        formData,
        extraFields: {'btnNext': 'Next', 'page': '2'},
      );
      expect(data['__VIEWSTATE'], formData.viewState);
      expect(data['__EVENTVALIDATION'], formData.eventValidation);
      expect(data['__VIEWSTATEGENERATOR'], formData.viewStateGenerator);
      expect(data['__PREVIOUSPAGE'], formData.previousPage);
      expect(data['btnNext'], 'Next');
      expect(data['page'], '2');
    });
  });
}
