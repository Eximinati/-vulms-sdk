import 'package:freezed_annotation/freezed_annotation.dart';

part 'course.freezed.dart';
part 'course.g.dart';

/// Represents an enrolled course.
@freezed
abstract class Course with _$Course {
  const factory Course({
    required String code,
    required String title,
  }) = _Course;

  factory Course.fromJson(Map<String, dynamic> json) => _$CourseFromJson(json);
}
