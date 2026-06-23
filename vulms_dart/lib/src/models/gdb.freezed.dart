// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'gdb.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Gdb {

 String get courseCode; String get courseTitle; String get title; DateTime? get dueDate; double? get totalMarks; double? get obtainedMarks; GdbStatus get status;
/// Create a copy of Gdb
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$GdbCopyWith<Gdb> get copyWith => _$GdbCopyWithImpl<Gdb>(this as Gdb, _$identity);

  /// Serializes this Gdb to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Gdb&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.title, title) || other.title == title)&&(identical(other.dueDate, dueDate) || other.dueDate == dueDate)&&(identical(other.totalMarks, totalMarks) || other.totalMarks == totalMarks)&&(identical(other.obtainedMarks, obtainedMarks) || other.obtainedMarks == obtainedMarks)&&(identical(other.status, status) || other.status == status));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,courseCode,courseTitle,title,dueDate,totalMarks,obtainedMarks,status);

@override
String toString() {
  return 'Gdb(courseCode: $courseCode, courseTitle: $courseTitle, title: $title, dueDate: $dueDate, totalMarks: $totalMarks, obtainedMarks: $obtainedMarks, status: $status)';
}


}

/// @nodoc
abstract mixin class $GdbCopyWith<$Res>  {
  factory $GdbCopyWith(Gdb value, $Res Function(Gdb) _then) = _$GdbCopyWithImpl;
@useResult
$Res call({
 String courseCode, String courseTitle, String title, DateTime? dueDate, double? totalMarks, double? obtainedMarks, GdbStatus status
});




}
/// @nodoc
class _$GdbCopyWithImpl<$Res>
    implements $GdbCopyWith<$Res> {
  _$GdbCopyWithImpl(this._self, this._then);

  final Gdb _self;
  final $Res Function(Gdb) _then;

/// Create a copy of Gdb
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? courseCode = null,Object? courseTitle = null,Object? title = null,Object? dueDate = freezed,Object? totalMarks = freezed,Object? obtainedMarks = freezed,Object? status = null,}) {
  return _then(_self.copyWith(
courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,dueDate: freezed == dueDate ? _self.dueDate : dueDate // ignore: cast_nullable_to_non_nullable
as DateTime?,totalMarks: freezed == totalMarks ? _self.totalMarks : totalMarks // ignore: cast_nullable_to_non_nullable
as double?,obtainedMarks: freezed == obtainedMarks ? _self.obtainedMarks : obtainedMarks // ignore: cast_nullable_to_non_nullable
as double?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as GdbStatus,
  ));
}

}


/// Adds pattern-matching-related methods to [Gdb].
extension GdbPatterns on Gdb {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Gdb value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Gdb() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Gdb value)  $default,){
final _that = this;
switch (_that) {
case _Gdb():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Gdb value)?  $default,){
final _that = this;
switch (_that) {
case _Gdb() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String courseCode,  String courseTitle,  String title,  DateTime? dueDate,  double? totalMarks,  double? obtainedMarks,  GdbStatus status)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Gdb() when $default != null:
return $default(_that.courseCode,_that.courseTitle,_that.title,_that.dueDate,_that.totalMarks,_that.obtainedMarks,_that.status);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String courseCode,  String courseTitle,  String title,  DateTime? dueDate,  double? totalMarks,  double? obtainedMarks,  GdbStatus status)  $default,) {final _that = this;
switch (_that) {
case _Gdb():
return $default(_that.courseCode,_that.courseTitle,_that.title,_that.dueDate,_that.totalMarks,_that.obtainedMarks,_that.status);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String courseCode,  String courseTitle,  String title,  DateTime? dueDate,  double? totalMarks,  double? obtainedMarks,  GdbStatus status)?  $default,) {final _that = this;
switch (_that) {
case _Gdb() when $default != null:
return $default(_that.courseCode,_that.courseTitle,_that.title,_that.dueDate,_that.totalMarks,_that.obtainedMarks,_that.status);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Gdb implements Gdb {
  const _Gdb({required this.courseCode, required this.courseTitle, required this.title, this.dueDate, this.totalMarks, this.obtainedMarks, this.status = GdbStatus.pending});
  factory _Gdb.fromJson(Map<String, dynamic> json) => _$GdbFromJson(json);

@override final  String courseCode;
@override final  String courseTitle;
@override final  String title;
@override final  DateTime? dueDate;
@override final  double? totalMarks;
@override final  double? obtainedMarks;
@override@JsonKey() final  GdbStatus status;

/// Create a copy of Gdb
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$GdbCopyWith<_Gdb> get copyWith => __$GdbCopyWithImpl<_Gdb>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$GdbToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Gdb&&(identical(other.courseCode, courseCode) || other.courseCode == courseCode)&&(identical(other.courseTitle, courseTitle) || other.courseTitle == courseTitle)&&(identical(other.title, title) || other.title == title)&&(identical(other.dueDate, dueDate) || other.dueDate == dueDate)&&(identical(other.totalMarks, totalMarks) || other.totalMarks == totalMarks)&&(identical(other.obtainedMarks, obtainedMarks) || other.obtainedMarks == obtainedMarks)&&(identical(other.status, status) || other.status == status));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,courseCode,courseTitle,title,dueDate,totalMarks,obtainedMarks,status);

@override
String toString() {
  return 'Gdb(courseCode: $courseCode, courseTitle: $courseTitle, title: $title, dueDate: $dueDate, totalMarks: $totalMarks, obtainedMarks: $obtainedMarks, status: $status)';
}


}

/// @nodoc
abstract mixin class _$GdbCopyWith<$Res> implements $GdbCopyWith<$Res> {
  factory _$GdbCopyWith(_Gdb value, $Res Function(_Gdb) _then) = __$GdbCopyWithImpl;
@override @useResult
$Res call({
 String courseCode, String courseTitle, String title, DateTime? dueDate, double? totalMarks, double? obtainedMarks, GdbStatus status
});




}
/// @nodoc
class __$GdbCopyWithImpl<$Res>
    implements _$GdbCopyWith<$Res> {
  __$GdbCopyWithImpl(this._self, this._then);

  final _Gdb _self;
  final $Res Function(_Gdb) _then;

/// Create a copy of Gdb
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? courseCode = null,Object? courseTitle = null,Object? title = null,Object? dueDate = freezed,Object? totalMarks = freezed,Object? obtainedMarks = freezed,Object? status = null,}) {
  return _then(_Gdb(
courseCode: null == courseCode ? _self.courseCode : courseCode // ignore: cast_nullable_to_non_nullable
as String,courseTitle: null == courseTitle ? _self.courseTitle : courseTitle // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,dueDate: freezed == dueDate ? _self.dueDate : dueDate // ignore: cast_nullable_to_non_nullable
as DateTime?,totalMarks: freezed == totalMarks ? _self.totalMarks : totalMarks // ignore: cast_nullable_to_non_nullable
as double?,obtainedMarks: freezed == obtainedMarks ? _self.obtainedMarks : obtainedMarks // ignore: cast_nullable_to_non_nullable
as double?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as GdbStatus,
  ));
}


}

// dart format on
