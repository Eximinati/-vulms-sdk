/// Utility functions for deduplicating activity lists.
class Dedupe {
  Dedupe._();

  /// Deduplicate items using a key function.
  static DedupeResult<T> dedupe<T>(List<T> items, String Function(T) keyFn) {
    final seen = <String>{};
    final unique = <T>[];
    var duplicates = 0;

    for (final item in items) {
      final key = keyFn(item);
      if (seen.contains(key)) {
        duplicates++;
      } else {
        seen.add(key);
        unique.add(item);
      }
    }

    return DedupeResult(unique: unique, duplicates: duplicates);
  }

  /// Generate a deduplication key for an assignment.
  static String assignmentKey(String courseCode, String title,
      DateTime? dueDate, double? totalMarks) {
    final due = dueDate?.toIso8601String().substring(0, 10) ?? '';
    return '$courseCode|$title|$due|${totalMarks ?? ''}';
  }

  /// Generate a deduplication key for a quiz.
  static String quizKey(String courseCode, String title, DateTime? startDate) {
    final start = startDate?.toIso8601String().substring(0, 10) ?? '';
    return '$courseCode|$title|$start';
  }

  /// Generate a deduplication key for a GDB.
  static String gdbKey(String courseCode, String title, DateTime? dueDate) {
    final due = dueDate?.toIso8601String().substring(0, 10) ?? '';
    return '$courseCode|$title|$due';
  }

  /// Generate a deduplication key for a lecture.
  static String lectureKey(
      String courseCode, String title, int? week, String? type) {
    return '$courseCode|$title|${week ?? ''}|${type ?? ''}';
  }
}

/// Result of a deduplication operation.
class DedupeResult<T> {
  final List<T> unique;
  final int duplicates;

  const DedupeResult({required this.unique, required this.duplicates});
}
