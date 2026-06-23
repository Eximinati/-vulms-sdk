// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'activity.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$UnifiedActivity {

 ActivityType get type; String get courseCode; String get courseTitle; String get title; DateTime? get dueDate; double? get totalMarks; double? get obtainedMarks; ActivityStatus get status;
/// Create a copy of UnifiedActivity
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UnifiedActivityCopyWith<UnifiedActivity> get copyWith => _$UnifiedActivityCopyWithImpl<UnifiedActivity>(this as UnifiedActivity, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is UnifiedActivity&&(identical(other.type, type) || other.type == type)&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.title, title) || other.title == title)&&(identical(other.dueDate, dueDate) || other.dueDate == dueDate)&&(identical(other.totalMarks, totalMarks) || other.totalMarks == totalMarks)&&(identical(other.obtainedMarks, obtainedMarks) || other.obtainedMarks == obtainedMarks)&&(identical(other.status, status) || other.status == status));
}


@override
int get hashCode => Object.hash(runtimeType,type,courseCode,courseTitle,title,dueDate,totalMarks,obtainedMarks,status);

@override
String toString() {
  return 'UnifiedActivity(type: $type, courseCode: $courseCode, courseTitle: $courseTitle, title: $title, dueDate: $dueDate, totalMarks: $totalMarks, obtainedMarks: $obtainedMarks, status: $status)';
}


}

/// @nodoc
abstract mixin class $UnifiedActivityCopyWith<$Res>  {
  factory $UnifiedActivityCopyWith(UnifiedActivity value, $Res Function(UnifiedActivity) _then) = _$UnifiedActivityCopyWithImpl;
@useResult
$Res call({
 ActivityType type, String courseCode, String courseTitle, String title, DateTime? dueDate, double? totalMarks, double? obtainedMarks, ActivityStatus status
});




}
/// @nodoc
class _$UnifiedActivityCopyWithImpl<$Res>
    implements $UnifiedActivityCopyWith<$Res> {
  _$UnifiedActivityCopyWithImpl(this._self, this._then);

  final UnifiedActivity _self;
  final $Res Function(UnifiedActivity) _then;

/// Create a copy of UnifiedActivity
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? type = null,Object? courseCode = null,Object? courseTitle = null,Object? title = null,Object? dueDate = freezed,Object? totalMarks = freezed,Object? obtainedMarks = freezed,Object? status = null,}) {
  return _then(_self.copyWith(
type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as ActivityType,courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,dueDate: freezed == dueDate ? _self.dueDate : dueDate // ignore: cast_nullable_to_non_nullable
as DateTime?,totalMarks: freezed == totalMarks ? _self.totalMarks : totalMarks // ignore: cast_nullable_to_non_nullable
as double?,obtainedMarks: freezed == obtainedMarks ? _self.obtainedMarks : obtainedMarks // ignore: cast_nullable_to_non_nullable
as double?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as ActivityStatus,
  ));
}

}


