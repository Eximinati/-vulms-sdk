import 'package:html/dom.dart';
import 'package:html/parser.dart' as html_parser;

import '../models/session.dart';
import '../exceptions/exceptions.dart';
import '../utils/constants.dart';

/// Parses ASP.NET form data from HTML pages.
///
/// Extracts __VIEWSTATE, __EVENTVALIDATION, and other hidden fields
/// required for ASP.NET PostBack requests.
class AspNetParser {
  AspNetParser._();

  /// Extract ASP.NET form data from HTML.
  ///
  /// Throws [ParsingException] if __VIEWSTATE cannot be found.
  static AspNetFormData extractFormData(String html) {
    final doc = html_parser.parse(html);

    // Try standard selectors first
    var viewState = _extractValue(doc, AspNetSelectors.viewState);
    var eventValidation = _extractValue(doc, AspNetSelectors.eventValidation);
    var viewStateGenerator =
        _extractValue(doc, AspNetSelectors.viewStateGenerator);
    final previousPage = _extractValue(doc, AspNetSelectors.previousPage);

    // Fallback to root form selectors
    viewState ??= _extractValue(doc, AspNetSelectors.rootViewState);
    eventValidation ??= _extractValue(doc, AspNetSelectors.rootEventValidation);
    viewStateGenerator ??=
        _extractValue(doc, AspNetSelectors.rootViewStateGenerator);

    if (viewState == null || viewState.isEmpty) {
      throw const ParsingException(
        'Failed to extract form data: no __VIEWSTATE found. '
        'Page may be a redirect or captcha.',
      );
    }

    return AspNetFormData(
      viewState: viewState,
      eventValidation: eventValidation ?? '',
      viewStateGenerator: viewStateGenerator,
      previousPage: previousPage,
    );
  }

  /// Build login form data from extracted form fields.
  static Map<String, String> buildLoginData(
    AspNetFormData formData,
    String username,
    String password,
  ) {
    final data = <String, String>{
      '__VIEWSTATE': formData.viewState,
      '__EVENTVALIDATION': formData.eventValidation,
      'txtStudentID': username,
      'txtPassword': password,
      'ibtnLogin': 'Sign In',
    };
    if (formData.viewStateGenerator != null) {
      data['__VIEWSTATEGENERATOR'] = formData.viewStateGenerator!;
    }
    return data;
  }

  /// Build PostBack form data from extracted form fields.
  static Map<String, String> buildPostbackData(
    AspNetFormData formData, {
    Map<String, String>? extraFields,
  }) {
    final data = <String, String>{
      '__VIEWSTATE': formData.viewState,
      '__EVENTVALIDATION': formData.eventValidation,
    };
    if (formData.viewStateGenerator != null) {
      data['__VIEWSTATEGENERATOR'] = formData.viewStateGenerator!;
    }
    if (formData.previousPage != null) {
      data['__PREVIOUSPAGE'] = formData.previousPage!;
    }
    if (extraFields != null) {
      data.addAll(extraFields);
    }
    return data;
  }

  /// Check if the HTML indicates a successful login.
  static bool isLoginSuccess(String html) {
    return !html.contains('Incorrect') &&
        !html.contains('Invalid') &&
        !html.contains('Login.aspx') &&
        html.contains('__VIEWSTATE');
  }

  /// Check if the HTML indicates a login error.
  static bool isLoginError(String html) {
    return html.contains('Incorrect') ||
        html.contains('Invalid') ||
        html.contains('alert-danger');
  }

  static String? _extractValue(Document doc, String selector) {
    final element = doc.querySelector(selector);
    if (element == null) return null;
    return element.attributes['value'];
  }
}
