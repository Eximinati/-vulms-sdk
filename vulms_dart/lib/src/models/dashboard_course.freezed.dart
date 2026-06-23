// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'dashboard_course.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$DashboardActivityPreview {

 String get type; String? get courseCode; bool? get isPending; bool? get isNew; bool? get isUpcoming;
/// Create a copy of DashboardActivityPreview
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DashboardActivityPreviewCopyWith<DashboardActivityPreview> get copyWith => _$DashboardActivityPreviewCopyWithImpl<DashboardActivityPreview>(this as DashboardActivityPreview, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is DashboardActivityPreview&&(identical(other.type, type) || other.type == type)&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.isPending, isPending) || other.isPending == isPending)&&(identical(other.isNew, isNew) || other.isNew == isNew)&&(identical(other.isUpcoming, isUpcoming) || other.isUpcoming == isUpcoming));
}


@override
int get hashCode => Object.hash(runtimeType,type,courseCode,isPending,isNew,isUpcoming);

@override
String toString() {
  return 'DashboardActivityPreview(type: $type, courseCode: $courseCode, isPending: $isPending, isNew: $isNew, isUpcoming: $isUpcoming)';
}


}

/// @nodoc
abstract mixin class $DashboardActivityPreviewCopyWith<$Res>  {
  factory $DashboardActivityPreviewCopyWith(DashboardActivityPreview value, $Res Function(DashboardActivityPreview) _then) = _$DashboardActivityPreviewCopyWithImpl;
@useResult
$Res call({
 String type, String? courseCode, bool? isPending, bool? isNew, bool? isUpcoming
});




}
/// @nodoc
class _$DashboardActivityPreviewCopyWithImpl<$Res>
    implements $DashboardActivityPreviewCopyWith<$Res> {
  _$DashboardActivityPreviewCopyWithImpl(this._self, this._then);

  final DashboardActivityPreview _self;
  final $Res Function(DashboardActivityPreview) _then;

/// Create a copy of DashboardActivityPreview
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? type = null,Object? courseCode = freezed,Object? isPending = freezed,Object? isNew = freezed,Object? isUpcoming = freezed,}) {
  return _then(_self.copyWith(
type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,courseCode: freezed == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String?,isPending: freezed == isPending ? _self.isPending : isPending // ignore: cast_nullable_to_non_nullable
as bool?,isNew: freezed == isNew ? _self.isNew : isNew // ignore: cast_nullable_to_non_nullable
as bool?,isUpcoming: freezed == isUpcoming ? _self.isUpcoming : isUpcoming // ignore: cast_nullable_to_non_nullable
as bool?,
  ));
}

}


/// Adds pattern-matching-related methods to [DashboardActivityPreview].
extension DashboardActivityPreviewPatterns on DashboardActivityPreview {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _DashboardActivityPreview value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _DashboardActivityPreview() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _DashboardActivityPreview value)  $default,){
final _that = this;
switch (_that) {
case _DashboardActivityPreview():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _DashboardActivityPreview value)?  $default,){
final _that = this;
switch (_that) {
case _DashboardActivityPreview() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String type,  String? courseCode,  bool? isPending,  bool? isNew,  bool? isUpcoming)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _DashboardActivityPreview() when $default != null:
return $default(_that.type,_that.courseCode,_that.isPending,_that.isNew,_that.isUpcoming);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String type,  String? courseCode,  bool? isPending,  bool? isNew,  bool? isUpcoming)  $default,) {final _that = this;
switch (_that) {
case _DashboardActivityPreview():
return $default(_that.type,_that.courseCode,_that.isPending,_that.isNew,_that.isUpcoming);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String type,  String? courseCode,  bool? isPending,  bool? isNew,  bool? isUpcoming)?  $default,) {final _that = this;
switch (_that) {
case _DashboardActivityPreview() when $default != null:
return $default(_that.type,_that.courseCode,_that.isPending,_that.isNew,_that.isUpcoming);case _:
  return null;

}
}

}

/// @nodoc


