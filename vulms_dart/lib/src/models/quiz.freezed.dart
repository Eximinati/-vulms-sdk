// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'quiz.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Quiz {

 String get courseCode; String get courseTitle; String get title; DateTime? get startDate; DateTime? get endDate; double? get totalMarks; double? get obtainedMarks; QuizAvailabilityStatus get availabilityStatus; QuizSubmissionStatus get submissionStatus; QuizResultStatus get resultStatus; DateTime? get submitDate;
/// Create a copy of Quiz
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuizCopyWith<Quiz> get copyWith => _$QuizCopyWithImpl<Quiz>(this as Quiz, _$identity);

  /// Serializes this Quiz to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Quiz&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.title, title) || other.title == title)&&(identical(other.startDate, startDate) || other.startDate == startDate)&&(identical(other.endDate, endDate) || other.endDate == endDate)&&(identical(other.totalMarks, totalMarks) || other.totalMarks == totalMarks)&&(identical(other.obtainedMarks, obtainedMarks) || other.obtainedMarks == obtainedMarks)&&(identical(other.availabilityStatus, availabilityStatus) || other.availabilityStatus == availabilityStatus)&&(identical(other.submissionStatus, submissionStatus) || other.submissionStatus == submissionStatus)&&(identical(other.resultStatus, resultStatus) || other.resultStatus == resultStatus)&&(identical(other.submitDate, submitDate) || other.submitDate == submitDate));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,courseCode,courseTitle,title,startDate,endDate,totalMarks,obtainedMarks,availabilityStatus,submissionStatus,resultStatus,submitDate);

@override
String toString() {
  return 'Quiz(courseCode: $courseCode, courseTitle: $courseTitle, title: $title, startDate: $startDate, endDate: $endDate, totalMarks: $totalMarks, obtainedMarks: $obtainedMarks, availabilityStatus: $availabilityStatus, submissionStatus: $submissionStatus, resultStatus: $resultStatus, submitDate: $submitDate)';
}


}

/// @nodoc
abstract mixin class $QuizCopyWith<$Res>  {
  factory $QuizCopyWith(Quiz value, $Res Function(Quiz) _then) = _$QuizCopyWithImpl;
@useResult
$Res call({
 String courseCode, String courseTitle, String title, DateTime? startDate, DateTime? endDate, double? totalMarks, double? obtainedMarks, QuizAvailabilityStatus availabilityStatus, QuizSubmissionStatus submissionStatus, QuizResultStatus resultStatus, DateTime? submitDate
});




}
/// @nodoc
class _$QuizCopyWithImpl<$Res>
    implements $QuizCopyWith<$Res> {
  _$QuizCopyWithImpl(this._self, this._then);

  final Quiz _self;
  final $Res Function(Quiz) _then;

/// Create a copy of Quiz
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? courseCode = null,Object? courseTitle = null,Object? title = null,Object? startDate = freezed,Object? endDate = freezed,Object? totalMarks = freezed,Object? obtainedMarks = freezed,Object? availabilityStatus = null,Object? submissionStatus = null,Object? resultStatus = null,Object? submitDate = freezed,}) {
  return _then(_self.copyWith(
courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,startDate: freezed == startDate ? _self.startDate : startDate // ignore: cast_nullable_to_non_nullable
as DateTime?,endDate: freezed == endDate ? _self.endDate : endDate // ignore: cast_nullable_to_non_nullable
as DateTime?,totalMarks: freezed == totalMarks ? _self.totalMarks : totalMarks // ignore: cast_nullable_to_non_nullable
as double?,obtainedMarks: freezed == obtainedMarks ? _self.obtainedMarks : obtainedMarks // ignore: cast_nullable_to_non_nullable
as double?,availabilityStatus: null == availabilityStatus ? _self.availabilityStatus : availabilityStatus // ignore: cast_nullable_to_non_nullable
as QuizAvailabilityStatus,submissionStatus: null == submissionStatus ? _self.submissionStatus : submissionStatus // ignore: cast_nullable_to_non_nullable
as QuizSubmissionStatus,resultStatus: null == resultStatus ? _self.resultStatus : resultStatus // ignore: cast_nullable_to_non_nullable
as QuizResultStatus,submitDate: freezed == submitDate ? _self.submitDate : submitDate // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

}


/// Adds pattern-matching-related methods to [Quiz].
extension QuizPatterns on Quiz {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Quiz value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Quiz() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Quiz value)  $default,){
final _that = this;
switch (_that) {
case _Quiz():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Quiz value)?  $default,){
final _that = this;
switch (_that) {
case _Quiz() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String courseCode,  String courseTitle,  String title,  DateTime? startDate,  DateTime? endDate,  double? totalMarks,  double? obtainedMarks,  QuizAvailabilityStatus availabilityStatus,  QuizSubmissionStatus submissionStatus,  QuizResultStatus resultStatus,  DateTime? submitDate)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Quiz() when $default != null:
return $default(_that.courseCode,_that.courseTitle,_that.title,_that.startDate,_that.endDate,_that.totalMarks,_that.obtainedMarks,_that.availabilityStatus,_that.submissionStatus,_that.resultStatus,_that.submitDate);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String courseCode,  String courseTitle,  String title,  DateTime? startDate,  DateTime? endDate,  double? totalMarks,  double? obtainedMarks,  QuizAvailabilityStatus availabilityStatus,  QuizSubmissionStatus submissionStatus,  QuizResultStatus resultStatus,  DateTime? submitDate)  $default,) {final _that = this;
switch (_that) {
case _Quiz():
return $default(_that.courseCode,_that.courseTitle,_that.title,_that.startDate,_that.endDate,_that.totalMarks,_that.obtainedMarks,_that.availabilityStatus,_that.submissionStatus,_that.resultStatus,_that.submitDate);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String courseCode,  String courseTitle,  String title,  DateTime? startDate,  DateTime? endDate,  double? totalMarks,  double? obtainedMarks,  QuizAvailabilityStatus availabilityStatus,  QuizSubmissionStatus submissionStatus,  QuizResultStatus resultStatus,  DateTime? submitDate)?  $default,) {final _that = this;
switch (_that) {
case _Quiz() when $default != null:
return $default(_that.courseCode,_that.courseTitle,_that.title,_that.startDate,_that.endDate,_that.totalMarks,_that.obtainedMarks,_that.availabilityStatus,_that.submissionStatus,_that.resultStatus,_that.submitDate);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Quiz implements Quiz {
  const _Quiz({required this.courseCode, required this.courseTitle, required this.title, this.startDate, this.endDate, this.totalMarks, this.obtainedMarks, this.availabilityStatus = QuizAvailabilityStatus.unknown, this.submissionStatus = QuizSubmissionStatus.unknown, this.resultStatus = QuizResultStatus.unknown, this.submitDate});
  factory _Quiz.fromJson(Map<String, dynamic> json) => _$QuizFromJson(json);

@override final  String courseCode;
@override final  String courseTitle;
@override final  String title;
@override final  DateTime? startDate;
@override final  DateTime? endDate;
@override final  double? totalMarks;
@override final  double? obtainedMarks;
@override@JsonKey() final  QuizAvailabilityStatus availabilityStatus;
@override@JsonKey() final  QuizSubmissionStatus submissionStatus;
@override@JsonKey() final  QuizResultStatus resultStatus;
@override final  DateTime? submitDate;

/// Create a copy of Quiz
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$QuizCopyWith<_Quiz> get copyWith => __$QuizCopyWithImpl<_Quiz>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$QuizToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Quiz&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.title, title) || other.title == title)&&(identical(other.startDate, startDate) || other.startDate == startDate)&&(identical(other.endDate, endDate) || other.endDate == endDate)&&(identical(other.totalMarks, totalMarks) || other.totalMarks == totalMarks)&&(identical(other.obtainedMarks, obtainedMarks) || other.obtainedMarks == obtainedMarks)&&(identical(other.availabilityStatus, availabilityStatus) || other.availabilityStatus == availabilityStatus)&&(identical(other.submissionStatus, submissionStatus) || other.submissionStatus == submissionStatus)&&(identical(other.resultStatus, resultStatus) || other.resultStatus == resultStatus)&&(identical(other.submitDate, submitDate) || other.submitDate == submitDate));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,courseCode,courseTitle,title,startDate,endDate,totalMarks,obtainedMarks,availabilityStatus,submissionStatus,resultStatus,submitDate);

