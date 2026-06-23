// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'assignment.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Assignment {

 String get courseCode; String get courseTitle; String get title; String? get lesson; DateTime? get dueDate; double? get totalMarks; AssignmentStatus get status; DateTime? get submitDate; String? get fileSize; double? get obtainedMarks;
/// Create a copy of Assignment
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AssignmentCopyWith<Assignment> get copyWith => _$AssignmentCopyWithImpl<Assignment>(this as Assignment, _$identity);

  /// Serializes this Assignment to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Assignment&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.title, title) || other.title == title)&&(identical(other.lesson, lesson) || other.lesson == lesson)&&(identical(other.dueDate, dueDate) || other.dueDate == dueDate)&&(identical(other.totalMarks, totalMarks) || other.totalMarks == totalMarks)&&(identical(other.status, status) || other.status == status)&&(identical(other.submitDate, submitDate) || other.submitDate == submitDate)&&(identical(other.fileSize, fileSize) || other.fileSize == fileSize)&&(identical(other.obtainedMarks, obtainedMarks) || other.obtainedMarks == obtainedMarks));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,courseCode,courseTitle,title,lesson,dueDate,totalMarks,status,submitDate,fileSize,obtainedMarks);

@override
String toString() {
  return 'Assignment(courseCode: $courseCode, courseTitle: $courseTitle, title: $title, lesson: $lesson, dueDate: $dueDate, totalMarks: $totalMarks, status: $status, submitDate: $submitDate, fileSize: $fileSize, obtainedMarks: $obtainedMarks)';
}


}

/// @nodoc
abstract mixin class $AssignmentCopyWith<$Res>  {
  factory $AssignmentCopyWith(Assignment value, $Res Function(Assignment) _then) = _$AssignmentCopyWithImpl;
@useResult
$Res call({
 String courseCode, String courseTitle, String title, String? lesson, DateTime? dueDate, double? totalMarks, AssignmentStatus status, DateTime? submitDate, String? fileSize, double? obtainedMarks
});




}
/// @nodoc
class _$AssignmentCopyWithImpl<$Res>
    implements $AssignmentCopyWith<$Res> {
  _$AssignmentCopyWithImpl(this._self, this._then);

  final Assignment _self;
  final $Res Function(Assignment) _then;

/// Create a copy of Assignment
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? courseCode = null,Object? courseTitle = null,Object? title = null,Object? lesson = freezed,Object? dueDate = freezed,Object? totalMarks = freezed,Object? status = null,Object? submitDate = freezed,Object? fileSize = freezed,Object? obtainedMarks = freezed,}) {
  return _then(_self.copyWith(
courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,lesson: freezed == lesson ? _self.lesson : lesson // ignore: cast_nullable_to_non_nullable
as String?,dueDate: freezed == dueDate ? _self.dueDate : dueDate // ignore: cast_nullable_to_non_nullable
as DateTime?,totalMarks: freezed == totalMarks ? _self.totalMarks : totalMarks // ignore: cast_nullable_to_non_nullable
as double?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as AssignmentStatus,submitDate: freezed == submitDate ? _self.submitDate : submitDate // ignore: cast_nullable_to_non_nullable
as DateTime?,fileSize: freezed == fileSize ? _self.fileSize : fileSize // ignore: cast_nullable_to_non_nullable
as String?,obtainedMarks: freezed == obtainedMarks ? _self.obtainedMarks : obtainedMarks // ignore: cast_nullable_to_non_nullable
as double?,
  ));
}

}


