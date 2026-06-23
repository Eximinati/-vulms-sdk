import 'package:html/dom.dart';

/// Walk up the DOM tree from [element] to find an ancestor matching [selector].
///
/// Supports simple CSS selectors: tag names, #id, and .class selectors.
/// The `html` package doesn't have `Element.closest()`.
Element? closest(Element element, String selector) {
  var current = element.parent;
  while (current != null) {
    if (_matchesSelector(current, selector)) return current;
    current = current.parent;
  }
  return null;
}

bool _matchesSelector(Element element, String selector) {
  final s = selector.trim();

  // ID selector: #some-id
  if (s.startsWith('#')) {
    return element.id == s.substring(1);
  }

  // Class selector: .some-class
  if (s.startsWith('.')) {
    final className = s.substring(1);
    return element.classes.contains(className);
  }

  // Tag selector: div, span, etc.
  return element.localName == s.toLowerCase();
}
