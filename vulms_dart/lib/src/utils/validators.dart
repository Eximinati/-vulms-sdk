import 'package:html/parser.dart' as html_parser;

/// Page validation state.
enum ValidationState { invalid, emptyValid, valid }

/// Describes what type of page was detected.
enum PageType {
  unknown,
  login,
  home,
  courses,
  courseHome,
  lecture,
  quiz,
  assignment,
  gdb,
}

/// Result of semantic page validation.
class PageValidationResult {
  final ValidationState state;
  final PageType pageType;
  final List<String> indicators;
  final String? missingExpected;

  const PageValidationResult({
    required this.state,
    required this.pageType,
    this.indicators = const [],
    this.missingExpected,
  });

  bool get isValid => state == ValidationState.valid;
  bool get isEmptyValid => state == ValidationState.emptyValid;
  bool get isInvalid => state == ValidationState.invalid;
}

/// Validates VULMS HTML pages semantically.
class Validators {
  Validators._();

  /// Check if the HTML represents a session-expired or login page.
  static bool isSessionExpired(String html) {
    const indicators = [
      'Login.aspx',
      'txtStudentID',
      'Incorrect username',
      'Invalid credentials',
      'Your session has expired',
      'session expired',
    ];
    return indicators.any((i) => html.contains(i));
  }

  /// Validate an assignment page.
  static PageValidationResult validateAssignmentPage(String html) {
    return _analyzeSemantic(html, PageType.assignment);
  }

  /// Validate a quiz page.
  static PageValidationResult validateQuizPage(String html) {
    return _analyzeSemantic(html, PageType.quiz);
  }

  /// Validate a GDB page.
  static PageValidationResult validateGdbPage(String html) {
    return _analyzeSemantic(html, PageType.gdb);
  }

  /// Validate a lecture page.
  static PageValidationResult validateLecturePage(String html) {
    return _analyzeSemantic(html, PageType.lecture);
  }

  /// Validate a course list page.
  static PageValidationResult validateCourseListPage(String html) {
    final doc = html_parser.parse(html);
    final lowerHtml = html.toLowerCase();

    // Check for login form
    if (_hasLoginForm(lowerHtml)) {
      return const PageValidationResult(
        state: ValidationState.invalid,
        pageType: PageType.login,
        indicators: ['login_form'],
      );
    }

    final indicators = <String>[];
    final courseCards =
        doc.querySelectorAll('[id^="MainContent_gvCourseList_"]');
    final portlets = doc.querySelectorAll('.m-portlet');

    if (courseCards.isNotEmpty) {
      indicators.add('course_cards:${courseCards.length}');
    }
    if (portlets.isNotEmpty) {
      indicators.add('course_portlets:${portlets.length}');
    }

    final h3Elements = doc.querySelectorAll('h3');
    final courseCodes = h3Elements.where((el) {
      final text = el.text.trim();
      return RegExp(r'[A-Z]{2,4}\d{3}[A-Z]?').hasMatch(text);
    }).length;

    if (courseCodes > 0) {
      indicators.add('course_codes:$courseCodes');
    }

    if (indicators.length >= 2) {
      return PageValidationResult(
        state: ValidationState.valid,
        pageType: PageType.courses,
        indicators: indicators,
      );
    }

    return PageValidationResult(
      state: ValidationState.invalid,
      pageType: PageType.unknown,
      indicators: indicators,
      missingExpected: 'course list structure not found',
    );
  }

