import 'dart:async';

import 'package:test/test.dart';
import 'package:vulms_dart/src/utils/logger.dart';

void main() {
  group('DefaultLogger', () {
    group('log level filtering', () {
      test('debug message is printed when level is debug', () {
        final messages = _capturePrints(() {
          final logger = DefaultLogger(level: LogLevel.debug);
          logger.debug('test message');
        });
        expect(messages, contains('[DEBUG] test message'));
      });

      test('debug message is suppressed when level is warn', () {
        final messages = _capturePrints(() {
          final logger = DefaultLogger(level: LogLevel.warn);
          logger.debug('should not appear');
        });
        expect(messages, isEmpty);
      });

      test('info message is printed when level is info', () {
        final messages = _capturePrints(() {
          final logger = DefaultLogger(level: LogLevel.info);
          logger.info('info message');
        });
        expect(messages, contains('[INFO] info message'));
      });

      test('info message is suppressed when level is warn', () {
        final messages = _capturePrints(() {
          final logger = DefaultLogger(level: LogLevel.warn);
          logger.info('should not appear');
        });
        expect(messages, isEmpty);
      });

      test('warn message is printed when level is warn', () {
        final messages = _capturePrints(() {
          final logger = DefaultLogger(level: LogLevel.warn);
          logger.warn('warn message');
        });
        expect(messages, contains('[WARN] warn message'));
      });

      test('warn message is suppressed when level is error', () {
        final messages = _capturePrints(() {
          final logger = DefaultLogger(level: LogLevel.error);
          logger.warn('should not appear');
        });
        expect(messages, isEmpty);
      });

      test('error message is printed when level is error', () {
        final messages = _capturePrints(() {
          final logger = DefaultLogger(level: LogLevel.error);
          logger.error('error message');
        });
        expect(messages, contains('[ERROR] error message'));
      });

      test('error message is suppressed when level is silent', () {
        final messages = _capturePrints(() {
          final logger = DefaultLogger(level: LogLevel.silent);
          logger.error('should not appear');
        });
        expect(messages, isEmpty);
      });

      test('trace message is printed when level is trace', () {
        final messages = _capturePrints(() {
          final logger = DefaultLogger(level: LogLevel.trace);
          logger.trace('trace message');
        });
        expect(messages, contains('[TRACE] trace message'));
      });

      test('all levels are printed when level is trace', () {
        final messages = _capturePrints(() {
          final logger = DefaultLogger(level: LogLevel.trace);
          logger.debug('d');
          logger.info('i');
          logger.warn('w');
          logger.error('e');
          logger.trace('t');
        });
        expect(messages.length, 5);
      });

      test('silent level suppresses all output', () {
        final messages = _capturePrints(() {
          final logger = DefaultLogger(level: LogLevel.silent);
          logger.debug('d');
          logger.info('i');
          logger.warn('w');
          logger.error('e');
          logger.trace('t');
        });
        expect(messages, isEmpty);
      });
    });

    group('prefix', () {
      test('includes prefix in output when set', () {
        final messages = _capturePrints(() {
          final logger = DefaultLogger(
            level: LogLevel.debug,
            prefix: 'MyService',
          );
          logger.debug('loading');
        });
        expect(messages, contains('[DEBUG:MyService] loading'));
      });

      test('omits colon when prefix is empty', () {
        final messages = _capturePrints(() {
          final logger = DefaultLogger(level: LogLevel.debug);
          logger.debug('msg');
        });
        expect(messages, contains('[DEBUG] msg'));
      });
    });

    group('child()', () {
      test('child logger has correct prefix', () {
        final messages = _capturePrints(() {
          final parent = DefaultLogger(
            level: LogLevel.debug,
            prefix: 'Parent',
          );
          final child = parent.child('Child');
          child.debug('msg');
        });
        expect(messages, contains('[DEBUG:Parent:Child] msg'));
      });

      test('child of root logger has only child prefix', () {
        final messages = _capturePrints(() {
          final parent = DefaultLogger(level: LogLevel.debug);
          final child = parent.child('Child');
          child.debug('msg');
        });
        expect(messages, contains('[DEBUG:Child] msg'));
      });

      test('deeply nested child accumulates prefix', () {
        final messages = _capturePrints(() {
          final root = DefaultLogger(level: LogLevel.debug, prefix: 'A');
          final b = root.child('B');
          final c = b.child('C');
          c.debug('msg');
        });
        expect(messages, contains('[DEBUG:A:B:C] msg'));
      });

      test('child logger inherits log level', () {
        final messages = _capturePrints(() {
          final parent = DefaultLogger(level: LogLevel.error);
          final child = parent.child('Child');
          child.debug('should not appear');
        });
        expect(messages, isEmpty);
      });
    });
  });

  group('NoopLogger', () {
    test('discards all debug output', () {
      final messages = _capturePrints(() {
        const logger = NoopLogger();
        logger.debug('msg');
      });
      expect(messages, isEmpty);
    });

    test('discards all info output', () {
      final messages = _capturePrints(() {
        const logger = NoopLogger();
        logger.info('msg');
      });
      expect(messages, isEmpty);
    });

    test('discards all warn output', () {
      final messages = _capturePrints(() {
        const logger = NoopLogger();
        logger.warn('msg');
      });
      expect(messages, isEmpty);
    });

    test('discards all error output', () {
      final messages = _capturePrints(() {
        const logger = NoopLogger();
        logger.error('msg');
      });
      expect(messages, isEmpty);
    });

    test('discards all trace output', () {
      final messages = _capturePrints(() {
        const logger = NoopLogger();
        logger.trace('msg');
      });
      expect(messages, isEmpty);
    });

    test('child returns NoopLogger', () {
      const logger = NoopLogger();
      final child = logger.child('prefix');
      expect(child, isA<NoopLogger>());

      final messages = _capturePrints(() {
        child.info('msg');
      });
      expect(messages, isEmpty);
    });
  });

  group('LogLevel enum', () {
    test('has all expected values', () {
      expect(LogLevel.values, containsAll([
        LogLevel.silent,
        LogLevel.error,
        LogLevel.warn,
        LogLevel.info,
        LogLevel.debug,
        LogLevel.trace,
      ]));
      expect(LogLevel.values.length, 6);
    });
  });
}

/// Captures print output during [action] and returns the printed lines.
List<String> _capturePrints(void Function() action) {
  final messages = <String>[];
  final zone = Zone.current.fork(
    specification: ZoneSpecification(
      print: (self, parent, zone, line) {
        messages.add(line);
      },
    ),
  );
  zone.run(action);
  return messages;
}
