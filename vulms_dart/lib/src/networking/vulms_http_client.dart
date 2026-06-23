import 'dart:async';

import 'package:dio/dio.dart';

import '../exceptions/exceptions.dart';
import '../utils/logger.dart';

/// Centralized HTTP client for VULMS communication.
///
/// All HTTP requests go through this client. It handles:
/// - Cookie persistence via interceptors
/// - Retry with exponential backoff
/// - Request tracing
/// - Authentication detection
class VulmsHttpClient {
  late final Dio _dio;
  final VulmsLogger _logger;
  final List<RequestTrace> _traces = [];
  final int _maxTraces;
  final bool _traceRequests;

  VulmsHttpClient({
    required VulmsLogger logger,
    int timeoutMs = 30000,
    int maxTraces = 200,
    bool traceRequests = false,
    String? userAgent,
  })  : _logger = logger,
        _maxTraces = maxTraces,
        _traceRequests = traceRequests {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://vulms.vu.edu.pk',
      connectTimeout: Duration(milliseconds: timeoutMs),
      receiveTimeout: Duration(milliseconds: timeoutMs),
      followRedirects: true,
      maxRedirects: 5,
      headers: {
        'User-Agent': userAgent ??
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      },
    ));

    _dio.interceptors.add(_CookieInterceptor());
    _dio.interceptors.add(_LoggingInterceptor(_logger, _traceRequests));
  }

  /// GET request with retry.
  Future<String> get({
    required String path,
    Map<String, String>? params,
    Map<String, String>? headers,
    int? timeoutMs,
  }) async {
    return _executeWithRetry('GET', path, (options) async {
      final response = await _dio.get(
        path,
        queryParameters: params,
        options: Options(
          headers: headers,
          receiveTimeout:
              timeoutMs != null ? Duration(milliseconds: timeoutMs) : null,
          validateStatus: (status) => status != null && status < 400,
        ),
      );
      return response.data.toString();
    });
  }

  /// POST request with retry.
  Future<String> post({
    required String path,
    required Map<String, String> data,
    String? referer,
    Map<String, String>? headers,
    int? timeoutMs,
  }) async {
    return _executeWithRetry('POST', path, (options) async {
      final payload = data.entries
          .map((e) =>
              '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}')
          .join('&');

      final response = await _dio.post(
        path,
        data: payload,
        options: Options(
          contentType: 'application/x-www-form-urlencoded',
          headers: {
            'Referer': referer ?? 'https://vulms.vu.edu.pk$path',
            ...?headers,
          },
          receiveTimeout:
              timeoutMs != null ? Duration(milliseconds: timeoutMs) : null,
          validateStatus: (status) => status != null && status < 400,
        ),
      );
      return response.data.toString();
    });
  }

  /// Execute a request with exponential backoff retry.
  Future<String> _executeWithRetry(
    String method,
    String path,
    Future<String> Function(BaseOptions) executor, [
    int attempt = 0,
    int maxRetries = 3,
  ]) async {
    final startTime = DateTime.now();
    DioException? lastError;

    for (var i = attempt; i <= maxRetries; i++) {
      if (i > 0) {
        final delay = Duration(
          milliseconds: (500 * (1 << (i - 1))).clamp(500, 8000),
        );
        _logger.warn(
          'Retry $i/$maxRetries for $method $path after ${delay.inMilliseconds}ms',
        );
        await Future<void>.delayed(delay);
      }

      try {
        final result = await executor(_dio.options);
        final duration = DateTime.now().difference(startTime);
        _logTrace(method, path, 200, duration, result.length);
        return result;
      } on DioException catch (e) {
        lastError = e;
        final status = e.response?.statusCode;
        final isRetryable = _isRetryable(e);

        if (!isRetryable || i >= maxRetries) {
          final duration = DateTime.now().difference(startTime);
          _logTrace(method, path, status, duration, 0, error: e.message);
          _throwNetworkError(e, method);
        }
      }
    }

    throw NetworkException(
      'Max retries exceeded for $method $path',
      operation: '$method $path',
      cause: lastError,
    );
  }

  bool _isRetryable(DioException e) {
    final status = e.response?.statusCode;
    if (status != null) {
      const retryableStatuses = [408, 429, 500, 502, 503, 504];
      if (retryableStatuses.contains(status)) return true;
    }
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.sendTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return true;
    }
    return false;
  }

  Never _throwNetworkError(DioException e, String method) {
    final status = e.response?.statusCode;
    if (status == 429) {
      throw RateLimitException(
        'Rate limited by VULMS server',
        operation: method,
        cause: e,
      );
    }
    throw NetworkException(
      'HTTP ${status ?? "timeout"}: ${e.message}',
      statusCode: status,
      operation: method,
      cause: e,
    );
  }

  void _logTrace(
    String method,
    String url,
    int? status,
    Duration duration,
    int responseSize, {
    String? error,
  }) {
    final trace = RequestTrace(
      id: 'REQ_${DateTime.now().millisecondsSinceEpoch}_${_randomId()}',
      method: method,
      url: url,
      status: status,
      durationMs: duration.inMilliseconds,
      responseSize: responseSize,
      error: error,
      timestamp: DateTime.now(),
    );

    _traces.add(trace);
    if (_traces.length > _maxTraces) {
      _traces.removeRange(0, _traces.length - _maxTraces);
    }
  }

  String _randomId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return List.generate(
      6,
      (_) => chars[DateTime.now().microsecondsSinceEpoch % chars.length],
    ).join();
  }

  /// Get cookies as a string.
  Future<String> getCookieString() async {
    final interceptor =
        _dio.interceptors.whereType<_CookieInterceptor>().firstOrNull;
    if (interceptor == null || interceptor.cookies.isEmpty) return '';
    return interceptor.cookies
        .map((c) => '${c.name}=${c.value}')
        .join('; ');
  }

  /// Set cookies from a string.
  void setCookieString(String cookieString) {
    final interceptor =
        _dio.interceptors.whereType<_CookieInterceptor>().firstOrNull;
    if (interceptor != null) {
      final pairs = cookieString.split(';');
      for (final pair in pairs) {
        final trimmed = pair.trim();
        if (trimmed.isEmpty) continue;
        final eqIndex = trimmed.indexOf('=');
        if (eqIndex > 0) {
          final name = trimmed.substring(0, eqIndex).trim();
          final value = trimmed.substring(eqIndex + 1).trim();
          interceptor.setCookie(name, value);
        }
      }
    }
  }

  /// Clear all cookies.
  void clearCookies() {
    final interceptor =
        _dio.interceptors.whereType<_CookieInterceptor>().firstOrNull;
    interceptor?.clearCookies();
  }

  /// Get request traces.
  List<RequestTrace> getTraces() => List.unmodifiable(_traces);

  /// Clear request traces.
  void clearTraces() => _traces.clear();

  /// Dispose the Dio client.
  void dispose() {
    _dio.close(force: true);
  }
}

