import 'package:freezed_annotation/freezed_annotation.dart';

part 'assignment.freezed.dart';
part 'assignment.g.dart';

/// Status of an assignment.
enum AssignmentStatus {
  pending,
  submitted,
  attempted,
  missed,
  resultDeclared,
}

/// Represents a VULMS assignment.
@freezed
abstract class Assignment with _$Assignment {
  const factory Assignment({
    required String courseCode,
    required String courseTitle,
    required String title,
    String? lesson,
    DateTime? dueDate,
    double? totalMarks,
    @Default(AssignmentStatus.pending) AssignmentStatus status,
    DateTime? submitDate,
    String? fileSize,
    double? obtainedMarks,
  }) = _Assignment;

  factory Assignment.fromJson(Map<String, dynamic> json) =>
      _$AssignmentFromJson(json);
}
