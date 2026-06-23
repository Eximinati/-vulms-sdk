// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'lecture.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Lecture {

 String get courseCode; String get courseTitle; int? get week; String get title; String? get type; String? get duration; LectureStatus get status; String? get url;
/// Create a copy of Lecture
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LectureCopyWith<Lecture> get copyWith => _$LectureCopyWithImpl<Lecture>(this as Lecture, _$identity);

  /// Serializes this Lecture to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Lecture&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.week, week) || other.week == week)&&(identical(other.title, title) || other.title == title)&&(identical(other.type, type) || other.type == type)&&(identical(other.duration, duration) || other.duration == duration)&&(identical(other.status, status) || other.status == status)&&(identical(other.url, url) || other.url == url));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,courseCode,courseTitle,week,title,type,duration,status,url);

@override
String toString() {
  return 'Lecture(courseCode: $courseCode, courseTitle: $courseTitle, week: $week, title: $title, type: $type, duration: $duration, status: $status, url: $url)';
}


}

/// @nodoc
abstract mixin class $LectureCopyWith<$Res>  {
  factory $LectureCopyWith(Lecture value, $Res Function(Lecture) _then) = _$LectureCopyWithImpl;
@useResult
$Res call({
 String courseCode, String courseTitle, int? week, String title, String? type, String? duration, LectureStatus status, String? url
});




}
/// @nodoc
class _$LectureCopyWithImpl<$Res>
    implements $LectureCopyWith<$Res> {
  _$LectureCopyWithImpl(this._self, this._then);

  final Lecture _self;
  final $Res Function(Lecture) _then;

/// Create a copy of Lecture
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? courseCode = null,Object? courseTitle = null,Object? week = freezed,Object? title = null,Object? type = freezed,Object? duration = freezed,Object? status = null,Object? url = freezed,}) {
  return _then(_self.copyWith(
courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,week: freezed == week ? _self.week : week // ignore: cast_nullable_to_non_nullable
as int?,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,type: freezed == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String?,duration: freezed == duration ? _self.duration : duration // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as LectureStatus,url: freezed == url ? _self.url : url // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [Lecture].
extension LecturePatterns on Lecture {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Lecture value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Lecture() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Lecture value)  $default,){
final _that = this;
switch (_that) {
case _Lecture():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Lecture value)?  $default,){
final _that = this;
switch (_that) {
case _Lecture() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String courseCode,  String courseTitle,  int? week,  String title,  String? type,  String? duration,  LectureStatus status,  String? url)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Lecture() when $default != null:
return $default(_that.courseCode,_that.courseTitle,_that.week,_that.title,_that.type,_that.duration,_that.status,_that.url);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String courseCode,  String courseTitle,  int? week,  String title,  String? type,  String? duration,  LectureStatus status,  String? url)  $default,) {final _that = this;
switch (_that) {
case _Lecture():
return $default(_that.courseCode,_that.courseTitle,_that.week,_that.title,_that.type,_that.duration,_that.status,_that.url);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String courseCode,  String courseTitle,  int? week,  String title,  String? type,  String? duration,  LectureStatus status,  String? url)?  $default,) {final _that = this;
switch (_that) {
case _Lecture() when $default != null:
return $default(_that.courseCode,_that.courseTitle,_that.week,_that.title,_that.type,_that.duration,_that.status,_that.url);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Lecture implements Lecture {
  const _Lecture({required this.courseCode, required this.courseTitle, this.week, required this.title, this.type, this.duration, this.status = LectureStatus.newLecture, this.url});
  factory _Lecture.fromJson(Map<String, dynamic> json) => _$LectureFromJson(json);

@override final  String courseCode;
@override final  String courseTitle;
@override final  int? week;
@override final  String title;
@override final  String? type;
@override final  String? duration;
@override@JsonKey() final  LectureStatus status;
@override final  String? url;

/// Create a copy of Lecture
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LectureCopyWith<_Lecture> get copyWith => __$LectureCopyWithImpl<_Lecture>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$LectureToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Lecture&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.week, week) || other.week == week)&&(identical(other.title, title) || other.title == title)&&(identical(other.type, type) || other.type == type)&&(identical(other.duration, duration) || other.duration == duration)&&(identical(other.status, status) || other.status == status)&&(identical(other.url, url) || other.url == url));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,courseCode,courseTitle,week,title,type,duration,status,url);

@override
String toString() {
  return 'Lecture(courseCode: $courseCode, courseTitle: $courseTitle, week: $week, title: $title, type: $type, duration: $duration, status: $status, url: $url)';
}


}

/// @nodoc
abstract mixin class _$LectureCopyWith<$Res> implements $LectureCopyWith<$Res> {
  factory _$LectureCopyWith(_Lecture value, $Res Function(_Lecture) _then) = __$LectureCopyWithImpl;
@override @useResult
$Res call({
 String courseCode, String courseTitle, int? week, String title, String? type, String? duration, LectureStatus status, String? url
});




}
/// @nodoc
class __$LectureCopyWithImpl<$Res>
    implements _$LectureCopyWith<$Res> {
  __$LectureCopyWithImpl(this._self, this._then);

  final _Lecture _self;
  final $Res Function(_Lecture) _then;

/// Create a copy of Lecture
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? courseCode = null,Object? courseTitle = null,Object? week = freezed,Object? title = null,Object? type = freezed,Object? duration = freezed,Object? status = null,Object? url = freezed,}) {
  return _then(_Lecture(
courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,week: freezed == week ? _self.week : week // ignore: cast_nullable_to_non_nullable
as int?,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,type: freezed == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String?,duration: freezed == duration ? _self.duration : duration // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as LectureStatus,url: freezed == url ? _self.url : url // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
