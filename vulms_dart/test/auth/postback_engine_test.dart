import 'package:test/test.dart';
import 'package:vulms_dart/src/client/postback_engine.dart';
import 'package:vulms_dart/src/networking/vulms_http_client.dart';
import 'package:vulms_dart/src/utils/logger.dart';

void main() {
  group('PostBackEngine', () {
    late VulmsHttpClient httpClient;
    late VulmsLogger logger;
    late PostBackEngine engine;

    setUp(() {
      httpClient = VulmsHttpClient(logger: const NoopLogger());
      logger = const NoopLogger();
      engine = PostBackEngine(
        httpClient: httpClient,
        logger: logger,
      );
    });

    tearDown(() {
      httpClient.dispose();
    });

    group('hasState', () {
      test('returns false initially', () {
        expect(engine.hasState(), isFalse);
      });
    });

    group('clearState', () {
      test('clearState resets state', () {
        engine.clearState();
        expect(engine.hasState(), isFalse);
      });

      test('clearState then hasState returns false', () {
        engine.clearState();
        expect(engine.hasState(), isFalse);
      });

      test('clearState on fresh engine does not throw', () {
        expect(() => engine.clearState(), returnsNormally);
      });
    });
  });
}
