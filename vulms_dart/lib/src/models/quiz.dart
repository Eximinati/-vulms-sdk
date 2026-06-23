import 'package:freezed_annotation/freezed_annotation.dart';

part 'quiz.freezed.dart';
part 'quiz.g.dart';

/// Availability status of a quiz.
enum QuizAvailabilityStatus { open, closed, upcoming, unknown }

/// Submission status of a quiz.
enum QuizSubmissionStatus { submitted, notSubmitted, unknown }

/// Result status of a quiz.
enum QuizResultStatus { declared, pending, unknown }

/// Represents a VULMS quiz.
@freezed
abstract class Quiz with _$Quiz {
  const factory Quiz({
    required String courseCode,
    required String courseTitle,
    required String title,
    DateTime? startDate,
    DateTime? endDate,
    double? totalMarks,
    double? obtainedMarks,
    @Default(QuizAvailabilityStatus.unknown)
    QuizAvailabilityStatus availabilityStatus,
    @Default(QuizSubmissionStatus.unknown) QuizSubmissionStatus submissionStatus,
    @Default(QuizResultStatus.unknown) QuizResultStatus resultStatus,
    DateTime? submitDate,
  }) = _Quiz;

  factory Quiz.fromJson(Map<String, dynamic> json) => _$QuizFromJson(json);
}
