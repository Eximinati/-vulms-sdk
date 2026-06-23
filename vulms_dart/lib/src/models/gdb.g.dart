// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'gdb.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Gdb _$GdbFromJson(Map<String, dynamic> json) => _Gdb(
  courseCode: json['courseCode'] as String,
  courseTitle: json['courseTitle'] as String,
  title: json['title'] as String,
  dueDate: json['dueDate'] == null
      ? null
      : DateTime.parse(json['dueDate'] as String),
  totalMarks: (json['totalMarks'] as num?)?.toDouble(),
  obtainedMarks: (json['obtainedMarks'] as num?)?.toDouble(),
  status:
      $enumDecodeNullable(_$GdbStatusEnumMap, json['status']) ??
      GdbStatus.pending,
);

Map<String, dynamic> _$GdbToJson(_Gdb instance) => <String, dynamic>{
  'courseCode': instance.courseCode,
  'courseTitle': instance.courseTitle,
  'title': instance.title,
  'dueDate': instance.dueDate?.toIso8601String(),
  'totalMarks': instance.totalMarks,
  'obtainedMarks': instance.obtainedMarks,
  'status': _$GdbStatusEnumMap[instance.status]!,
};

const _$GdbStatusEnumMap = {
  GdbStatus.pending: 'pending',
  GdbStatus.submitted: 'submitted',
  GdbStatus.attempted: 'attempted',
  GdbStatus.missed: 'missed',
  GdbStatus.resultDeclared: 'resultDeclared',
};
