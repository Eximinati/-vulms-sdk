// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'grade.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Grade {

 String get courseCode; String get courseTitle; String get title; String? get type; double? get totalMarks; double? get obtainedMarks; String? get percentage; String? get letterGrade; DateTime? get datePosted;
/// Create a copy of Grade
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$GradeCopyWith<Grade> get copyWith => _$GradeCopyWithImpl<Grade>(this as Grade, _$identity);

  /// Serializes this Grade to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Grade&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.title, title) || other.title == title)&&(identical(other.type, type) || other.type == type)&&(identical(other.totalMarks, totalMarks) || other.totalMarks == totalMarks)&&(identical(other.obtainedMarks, obtainedMarks) || other.obtainedMarks == obtainedMarks)&&(identical(other.percentage, percentage) || other.percentage == percentage)&&(identical(other.letterGrade, letterGrade) || other.letterGrade == letterGrade)&&(identical(other.datePosted, datePosted) || other.datePosted == datePosted));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,courseCode,courseTitle,title,type,totalMarks,obtainedMarks,percentage,letterGrade,datePosted);

@override
String toString() {
  return 'Grade(courseCode: $courseCode, courseTitle: $courseTitle, title: $title, type: $type, totalMarks: $totalMarks, obtainedMarks: $obtainedMarks, percentage: $percentage, letterGrade: $letterGrade, datePosted: $datePosted)';
}


}

/// @nodoc
abstract mixin class $GradeCopyWith<$Res>  {
  factory $GradeCopyWith(Grade value, $Res Function(Grade) _then) = _$GradeCopyWithImpl;
@useResult
$Res call({
 String courseCode, String courseTitle, String title, String? type, double? totalMarks, double? obtainedMarks, String? percentage, String? letterGrade, DateTime? datePosted
});




}
/// @nodoc
class _$GradeCopyWithImpl<$Res>
    implements $GradeCopyWith<$Res> {
  _$GradeCopyWithImpl(this._self, this._then);

  final Grade _self;
  final $Res Function(Grade) _then;

/// Create a copy of Grade
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? courseCode = null,Object? courseTitle = null,Object? title = null,Object? type = freezed,Object? totalMarks = freezed,Object? obtainedMarks = freezed,Object? percentage = freezed,Object? letterGrade = freezed,Object? datePosted = freezed,}) {
  return _then(_self.copyWith(
courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,type: freezed == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String?,totalMarks: freezed == totalMarks ? _self.totalMarks : totalMarks // ignore: cast_nullable_to_non_nullable
as double?,obtainedMarks: freezed == obtainedMarks ? _self.obtainedMarks : obtainedMarks // ignore: cast_nullable_to_non_nullable
as double?,percentage: freezed == percentage ? _self.percentage : percentage // ignore: cast_nullable_to_non_nullable
as String?,letterGrade: freezed == letterGrade ? _self.letterGrade : letterGrade // ignore: cast_nullable_to_non_nullable
as String?,datePosted: freezed == datePosted ? _self.datePosted : datePosted // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

}


/// Adds pattern-matching-related methods to [Grade].
extension GradePatterns on Grade {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Grade value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Grade() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Grade value)  $default,){
final _that = this;
switch (_that) {
case _Grade():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Grade value)?  $default,){
final _that = this;
switch (_that) {
case _Grade() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String courseCode,  String courseTitle,  String title,  String? type,  double? totalMarks,  double? obtainedMarks,  String? percentage,  String? letterGrade,  DateTime? datePosted)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Grade() when $default != null:
return $default(_that.courseCode,_that.courseTitle,_that.title,_that.type,_that.totalMarks,_that.obtainedMarks,_that.percentage,_that.letterGrade,_that.datePosted);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String courseCode,  String courseTitle,  String title,  String? type,  double? totalMarks,  double? obtainedMarks,  String? percentage,  String? letterGrade,  DateTime? datePosted)  $default,) {final _that = this;
switch (_that) {
case _Grade():
return $default(_that.courseCode,_that.courseTitle,_that.title,_that.type,_that.totalMarks,_that.obtainedMarks,_that.percentage,_that.letterGrade,_that.datePosted);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String courseCode,  String courseTitle,  String title,  String? type,  double? totalMarks,  double? obtainedMarks,  String? percentage,  String? letterGrade,  DateTime? datePosted)?  $default,) {final _that = this;
switch (_that) {
case _Grade() when $default != null:
return $default(_that.courseCode,_that.courseTitle,_that.title,_that.type,_that.totalMarks,_that.obtainedMarks,_that.percentage,_that.letterGrade,_that.datePosted);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Grade implements Grade {
  const _Grade({required this.courseCode, required this.courseTitle, required this.title, this.type, this.totalMarks, this.obtainedMarks, this.percentage, this.letterGrade, this.datePosted});
  factory _Grade.fromJson(Map<String, dynamic> json) => _$GradeFromJson(json);

@override final  String courseCode;
@override final  String courseTitle;
@override final  String title;
@override final  String? type;
@override final  double? totalMarks;
@override final  double? obtainedMarks;
@override final  String? percentage;
@override final  String? letterGrade;
@override final  DateTime? datePosted;

/// Create a copy of Grade
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$GradeCopyWith<_Grade> get copyWith => __$GradeCopyWithImpl<_Grade>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$GradeToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Grade&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.title, title) || other.title == title)&&(identical(other.type, type) || other.type == type)&&(identical(other.totalMarks, totalMarks) || other.totalMarks == totalMarks)&&(identical(other.obtainedMarks, obtainedMarks) || other.obtainedMarks == obtainedMarks)&&(identical(other.percentage, percentage) || other.percentage == percentage)&&(identical(other.letterGrade, letterGrade) || other.letterGrade == letterGrade)&&(identical(other.datePosted, datePosted) || other.datePosted == datePosted));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,courseCode,courseTitle,title,type,totalMarks,obtainedMarks,percentage,letterGrade,datePosted);

