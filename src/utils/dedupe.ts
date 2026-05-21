import type { Assignment } from '../types/assignments';
import type { Quiz } from '../types/quizzes';
import type { GDB } from '../types/gdb';
import type { Lecture } from '../types/lectures';
import type { UnifiedActivity } from '../types/activities';

export type ActivityKey = string;

export function assignmentKey(a: Assignment): ActivityKey {
  const due = a.dueDate?.toISOString().slice(0, 10) || '';
  return `${a.courseCode}|${a.title}|${due}|${a.totalMarks || ''}`;
}

export function quizKey(q: Quiz): ActivityKey {
  const start = q.startDate?.toISOString().slice(0, 10) || '';
  return `${q.courseCode}|${q.title}|${start}`;
}

export function gdbKey(g: GDB): ActivityKey {
  const due = g.dueDate?.toISOString().slice(0, 10) || '';
  return `${g.courseCode}|${g.title}|${due}`;
}

export function lectureKey(l: Lecture): ActivityKey {
  return `${l.courseCode}|${l.title}|${l.week || ''}|${l.type || ''}`;
}

export function unifiedActivityKey(a: UnifiedActivity): ActivityKey {
  const due = a.dueDate?.toISOString().slice(0, 10) || '';
  return `${a.type}|${a.courseCode}|${a.title}|${due}`;
}

export function dedupe<T>(items: T[], keyFn: (item: T) => ActivityKey): { unique: T[]; duplicates: number } {
  const seen = new Set<ActivityKey>();
  const unique: T[] = [];
  let duplicates = 0;

  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) {
      duplicates++;
    } else {
      seen.add(key);
      unique.push(item);
    }
  }

  return { unique, duplicates };
}

export function dedupeAssignments(assignments: Assignment[]): { unique: Assignment[]; duplicates: number } {
  return dedupe(assignments, assignmentKey);
}

export function dedupeQuizzes(quizzes: Quiz[]): { unique: Quiz[]; duplicates: number } {
  return dedupe(quizzes, quizKey);
}

export function dedupeGDBs(gdbs: GDB[]): { unique: GDB[]; duplicates: number } {
  return dedupe(gdbs, gdbKey);
}

export function dedupeLectures(lectures: Lecture[]): { unique: Lecture[]; duplicates: number } {
  return dedupe(lectures, lectureKey);
}

export function dedupeUnifiedActivities(activities: UnifiedActivity[]): { unique: UnifiedActivity[]; duplicates: number } {
  return dedupe(activities, unifiedActivityKey);
}
