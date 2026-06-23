import '../models/session.dart';
import '../networking/vulms_http_client.dart';
import '../client/postback_engine.dart';
import '../parsers/aspnet_parser.dart';
import '../utils/logger.dart';
import '../utils/validators.dart';
import '../utils/constants.dart';
import '../exceptions/exceptions.dart';

/// Manages authentication state and session lifecycle.
///
/// Responsibilities:
/// - Login (HTTP-based)
/// - Session validation
/// - Cookie management
/// - PostBack engine access
class SessionManager {
  final VulmsHttpClient _httpClient;
  final VulmsLogger _logger;
  late final PostBackEngine _postbackEngine;
  SessionState _state;

  SessionManager({
    required VulmsHttpClient httpClient,
    required VulmsLogger logger,
  })  : _httpClient = httpClient,
        _logger = logger,
        _state = const SessionState() {
    _postbackEngine = PostBackEngine(httpClient: httpClient, logger: logger);
  }

  /// Perform HTTP-based login.
  ///
  /// Returns [LoginResult] indicating success or failure.
  /// This may fail if VULMS has reCAPTCHA enabled.
  Future<LoginResult> login(String username, String password) async {
    try {
      _logger.info('[SESSION] Attempting login for $username');
      final rootPage = await _httpClient.get(path: VulmsUrls.root);

      final formData = AspNetParser.extractFormData(rootPage);
      final loginData = AspNetParser.buildLoginData(formData, username, password);

      final result = await _httpClient.post(
        path: VulmsUrls.root,
        data: loginData,
        referer: '${VulmsUrls.baseUrl}/',
      );

      if (AspNetParser.isLoginSuccess(result)) {
        final cookies = await _httpClient.getCookieString();
        _state = SessionState(
          isValid: true,
          cookies: cookies,
          username: username,
        );
        return const LoginResult(success: true);
      }

      if (AspNetParser.isLoginError(result)) {
        return const LoginResult(success: false, error: 'Invalid credentials');
      }

      if (result.contains('__VIEWSTATE') && result.contains('txtStudentID')) {
        return const LoginResult(
          success: false,
          error: 'Login failed. Please check your credentials.',
        );
      }

      return const LoginResult(success: false, error: 'Unexpected login response');
    } on ParsingException catch (e) {
      return LoginResult(success: false, error: e.message);
    } on AuthException catch (e) {
      return LoginResult(success: false, error: e.message);
    } catch (e) {
      throw AuthException(
        'Login failed',
        operation: 'login',
        cause: e is Exception ? e : Exception(e.toString()),
      );
    }
  }

  /// Set session from browser-obtained cookies.
  Future<void> setFromBrowserCookies({
    required String cookies,
    required String username,
  }) async {
    _httpClient.setCookieString(cookies);
    _state = SessionState(
      isValid: true,
      cookies: cookies,
      username: username,
    );
  }

  /// Validate the current session by fetching the home page.
  Future<bool> validateSession() async {
    try {
      _logger.debug('[SESSION] Validating session');
      final html = await _httpClient.get(path: VulmsUrls.home);
      final isLoginPage = Validators.isSessionExpired(html);
      _state = _state.copyWith(isValid: !isLoginPage);
      return !isLoginPage;
    } catch (_) {
      _state = _state.copyWith(isValid: false);
      return false;
    }
  }

  /// Ensure the session is authenticated. Throws if not.
  void ensureAuthenticated() {
    if (!_state.isValid) {
      throw const AuthException(
        'Session is not authenticated. Call login() first.',
      );
    }
  }

  /// Ensure the session is valid, validating with the server if needed.
  Future<void> ensureValidSession() async {
    ensureAuthenticated();
    final valid = await validateSession();
    if (!valid) {
      _state = _state.copyWith(isValid: false);
      throw const SessionExpiredException(
        'Session has expired. Re-login required.',
      );
    }
  }

  /// Whether the session is currently authenticated.
  bool get isAuthenticated => _state.isValid;

  /// Get the current session state.
  SessionState get state => _state;

  /// Get the HTTP client.
  VulmsHttpClient get httpClient => _httpClient;

  /// Get the PostBack engine.
  PostBackEngine get postbackEngine => _postbackEngine;
}
