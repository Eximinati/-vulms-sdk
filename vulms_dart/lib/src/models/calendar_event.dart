import 'package:freezed_annotation/freezed_annotation.dart';

part 'calendar_event.freezed.dart';
part 'calendar_event.g.dart';

/// Type of calendar event.
enum CalendarEventType {
  assignment,
  quiz,
  gdb,
  lecture,
  exam,
  other,
}

/// Represents a calendar event from VULMS.
@freezed
abstract class CalendarEvent with _$CalendarEvent {
  const factory CalendarEvent({
    required String courseCode,
    required String title,
    required DateTime date,
    CalendarEventType? type,
    String? description,
    String? time,
  }) = _CalendarEvent;

  factory CalendarEvent.fromJson(Map<String, dynamic> json) =>
      _$CalendarEventFromJson(json);
}
