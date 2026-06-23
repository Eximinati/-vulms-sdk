import 'package:freezed_annotation/freezed_annotation.dart';

part 'gdb.freezed.dart';
part 'gdb.g.dart';

/// Status of a Graded Discussion Board.
enum GdbStatus { pending, submitted, attempted, missed, resultDeclared }

/// Represents a VULMS Graded Discussion Board.
@freezed
abstract class Gdb with _$Gdb {
  const factory Gdb({
    required String courseCode,
    required String courseTitle,
    required String title,
    DateTime? dueDate,
    double? totalMarks,
    double? obtainedMarks,
    @Default(GdbStatus.pending) GdbStatus status,
  }) = _Gdb;

  factory Gdb.fromJson(Map<String, dynamic> json) => _$GdbFromJson(json);
}
