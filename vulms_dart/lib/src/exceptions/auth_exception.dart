import 'vulms_exception.dart';

/// Thrown when authentication fails (invalid credentials, login page errors).
class AuthException extends VulmsException {
  const AuthException(
    super.message, {
    super.operation,
    Exception? cause,
  }) : super(
          code: 'AUTH_ERROR',
          recoverable: true,
          cause: cause,
        );

  @override
  String toString() => 'AuthException: $message';
}