/// Adds pattern-matching-related methods to [Assignment].
extension AssignmentPatterns on Assignment {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Assignment value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Assignment() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Assignment value)  $default,){
final _that = this;
switch (_that) {
case _Assignment():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Assignment value)?  $default,){
final _that = this;
switch (_that) {
case _Assignment() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String courseCode,  String courseTitle,  String title,  String? lesson,  DateTime? dueDate,  double? totalMarks,  AssignmentStatus status,  DateTime? submitDate,  String? fileSize,  double? obtainedMarks)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Assignment() when $default != null:
return $default(_that.courseCode,_that.courseTitle,_that.title,_that.lesson,_that.dueDate,_that.totalMarks,_that.status,_that.submitDate,_that.fileSize,_that.obtainedMarks);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String courseCode,  String courseTitle,  String title,  String? lesson,  DateTime? dueDate,  double? totalMarks,  AssignmentStatus status,  DateTime? submitDate,  String? fileSize,  double? obtainedMarks)  $default,) {final _that = this;
switch (_that) {
case _Assignment():
return $default(_that.courseCode,_that.courseTitle,_that.title,_that.lesson,_that.dueDate,_that.totalMarks,_that.status,_that.submitDate,_that.fileSize,_that.obtainedMarks);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String courseCode,  String courseTitle,  String title,  String? lesson,  DateTime? dueDate,  double? totalMarks,  AssignmentStatus status,  DateTime? submitDate,  String? fileSize,  double? obtainedMarks)?  $default,) {final _that = this;
switch (_that) {
case _Assignment() when $default != null:
return $default(_that.courseCode,_that.courseTitle,_that.title,_that.lesson,_that.dueDate,_that.totalMarks,_that.status,_that.submitDate,_that.fileSize,_that.obtainedMarks);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Assignment implements Assignment {
  const _Assignment({required this.courseCode, required this.courseTitle, required this.title, this.lesson, this.dueDate, this.totalMarks, this.status = AssignmentStatus.pending, this.submitDate, this.fileSize, this.obtainedMarks});
  factory _Assignment.fromJson(Map<String, dynamic> json) => _$AssignmentFromJson(json);

@override final  String courseCode;
@override final  String courseTitle;
@override final  String title;
@override final  String? lesson;
@override final  DateTime? dueDate;
@override final  double? totalMarks;
@override@JsonKey() final  AssignmentStatus status;
@override final  DateTime? submitDate;
@override final  String? fileSize;
@override final  double? obtainedMarks;

/// Create a copy of Assignment
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AssignmentCopyWith<_Assignment> get copyWith => __$AssignmentCopyWithImpl<_Assignment>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AssignmentToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Assignment&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.title, title) || other.title == title)&&(identical(other.lesson, lesson) || other.lesson == lesson)&&(identical(other.dueDate, dueDate) || other.dueDate == dueDate)&&(identical(other.totalMarks, totalMarks) || other.totalMarks == totalMarks)&&(identical(other.status, status) || other.status == status)&&(identical(other.submitDate, submitDate) || other.submitDate == submitDate)&&(identical(other.fileSize, fileSize) || other.fileSize == fileSize)&&(identical(other.obtainedMarks, obtainedMarks) || other.obtainedMarks == obtainedMarks));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,courseCode,courseTitle,title,lesson,dueDate,totalMarks,status,submitDate,fileSize,obtainedMarks);

@override
String toString() {
  return 'Assignment(courseCode: $courseCode, courseTitle: $courseTitle, title: $title, lesson: $lesson, dueDate: $dueDate, totalMarks: $totalMarks, status: $status, submitDate: $submitDate, fileSize: $fileSize, obtainedMarks: $obtainedMarks)';
}


}

/// @nodoc
abstract mixin class _$AssignmentCopyWith<$Res> implements $AssignmentCopyWith<$Res> {
  factory _$AssignmentCopyWith(_Assignment value, $Res Function(_Assignment) _then) = __$AssignmentCopyWithImpl;
@override @useResult
$Res call({
 String courseCode, String courseTitle, String title, String? lesson, DateTime? dueDate, double? totalMarks, AssignmentStatus status, DateTime? submitDate, String? fileSize, double? obtainedMarks
});




}
/// @nodoc
class __$AssignmentCopyWithImpl<$Res>
    implements _$AssignmentCopyWith<$Res> {
  __$AssignmentCopyWithImpl(this._self, this._then);

  final _Assignment _self;
  final $Res Function(_Assignment) _then;

/// Create a copy of Assignment
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? courseCode = null,Object? courseTitle = null,Object? title = null,Object? lesson = freezed,Object? dueDate = freezed,Object? totalMarks = freezed,Object? status = null,Object? submitDate = freezed,Object? fileSize = freezed,Object? obtainedMarks = freezed,}) {
  return _then(_Assignment(
courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,lesson: freezed == lesson ? _self.lesson : lesson // ignore: cast_nullable_to_non_nullable
as String?,dueDate: freezed == dueDate ? _self.dueDate : dueDate // ignore: cast_nullable_to_non_nullable
as DateTime?,totalMarks: freezed == totalMarks ? _self.totalMarks : totalMarks // ignore: cast_nullable_to_non_nullable
as double?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as AssignmentStatus,submitDate: freezed == submitDate ? _self.submitDate : submitDate // ignore: cast_nullable_to_non_nullable
as DateTime?,fileSize: freezed == fileSize ? _self.fileSize : fileSize // ignore: cast_nullable_to_non_nullable
as String?,obtainedMarks: freezed == obtainedMarks ? _self.obtainedMarks : obtainedMarks // ignore: cast_nullable_to_non_nullable
as double?,
  ));
}


}

// dart format on
