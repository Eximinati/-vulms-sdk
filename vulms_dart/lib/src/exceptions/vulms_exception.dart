/// Base exception for all VULMS SDK errors.
///
/// All SDK-specific exceptions extend this class, allowing callers
/// to catch any SDK error with a single `catch` block while still
/// supporting granular exception handling via subtypes.
class VulmsException implements Exception {
  /// Human-readable error message.
  final String message;

  /// Machine-readable error code (e.g. 'AUTH_ERROR', 'SESSION_EXPIRED').
  final String code;

  /// The operation that failed (e.g. 'login', 'getAssignments').
  final String? operation;

  /// Whether this error is potentially recoverable.
  final bool recoverable;

  /// The underlying cause, if any.
  final Exception? cause;

  const VulmsException(
    this.message, {
    this.code = 'UNKNOWN_ERROR',
    this.operation,
    this.recoverable = false,
    this.cause,
  });

  @override
  String toString() {
    final parts = ['VulmsException($code): $message'];
    if (operation != null) parts.add('  operation: $operation');
    if (recoverable) parts.add('  recoverable: true');
    if (cause != null) parts.add('  cause: $cause');
    return parts.join('\n');
  }
}
