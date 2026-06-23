import 'package:freezed_annotation/freezed_annotation.dart';

part 'announcement.freezed.dart';
part 'announcement.g.dart';

/// Represents a course announcement.
@freezed
abstract class Announcement with _$Announcement {
  const factory Announcement({
    required String courseCode,
    required String title,
    String? body,
    DateTime? date,
    String? author,
  }) = _Announcement;

  factory Announcement.fromJson(Map<String, dynamic> json) =>
      _$AnnouncementFromJson(json);
}
