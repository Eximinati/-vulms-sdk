import 'package:test/test.dart';
import 'package:vulms_dart/src/utils/validators.dart';

void main() {
  group('Validators.isSessionExpired()', () {
    test('returns true when HTML contains "Login.aspx"', () {
      expect(Validators.isSessionExpired('<a href="Login.aspx">Login</a>'), isTrue);
    });

    test('returns true when HTML contains "txtStudentID"', () {
      expect(Validators.isSessionExpired('<input id="txtStudentID" />'), isTrue);
    });

    test('returns true when HTML contains "Incorrect username"', () {
      expect(Validators.isSessionExpired('Error: Incorrect username or password'), isTrue);
    });

    test('returns true when HTML contains "Invalid credentials"', () {
      expect(Validators.isSessionExpired('Invalid credentials'), isTrue);
    });

    test('returns true when HTML contains "Your session has expired"', () {
      expect(Validators.isSessionExpired('Your session has expired. Please login again.'), isTrue);
    });

    test('returns true when HTML contains "session expired" (lowercase)', () {
      expect(Validators.isSessionExpired('Your session expired'), isTrue);
    });

    test('returns false for normal home page HTML', () {
      const html = '<html><head><title>Home</title></head>'
          '<body><div id="MainContent">Welcome</div></body></html>';
      expect(Validators.isSessionExpired(html), isFalse);
    });

    test('returns false for empty string', () {
      expect(Validators.isSessionExpired(''), isFalse);
    });
  });

  group('Validators.validateAssignmentPage()', () {
    test('returns invalid with login form', () {
      const html = '<html><body>'
          '<input id="txtUsername" />'
          '</body></html>';
      final result = Validators.validateAssignmentPage(html);
      expect(result.isInvalid, isTrue);
      expect(result.pageType, PageType.login);
    });

    test('returns valid when assignment content structure is present', () {
      const html = '<html><body>'
          '<div id="MainContent_pnlAssignment">'
          '<div id="gvTileRepeaterAssignment_0">Assignment 1</div>'
          '</div>'
          '</body></html>';
      final result = Validators.validateAssignmentPage(html);
      expect(result.isValid, isTrue);
      expect(result.pageType, PageType.assignment);
      expect(result.indicators, isNotEmpty);
    });

    test('returns valid with gvAssignment selector', () {
      const html = '<html><body>'
          '<div id="MainContent_gvAssignment">'
          '<span id="lblTitle_0">Assignment Title</span>'
          '</div>'
          '</body></html>';
      final result = Validators.validateAssignmentPage(html);
      expect(result.isValid, isTrue);
    });

    test('returns invalid for course dashboard HTML', () {
      const html = '<html><body>'
          '<div id="gvCourseList">Courses</div>'
          '<div id="MainContent_divRecord">No assignments</div>'
          '</body></html>';
      final result = Validators.validateAssignmentPage(html);
      expect(result.isInvalid, isTrue);
      expect(result.pageType, PageType.home);
    });
  });

  group('Validators.validateQuizPage()', () {
    test('returns valid when quiz content structure is present', () {
      const html = '<html><body>'
          '<div id="MainContent_pnlQuiz">'
          '<div id="gvTileRepeaterQuiz_0">Quiz 1</div>'
          '</div>'
          '</body></html>';
      final result = Validators.validateQuizPage(html);
      expect(result.isValid, isTrue);
      expect(result.pageType, PageType.quiz);
    });

    test('returns invalid with login form', () {
      const html = '<html><body>'
          '<input id="txtUsername" />'
          '</body></html>';
      final result = Validators.validateQuizPage(html);
      expect(result.isInvalid, isTrue);
      expect(result.pageType, PageType.login);
    });

    test('returns valid with gvQuiz selector', () {
      const html = '<html><body>'
          '<div id="MainContent_gvQuiz">'
          '<span id="lblQuizTitle_0">Quiz Title</span>'
          '</div>'
          '</body></html>';
      final result = Validators.validateQuizPage(html);
      expect(result.isValid, isTrue);
    });
  });

  group('Validators.validateGdbPage()', () {
    test('returns valid when GDB content structure is present', () {
      const html = '<html><body>'
          '<div id="MainContent_pnlGDB">'
          '<div id="gvTileRepeaterGDB_pnl_0">GDB 1</div>'
          '</div>'
          '</body></html>';
      final result = Validators.validateGdbPage(html);
      expect(result.isValid, isTrue);
      expect(result.pageType, PageType.gdb);
    });

    test('returns invalid with login form', () {
      const html = '<html><body>'
          '<input id="txtUsername" />'
          '</body></html>';
      final result = Validators.validateGdbPage(html);
      expect(result.isInvalid, isTrue);
      expect(result.pageType, PageType.login);
    });

    test('returns valid with GDBTitle class', () {
      const html = '<html><body>'
          '<div class="GDBTitle">Discussion Topic</div>'
          '</body></html>';
      final result = Validators.validateGdbPage(html);
      expect(result.isValid, isTrue);
    });
  });

  group('Validators.validateLecturePage()', () {
    test('returns valid when lecture content structure is present', () {
      const html = '<html><body>'
          '<div id="MainContent_pnlLecture">'
          '<div id="gvTileRepeaterLecture_0">Lecture 1</div>'
          '</div>'
          '</body></html>';
      final result = Validators.validateLecturePage(html);
      expect(result.isValid, isTrue);
      expect(result.pageType, PageType.lecture);
    });

    test('returns invalid with login form', () {
      const html = '<html><body>'
          '<input id="txtUsername" />'
          '</body></html>';
      final result = Validators.validateLecturePage(html);
      expect(result.isInvalid, isTrue);
      expect(result.pageType, PageType.login);
    });

    test('returns valid with ActivitySession class', () {
      const html = '<html><body>'
          '<div class="ActivitySession">Lecture content</div>'
          '</body></html>';
      final result = Validators.validateLecturePage(html);
      expect(result.isValid, isTrue);
    });

    test('returns valid with lblLectureTitle selector', () {
      const html = '<html><body>'
          '<span id="lblLectureTitle_0">Lecture Title</span>'
          '</body></html>';
      final result = Validators.validateLecturePage(html);
      expect(result.isValid, isTrue);
    });
  });

  group('Validators.validateCourseListPage()', () {
    test('returns valid with course cards and portlets', () {
      const html = '<html><body>'
          '<div id="MainContent_gvCourseList_0">CS101</div>'
          '<div class="m-portlet">Course Widget</div>'
          '<h3>CS101 - Intro</h3>'
          '</body></html>';
      final result = Validators.validateCourseListPage(html);
      expect(result.isValid, isTrue);
      expect(result.pageType, PageType.courses);
      expect(result.indicators.length, greaterThanOrEqualTo(2));
    });

    test('returns invalid with login form', () {
      const html = '<html><body>'
          '<input name="username" />'
          '</body></html>';
      final result = Validators.validateCourseListPage(html);
      expect(result.isInvalid, isTrue);
      expect(result.pageType, PageType.login);
    });

    test('returns invalid when no course structure found', () {
      const html = '<html><body>'
          '<div>Random content</div>'
          '</body></html>';
      final result = Validators.validateCourseListPage(html);
      expect(result.isInvalid, isTrue);
      expect(result.missingExpected, isNotNull);
    });

    test('detects course codes in h3 elements', () {
      const html = '<html><body>'
          '<h3>CS101 - Computer Science</h3>'
          '<h3>MATH201 - Linear Algebra</h3>'
          '<div class="m-portlet">Widget</div>'
          '</body></html>';
      final result = Validators.validateCourseListPage(html);
      expect(result.isValid, isTrue);
      expect(result.indicators.any((i) => i.startsWith('course_codes:')), isTrue);
    });
  });

  group('ValidationState enum', () {
    test('PageValidationResult.isValid returns true for valid state', () {
      const result = PageValidationResult(
        state: ValidationState.valid,
        pageType: PageType.assignment,
      );
      expect(result.isValid, isTrue);
      expect(result.isEmptyValid, isFalse);
      expect(result.isInvalid, isFalse);
    });

    test('PageValidationResult.isEmptyValid returns true for emptyValid state', () {
      const result = PageValidationResult(
        state: ValidationState.emptyValid,
        pageType: PageType.assignment,
      );
      expect(result.isEmptyValid, isTrue);
      expect(result.isValid, isFalse);
    });

    test('PageValidationResult.isInvalid returns true for invalid state', () {
      const result = PageValidationResult(
        state: ValidationState.invalid,
        pageType: PageType.unknown,
      );
      expect(result.isInvalid, isTrue);
    });
  });
}