/// Adds pattern-matching-related methods to [UnifiedActivity].
extension UnifiedActivityPatterns on UnifiedActivity {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _UnifiedActivity value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _UnifiedActivity() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _UnifiedActivity value)  $default,){
final _that = this;
switch (_that) {
case _UnifiedActivity():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _UnifiedActivity value)?  $default,){
final _that = this;
switch (_that) {
case _UnifiedActivity() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( ActivityType type,  String courseCode,  String courseTitle,  String title,  DateTime? dueDate,  double? totalMarks,  double? obtainedMarks,  ActivityStatus status)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _UnifiedActivity() when $default != null:
return $default(_that.type,_that.courseCode,_that.courseTitle,_that.title,_that.dueDate,_that.totalMarks,_that.obtainedMarks,_that.status);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( ActivityType type,  String courseCode,  String courseTitle,  String title,  DateTime? dueDate,  double? totalMarks,  double? obtainedMarks,  ActivityStatus status)  $default,) {final _that = this;
switch (_that) {
case _UnifiedActivity():
return $default(_that.type,_that.courseCode,_that.courseTitle,_that.title,_that.dueDate,_that.totalMarks,_that.obtainedMarks,_that.status);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( ActivityType type,  String courseCode,  String courseTitle,  String title,  DateTime? dueDate,  double? totalMarks,  double? obtainedMarks,  ActivityStatus status)?  $default,) {final _that = this;
switch (_that) {
case _UnifiedActivity() when $default != null:
return $default(_that.type,_that.courseCode,_that.courseTitle,_that.title,_that.dueDate,_that.totalMarks,_that.obtainedMarks,_that.status);case _:
  return null;

}
}

}

/// @nodoc


class _UnifiedActivity implements UnifiedActivity {
  const _UnifiedActivity({required this.type, required this.courseCode, required this.courseTitle, required this.title, this.dueDate, this.totalMarks, this.obtainedMarks, this.status = ActivityStatus.pending});
  

@override final  ActivityType type;
@override final  String courseCode;
@override final  String courseTitle;
@override final  String title;
@override final  DateTime? dueDate;
@override final  double? totalMarks;
@override final  double? obtainedMarks;
@override@JsonKey() final  ActivityStatus status;

/// Create a copy of UnifiedActivity
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$UnifiedActivityCopyWith<_UnifiedActivity> get copyWith => __$UnifiedActivityCopyWithImpl<_UnifiedActivity>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _UnifiedActivity&&(identical(other.type, type) || other.type == type)&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.title, title) || other.title == title)&&(identical(other.dueDate, dueDate) || other.dueDate == dueDate)&&(identical(other.totalMarks, totalMarks) || other.totalMarks == totalMarks)&&(identical(other.obtainedMarks, obtainedMarks) || other.obtainedMarks == obtainedMarks)&&(identical(other.status, status) || other.status == status));
}


@override
int get hashCode => Object.hash(runtimeType,type,courseCode,courseTitle,title,dueDate,totalMarks,obtainedMarks,status);

@override
String toString() {
  return 'UnifiedActivity(type: $type, courseCode: $courseCode, courseTitle: $courseTitle, title: $title, dueDate: $dueDate, totalMarks: $totalMarks, obtainedMarks: $obtainedMarks, status: $status)';
}


}

/// @nodoc
abstract mixin class _$UnifiedActivityCopyWith<$Res> implements $UnifiedActivityCopyWith<$Res> {
  factory _$UnifiedActivityCopyWith(_UnifiedActivity value, $Res Function(_UnifiedActivity) _then) = __$UnifiedActivityCopyWithImpl;
@override @useResult
$Res call({
 ActivityType type, String courseCode, String courseTitle, String title, DateTime? dueDate, double? totalMarks, double? obtainedMarks, ActivityStatus status
});




}
/// @nodoc
class __$UnifiedActivityCopyWithImpl<$Res>
    implements _$UnifiedActivityCopyWith<$Res> {
  __$UnifiedActivityCopyWithImpl(this._self, this._then);

  final _UnifiedActivity _self;
  final $Res Function(_UnifiedActivity) _then;

/// Create a copy of UnifiedActivity
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? type = null,Object? courseCode = null,Object? courseTitle = null,Object? title = null,Object? dueDate = freezed,Object? totalMarks = freezed,Object? obtainedMarks = freezed,Object? status = null,}) {
  return _then(_UnifiedActivity(
type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as ActivityType,courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,dueDate: freezed == dueDate ? _self.dueDate : dueDate // ignore: cast_nullable_to_non_nullable
as DateTime?,totalMarks: freezed == totalMarks ? _self.totalMarks : totalMarks // ignore: cast_nullable_to_non_nullable
as double?,obtainedMarks: freezed == obtainedMarks ? _self.obtainedMarks : obtainedMarks // ignore: cast_nullable_to_non_nullable
as double?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as ActivityStatus,
  ));
}


}

