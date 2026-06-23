import '../auth/session_manager.dart';
import '../models/activity.dart';
import '../models/assignment.dart';
import '../models/quiz.dart';
import '../models/gdb.dart';
import '../models/lecture.dart';
import '../utils/logger.dart';
import 'assignments_service.dart';
import 'quizzes_service.dart';
import 'gdbs_service.dart';
import 'lectures_service.dart';

class ActivitiesService {
  final VulmsLogger _logger;
  final AssignmentsService _assignmentsService;
  final QuizzesService _quizzesService;
  final GdbsService _gdbsService;
  final LecturesService _lecturesService;

  ActivitiesService({
    required SessionManager session,
    required VulmsLogger logger,
  })  : _logger = logger.child('activities'),
        _assignmentsService = AssignmentsService(session: session, logger: logger),
        _quizzesService = QuizzesService(session: session, logger: logger),
        _gdbsService = GdbsService(session: session, logger: logger),
        _lecturesService = LecturesService(session: session, logger: logger);

  Future<ActivityAggregate> getAll({
    String? courseCode,
    bool forceRefresh = false,
  }) async {
    _logger.info('Fetching all activities');

    final results = await Future.wait([
      _assignmentsService.getAll(courseCode: courseCode, forceRefresh: forceRefresh),
      _quizzesService.getAll(courseCode: courseCode, forceRefresh: forceRefresh),
      _gdbsService.getAll(courseCode: courseCode, forceRefresh: forceRefresh),
      _lecturesService.getAll(courseCode: courseCode, forceRefresh: forceRefresh),
    ]);

    final assignments = results[0] as List<Assignment>;
    final quizzes = results[1] as List<Quiz>;
    final gdbs = results[2] as List<Gdb>;
    final lectures = results[3] as List<Lecture>;

    final unified = <UnifiedActivity>[
      ...assignments.map((a) => _toUnifiedAssignment(a)),
      ...quizzes.map((q) => _toUnifiedQuiz(q)),
      ...gdbs.map((g) => _toUnifiedGdb(g)),
      ...lectures.map((l) => _toUnifiedLecture(l)),
    ];

    final aggregate = _buildAggregate(unified);

    _logger.info(
        'Activities: ${aggregate.pending.length} pending, '
        '${aggregate.submitted.length} submitted, '
        '${aggregate.missed.length} missed, '
        '${aggregate.resultDeclared.length} results');

    return aggregate;
  }

  UnifiedActivity _toUnifiedAssignment(Assignment a) {
    return UnifiedActivity(
      type: ActivityType.assignment,
      courseCode: a.courseCode,
      courseTitle: a.courseTitle,
      title: a.title,
      dueDate: a.dueDate,
      totalMarks: a.totalMarks,
      obtainedMarks: a.obtainedMarks,
      status: _mapAssignmentStatus(a.status),
    );
  }

  UnifiedActivity _toUnifiedQuiz(Quiz q) {
    return UnifiedActivity(
      type: ActivityType.quiz,
      courseCode: q.courseCode,
      courseTitle: q.courseTitle,
      title: q.title,
      dueDate: q.endDate,
      totalMarks: q.totalMarks,
      obtainedMarks: q.obtainedMarks,
      status: _mapQuizStatus(q),
    );
  }

  UnifiedActivity _toUnifiedGdb(Gdb g) {
    return UnifiedActivity(
      type: ActivityType.gdb,
      courseCode: g.courseCode,
      courseTitle: g.courseTitle,
      title: g.title,
      dueDate: g.dueDate,
      totalMarks: g.totalMarks,
      obtainedMarks: g.obtainedMarks,
      status: _mapGdbStatus(g.status),
    );
  }

  UnifiedActivity _toUnifiedLecture(Lecture l) {
    return UnifiedActivity(
      type: ActivityType.lecture,
      courseCode: l.courseCode,
      courseTitle: l.courseTitle,
      title: l.title,
      status: ActivityStatus.pending,
    );
  }

  ActivityStatus _mapAssignmentStatus(AssignmentStatus s) {
    switch (s) {
      case AssignmentStatus.submitted:
      case AssignmentStatus.attempted:
        return ActivityStatus.submitted;
      case AssignmentStatus.missed:
        return ActivityStatus.missed;
      case AssignmentStatus.resultDeclared:
        return ActivityStatus.resultDeclared;
      case AssignmentStatus.pending:
        return ActivityStatus.pending;
    }
  }

  ActivityStatus _mapQuizStatus(Quiz q) {
    if (q.submissionStatus == QuizSubmissionStatus.submitted) {
      return ActivityStatus.submitted;
    }
    if (q.resultStatus == QuizResultStatus.declared) {
      return ActivityStatus.resultDeclared;
    }
    return ActivityStatus.pending;
  }

  ActivityStatus _mapGdbStatus(GdbStatus s) {
    switch (s) {
      case GdbStatus.submitted:
      case GdbStatus.attempted:
        return ActivityStatus.submitted;
      case GdbStatus.missed:
        return ActivityStatus.missed;
      case GdbStatus.resultDeclared:
        return ActivityStatus.resultDeclared;
      case GdbStatus.pending:
        return ActivityStatus.pending;
    }
  }

  ActivityAggregate _buildAggregate(List<UnifiedActivity> activities) {
    final pending = <UnifiedActivity>[];
    final submitted = <UnifiedActivity>[];
    final missed = <UnifiedActivity>[];
    final resultDeclared = <UnifiedActivity>[];

    for (final activity in activities) {
      switch (activity.status) {
        case ActivityStatus.pending:
          pending.add(activity);
          break;
        case ActivityStatus.submitted:
          submitted.add(activity);
          break;
        case ActivityStatus.missed:
          missed.add(activity);
          break;
        case ActivityStatus.resultDeclared:
          resultDeclared.add(activity);
          break;
      }
    }

    return ActivityAggregate(
      pending: pending,
      submitted: submitted,
      missed: missed,
      resultDeclared: resultDeclared,
    );
  }

  void invalidateCache() {}
}
