import 'package:freezed_annotation/freezed_annotation.dart';

part 'grade.freezed.dart';
part 'grade.g.dart';

/// Represents a single grade entry.
@freezed
abstract class Grade with _$Grade {
  const factory Grade({
    required String courseCode,
    required String courseTitle,
    required String title,
    String? type,
    double? totalMarks,
    double? obtainedMarks,
    String? percentage,
    String? letterGrade,
    DateTime? datePosted,
  }) = _Grade;

  factory Grade.fromJson(Map<String, dynamic> json) => _$GradeFromJson(json);
}