/// @nodoc
mixin _$ActivityAggregate {

 List<UnifiedActivity> get pending; List<UnifiedActivity> get submitted; List<UnifiedActivity> get missed; List<UnifiedActivity> get resultDeclared;
/// Create a copy of ActivityAggregate
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ActivityAggregateCopyWith<ActivityAggregate> get copyWith => _$ActivityAggregateCopyWithImpl<ActivityAggregate>(this as ActivityAggregate, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ActivityAggregate&&const DeepCollectionEquality().equals(other.pending, pending)&&const DeepCollectionEquality().equals(other.submitted, submitted)&&const DeepCollectionEquality().equals(other.missed, missed)&&const DeepCollectionEquality().equals(other.resultDeclared, resultDeclared));
}


@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(pending),const DeepCollectionEquality().hash(submitted),const DeepCollectionEquality().hash(missed),const DeepCollectionEquality().hash(resultDeclared));

@override
String toString() {
  return 'ActivityAggregate(pending: $pending, submitted: $submitted, missed: $missed, resultDeclared: $resultDeclared)';
}


}

/// @nodoc
abstract mixin class $ActivityAggregateCopyWith<$Res>  {
  factory $ActivityAggregateCopyWith(ActivityAggregate value, $Res Function(ActivityAggregate) _then) = _$ActivityAggregateCopyWithImpl;
@useResult
$Res call({
 List<UnifiedActivity> pending, List<UnifiedActivity> submitted, List<UnifiedActivity> missed, List<UnifiedActivity> resultDeclared
});




}
/// @nodoc
class _$ActivityAggregateCopyWithImpl<$Res>
    implements $ActivityAggregateCopyWith<$Res> {
  _$ActivityAggregateCopyWithImpl(this._self, this._then);

  final ActivityAggregate _self;
  final $Res Function(ActivityAggregate) _then;

/// Create a copy of ActivityAggregate
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? pending = null,Object? submitted = null,Object? missed = null,Object? resultDeclared = null,}) {
  return _then(_self.copyWith(
pending: null == pending ? _self.pending : pending // ignore: cast_nullable_to_non_nullable
as List<UnifiedActivity>,submitted: null == submitted ? _self.submitted : submitted // ignore: cast_nullable_to_non_nullable
as List<UnifiedActivity>,missed: null == missed ? _self.missed : missed // ignore: cast_nullable_to_non_nullable
as List<UnifiedActivity>,resultDeclared: null == resultDeclared ? _self.resultDeclared : resultDeclared // ignore: cast_nullable_to_non_nullable
as List<UnifiedActivity>,
  ));
}

}


/// Adds pattern-matching-related methods to [ActivityAggregate].
extension ActivityAggregatePatterns on ActivityAggregate {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ActivityAggregate value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ActivityAggregate() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ActivityAggregate value)  $default,){
final _that = this;
switch (_that) {
case _ActivityAggregate():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ActivityAggregate value)?  $default,){
final _that = this;
switch (_that) {
case _ActivityAggregate() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( List<UnifiedActivity> pending,  List<UnifiedActivity> submitted,  List<UnifiedActivity> missed,  List<UnifiedActivity> resultDeclared)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ActivityAggregate() when $default != null:
return $default(_that.pending,_that.submitted,_that.missed,_that.resultDeclared);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( List<UnifiedActivity> pending,  List<UnifiedActivity> submitted,  List<UnifiedActivity> missed,  List<UnifiedActivity> resultDeclared)  $default,) {final _that = this;
switch (_that) {
case _ActivityAggregate():
return $default(_that.pending,_that.submitted,_that.missed,_that.resultDeclared);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( List<UnifiedActivity> pending,  List<UnifiedActivity> submitted,  List<UnifiedActivity> missed,  List<UnifiedActivity> resultDeclared)?  $default,) {final _that = this;
switch (_that) {
case _ActivityAggregate() when $default != null:
return $default(_that.pending,_that.submitted,_that.missed,_that.resultDeclared);case _:
  return null;

}
}

}

/// @nodoc


class _ActivityAggregate implements ActivityAggregate {
  const _ActivityAggregate({final  List<UnifiedActivity> pending = const [], final  List<UnifiedActivity> submitted = const [], final  List<UnifiedActivity> missed = const [], final  List<UnifiedActivity> resultDeclared = const []}): _pending = pending,_submitted = submitted,_missed = missed,_resultDeclared = resultDeclared;
  

 final  List<UnifiedActivity> _pending;
@override@JsonKey() List<UnifiedActivity> get pending {
  if (_pending is EqualUnmodifiableListView) return _pending;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_pending);
}

 final  List<UnifiedActivity> _submitted;
@override@JsonKey() List<UnifiedActivity> get submitted {
  if (_submitted is EqualUnmodifiableListView) return _submitted;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_submitted);
}

 final  List<UnifiedActivity> _missed;
