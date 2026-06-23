import 'package:test/test.dart';
import 'package:vulms_dart/src/auth/session_manager.dart';
import 'package:vulms_dart/src/client/postback_engine.dart';
import 'package:vulms_dart/src/exceptions/exceptions.dart';
import 'package:vulms_dart/src/models/session.dart';
import 'package:vulms_dart/src/networking/vulms_http_client.dart';
import 'package:vulms_dart/src/utils/logger.dart';

void main() {
  group('SessionManager', () {
    late VulmsHttpClient httpClient;
    late VulmsLogger logger;
    late SessionManager sessionManager;

    setUp(() {
      httpClient = VulmsHttpClient(logger: const NoopLogger());
      logger = const NoopLogger();
      sessionManager = SessionManager(
        httpClient: httpClient,
        logger: logger,
      );
    });

    tearDown(() {
      httpClient.dispose();
    });

    group('initial state', () {
      test('isAuthenticated returns false initially', () {
        expect(sessionManager.isAuthenticated, isFalse);
      });

      test('state returns current SessionState', () {
        final state = sessionManager.state;
        expect(state, isA<SessionState>());
        expect(state.isValid, isFalse);
        expect(state.cookies, isNull);
        expect(state.username, isNull);
      });

      test('SessionState default values', () {
        const state = SessionState();
        expect(state.isValid, isFalse);
        expect(state.cookies, isNull);
        expect(state.username, isNull);
      });
    });

    group('setFromBrowserCookies', () {
      test('sets session state correctly', () async {
        await sessionManager.setFromBrowserCookies(
          cookies: 'session=abc123; token=xyz',
          username: 'student123',
        );

        final state = sessionManager.state;
        expect(state.isValid, isTrue);
        expect(state.cookies, equals('session=abc123; token=xyz'));
        expect(state.username, equals('student123'));
      });

      test('sets cookies in HTTP client', () async {
        await sessionManager.setFromBrowserCookies(
          cookies: 'session=abc123',
          username: 'student123',
        );

        final cookieString = await httpClient.getCookieString();
        expect(cookieString, contains('session=abc123'));
      });

      test('isAuthenticated returns true after setFromBrowserCookies', () async {
        expect(sessionManager.isAuthenticated, isFalse);

        await sessionManager.setFromBrowserCookies(
          cookies: 'session=abc123',
          username: 'student123',
        );

        expect(sessionManager.isAuthenticated, isTrue);
      });

      test('state reflects changes from setFromBrowserCookies', () async {
        final stateBefore = sessionManager.state;
        expect(stateBefore.isValid, isFalse);
        expect(stateBefore.username, isNull);

        await sessionManager.setFromBrowserCookies(
          cookies: 'session=new',
          username: 'newuser',
        );

        final stateAfter = sessionManager.state;
        expect(stateAfter.isValid, isTrue);
        expect(stateAfter.username, equals('newuser'));
        expect(stateAfter.cookies, equals('session=new'));
      });

      test('multiple calls update state', () async {
        await sessionManager.setFromBrowserCookies(
          cookies: 'session=first',
          username: 'user1',
        );

        await sessionManager.setFromBrowserCookies(
          cookies: 'session=second',
          username: 'user2',
        );

        final state = sessionManager.state;
        expect(state.cookies, equals('session=second'));
        expect(state.username, equals('user2'));
      });
    });

    group('ensureAuthenticated', () {
      test('throws AuthException when not authenticated', () {
        expect(
          () => sessionManager.ensureAuthenticated(),
          throwsA(isA<AuthException>()),
        );
      });

      test('does not throw when authenticated', () async {
        await sessionManager.setFromBrowserCookies(
          cookies: 'session=abc123',
          username: 'student123',
        );

        expect(() => sessionManager.ensureAuthenticated(), returnsNormally);
      });

      test('AuthException has correct message', () async {
        expect(
          () => sessionManager.ensureAuthenticated(),
          throwsA(
            isA<AuthException>().having(
              (e) => e.message,
              'message',
              contains('not authenticated'),
            ),
          ),
        );
      });

      test('AuthException is recoverable', () async {
        try {
          sessionManager.ensureAuthenticated();
          fail('Should have thrown');
        } on AuthException catch (e) {
          expect(e.recoverable, isTrue);
        }
      });
    });

    group('postbackEngine', () {
      test('postbackEngine getter returns PostBackEngine', () {
        expect(sessionManager.postbackEngine, isA<PostBackEngine>());
      });

      test('postbackEngine is the same instance on repeated access', () {
        final engine1 = sessionManager.postbackEngine;
        final engine2 = sessionManager.postbackEngine;
        expect(engine1, same(engine2));
      });
    });

    group('httpClient', () {
      test('httpClient getter returns the injected client', () {
        expect(sessionManager.httpClient, same(httpClient));
      });
    });
  });
}
