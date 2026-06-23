import 'package:test/test.dart';
import 'package:vulms_dart/src/models/session.dart';

void main() {
  group('LoginResult', () {
    group('constructor', () {
      test('creates instance with success true and no error', () {
        const result = LoginResult(success: true);

        expect(result.success, isTrue);
        expect(result.error, isNull);
      });

      test('creates instance with success false and error message', () {
        const result = LoginResult(
          success: false,
          error: 'Invalid credentials',
        );

        expect(result.success, isFalse);
        expect(result.error, equals('Invalid credentials'));
      });

      test('creates instance with success true and error message', () {
        const result = LoginResult(
          success: true,
          error: 'Warning: password expiring soon',
        );

        expect(result.success, isTrue);
        expect(result.error, equals('Warning: password expiring soon'));
      });
    });

    group('equality', () {
      test('two LoginResults with same fields are equal', () {
        const a = LoginResult(success: true);
        const b = LoginResult(success: true);

        expect(a, equals(b));
        expect(a.hashCode, equals(b.hashCode));
      });

      test('two LoginResults with different success are not equal', () {
        const a = LoginResult(success: true);
        const b = LoginResult(success: false);

        expect(a, isNot(equals(b)));
      });

      test('two LoginResults with different errors are not equal', () {
        const a = LoginResult(success: false, error: 'Error 1');
        const b = LoginResult(success: false, error: 'Error 2');

        expect(a, isNot(equals(b)));
      });

      test('LoginResult with null error equals one without error', () {
        const a = LoginResult(success: true);
        const b = LoginResult(success: true, error: null);

        expect(a, equals(b));
      });
    });

    group('toString', () {
      test('returns a non-empty string', () {
        const result = LoginResult(success: true);
        final str = result.toString();

        expect(str, isA<String>());
        expect(str, isNotEmpty);
        expect(str, contains('true'));
      });

      test('includes error message in string', () {
        const result = LoginResult(
          success: false,
          error: 'Invalid credentials',
        );
        final str = result.toString();

        expect(str, contains('Invalid credentials'));
      });
    });

    group('copyWith', () {
      test('returns same values when no arguments provided', () {
        const original = LoginResult(
          success: false,
          error: 'Original error',
        );
        final copied = original.copyWith();

        expect(copied.success, equals(false));
        expect(copied.error, equals('Original error'));
        expect(copied, isNot(same(original)));
      });

      test('changes success', () {
        const original = LoginResult(success: false);
        final copied = original.copyWith(success: true);

        expect(copied.success, isTrue);
        expect(copied.error, isNull);
      });

      test('changes error', () {
        const original = LoginResult(success: false, error: 'Old');
        final copied = original.copyWith(error: 'New');

        expect(copied.success, isFalse);
        expect(copied.error, equals('New'));
      });
    });
  });

  group('AspNetFormData', () {
    group('constructor', () {
      test('creates instance with required fields', () {
        const data = AspNetFormData(
          viewState: 'abc123',
          eventValidation: 'def456',
        );

        expect(data.viewState, equals('abc123'));
        expect(data.eventValidation, equals('def456'));
        expect(data.viewStateGenerator, isNull);
        expect(data.previousPage, isNull);
      });

      test('creates instance with all fields', () {
        const data = AspNetFormData(
          viewState: 'abc123',
          eventValidation: 'def456',
          viewStateGenerator: 'ghi789',
          previousPage: '/home',
        );

        expect(data.viewState, equals('abc123'));
        expect(data.eventValidation, equals('def456'));
        expect(data.viewStateGenerator, equals('ghi789'));
        expect(data.previousPage, equals('/home'));
      });
    });

    group('equality', () {
      test('two AspNetFormData with same fields are equal', () {
        const a = AspNetFormData(
          viewState: 'abc',
          eventValidation: 'def',
        );
        const b = AspNetFormData(
          viewState: 'abc',
          eventValidation: 'def',
        );

        expect(a, equals(b));
        expect(a.hashCode, equals(b.hashCode));
      });

      test('two AspNetFormData with different viewState are not equal', () {
        const a = AspNetFormData(
          viewState: 'abc',
          eventValidation: 'def',
        );
        const b = AspNetFormData(
          viewState: 'xyz',
          eventValidation: 'def',
        );

        expect(a, isNot(equals(b)));
      });

      test('two AspNetFormData with different eventValidation are not equal', () {
        const a = AspNetFormData(
          viewState: 'abc',
          eventValidation: 'def',
        );
        const b = AspNetFormData(
          viewState: 'abc',
          eventValidation: 'xyz',
        );

        expect(a, isNot(equals(b)));
      });
    });

    group('toString', () {
      test('returns a non-empty string', () {
        const data = AspNetFormData(
          viewState: 'abc123',
          eventValidation: 'def456',
        );
        final str = data.toString();

        expect(str, isA<String>());
        expect(str, isNotEmpty);
        expect(str, contains('abc123'));
      });
    });

    group('copyWith', () {
      test('returns same values when no arguments provided', () {
        const original = AspNetFormData(
          viewState: 'abc',
          eventValidation: 'def',
          viewStateGenerator: 'ghi',
        );
        final copied = original.copyWith();

        expect(copied.viewState, equals('abc'));
        expect(copied.eventValidation, equals('def'));
        expect(copied.viewStateGenerator, equals('ghi'));
        expect(copied, isNot(same(original)));
      });

      test('changes viewState', () {
        const original = AspNetFormData(
          viewState: 'abc',
          eventValidation: 'def',
        );
        final copied = original.copyWith(viewState: 'xyz');

        expect(copied.viewState, equals('xyz'));
        expect(copied.eventValidation, equals('def'));
      });

      test('changes eventValidation', () {
        const original = AspNetFormData(
          viewState: 'abc',
          eventValidation: 'def',
        );
        final copied = original.copyWith(eventValidation: 'xyz');

        expect(copied.viewState, equals('abc'));
        expect(copied.eventValidation, equals('xyz'));
      });
    });
  });

  group('SessionState', () {
    group('constructor', () {
      test('creates instance with defaults', () {
        const state = SessionState();

        expect(state.isValid, isFalse);
        expect(state.cookies, isNull);
        expect(state.username, isNull);
      });

      test('creates instance with all fields', () {
        const state = SessionState(
          isValid: true,
          cookies: 'session=abc123',
          username: 'student123',
        );

        expect(state.isValid, isTrue);
        expect(state.cookies, equals('session=abc123'));
        expect(state.username, equals('student123'));
      });
    });

    group('default values', () {
      test('isValid defaults to false', () {
        const state = SessionState();

        expect(state.isValid, isFalse);
      });
    });

    group('equality', () {
      test('two SessionStates with same fields are equal', () {
        const a = SessionState(
          isValid: true,
          cookies: 'abc',
          username: 'user',
        );
        const b = SessionState(
          isValid: true,
          cookies: 'abc',
          username: 'user',
        );

        expect(a, equals(b));
        expect(a.hashCode, equals(b.hashCode));
      });

      test('two SessionStates with different isValid are not equal', () {
        const a = SessionState(isValid: true);
        const b = SessionState(isValid: false);

        expect(a, isNot(equals(b)));
      });

      test('two SessionStates with different cookies are not equal', () {
        const a = SessionState(isValid: true, cookies: 'abc');
        const b = SessionState(isValid: true, cookies: 'xyz');

        expect(a, isNot(equals(b)));
      });

      test('two SessionStates with different usernames are not equal', () {
        const a = SessionState(isValid: true, username: 'user1');
        const b = SessionState(isValid: true, username: 'user2');

        expect(a, isNot(equals(b)));
      });

      test('default SessionState equals another default SessionState', () {
        const a = SessionState();
        const b = SessionState();

        expect(a, equals(b));
      });
    });

    group('toString', () {
      test('returns a non-empty string', () {
        const state = SessionState(
          isValid: true,
          username: 'user',
        );
        final str = state.toString();

        expect(str, isA<String>());
        expect(str, isNotEmpty);
        expect(str, contains('user'));
      });
    });

    group('copyWith', () {
      test('returns same values when no arguments provided', () {
        const original = SessionState(
          isValid: true,
          cookies: 'abc',
          username: 'user',
        );
        final copied = original.copyWith();

        expect(copied.isValid, isTrue);
        expect(copied.cookies, equals('abc'));
        expect(copied.username, equals('user'));
        expect(copied, isNot(same(original)));
      });

      test('changes isValid', () {
        const original = SessionState(isValid: false);
        final copied = original.copyWith(isValid: true);

        expect(copied.isValid, isTrue);
        expect(copied.cookies, isNull);
        expect(copied.username, isNull);
      });

      test('changes cookies', () {
        const original = SessionState(cookies: 'old');
        final copied = original.copyWith(cookies: 'new');

        expect(copied.cookies, equals('new'));
      });

      test('changes username', () {
        const original = SessionState(username: 'old_user');
        final copied = original.copyWith(username: 'new_user');

        expect(copied.username, equals('new_user'));
      });

      test('changes multiple fields', () {
        const original = SessionState(
          isValid: false,
          cookies: 'old',
          username: 'old_user',
        );
        final copied = original.copyWith(
          isValid: true,
          cookies: 'new',
          username: 'new_user',
        );

        expect(copied.isValid, isTrue);
        expect(copied.cookies, equals('new'));
        expect(copied.username, equals('new_user'));
      });
    });
  });
}