@override@JsonKey() List<UnifiedActivity> get missed {
  if (_missed is EqualUnmodifiableListView) return _missed;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_missed);
}

 final  List<UnifiedActivity> _resultDeclared;
@override@JsonKey() List<UnifiedActivity> get resultDeclared {
  if (_resultDeclared is EqualUnmodifiableListView) return _resultDeclared;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_resultDeclared);
}


/// Create a copy of ActivityAggregate
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ActivityAggregateCopyWith<_ActivityAggregate> get copyWith => __$ActivityAggregateCopyWithImpl<_ActivityAggregate>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ActivityAggregate&&const DeepCollectionEquality().equals(other._pending, _pending)&&const DeepCollectionEquality().equals(other._submitted, _submitted)&&const DeepCollectionEquality().equals(other._missed, _missed)&&const DeepCollectionEquality().equals(other._resultDeclared, _resultDeclared));
}


@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(_pending),const DeepCollectionEquality().hash(_submitted),const DeepCollectionEquality().hash(_missed),const DeepCollectionEquality().hash(_resultDeclared));

@override
String toString() {
  return 'ActivityAggregate(pending: $pending, submitted: $submitted, missed: $missed, resultDeclared: $resultDeclared)';
}


}

/// @nodoc
abstract mixin class _$ActivityAggregateCopyWith<$Res> implements $ActivityAggregateCopyWith<$Res> {
  factory _$ActivityAggregateCopyWith(_ActivityAggregate value, $Res Function(_ActivityAggregate) _then) = __$ActivityAggregateCopyWithImpl;
@override @useResult
$Res call({
 List<UnifiedActivity> pending, List<UnifiedActivity> submitted, List<UnifiedActivity> missed, List<UnifiedActivity> resultDeclared
});




}
/// @nodoc
class __$ActivityAggregateCopyWithImpl<$Res>
    implements _$ActivityAggregateCopyWith<$Res> {
  __$ActivityAggregateCopyWithImpl(this._self, this._then);

  final _ActivityAggregate _self;
  final $Res Function(_ActivityAggregate) _then;

/// Create a copy of ActivityAggregate
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? pending = null,Object? submitted = null,Object? missed = null,Object? resultDeclared = null,}) {
  return _then(_ActivityAggregate(
pending: null == pending ? _self._pending : pending // ignore: cast_nullable_to_non_nullable
as List<UnifiedActivity>,submitted: null == submitted ? _self._submitted : submitted // ignore: cast_nullable_to_non_nullable
as List<UnifiedActivity>,missed: null == missed ? _self._missed : missed // ignore: cast_nullable_to_non_nullable
as List<UnifiedActivity>,resultDeclared: null == resultDeclared ? _self._resultDeclared : resultDeclared // ignore: cast_nullable_to_non_nullable
as List<UnifiedActivity>,
  ));
}


}

// dart format on
