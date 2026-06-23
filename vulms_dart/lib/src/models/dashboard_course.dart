import 'package:freezed_annotation/freezed_annotation.dart';

part 'dashboard_course.freezed.dart';

/// Activity preview from the dashboard.
@freezed
abstract class DashboardActivityPreview with _$DashboardActivityPreview {
  const factory DashboardActivityPreview({
    required String type,
    String? courseCode,
    bool? isPending,
    bool? isNew,
    bool? isUpcoming,
  }) = _DashboardActivityPreview;
}

/// Dashboard course overview with activity indicators.
@freezed
abstract class DashboardCourse with _$DashboardCourse {
  const factory DashboardCourse({
    required String courseCode,
    required String courseTitle,
    @Default(false) bool hasQuizzes,
    @Default(false) bool hasAssignments,
    @Default(false) bool hasGdbs,
    @Default(false) bool hasLectures,
    @Default(0) int quizCount,
    @Default(0) int assignmentCount,
    @Default(0) int gdbCount,
    @Default(0) int lectureCount,
    @Default(0) int upcomingCount,
    @Default(0) int pendingCount,
    @Default([]) List<DashboardActivityPreview> activities,
  }) = _DashboardCourse;
}
