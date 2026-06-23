import 'package:freezed_annotation/freezed_annotation.dart';

part 'lecture.freezed.dart';
part 'lecture.g.dart';

/// Status of a lecture.
enum LectureStatus { newLecture, watched, unwatched }

/// Represents a VULMS lecture.
@freezed
abstract class Lecture with _$Lecture {
  const factory Lecture({
    required String courseCode,
    required String courseTitle,
    int? week,
    required String title,
    String? type,
    String? duration,
    @Default(LectureStatus.newLecture) LectureStatus status,
    String? url,
  }) = _Lecture;

  factory Lecture.fromJson(Map<String, dynamic> json) =>
      _$LectureFromJson(json);
}