class _DashboardActivityPreview implements DashboardActivityPreview {
  const _DashboardActivityPreview({required this.type, this.courseCode, this.isPending, this.isNew, this.isUpcoming});
  

@override final  String type;
@override final  String? courseCode;
@override final  bool? isPending;
@override final  bool? isNew;
@override final  bool? isUpcoming;

/// Create a copy of DashboardActivityPreview
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$DashboardActivityPreviewCopyWith<_DashboardActivityPreview> get copyWith => __$DashboardActivityPreviewCopyWithImpl<_DashboardActivityPreview>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _DashboardActivityPreview&&(identical(other.type, type) || other.type == type)&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.isPending, isPending) || other.isPending == isPending)&&(identical(other.isNew, isNew) || other.isNew == isNew)&&(identical(other.isUpcoming, isUpcoming) || other.isUpcoming == isUpcoming));
}


@override
int get hashCode => Object.hash(runtimeType,type,courseCode,isPending,isNew,isUpcoming);

@override
String toString() {
  return 'DashboardActivityPreview(type: $type, courseCode: $courseCode, isPending: $isPending, isNew: $isNew, isUpcoming: $isUpcoming)';
}


}

/// @nodoc
abstract mixin class _$DashboardActivityPreviewCopyWith<$Res> implements $DashboardActivityPreviewCopyWith<$Res> {
  factory _$DashboardActivityPreviewCopyWith(_DashboardActivityPreview value, $Res Function(_DashboardActivityPreview) _then) = __$DashboardActivityPreviewCopyWithImpl;
@override @useResult
$Res call({
 String type, String? courseCode, bool? isPending, bool? isNew, bool? isUpcoming
});




}
/// @nodoc
class __$DashboardActivityPreviewCopyWithImpl<$Res>
    implements _$DashboardActivityPreviewCopyWith<$Res> {
  __$DashboardActivityPreviewCopyWithImpl(this._self, this._then);

  final _DashboardActivityPreview _self;
  final $Res Function(_DashboardActivityPreview) _then;

/// Create a copy of DashboardActivityPreview
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? type = null,Object? courseCode = freezed,Object? isPending = freezed,Object? isNew = freezed,Object? isUpcoming = freezed,}) {
  return _then(_DashboardActivityPreview(
type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,courseCode: freezed == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String?,isPending: freezed == isPending ? _self.isPending : isPending // ignore: cast_nullable_to_non_nullable
as bool?,isNew: freezed == isNew ? _self.isNew : isNew // ignore: cast_nullable_to_non_nullable
as bool?,isUpcoming: freezed == isUpcoming ? _self.isUpcoming : isUpcoming // ignore: cast_nullable_to_non_nullable
as bool?,
  ));
}


}

/// @nodoc
mixin _$DashboardCourse {

 String get courseCode; String get courseTitle; bool get hasQuizzes; bool get hasAssignments; bool get hasGdbs; bool get hasLectures; int get quizCount; int get assignmentCount; int get gdbCount; int get lectureCount; int get upcomingCount; int get pendingCount; List<DashboardActivityPreview> get activities;
/// Create a copy of DashboardCourse
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DashboardCourseCopyWith<DashboardCourse> get copyWith => _$DashboardCourseCopyWithImpl<DashboardCourse>(this as DashboardCourse, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is DashboardCourse&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.hasQuizzes, hasQuizzes) || other.hasQuizzes == hasQuizzes)&&(identical(other.hasAssignments, hasAssignments) || other.hasAssignments == hasAssignments)&&(identical(other.hasGdbs, hasGdbs) || other.hasGdbs == hasGdbs)&&(identical(other.hasLectures, hasLectures) || other.hasLectures == hasLectures)&&(identical(other.quizCount, quizCount) || other.quizCount == quizCount)&&(identical(other.assignmentCount, assignmentCount) || other.assignmentCount == assignmentCount)&&(identical(other.gdbCount, gdbCount) || other.gdbCount == gdbCount)&&(identical(other.lectureCount, lectureCount) || other.lectureCount == lectureCount)&&(identical(other.upcomingCount, upcomingCount) || other.upcomingCount == upcomingCount)&&(identical(other.pendingCount, pendingCount) || other.pendingCount == pendingCount)&&const DeepCollectionEquality().equals(other.activities, activities));
}