@override
String toString() {
  return 'Quiz(courseCode: $courseCode, courseTitle: $courseTitle, title: $title, startDate: $startDate, endDate: $endDate, totalMarks: $totalMarks, obtainedMarks: $obtainedMarks, availabilityStatus: $availabilityStatus, submissionStatus: $submissionStatus, resultStatus: $resultStatus, submitDate: $submitDate)';
}


}

/// @nodoc
abstract mixin class _$QuizCopyWith<$Res> implements $QuizCopyWith<$Res> {
  factory _$QuizCopyWith(_Quiz value, $Res Function(_Quiz) _then) = __$QuizCopyWithImpl;
@override @useResult
$Res call({
 String courseCode, String courseTitle, String title, DateTime? startDate, DateTime? endDate, double? totalMarks, double? obtainedMarks, QuizAvailabilityStatus availabilityStatus, QuizSubmissionStatus submissionStatus, QuizResultStatus resultStatus, DateTime? submitDate
});




}
/// @nodoc
class __$QuizCopyWithImpl<$Res>
    implements _$QuizCopyWith<$Res> {
  __$QuizCopyWithImpl(this._self, this._then);

  final _Quiz _self;
  final $Res Function(_Quiz) _then;

/// Create a copy of Quiz
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? courseCode = null,Object? courseTitle = null,Object? title = null,Object? startDate = freezed,Object? endDate = freezed,Object? totalMarks = freezed,Object? obtainedMarks = freezed,Object? availabilityStatus = null,Object? submissionStatus = null,Object? resultStatus = null,Object? submitDate = freezed,}) {
  return _then(_Quiz(
courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,startDate: freezed == startDate ? _self.startDate : startDate // ignore: cast_nullable_to_non_nullable
as DateTime?,endDate: freezed == endDate ? _self.endDate : endDate // ignore: cast_nullable_to_non_nullable
as DateTime?,totalMarks: freezed == totalMarks ? _self.totalMarks : totalMarks // ignore: cast_nullable_to_non_nullable
as double?,obtainedMarks: freezed == obtainedMarks ? _self.obtainedMarks : obtainedMarks // ignore: cast_nullable_to_non_nullable
as double?,availabilityStatus: null == availabilityStatus ? _self.availabilityStatus : availabilityStatus // ignore: cast_nullable_to_non_nullable
as QuizAvailabilityStatus,submissionStatus: null == submissionStatus ? _self.submissionStatus : submissionStatus // ignore: cast_nullable_to_non_nullable
as QuizSubmissionStatus,resultStatus: null == resultStatus ? _self.resultStatus : resultStatus // ignore: cast_nullable_to_non_nullable
as QuizResultStatus,submitDate: freezed == submitDate ? _self.submitDate : submitDate // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}


}

// dart format on
