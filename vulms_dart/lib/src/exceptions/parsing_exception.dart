import 'vulms_exception.dart';

/// Thrown when HTML parsing fails or returns unexpected structure.
class ParsingException extends VulmsException {
  const ParsingException(
    super.message, {
    super.operation,
    Exception? cause,
  }) : super(
          code: 'PARSING_ERROR',
          recoverable: false,
          cause: cause,
        );

  @override
  String toString() => 'ParsingException: $message';
}