@override
int get hashCode => Object.hash(runtimeType,courseCode,courseTitle,hasQuizzes,hasAssignments,hasGdbs,hasLectures,quizCount,assignmentCount,gdbCount,lectureCount,upcomingCount,pendingCount,const DeepCollectionEquality().hash(activities));

@override
String toString() {
  return 'DashboardCourse(courseCode: $courseCode, courseTitle: $courseTitle, hasQuizzes: $hasQuizzes, hasAssignments: $hasAssignments, hasGdbs: $hasGdbs, hasLectures: $hasLectures, quizCount: $quizCount, assignmentCount: $assignmentCount, gdbCount: $gdbCount, lectureCount: $lectureCount, upcomingCount: $upcomingCount, pendingCount: $pendingCount, activities: $activities)';
}


}

/// @nodoc
abstract mixin class $DashboardCourseCopyWith<$Res>  {
  factory $DashboardCourseCopyWith(DashboardCourse value, $Res Function(DashboardCourse) _then) = _$DashboardCourseCopyWithImpl;
@useResult
$Res call({
 String courseCode, String courseTitle, bool hasQuizzes, bool hasAssignments, bool hasGdbs, bool hasLectures, int quizCount, int assignmentCount, int gdbCount, int lectureCount, int upcomingCount, int pendingCount, List<DashboardActivityPreview> activities
});




}
/// @nodoc
class _$DashboardCourseCopyWithImpl<$Res>
    implements $DashboardCourseCopyWith<$Res> {
  _$DashboardCourseCopyWithImpl(this._self, this._then);

  final DashboardCourse _self;
  final $Res Function(DashboardCourse) _then;

/// Create a copy of DashboardCourse
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? courseCode = null,Object? courseTitle = null,Object? hasQuizzes = null,Object? hasAssignments = null,Object? hasGdbs = null,Object? hasLectures = null,Object? quizCount = null,Object? assignmentCount = null,Object? gdbCount = null,Object? lectureCount = null,Object? upcomingCount = null,Object? pendingCount = null,Object? activities = null,}) {
  return _then(_self.copyWith(
courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,hasQuizzes: null == hasQuizzes ? _self.hasQuizzes : hasQuizzes // ignore: cast_nullable_to_non_nullable
as bool,hasAssignments: null == hasAssignments ? _self.hasAssignments : hasAssignments // ignore: cast_nullable_to_non_nullable
as bool,hasGdbs: null == hasGdbs ? _self.hasGdbs : hasGdbs // ignore: cast_nullable_to_non_nullable
as bool,hasLectures: null == hasLectures ? _self.hasLectures : hasLectures // ignore: cast_nullable_to_non_nullable
as bool,quizCount: null == quizCount ? _self.quizCount : quizCount // ignore: cast_nullable_to_non_nullable
as int,assignmentCount: null == assignmentCount ? _self.assignmentCount : assignmentCount // ignore: cast_nullable_to_non_nullable
as int,gdbCount: null == gdbCount ? _self.gdbCount : gdbCount // ignore: cast_nullable_to_non_nullable
as int,lectureCount: null == lectureCount ? _self.lectureCount : lectureCount // ignore: cast_nullable_to_non_nullable
as int,upcomingCount: null == upcomingCount ? _self.upcomingCount : upcomingCount // ignore: cast_nullable_to_non_nullable
as int,pendingCount: null == pendingCount ? _self.pendingCount : pendingCount // ignore: cast_nullable_to_non_nullable
as int,activities: null == activities ? _self.activities : activities // ignore: cast_nullable_to_non_nullable
as List<DashboardActivityPreview>,
  ));
}

}


