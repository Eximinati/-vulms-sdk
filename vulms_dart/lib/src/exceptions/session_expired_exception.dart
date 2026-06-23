import 'vulms_exception.dart';

/// Thrown when the session has expired and re-authentication is required.
class SessionExpiredException extends VulmsException {
  const SessionExpiredException(
    super.message, {
    super.operation,
    Exception? cause,
  }) : super(
          code: 'SESSION_EXPIRED',
          recoverable: true,
          cause: cause,
        );

  @override
  String toString() => 'SessionExpiredException: $message';
}
