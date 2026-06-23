// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'lecture.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Lecture _$LectureFromJson(Map<String, dynamic> json) => _Lecture(
  courseCode: json['courseCode'] as String,
  courseTitle: json['courseTitle'] as String,
  week: (json['week'] as num?)?.toInt(),
  title: json['title'] as String,
  type: json['type'] as String?,
  duration: json['duration'] as String?,
  status:
      $enumDecodeNullable(_$LectureStatusEnumMap, json['status']) ??
      LectureStatus.newLecture,
  url: json['url'] as String?,
);

Map<String, dynamic> _$LectureToJson(_Lecture instance) => <String, dynamic>{
  'courseCode': instance.courseCode,
  'courseTitle': instance.courseTitle,
  'week': instance.week,
  'title': instance.title,
  'type': instance.type,
  'duration': instance.duration,
  'status': _$LectureStatusEnumMap[instance.status]!,
  'url': instance.url,
};

const _$LectureStatusEnumMap = {
  LectureStatus.newLecture: 'newLecture',
  LectureStatus.watched: 'watched',
  LectureStatus.unwatched: 'unwatched',
};