@override
String toString() {
  return 'Grade(courseCode: $courseCode, courseTitle: $courseTitle, title: $title, type: $type, totalMarks: $totalMarks, obtainedMarks: $obtainedMarks, percentage: $percentage, letterGrade: $letterGrade, datePosted: $datePosted)';
}


}

/// @nodoc
abstract mixin class _$GradeCopyWith<$Res> implements $GradeCopyWith<$Res> {
  factory _$GradeCopyWith(_Grade value, $Res Function(_Grade) _then) = __$GradeCopyWithImpl;
@override @useResult
$Res call({
 String courseCode, String courseTitle, String title, String? type, double? totalMarks, double? obtainedMarks, String? percentage, String? letterGrade, DateTime? datePosted
});




}
/// @nodoc
class __$GradeCopyWithImpl<$Res>
    implements _$GradeCopyWith<$Res> {
  __$GradeCopyWithImpl(this._self, this._then);

  final _Grade _self;
  final $Res Function(_Grade) _then;

/// Create a copy of Grade
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? courseCode = null,Object? courseTitle = null,Object? title = null,Object? type = freezed,Object? totalMarks = freezed,Object? obtainedMarks = freezed,Object? percentage = freezed,Object? letterGrade = freezed,Object? datePosted = freezed,}) {
  return _then(_Grade(
courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,type: freezed == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String?,totalMarks: freezed == totalMarks ? _self.totalMarks : totalMarks // ignore: cast_nullable_to_non_nullable
as double?,obtainedMarks: freezed == obtainedMarks ? _self.obtainedMarks : obtainedMarks // ignore: cast_nullable_to_non_nullable
as double?,percentage: freezed == percentage ? _self.percentage : percentage // ignore: cast_nullable_to_non_nullable
as String?,letterGrade: freezed == letterGrade ? _self.letterGrade : letterGrade // ignore: cast_nullable_to_non_nullable
as String?,datePosted: freezed == datePosted ? _self.datePosted : datePosted // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}


}

// dart format on
