import 'package:freezed_annotation/freezed_annotation.dart';

part 'activity.freezed.dart';

/// Type of activity.
enum ActivityType { assignment, quiz, gdb, lecture }

/// Unified status for activities.
enum ActivityStatus { pending, submitted, missed, resultDeclared }

/// A unified activity representation across all module types.
@freezed
abstract class UnifiedActivity with _$UnifiedActivity {
  const factory UnifiedActivity({
    required ActivityType type,
    required String courseCode,
    required String courseTitle,
    required String title,
    DateTime? dueDate,
    double? totalMarks,
    double? obtainedMarks,
    @Default(ActivityStatus.pending) ActivityStatus status,
  }) = _UnifiedActivity;
}

/// Aggregated activities grouped by status.
@freezed
abstract class ActivityAggregate with _$ActivityAggregate {
  const factory ActivityAggregate({
    @Default([]) List<UnifiedActivity> pending,
    @Default([]) List<UnifiedActivity> submitted,
    @Default([]) List<UnifiedActivity> missed,
    @Default([]) List<UnifiedActivity> resultDeclared,
  }) = _ActivityAggregate;
}
