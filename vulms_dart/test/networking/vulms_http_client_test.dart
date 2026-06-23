import 'package:test/test.dart';
import 'package:vulms_dart/src/networking/vulms_http_client.dart';
import 'package:vulms_dart/src/utils/logger.dart';

void main() {
  group('Cookie', () {
    test('toString returns "name=value"', () {
      const cookie = Cookie(name: 'session', value: 'abc123');
      expect(cookie.toString(), equals('session=abc123'));
    });

    test('toString handles special characters in value', () {
      const cookie = Cookie(name: 'token', value: 'a=b;c');
      expect(cookie.toString(), equals('token=a=b;c'));
    });
  });

  group('RequestTrace', () {
    test('fields are populated correctly', () {
      final timestamp = DateTime(2025, 1, 15, 10, 30);
      final trace = RequestTrace(
        id: 'REQ_123456_abc',
        method: 'GET',
        url: '/Home.aspx',
        status: 200,
        durationMs: 150,
        responseSize: 1024,
        timestamp: timestamp,
      );

      expect(trace.id, equals('REQ_123456_abc'));
      expect(trace.method, equals('GET'));
      expect(trace.url, equals('/Home.aspx'));
      expect(trace.status, equals(200));
      expect(trace.durationMs, equals(150));
      expect(trace.responseSize, equals(1024));
      expect(trace.error, isNull);
      expect(trace.timestamp, equals(timestamp));
    });

    test('fields with optional values', () {
      final trace = RequestTrace(
        id: 'REQ_789',
        method: 'POST',
        url: '/api/login',
        durationMs: 500,
        timestamp: DateTime.now(),
        error: 'Connection timeout',
      );

      expect(trace.status, isNull);
      expect(trace.responseSize, equals(0));
      expect(trace.error, equals('Connection timeout'));
    });
  });

  group('VulmsHttpClient', () {
    late VulmsHttpClient client;

    setUp(() {
      client = VulmsHttpClient(logger: const NoopLogger());
    });

    tearDown(() {
      client.dispose();
    });

    group('constructor', () {
      test('creates instance with default options', () {
        final c = VulmsHttpClient(logger: const NoopLogger());
        expect(c, isA<VulmsHttpClient>());
        c.dispose();
      });

      test('creates instance with custom timeout', () {
        final c = VulmsHttpClient(
          logger: const NoopLogger(),
          timeoutMs: 60000,
        );
        expect(c, isA<VulmsHttpClient>());
        c.dispose();
      });

      test('creates instance with custom user agent', () {
        final c = VulmsHttpClient(
          logger: const NoopLogger(),
          userAgent: 'TestAgent/1.0',
        );
        expect(c, isA<VulmsHttpClient>());
        c.dispose();
      });

      test('creates instance with traceRequests enabled', () {
        final c = VulmsHttpClient(
          logger: const NoopLogger(),
          traceRequests: true,
        );
        expect(c, isA<VulmsHttpClient>());
        c.dispose();
      });

      test('creates instance with custom maxTraces', () {
        final c = VulmsHttpClient(
          logger: const NoopLogger(),
          maxTraces: 50,
        );
        expect(c, isA<VulmsHttpClient>());
        c.dispose();
      });
    });

    group('cookie management', () {
      test('getCookieString returns empty string when no cookies set', () async {
        final cookieString = await client.getCookieString();
        expect(cookieString, equals(''));
      });

      test('setCookieString and getCookieString roundtrip', () async {
        client.setCookieString('session=abc123');

        final cookieString = await client.getCookieString();
        expect(cookieString, equals('session=abc123'));
      });

      test('setCookieString handles multiple cookies separated by semicolons',
          () async {
        client.setCookieString('session=abc123; token=xyz789; user=testuser');

        final cookieString = await client.getCookieString();
        expect(cookieString, contains('session=abc123'));
        expect(cookieString, contains('token=xyz789'));
        expect(cookieString, contains('user=testuser'));
      });

      test('setCookieString handles semicolons with spaces', () async {
        client.setCookieString('session=abc123 ; token=xyz789 ; user=testuser');

        final cookieString = await client.getCookieString();
        expect(cookieString, contains('session=abc123'));
        expect(cookieString, contains('token=xyz789'));
        expect(cookieString, contains('user=testuser'));
      });

      test('setCookieString handles empty segments', () async {
        client.setCookieString('session=abc123;; ; token=xyz789');

        final cookieString = await client.getCookieString();
        expect(cookieString, contains('session=abc123'));
        expect(cookieString, contains('token=xyz789'));
      });

      test('setCookieString handles value with equals sign', () async {
        client.setCookieString('encoded=a=b=c');

        final cookieString = await client.getCookieString();
        expect(cookieString, contains('encoded=a=b=c'));
      });

      test('clearCookies removes all cookies', () async {
        client.setCookieString('session=abc123; token=xyz789');
        client.clearCookies();

        final cookieString = await client.getCookieString();
        expect(cookieString, equals(''));
      });

      test('clearCookies on empty cookies does not throw', () {
        expect(() => client.clearCookies(), returnsNormally);
      });

      test('setCookieString overwrites existing cookie with same name', () async {
        client.setCookieString('session=old');
        client.setCookieString('session=new');

        final cookieString = await client.getCookieString();
        expect(cookieString, equals('session=new'));
      });

      test('setCookieString with empty string does not add cookies', () async {
        client.setCookieString('');

        final cookieString = await client.getCookieString();
        expect(cookieString, equals(''));
      });

      test('setCookieString with whitespace-only string does not add cookies',
          () async {
        client.setCookieString('   ');

        final cookieString = await client.getCookieString();
        expect(cookieString, equals(''));
      });
    });

    group('trace management', () {
      test('getTraces returns empty list initially', () {
        final traces = client.getTraces();
        expect(traces, isEmpty);
      });

      test('getTraces returns unmodifiable list', () {
        final traces = client.getTraces();
        expect(
          () => traces.add(RequestTrace(
            id: 'test',
            method: 'GET',
            url: '/',
            durationMs: 0,
            timestamp: DateTime.now(),
          )),
          throwsA(isA<UnsupportedError>()),
        );
      });

      test('clearTraces empties the trace list', () {
        final traces = client.getTraces();
        expect(traces, isEmpty);
        client.clearTraces();
        expect(client.getTraces(), isEmpty);
      });
    });

    group('dispose', () {
      test('dispose closes the client', () {
        final c = VulmsHttpClient(logger: const NoopLogger());
        expect(() => c.dispose(), returnsNormally);
      });

      test('dispose can be called multiple times', () {
        final c = VulmsHttpClient(logger: const NoopLogger());
        c.dispose();
        expect(() => c.dispose(), returnsNormally);
      });
    });

    group('logging', () {
      test('creates instance with DefaultLogger', () {
        final c = VulmsHttpClient(
          logger: DefaultLogger(level: LogLevel.debug),
        );
        expect(c, isA<VulmsHttpClient>());
        c.dispose();
      });

      test('creates instance with NoopLogger', () {
        final c = VulmsHttpClient(logger: const NoopLogger());
        expect(c, isA<VulmsHttpClient>());
        c.dispose();
      });
    });
  });
}
