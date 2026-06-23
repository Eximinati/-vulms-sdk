/// VULMS base URL and endpoint constants.
class VulmsUrls {
  VulmsUrls._();

  static const String baseUrl = 'https://vulms.vu.edu.pk';

  static const String home = '/Home.aspx';
  static const String courseHome = '/CourseHome.aspx';
  static const String activityCalendar = '/ActivityCalendar/ActivityCalendar.aspx';
  static const String gradeBook = '/GradeBook/GradeBook.aspx';
  static const String lectureSchedule = '/LectureSchedule/LectureSchedule.aspx';
  static const String assignments = '/Assignments/StudentAssignmentListView.aspx';
  static const String gdb = '/GDB/Default.aspx';
  static const String quizzes = '/Quiz/QuizList.aspx';
  static const String root = '/';
}

/// ASP.NET hidden field selectors.
class AspNetSelectors {
  AspNetSelectors._();

  static const String viewState = 'input#__VIEWSTATE';
  static const String eventValidation = 'input#__EVENTVALIDATION';
  static const String viewStateGenerator = 'input#__VIEWSTATEGENERATOR';
  static const String previousPage = 'input#__PREVIOUSPAGE';

  // Root form selectors (by name attribute)
  static const String rootViewState = 'input[name="__VIEWSTATE"]';
  static const String rootEventValidation = 'input[name="__EVENTVALIDATION"]';
  static const String rootViewStateGenerator =
      'input[name="__VIEWSTATEGENERATOR"]';
  static const String recaptchaResponse = 'input[name="g-recaptcha-response"]';
}