/// Adds pattern-matching-related methods to [DashboardCourse].
extension DashboardCoursePatterns on DashboardCourse {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _DashboardCourse value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _DashboardCourse() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _DashboardCourse value)  $default,){
final _that = this;
switch (_that) {
case _DashboardCourse():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _DashboardCourse value)?  $default,){
final _that = this;
switch (_that) {
case _DashboardCourse() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String courseCode,  String courseTitle,  bool hasQuizzes,  bool hasAssignments,  bool hasGdbs,  bool hasLectures,  int quizCount,  int assignmentCount,  int gdbCount,  int lectureCount,  int upcomingCount,  int pendingCount,  List<DashboardActivityPreview> activities)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _DashboardCourse() when $default != null:
return $default(_that.courseCode,_that.courseTitle,_that.hasQuizzes,_that.hasAssignments,_that.hasGdbs,_that.hasLectures,_that.quizCount,_that.assignmentCount,_that.gdbCount,_that.lectureCount,_that.upcomingCount,_that.pendingCount,_that.activities);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String courseCode,  String courseTitle,  bool hasQuizzes,  bool hasAssignments,  bool hasGdbs,  bool hasLectures,  int quizCount,  int assignmentCount,  int gdbCount,  int lectureCount,  int upcomingCount,  int pendingCount,  List<DashboardActivityPreview> activities)  $default,) {final _that = this;
switch (_that) {
case _DashboardCourse():
return $default(_that.courseCode,_that.courseTitle,_that.hasQuizzes,_that.hasAssignments,_that.hasGdbs,_that.hasLectures,_that.quizCount,_that.assignmentCount,_that.gdbCount,_that.lectureCount,_that.upcomingCount,_that.pendingCount,_that.activities);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String courseCode,  String courseTitle,  bool hasQuizzes,  bool hasAssignments,  bool hasGdbs,  bool hasLectures,  int quizCount,  int assignmentCount,  int gdbCount,  int lectureCount,  int upcomingCount,  int pendingCount,  List<DashboardActivityPreview> activities)?  $default,) {final _that = this;
switch (_that) {
case _DashboardCourse() when $default != null:
return $default(_that.courseCode,_that.courseTitle,_that.hasQuizzes,_that.hasAssignments,_that.hasGdbs,_that.hasLectures,_that.quizCount,_that.assignmentCount,_that.gdbCount,_that.lectureCount,_that.upcomingCount,_that.pendingCount,_that.activities);case _:
  return null;

}
}

}

/// @nodoc


class _DashboardCourse implements DashboardCourse {
  const _DashboardCourse({required this.courseCode, required this.courseTitle, this.hasQuizzes = false, this.hasAssignments = false, this.hasGdbs = false, this.hasLectures = false, this.quizCount = 0, this.assignmentCount = 0, this.gdbCount = 0, this.lectureCount = 0, this.upcomingCount = 0, this.pendingCount = 0, final  List<DashboardActivityPreview> activities = const []}): _activities = activities;
  

@override final  String courseCode;
@override final  String courseTitle;
@override@JsonKey() final  bool hasQuizzes;
@override@JsonKey() final  bool hasAssignments;
@override@JsonKey() final  bool hasGdbs;
@override@JsonKey() final  bool hasLectures;
@override@JsonKey() final  int quizCount;
@override@JsonKey() final  int assignmentCount;
@override@JsonKey() final  int gdbCount;
@override@JsonKey() final  int lectureCount;
@override@JsonKey() final  int upcomingCount;
@override@JsonKey() final  int pendingCount;
 final  List<DashboardActivityPreview> _activities;
@override@JsonKey() List<DashboardActivityPreview> get activities {
  if (_activities is EqualUnmodifiableListView) return _activities;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_activities);
}


/// Create a copy of DashboardCourse
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$DashboardCourseCopyWith<_DashboardCourse> get copyWith => __$DashboardCourseCopyWithImpl<_DashboardCourse>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _DashboardCourse&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.hasQuizzes, hasQuizzes) || other.hasQuizzes == hasQuizzes)&&(identical(other.hasAssignments, hasAssignments) || other.hasAssignments == hasAssignments)&&(identical(other.hasGdbs, hasGdbs) || other.hasGdbs == hasGdbs)&&(identical(other.hasLectures, hasLectures) || other.hasLectures == hasLectures)&&(identical(other.quizCount, quizCount) || other.quizCount == quizCount)&&(identical(other.assignmentCount, assignmentCount) || other.assignmentCount == assignmentCount)&&(identical(other.gdbCount, gdbCount) || other.gdbCount == gdbCount)&&(identical(other.lectureCount, lectureCount) || other.lectureCount == lectureCount)&&(identical(other.upcomingCount, upcomingCount) || other.upcomingCount == upcomingCount)&&(identical(other.pendingCount, pendingCount) || other.pendingCount == pendingCount)&&const DeepCollectionEquality().equals(other._activities, _activities));
}


