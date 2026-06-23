import 'package:freezed_annotation/freezed_annotation.dart';

part 'session.freezed.dart';

/// Result of a login attempt.
@freezed
abstract class LoginResult with _$LoginResult {
  const factory LoginResult({
    required bool success,
    String? error,
  }) = _LoginResult;
}

/// ASP.NET web form data required for PostBack requests.
@freezed
abstract class AspNetFormData with _$AspNetFormData {
  const factory AspNetFormData({
    required String viewState,
    required String eventValidation,
    String? viewStateGenerator,
    String? previousPage,
  }) = _AspNetFormData;
}

/// Internal session state.
@freezed
abstract class SessionState with _$SessionState {
  const factory SessionState({
    @Default(false) bool isValid,
    String? cookies,
    String? username,
  }) = _SessionState;
}