  static PageValidationResult _analyzeSemantic(String html, PageType pageType) {
    final doc = html_parser.parse(html);
    final lowerHtml = html.toLowerCase();
    final indicators = <String>[];

    if (_hasLoginForm(lowerHtml)) {
      return const PageValidationResult(
        state: ValidationState.invalid,
        pageType: PageType.login,
        indicators: const ['login_form'],
        missingExpected: 'page contains login form',
      );
    }

    // Check if page is actually the dashboard
    final isHome = lowerHtml.contains('gvcourselist') &&
        !lowerHtml.contains('gv${pageType.name}');
    if (isHome) {
      return PageValidationResult(
        state: ValidationState.invalid,
        pageType: PageType.home,
        indicators: const ['course_list'],
        missingExpected: 'page is course dashboard, not ${pageType.name}',
      );
    }

    final selectors = _getSemanticSelectors(pageType);
    var hasContentStructure = false;

    for (final sel in selectors) {
      final elements = doc.querySelectorAll(sel);
      if (elements.isNotEmpty) {
        indicators.add('$sel:${elements.length}');
        hasContentStructure = true;
      }
    }

    if (hasContentStructure) {
      return PageValidationResult(
        state: ValidationState.valid,
        pageType: pageType,
        indicators: indicators,
      );
    }

    if (_isPageContainerPresent(html, pageType)) {
      indicators.add('page_container:present');
      return PageValidationResult(
        state: ValidationState.emptyValid,
        pageType: pageType,
        indicators: indicators,
        missingExpected: 'no ${pageType.name}s available',
      );
    }

    return PageValidationResult(
      state: ValidationState.invalid,
      pageType: PageType.unknown,
      indicators: indicators,
      missingExpected: 'no ${pageType.name} content structure found',
    );
  }

  static bool _hasLoginForm(String lowerHtml) {
    return lowerHtml.contains('txtusername') ||
        lowerHtml.contains('id="txtuser') ||
        lowerHtml.contains('name="username"');
  }

  static List<String> _getSemanticSelectors(PageType pageType) {
    switch (pageType) {
      case PageType.assignment:
        return [
          '[id*="gvTileRepeaterAssignment_"]',
          '[id*="gvAssignment_"]',
          '[id*="lblTitle_"]',
          '#MainContent_pnlAssignment',
          '#MainContent_gvAssignment',
        ];
      case PageType.quiz:
        return [
          '[id*="gvTileRepeaterQuiz_"]',
          '[id*="gvQuiz_"]',
          '[id*="lblQuizTitle_"]',
          '#MainContent_pnlQuiz',
          '#MainContent_gvQuiz',
        ];
      case PageType.gdb:
        return [
          '[id*="gvTileRepeaterGDB_pnl_"]',
          '[id*="gvTileRepeaterGDB_lbl"]',
          '[id*="lblTitle_"]',
          '#MainContent_pnlGDB',
          '#MainContent_gvGDB',
          '[class*="GDBTitle"]',
        ];
      case PageType.lecture:
        return [
          '[id*="gvTileRepeaterLecture_"]',
          '[id*="gvLecture_"]',
          '[id*="lblLectureTitle_"]',
          '[id*="lblTitle_"]',
          '[class*="ActivitySession"]',
          '#MainContent_pnlLecture',
          '#MainContent_gvLecture',
        ];
      default:
        return [];
    }
  }

  static bool _isPageContainerPresent(String html, PageType pageType) {
    final pageTitle = _extractPageTitle(html).toLowerCase();

    final containers = {
      PageType.assignment: {
        'titleMatch': ['assignment'],
        'selectors': [
          'id="MainContent_divRecord"',
          'id="MainContent_pnlAssignment"',
          'id="MainContent_gvAssignment"',
        ],
      },
      PageType.quiz: {
        'titleMatch': ['quiz'],
        'selectors': [
          'id="MainContent_pnlQuiz"',
          'id="MainContent_gvQuiz"',
          'id="MainContent_divQuiz"',
        ],
      },
      PageType.lecture: {
        'titleMatch': ['lecture'],
        'selectors': [
          'id="MainContent_pnlLecture"',
          'id="MainContent_gvLecture"',
          'id="MainContent_divLecture"',
        ],
      },
      PageType.gdb: {
        'titleMatch': ['gdb', 'graded discussion'],
        'selectors': [
          'id="MainContent_divRecord"',
          'id="MainContent_pnlGDB"',
          'id="MainContent_gvGDB"',
          'id="MainContent_divGDB"',
        ],
      },
    };

    final check = containers[pageType];
    if (check == null) return false;

    final titleMatch = (check['titleMatch'] as List<String>)
        .any((t) => pageTitle.contains(t));
    final hasContainer = (check['selectors'] as List<String>)
        .any((s) => html.contains(s));

    return titleMatch && hasContainer;
  }

  static String _extractPageTitle(String html) {
    final match = RegExp(r'<title[^>]*>([^<]*)</title>', caseSensitive: false)
        .firstMatch(html);
    return match?.group(1)?.trim() ?? '';
  }
}
