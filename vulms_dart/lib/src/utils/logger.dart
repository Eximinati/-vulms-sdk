// ignore_for_file: avoid_print

/// Log level for SDK output.
enum LogLevel {
  silent,
  error,
  warn,
  info,
  debug,
  trace,
}

/// Abstract logger interface for the SDK.
///
/// Implement this to provide custom logging in your app.
abstract class VulmsLogger {
  void debug(String message);
  void info(String message);
  void warn(String message);
  void error(String message);
  void trace(String message);

  /// Create a child logger with a prefix.
  VulmsLogger child(String prefix);
}

/// Default logger implementation using `print`.
class DefaultLogger implements VulmsLogger {
  final LogLevel level;
  final String prefix;

  DefaultLogger({
    this.level = LogLevel.warn,
    this.prefix = '',
  });

  static const _priority = {
    LogLevel.silent: 0,
    LogLevel.error: 1,
    LogLevel.warn: 2,
    LogLevel.info: 3,
    LogLevel.debug: 4,
    LogLevel.trace: 5,
  };

  @override
  void debug(String message) {
    if (_priority[level]! >= _priority[LogLevel.debug]!) {
      print('[DEBUG${_pfx}] $message');
    }
  }

  @override
  void info(String message) {
    if (_priority[level]! >= _priority[LogLevel.info]!) {
      print('[INFO${_pfx}] $message');
    }
  }

  @override
  void warn(String message) {
    if (_priority[level]! >= _priority[LogLevel.warn]!) {
      print('[WARN${_pfx}] $message');
    }
  }

  @override
  void error(String message) {
    if (_priority[level]! >= _priority[LogLevel.error]!) {
      print('[ERROR${_pfx}] $message');
    }
  }

  @override
  void trace(String message) {
    if (_priority[level]! >= _priority[LogLevel.trace]!) {
      print('[TRACE${_pfx}] $message');
    }
  }

  @override
  VulmsLogger child(String childPrefix) {
    return DefaultLogger(
      level: level,
      prefix: prefix.isEmpty ? childPrefix : '$prefix:$childPrefix',
    );
  }

  String get _pfx => prefix.isEmpty ? '' : ':$prefix';
}

/// No-op logger that discards all output.
class NoopLogger implements VulmsLogger {
  const NoopLogger();

  @override
  void debug(String message) {}
  @override
  void info(String message) {}
  @override
  void warn(String message) {}
  @override
  void error(String message) {}
  @override
  void trace(String message) {}
  @override
  VulmsLogger child(String prefix) => const NoopLogger();
}
