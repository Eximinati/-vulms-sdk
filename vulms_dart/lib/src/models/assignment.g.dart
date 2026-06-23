// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assignment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Assignment _$AssignmentFromJson(Map<String, dynamic> json) => _Assignment(
  courseCode: json['courseCode'] as String,
  courseTitle: json['courseTitle'] as String,
  title: json['title'] as String,
  lesson: json['lesson'] as String?,
  dueDate: json['dueDate'] == null
      ? null
      : DateTime.parse(json['dueDate'] as String),
  totalMarks: (json['totalMarks'] as num?)?.toDouble(),
  status:
      $enumDecodeNullable(_$AssignmentStatusEnumMap, json['status']) ??
      AssignmentStatus.pending,
  submitDate: json['submitDate'] == null
      ? null
      : DateTime.parse(json['submitDate'] as String),
  fileSize: json['fileSize'] as String?,
  obtainedMarks: (json['obtainedMarks'] as num?)?.toDouble(),
);

Map<String, dynamic> _$AssignmentToJson(_Assignment instance) =>
    <String, dynamic>{
      'courseCode': instance.courseCode,
      'courseTitle': instance.courseTitle,
      'title': instance.title,
      'lesson': instance.lesson,
      'dueDate': instance.dueDate?.toIso8601String(),
      'totalMarks': instance.totalMarks,
      'status': _$AssignmentStatusEnumMap[instance.status]!,
      'submitDate': instance.submitDate?.toIso8601String(),
      'fileSize': instance.fileSize,
      'obtainedMarks': instance.obtainedMarks,
    };

const _$AssignmentStatusEnumMap = {
  AssignmentStatus.pending: 'pending',
  AssignmentStatus.submitted: 'submitted',
  AssignmentStatus.attempted: 'attempted',
  AssignmentStatus.missed: 'missed',
  AssignmentStatus.resultDeclared: 'resultDeclared',
};