/// A recorded HTTP request trace.
class RequestTrace {
  final String id;
  final String method;
  final String url;
  final int? status;
  final int durationMs;
  final int responseSize;
  final String? error;
  final DateTime timestamp;

  const RequestTrace({
    required this.id,
    required this.method,
    required this.url,
    this.status,
    required this.durationMs,
    this.responseSize = 0,
    this.error,
    required this.timestamp,
  });
}

/// Simple cookie model.
class Cookie {
  final String name;
  final String value;

  const Cookie({required this.name, required this.value});

  @override
  String toString() => '$name=$value';
}

/// Cookie management interceptor.
class _CookieInterceptor extends Interceptor {
  final Map<String, String> _cookies = {};

  List<Cookie> get cookies => _cookies.entries
      .map((e) => Cookie(name: e.key, value: e.value))
      .toList();

  void setCookie(String name, String value) {
    _cookies[name] = value;
  }

  void clearCookies() {
    _cookies.clear();
  }

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (_cookies.isNotEmpty) {
      options.headers['Cookie'] =
          _cookies.entries.map((e) => '${e.key}=${e.value}').join('; ');
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    _extractCookies(response);
    handler.next(response);
  }

  void _extractCookies(Response response) {
    final setCookieHeaders = response.headers['set-cookie'];
    if (setCookieHeaders != null) {
      for (final header in setCookieHeaders) {
        final parts = header.split(';');
        if (parts.isNotEmpty) {
          final cookieParts = parts[0].split('=');
          if (cookieParts.length >= 2) {
            final name = cookieParts[0].trim();
            final value = cookieParts.sublist(1).join('=').trim();
            _cookies[name] = value;
          }
        }
      }
    }
  }
}

/// Logging interceptor for debug output.
class _LoggingInterceptor extends Interceptor {
  final VulmsLogger _logger;
  final bool _enabled;

  _LoggingInterceptor(this._logger, this._enabled);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (_enabled) {
      _logger.debug('[HTTP] ${options.method} ${options.uri}');
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (_enabled) {
      final size = response.data?.toString().length ?? 0;
      _logger.debug(
        '[HTTP] ${response.statusCode} ${response.requestOptions.method} '
        '${response.requestOptions.uri} (${size}b)',
      );
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (_enabled) {
      _logger.debug('[HTTP] ERROR ${err.type} ${err.message}');
    }
    handler.next(err);
  }
}
