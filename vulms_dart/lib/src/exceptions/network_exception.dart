import 'vulms_exception.dart';

/// Thrown when a network request fails (timeout, connection error, etc.).
class NetworkException extends VulmsException {
  /// HTTP status code, if available.
  final int? statusCode;

  const NetworkException(
    super.message, {
    this.statusCode,
    super.operation,
    Exception? cause,
  }) : super(
          code: 'NETWORK_ERROR',
          recoverable: true,
          cause: cause,
        );

  @override
  String toString() {
    final base = 'NetworkException: $message';
    if (statusCode != null) return '$base (HTTP $statusCode)';
    return base;
  }
}
