// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'session.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$LoginResult {

 bool get success; String? get error;
/// Create a copy of LoginResult
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LoginResultCopyWith<LoginResult> get copyWith => _$LoginResultCopyWithImpl<LoginResult>(this as LoginResult, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LoginResult&&(identical(other.success, success) || other.success == success)&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode => Object.hash(runtimeType,success,error);

@override
String toString() {
  return 'LoginResult(success: $success, error: $error)';
}


}

/// @nodoc
abstract mixin class $LoginResultCopyWith<$Res>  {
  factory $LoginResultCopyWith(LoginResult value, $Res Function(LoginResult) _then) = _$LoginResultCopyWithImpl;
@useResult
$Res call({
 bool success, String? error
});




}
/// @nodoc
class _$LoginResultCopyWithImpl<$Res>
    implements $LoginResultCopyWith<$Res> {
  _$LoginResultCopyWithImpl(this._self, this._then);

  final LoginResult _self;
  final $Res Function(LoginResult) _then;

/// Create a copy of LoginResult
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? success = null,Object? error = freezed,}) {
  return _then(_self.copyWith(
success: null == success ? _self.success : success // ignore: cast_nullable_to_non_nullable
as bool,error: freezed == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [LoginResult].
extension LoginResultPatterns on LoginResult {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LoginResult value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LoginResult() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LoginResult value)  $default,){
final _that = this;
switch (_that) {
case _LoginResult():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LoginResult value)?  $default,){
final _that = this;
switch (_that) {
case _LoginResult() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( bool success,  String? error)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LoginResult() when $default != null:
return $default(_that.success,_that.error);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( bool success,  String? error)  $default,) {final _that = this;
switch (_that) {
case _LoginResult():
return $default(_that.success,_that.error);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( bool success,  String? error)?  $default,) {final _that = this;
switch (_that) {
case _LoginResult() when $default != null:
return $default(_that.success,_that.error);case _:
  return null;

}
}

}

/// @nodoc


class _LoginResult implements LoginResult {
  const _LoginResult({required this.success, this.error});
  

@override final  bool success;
@override final  String? error;

/// Create a copy of LoginResult
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LoginResultCopyWith<_LoginResult> get copyWith => __$LoginResultCopyWithImpl<_LoginResult>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LoginResult&&(identical(other.success, success) || other.success == success)&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode => Object.hash(runtimeType,success,error);

@override
String toString() {
  return 'LoginResult(success: $success, error: $error)';
}


}

/// @nodoc
abstract mixin class _$LoginResultCopyWith<$Res> implements $LoginResultCopyWith<$Res> {
  factory _$LoginResultCopyWith(_LoginResult value, $Res Function(_LoginResult) _then) = __$LoginResultCopyWithImpl;
@override @useResult
$Res call({
 bool success, String? error
});




}
/// @nodoc
class __$LoginResultCopyWithImpl<$Res>
    implements _$LoginResultCopyWith<$Res> {
  __$LoginResultCopyWithImpl(this._self, this._then);

  final _LoginResult _self;
  final $Res Function(_LoginResult) _then;

/// Create a copy of LoginResult
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? success = null,Object? error = freezed,}) {
  return _then(_LoginResult(
success: null == success ? _self.success : success // ignore: cast_nullable_to_non_nullable
as bool,error: freezed == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

/// @nodoc
mixin _$AspNetFormData {

 String get viewState; String get eventValidation; String? get viewStateGenerator; String? get previousPage;
/// Create a copy of AspNetFormData
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AspNetFormDataCopyWith<AspNetFormData> get copyWith => _$AspNetFormDataCopyWithImpl<AspNetFormData>(this as AspNetFormData, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AspNetFormData&&(identical(other.viewState, viewState) || other.viewState == viewState)&&(identical(other.eventValidation, eventValidation) || other.eventValidation == eventValidation)&&(identical(other.viewStateGenerator, viewStateGenerator) || other.viewStateGenerator == viewStateGenerator)&&(identical(other.previousPage, previousPage) || other.previousPage == previousPage));
}


@override
int get hashCode => Object.hash(runtimeType,viewState,eventValidation,viewStateGenerator,previousPage);

@override
String toString() {
  return 'AspNetFormData(viewState: $viewState, eventValidation: $eventValidation, viewStateGenerator: $viewStateGenerator, previousPage: $previousPage)';
}


}

/// @nodoc
abstract mixin class $AspNetFormDataCopyWith<$Res>  {
  factory $AspNetFormDataCopyWith(AspNetFormData value, $Res Function(AspNetFormData) _then) = _$AspNetFormDataCopyWithImpl;
@useResult
$Res call({
 String viewState, String eventValidation, String? viewStateGenerator, String? previousPage
});




}
/// @nodoc
class _$AspNetFormDataCopyWithImpl<$Res>
    implements $AspNetFormDataCopyWith<$Res> {
  _$AspNetFormDataCopyWithImpl(this._self, this._then);

  final AspNetFormData _self;
  final $Res Function(AspNetFormData) _then;

/// Create a copy of AspNetFormData
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? viewState = null,Object? eventValidation = null,Object? viewStateGenerator = freezed,Object? previousPage = freezed,}) {
  return _then(_self.copyWith(
viewState: null == viewState ? _self.viewState : viewState // ignore: cast_nullable_to_non_nullable
as String,eventValidation: null == eventValidation ? _self.eventValidation : eventValidation // ignore: cast_nullable_to_non_nullable
as String,viewStateGenerator: freezed == viewStateGenerator ? _self.viewStateGenerator : viewStateGenerator // ignore: cast_nullable_to_non_nullable
as String?,previousPage: freezed == previousPage ? _self.previousPage : previousPage // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [AspNetFormData].
extension AspNetFormDataPatterns on AspNetFormData {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AspNetFormData value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AspNetFormData() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AspNetFormData value)  $default,){
final _that = this;
switch (_that) {
case _AspNetFormData():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AspNetFormData value)?  $default,){
final _that = this;
switch (_that) {
case _AspNetFormData() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String viewState,  String eventValidation,  String? viewStateGenerator,  String? previousPage)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AspNetFormData() when $default != null:
return $default(_that.viewState,_that.eventValidation,_that.viewStateGenerator,_that.previousPage);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String viewState,  String eventValidation,  String? viewStateGenerator,  String? previousPage)  $default,) {final _that = this;
switch (_that) {
case _AspNetFormData():
return $default(_that.viewState,_that.eventValidation,_that.viewStateGenerator,_that.previousPage);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String viewState,  String eventValidation,  String? viewStateGenerator,  String? previousPage)?  $default,) {final _that = this;
switch (_that) {
case _AspNetFormData() when $default != null:
return $default(_that.viewState,_that.eventValidation,_that.viewStateGenerator,_that.previousPage);case _:
  return null;

}
}

}

/// @nodoc


class _AspNetFormData implements AspNetFormData {
  const _AspNetFormData({required this.viewState, required this.eventValidation, this.viewStateGenerator, this.previousPage});
  

@override final  String viewState;
@override final  String eventValidation;
@override final  String? viewStateGenerator;
@override final  String? previousPage;

/// Create a copy of AspNetFormData
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AspNetFormDataCopyWith<_AspNetFormData> get copyWith => __$AspNetFormDataCopyWithImpl<_AspNetFormData>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _AspNetFormData&&(identical(other.viewState, viewState) || other.viewState == viewState)&&(identical(other.eventValidation, eventValidation) || other.eventValidation == eventValidation)&&(identical(other.viewStateGenerator, viewStateGenerator) || other.viewStateGenerator == viewStateGenerator)&&(identical(other.previousPage, previousPage) || other.previousPage == previousPage));
}


@override
int get hashCode => Object.hash(runtimeType,viewState,eventValidation,viewStateGenerator,previousPage);

@override
String toString() {
  return 'AspNetFormData(viewState: $viewState, eventValidation: $eventValidation, viewStateGenerator: $viewStateGenerator, previousPage: $previousPage)';
}


}

/// @nodoc
abstract mixin class _$AspNetFormDataCopyWith<$Res> implements $AspNetFormDataCopyWith<$Res> {
  factory _$AspNetFormDataCopyWith(_AspNetFormData value, $Res Function(_AspNetFormData) _then) = __$AspNetFormDataCopyWithImpl;
@override @useResult
$Res call({
 String viewState, String eventValidation, String? viewStateGenerator, String? previousPage
});




}
/// @nodoc
class __$AspNetFormDataCopyWithImpl<$Res>
    implements _$AspNetFormDataCopyWith<$Res> {
  __$AspNetFormDataCopyWithImpl(this._self, this._then);

  final _AspNetFormData _self;
  final $Res Function(_AspNetFormData) _then;

/// Create a copy of AspNetFormData
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? viewState = null,Object? eventValidation = null,Object? viewStateGenerator = freezed,Object? previousPage = freezed,}) {
  return _then(_AspNetFormData(
viewState: null == viewState ? _self.viewState : viewState // ignore: cast_nullable_to_non_nullable
as String,eventValidation: null == eventValidation ? _self.eventValidation : eventValidation // ignore: cast_nullable_to_non_nullable
as String,viewStateGenerator: freezed == viewStateGenerator ? _self.viewStateGenerator : viewStateGenerator // ignore: cast_nullable_to_non_nullable
as String?,previousPage: freezed == previousPage ? _self.previousPage : previousPage // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

/// @nodoc
mixin _$SessionState {

 bool get isValid; String? get cookies; String? get username;
/// Create a copy of SessionState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SessionStateCopyWith<SessionState> get copyWith => _$SessionStateCopyWithImpl<SessionState>(this as SessionState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SessionState&&(identical(other.isValid, isValid) || other.isValid == isValid)&&(identical(other.cookies, cookies) || other.cookies == cookies)&&(identical(other.username, username) || other.username == username));
}


@override
int get hashCode => Object.hash(runtimeType,isValid,cookies,username);

@override
String toString() {
  return 'SessionState(isValid: $isValid, cookies: $cookies, username: $username)';
}


}

/// @nodoc
abstract mixin class $SessionStateCopyWith<$Res>  {
  factory $SessionStateCopyWith(SessionState value, $Res Function(SessionState) _then) = _$SessionStateCopyWithImpl;
@useResult
$Res call({
 bool isValid, String? cookies, String? username
});




}
/// @nodoc
class _$SessionStateCopyWithImpl<$Res>
    implements $SessionStateCopyWith<$Res> {
  _$SessionStateCopyWithImpl(this._self, this._then);

  final SessionState _self;
  final $Res Function(SessionState) _then;

/// Create a copy of SessionState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? isValid = null,Object? cookies = freezed,Object? username = freezed,}) {
  return _then(_self.copyWith(
isValid: null == isValid ? _self.isValid : isValid // ignore: cast_nullable_to_non_nullable
as bool,cookies: freezed == cookies ? _self.cookies : cookies // ignore: cast_nullable_to_non_nullable
as String?,username: freezed == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [SessionState].
extension SessionStatePatterns on SessionState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SessionState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SessionState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SessionState value)  $default,){
final _that = this;
switch (_that) {
case _SessionState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SessionState value)?  $default,){
final _that = this;
switch (_that) {
case _SessionState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( bool isValid,  String? cookies,  String? username)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SessionState() when $default != null:
return $default(_that.isValid,_that.cookies,_that.username);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( bool isValid,  String? cookies,  String? username)  $default,) {final _that = this;
switch (_that) {
case _SessionState():
return $default(_that.isValid,_that.cookies,_that.username);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( bool isValid,  String? cookies,  String? username)?  $default,) {final _that = this;
switch (_that) {
case _SessionState() when $default != null:
return $default(_that.isValid,_that.cookies,_that.username);case _:
  return null;

}
}

}

/// @nodoc


class _SessionState implements SessionState {
  const _SessionState({this.isValid = false, this.cookies, this.username});
  

@override@JsonKey() final  bool isValid;
@override final  String? cookies;
@override final  String? username;

/// Create a copy of SessionState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SessionStateCopyWith<_SessionState> get copyWith => __$SessionStateCopyWithImpl<_SessionState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _SessionState&&(identical(other.isValid, isValid) || other.isValid == isValid)&&(identical(other.cookies, cookies) || other.cookies == cookies)&&(identical(other.username, username) || other.username == username));
}


@override
int get hashCode => Object.hash(runtimeType,isValid,cookies,username);

@override
String toString() {
  return 'SessionState(isValid: $isValid, cookies: $cookies, username: $username)';
}


}

/// @nodoc
abstract mixin class _$SessionStateCopyWith<$Res> implements $SessionStateCopyWith<$Res> {
  factory _$SessionStateCopyWith(_SessionState value, $Res Function(_SessionState) _then) = __$SessionStateCopyWithImpl;
@override @useResult
$Res call({
 bool isValid, String? cookies, String? username
});




}
/// @nodoc
class __$SessionStateCopyWithImpl<$Res>
    implements _$SessionStateCopyWith<$Res> {
  __$SessionStateCopyWithImpl(this._self, this._then);

  final _SessionState _self;
  final $Res Function(_SessionState) _then;

/// Create a copy of SessionState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? isValid = null,Object? cookies = freezed,Object? username = freezed,}) {
  return _then(_SessionState(
isValid: null == isValid ? _self.isValid : isValid // ignore: cast_nullable_to_non_nullable
as bool,cookies: freezed == cookies ? _self.cookies : cookies // ignore: cast_nullable_to_non_nullable
as String?,username: freezed == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
