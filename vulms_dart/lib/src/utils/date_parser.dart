/// Parses VULMS-specific date formats into [DateTime].
///
/// VULMS uses several date formats:
/// - `15-Jan-2024` or `15/Jan/2024`
/// - `15-01-2024` or `2024-01-15`
/// - `January 15, 2024`
/// - `January 15, 2024 3:30 PM`
/// - Unix timestamps (seconds or milliseconds)
class VulmsDateParser {
  VulmsDateParser._();

  static const _monthMap = <String, int>{
    'jan': 1,
    'feb': 2,
    'mar': 3,
    'apr': 4,
    'may': 5,
    'jun': 6,
    'jul': 7,
    'aug': 8,
    'sep': 9,
    'oct': 10,
    'nov': 11,
    'dec': 12,
  };

  /// Parse a VULMS date string. Returns null if unparseable.
  static DateTime? tryParse(String? input) {
    if (input == null) return null;
    final str = input.trim().replaceAll(RegExp(r'\s+'), ' ');
    if (str.isEmpty || str.toLowerCase() == 'n/a' || str == '-' || str == '---') {
      return null;
    }

    // Try DD-Mon-YYYY or DD/Mon/YYYY
    final mmmMatch = RegExp(
      r'^(\d{1,2})\s*[-/.]\s*([A-Za-z]{3,})\s*[-/.]\s*(\d{4})$',
    ).firstMatch(str);
    if (mmmMatch != null) {
      final day = int.tryParse(mmmMatch.group(1)!);
      final monthName = mmmMatch.group(2)!.toLowerCase().substring(0, 3);
      final year = int.tryParse(mmmMatch.group(3)!);
      final month = _monthMap[monthName];
      if (day != null && month != null && year != null) {
        final dt = DateTime(year, month, day);
        if (dt.year == year && dt.month == month && dt.day == day) return dt;
      }
    }

    // Try numeric DD/MM/YYYY or MM/DD/YYYY or YYYY/MM/DD
    final numericMatch = RegExp(
      r'^(\d{1,4})\s*[/.-]\s*(\d{1,2})\s*[/.-]\s*(\d{1,4})$',
    ).firstMatch(str);
    if (numericMatch != null) {
      final a = int.tryParse(numericMatch.group(1)!);
      final b = int.tryParse(numericMatch.group(2)!);
      final y = int.tryParse(numericMatch.group(3)!);
      if (a != null && b != null && y != null) {
        final year = y > 1000 ? y : y + 2000;
        // Try DD/MM/YYYY first (VULMS is typically day-first)
        if (a > 12) {
          final dt = DateTime(year, b, a);
          if (dt.month == b && dt.day == a) return dt;
        }
        if (b > 12) {
          final dt = DateTime(year, a, b);
          if (dt.month == a && dt.day == b) return dt;
        }
        // Default: month-day
        final dt = DateTime(year, b, a);
        if (dt.month == b && dt.day == a) return dt;
      }
    }

    // Try "Month DD, YYYY"
    final longMatch = RegExp(
      r'^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$',
    ).firstMatch(str);
    if (longMatch != null) {
      final monthStr = longMatch.group(1)!;
      final day = int.tryParse(longMatch.group(2)!);
      final year = int.tryParse(longMatch.group(3)!);
      if (day != null && year != null) {
        final dt = DateTime.tryParse('$monthStr $day, $year');
        if (dt != null) return dt;
      }
    }

    // Try "Month DD, YYYY H:MM AM/PM"
    final longWithTime = RegExp(
      r'^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$',
      caseSensitive: false,
    ).firstMatch(str);
    if (longWithTime != null) {
      final monthStr = longWithTime.group(1)!;
      final day = int.tryParse(longWithTime.group(2)!);
      final year = int.tryParse(longWithTime.group(3)!);
      var hours = int.tryParse(longWithTime.group(4)!);
      final minutes = int.tryParse(longWithTime.group(5)!);
      final ampm = longWithTime.group(6)!.toUpperCase();
      if (day != null && year != null && hours != null && minutes != null) {
        if (ampm == 'PM' && hours != 12) hours += 12;
        if (ampm == 'AM' && hours == 12) hours = 0;
        final month = _monthMap[monthStr.toLowerCase().substring(0, 3)];
        if (month != null) {
          final dt = DateTime(year, month, day, hours, minutes);
          if (dt.hour == hours) return dt;
        }
      }
    }

    // Try native Dart parsing
    final parsed = DateTime.tryParse(str);
    if (parsed != null) return parsed;

    // Try Unix timestamp
    final ts = int.tryParse(str);
    if (ts != null && ts > 1000000000) {
      if (ts < 10000000000) {
        // Seconds
        return DateTime.fromMillisecondsSinceEpoch(ts * 1000, isUtc: true);
      }
      // Milliseconds
      return DateTime.fromMillisecondsSinceEpoch(ts, isUtc: true);
    }

    return null;
  }

  /// Parse a VULMS date string. Throws if unparseable.
  static DateTime parse(String input) {
    final result = tryParse(input);
    if (result == null) {
      throw FormatException('Unable to parse VULMS date: $input');
    }
    return result;
  }
}
