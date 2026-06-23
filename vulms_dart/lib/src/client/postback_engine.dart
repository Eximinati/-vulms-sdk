import '../models/session.dart';
import '../networking/vulms_http_client.dart';
import '../parsers/aspnet_parser.dart';
import '../utils/logger.dart';
import '../utils/constants.dart';

/// Handles ASP.NET PostBack navigation.
///
/// Manages form state (__VIEWSTATE, __EVENTVALIDATION) across requests
/// and supports both standard PostBack and image button PostBack.
class PostBackEngine {
  final VulmsHttpClient _httpClient;
  final VulmsLogger _logger;
  AspNetFormData? _lastFormData;
  String? _lastPage;

  PostBackEngine({
    required VulmsHttpClient httpClient,
    required VulmsLogger logger,
  })  : _httpClient = httpClient,
        _logger = logger;

  /// Perform a PostBack request.
  ///
  /// [page] is the ASP.NET page path.
  /// [eventTarget] is the __EVENTTARGET value (control that triggered the postback).
  /// [extraFields] are additional form fields to include.
  /// [refreshFormState] forces re-fetching the form state before posting.
  Future<String> performPostBack({
    required String page,
    String? eventTarget,
    Map<String, String>? extraFields,
    bool refreshFormState = false,
  }) async {
    final isImgBtn = _isImageButton(eventTarget ?? '');
    _logger.debug(
        'PostBack: $page [${eventTarget ?? "none"}] type=${isImgBtn ? "image-button" : "standard"}');

    final needsRefresh = refreshFormState ||
        _lastFormData == null ||
        _lastPage != page;

    if (needsRefresh) {
      _logger.debug('  Fetching form state from $page');
      final pageHtml = await _httpClient.get(path: page);
      _lastFormData = AspNetParser.extractFormData(pageHtml);
      _lastPage = page;
      _logger.debug('  VIEWSTATE length: ${_lastFormData!.viewState.length}');
    }

    final fields = <String, String>{};

    if (isImgBtn) {
      fields[eventTarget!] = 'Submit';
      fields['${eventTarget}.x'] = '10';
      fields['${eventTarget}.y'] = '10';
      _logger.debug('  Image button: $eventTarget + x/y');
    } else {
      if (eventTarget != null) {
        fields['__EVENTTARGET'] = eventTarget;
        _logger.debug('  __EVENTTARGET=$eventTarget');
      }
    }

    final data = AspNetParser.buildPostbackData(
      _lastFormData!,
      extraFields: {...fields, ...?extraFields},
    );

    final html = await _httpClient.post(
      path: page,
      data: data,
      referer: '${VulmsUrls.baseUrl}$page',
    );

    _logger.debug('  Response length: ${html.length}');

    try {
      _lastFormData = AspNetParser.extractFormData(html);
      _lastPage = page;
      _logger.debug('  Response OK, VIEWSTATE length: ${_lastFormData!.viewState.length}');
    } catch (e) {
      _logger.warn('  Failed to extract form state from response: $e');
      _lastFormData = null;
      _lastPage = null;
    }

    return html;
  }

  /// Fetch a page and store its form state.
  Future<String> fetchWithFormState(String page) async {
    _logger.debug('fetchWithFormState: $page');
    final html = await _httpClient.get(path: page);
    _lastFormData = AspNetParser.extractFormData(html);
    _lastPage = page;
    return html;
  }

  /// Clear stored form state.
  void clearState() {
    _lastFormData = null;
    _lastPage = null;
    _logger.debug('PostBack state cleared');
  }

  /// Whether form state is currently stored.
  bool hasState() => _lastFormData != null && _lastPage != null;

  bool _isImageButton(String name) {
    return name.contains('ibtn') || name.contains(r'$ibtn');
  }
}
