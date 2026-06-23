// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quiz.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Quiz _$QuizFromJson(Map<String, dynamic> json) => _Quiz(
  courseCode: json['courseCode'] as String,
  courseTitle: json['courseTitle'] as String,
  title: json['title'] as String,
  startDate: json['startDate'] == null
      ? null
      : DateTime.parse(json['startDate'] as String),
  endDate: json['endDate'] == null
      ? null
      : DateTime.parse(json['endDate'] as String),
  totalMarks: (json['totalMarks'] as num?)?.toDouble(),
  obtainedMarks: (json['obtainedMarks'] as num?)?.toDouble(),
  availabilityStatus:
      $enumDecodeNullable(
        _$QuizAvailabilityStatusEnumMap,
        json['availabilityStatus'],
      ) ??
      QuizAvailabilityStatus.unknown,
  submissionStatus:
      $enumDecodeNullable(
        _$QuizSubmissionStatusEnumMap,
        json['submissionStatus'],
      ) ??
      QuizSubmissionStatus.unknown,
  resultStatus:
      $enumDecodeNullable(_$QuizResultStatusEnumMap, json['resultStatus']) ??
      QuizResultStatus.unknown,
  submitDate: json['submitDate'] == null
      ? null
      : DateTime.parse(json['submitDate'] as String),
);

Map<String, dynamic> _$QuizToJson(_Quiz instance) => <String, dynamic>{
  'courseCode': instance.courseCode,
  'courseTitle': instance.courseTitle,
  'title': instance.title,
  'startDate': instance.startDate?.toIso8601String(),
  'endDate': instance.endDate?.toIso8601String(),
  'totalMarks': instance.totalMarks,
  'obtainedMarks': instance.obtainedMarks,
  'availabilityStatus':
      _$QuizAvailabilityStatusEnumMap[instance.availabilityStatus]!,
  'submissionStatus': _$QuizSubmissionStatusEnumMap[instance.submissionStatus]!,
  'resultStatus': _$QuizResultStatusEnumMap[instance.resultStatus]!,
  'submitDate': instance.submitDate?.toIso8601String(),
};

const _$QuizAvailabilityStatusEnumMap = {
  QuizAvailabilityStatus.open: 'open',
  QuizAvailabilityStatus.closed: 'closed',
  QuizAvailabilityStatus.upcoming: 'upcoming',
  QuizAvailabilityStatus.unknown: 'unknown',
};

const _$QuizSubmissionStatusEnumMap = {
  QuizSubmissionStatus.submitted: 'submitted',
  QuizSubmissionStatus.notSubmitted: 'notSubmitted',
  QuizSubmissionStatus.unknown: 'unknown',
};

const _$QuizResultStatusEnumMap = {
  QuizResultStatus.declared: 'declared',
  QuizResultStatus.pending: 'pending',
  QuizResultStatus.unknown: 'unknown',
};
