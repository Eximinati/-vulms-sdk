import { describe, it, expect } from 'vitest';
import { dedupeAssignments, dedupeQuizzes, dedupeGDBs, dedupeLectures, dedupe } from '../../src/utils/dedupe';
import type { Assignment } from '../../src/types/assignments';
import type { Quiz } from '../../src/types/quizzes';
import type { GDB } from '../../src/types/gdb';
import type { Lecture } from '../../src/types/lectures';

describe('dedupe', () => {
  it('returns unique items when no duplicates', () => {
    const items = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
    ];
    const { unique, duplicates } = dedupe(items, (x) => String(x.id));
    expect(unique).toHaveLength(2);
    expect(duplicates).toBe(0);
  });

  it('removes duplicates by key', () => {
    const items = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 1, name: 'a-copy' },
    ];
    const { unique, duplicates } = dedupe(items, (x) => String(x.id));
    expect(unique).toHaveLength(2);
    expect(duplicates).toBe(1);
    expect(unique[0].name).toBe('a');
  });

  it('returns empty array when all duplicates', () => {
    const items = [
      { id: 1, name: 'a' },
      { id: 1, name: 'b' },
      { id: 1, name: 'c' },
    ];
    const { unique, duplicates } = dedupe(items, (x) => String(x.id));
    expect(unique).toHaveLength(1);
    expect(duplicates).toBe(2);
  });
});

describe('dedupeAssignments', () => {
  const base: Assignment = {
    courseCode: 'CS301',
    courseTitle: 'Data Structures',
    title: 'Assignment 1',
    lesson: 'Lesson 1',
    dueDate: new Date('2026-01-15'),
    totalMarks: 10,
    status: 'submitted',
    submitDate: new Date('2026-01-14'),
    fileSize: '2 MB',
    obtainedMarks: 8,
  };

  it('deduplicates by course + title + due date', () => {
    const items = [base, { ...base, title: 'Assignment 2' }, base];
    const { unique, duplicates } = dedupeAssignments(items);
    expect(unique).toHaveLength(2);
    expect(duplicates).toBe(1);
  });

  it('treats same title different date as different', () => {
    const items = [base, { ...base, dueDate: new Date('2026-02-15') }];
    const { unique, duplicates } = dedupeAssignments(items);
    expect(unique).toHaveLength(2);
    expect(duplicates).toBe(0);
  });
});

describe('dedupeQuizzes', () => {
  const base: Quiz = {
    courseCode: 'CS301',
    courseTitle: 'Data Structures',
    title: 'Quiz 1',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-01-20'),
    totalMarks: 5,
    obtainedMarks: 4,
    availabilityStatus: 'closed',
    submissionStatus: 'submitted',
    resultStatus: 'declared',
  };

  it('deduplicates by course + title + date', () => {
    const items = [base, base];
    const { unique, duplicates } = dedupeQuizzes(items);
    expect(unique).toHaveLength(1);
    expect(duplicates).toBe(1);
  });
});

describe('dedupeGDBs', () => {
  const base: GDB = {
    courseCode: 'CS301',
    courseTitle: 'Data Structures',
    title: 'GDB 1',
    dueDate: new Date('2026-01-20'),
    totalMarks: 5,
    status: 'submitted',
    obtainedMarks: 4,
  };

  it('deduplicates GDBs', () => {
    const items = [base, { ...base, title: 'GDB 2' }, base];
    const { unique, duplicates } = dedupeGDBs(items);
    expect(unique).toHaveLength(2);
    expect(duplicates).toBe(1);
  });
});

describe('dedupeLectures', () => {
  const base: Lecture = {
    courseCode: 'CS301',
    courseTitle: 'Data Structures',
    title: 'Lecture 1',
    week: 1,
    type: 'Video',
    duration: '30 min',
    status: 'watched',
    url: 'http://example.com',
  };

  it('deduplicates by course + title + week', () => {
    const items = [base, base, { ...base, week: 2 }];
    const { unique, duplicates } = dedupeLectures(items);
    expect(unique).toHaveLength(2);
    expect(duplicates).toBe(1);
  });
});