@override
int get hashCode => Object.hash(runtimeType,courseCode,courseTitle,hasQuizzes,hasAssignments,hasGdbs,hasLectures,quizCount,assignmentCount,gdbCount,lectureCount,upcomingCount,pendingCount,const DeepCollectionEquality().hash(_activities));

@override
String toString() {
  return 'DashboardCourse(courseCode: $courseCode, courseTitle: $courseTitle, hasQuizzes: $hasQuizzes, hasAssignments: $hasAssignments, hasGdbs: $hasGdbs, hasLectures: $hasLectures, quizCount: $quizCount, assignmentCount: $assignmentCount, gdbCount: $gdbCount, lectureCount: $lectureCount, upcomingCount: $upcomingCount, pendingCount: $pendingCount, activities: $activities)';
}


}

/// @nodoc
abstract mixin class _$DashboardCourseCopyWith<$Res> implements $DashboardCourseCopyWith<$Res> {
  factory _$DashboardCourseCopyWith(_DashboardCourse value, $Res Function(_DashboardCourse) _then) = __$DashboardCourseCopyWithImpl;
@override @useResult
$Res call({
 String courseCode, String courseTitle, bool hasQuizzes, bool hasAssignments, bool hasGdbs, bool hasLectures, int quizCount, int assignmentCount, int gdbCount, int lectureCount, int upcomingCount, int pendingCount, List<DashboardActivityPreview> activities
});




}
/// @nodoc
class __$DashboardCourseCopyWithImpl<$Res>
    implements _$DashboardCourseCopyWith<$Res> {
  __$DashboardCourseCopyWithImpl(this._self, this._then);

  final _DashboardCourse _self;
  final $Res Function(_DashboardCourse) _then;

/// Create a copy of DashboardCourse
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? courseCode = null,Object? courseTitle = null,Object? hasQuizzes = null,Object? hasAssignments = null,Object? hasGdbs = null,Object? hasLectures = null,Object? quizCount = null,Object? assignmentCount = null,Object? gdbCount = null,Object? lectureCount = null,Object? upcomingCount = null,Object? pendingCount = null,Object? activities = null,}) {
  return _then(_DashboardCourse(
courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,hasQuizzes: null == hasQuizzes ? _self.hasQuizzes : hasQuizzes // ignore: cast_nullable_to_non_nullable
as bool,hasAssignments: null == hasAssignments ? _self.hasAssignments : hasAssignments // ignore: cast_nullable_to_non_nullable
as bool,hasGdbs: null == hasGdbs ? _self.hasGdbs : hasGdbs // ignore: cast_nullable_to_non_nullable
as bool,hasLectures: null == hasLectures ? _self.hasLectures : hasLectures // ignore: cast_nullable_to_non_nullable
as bool,quizCount: null == quizCount ? _self.quizCount : quizCount // ignore: cast_nullable_to_non_nullable
as int,assignmentCount: null == assignmentCount ? _self.assignmentCount : assignmentCount // ignore: cast_nullable_to_non_nullable
as int,gdbCount: null == gdbCount ? _self.gdbCount : gdbCount // ignore: cast_nullable_to_non_nullable
as int,lectureCount: null == lectureCount ? _self.lectureCount : lectureCount // ignore: cast_nullable_to_non_nullable
as int,upcomingCount: null == upcomingCount ? _self.upcomingCount : upcomingCount // ignore: cast_nullable_to_non_nullable
as int,pendingCount: null == pendingCount ? _self.pendingCount : pendingCount // ignore: cast_nullable_to_non_nullable
as int,activities: null == activities ? _self._activities : activities // ignore: cast_nullable_to_non_nullable
as List<DashboardActivityPreview>,
  ));
}


}

// dart format on
