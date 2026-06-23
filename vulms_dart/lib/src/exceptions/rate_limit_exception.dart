import 'vulms_exception.dart';

/// Thrown when the server responds with HTTP 429 (Too Many Requests).
class RateLimitException extends VulmsException {
  /// Duration to wait before retrying, if suggested by the server.
  final Duration? retryAfter;

  const RateLimitException(
    super.message, {
    this.retryAfter,
    super.operation,
    Exception? cause,
  }) : super(
          code: 'RATE_LIMITED',
          recoverable: true,
          cause: cause,
        );

  @override
  String toString() {
    final base = 'RateLimitException: $message';
    if (retryAfter != null) return '$base (retry after ${retryAfter!.inSeconds}s)';
    return base;
  }
}
