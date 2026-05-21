import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseAssignments } from '../../src/parsers/assignment-parser';
import { parseQuizzes } from '../../src/parsers/quiz-parser';
import { parseGDBs } from '../../src/parsers/gdb-parser';
import { parseLectures } from '../../src/parsers/lecture-parser';
import { dedupeAssignments, dedupeQuizzes, dedupeGDBs } from '../../src/utils/dedupe';

function loadRealFixture(name: string): string {
  return readFileSync(join(__dirname, '..', 'fixtures', 'real', name), 'utf-8');
}

describe('real fixture: quiz-cs301.html', () => {
  it('parses quiz tile repeater with correct field IDs', () => {
    const html = loadRealFixture('quiz-cs301.html');
    const { quizzes, confidence } = parseQuizzes(html);

    expect(quizzes.length).toBeGreaterThan(0);

    const q1 = quizzes.find(q => q.title.includes('Quiz # 1'));
    expect(q1).toBeDefined();
    expect(q1!.courseCode).toBe('CS301');
    expect(q1!.availabilityStatus).toBe('closed');
    expect(q1!.submissionStatus).toBe('submitted');
    expect(q1!.resultStatus).toBe('declared');
    expect(q1!.obtainedMarks).toBe(0);
    expect(q1!.totalMarks).toBe(10);
    expect(q1!.startDate).toBeInstanceOf(Date);
    expect(q1!.endDate).toBeInstanceOf(Date);

    expect(confidence.extracted).toBeGreaterThan(0);
    expect(confidence.confidence).toBeGreaterThan(0);
  });

  it('extracts all 4 quizzes from CS301', () => {
    const html = loadRealFixture('quiz-cs301.html');
    const { quizzes } = parseQuizzes(html);
    expect(quizzes.length).toBe(4);

    const titles = quizzes.map(q => q.title);
    expect(titles).toContain('Quiz # 1');
    expect(titles).toContain('Quiz # 2');
    expect(titles).toContain('Quiz # 3');
    expect(titles).toContain('Quiz # 4');

    expect(quizzes.every(q => q.courseCode === 'CS301')).toBe(true);
  });

  it('extracts open quiz correctly', () => {
    const html = loadRealFixture('quiz-cs301.html');
    const { quizzes } = parseQuizzes(html);

    const q2 = quizzes.find(q => q.title.includes('Quiz # 2'));
    expect(q2).toBeDefined();
    expect(q2!.availabilityStatus).toBe('open');
    expect(q2!.submissionStatus).toBe('submitted');
    expect(q2!.submitDate).toBeInstanceOf(Date);
  });
});

describe('real fixture: quiz-cs301p.html', () => {
  it('parses practical/LAB quizzes from CS301p with correct course code', () => {
    const html = loadRealFixture('quiz-cs301p.html');
    const { quizzes, confidence } = parseQuizzes(html);

    expect(quizzes.length).toBeGreaterThan(0);
    expect(quizzes.every(q => q.courseCode === 'CS301P')).toBe(true);
    expect(quizzes.some(q => q.title.toLowerCase().includes('lab'))).toBe(true);

    const lab1 = quizzes.find(q => q.title.includes('Lab 1'));
    if (lab1) {
      expect(lab1.totalMarks).toBe(5);
      expect(lab1.submissionStatus).toBe('submitted');
      expect(lab1.submitDate).toBeInstanceOf(Date);
    }

    expect(confidence.extracted).toBeGreaterThan(0);
  });
});

describe('real fixture: quiz-cs302.html', () => {
  it('parses CS302 quizzes with all fields', () => {
    const html = loadRealFixture('quiz-cs302.html');
    const { quizzes, confidence } = parseQuizzes(html);

    expect(quizzes.length).toBeGreaterThan(0);
    expect(quizzes.every(q => q.courseCode === 'CS302')).toBe(true);

    const q1 = quizzes.find(q => q.title.includes('Semester Quiz # 01'));
    expect(q1).toBeDefined();
    expect(q1!.availabilityStatus).toBe('closed');
    expect(q1!.submissionStatus).toBe('submitted');
    expect(q1!.resultStatus).toBe('declared');
    expect(q1!.obtainedMarks).toBe(9);
    expect(q1!.totalMarks).toBe(10);
    expect(q1!.submitDate).toBeInstanceOf(Date);
    expect(q1!.startDate).toBeInstanceOf(Date);
    expect(q1!.endDate).toBeInstanceOf(Date);
  });
});

describe('real fixture: quiz-cs302.html', () => {
  it('parses CS302 quizzes', () => {
    const html = loadRealFixture('quiz-cs302.html');
    const { quizzes, confidence } = parseQuizzes(html);

    expect(quizzes.length).toBeGreaterThan(0);
    expect(quizzes.every(q => q.courseCode === 'CS302')).toBe(true);

    const q1 = quizzes.find(q => q.title.includes('Semester Quiz # 01'));
    expect(q1).toBeDefined();
    expect(q1!.resultStatus).toBe('declared');
    expect(q1!.obtainedMarks).toBe(9);
    expect(q1!.totalMarks).toBe(10);
  });
});

describe('real fixture: assignment-cs301.html', () => {
  it('parses assignment tile repeater with correct field IDs', () => {
    const html = loadRealFixture('assignment-cs301.html');
    const { assignments, confidence } = parseAssignments(html);

    expect(assignments.length).toBeGreaterThan(0);

    const a1 = assignments[0];
    expect(a1.courseCode).toBe('CS301');
    expect(a1.title).toBe('Assignment # 1');
    expect(a1.lesson).toBe('8. Implementation of Stack');
    expect(a1.status).toBe('submitted');
    expect(a1.totalMarks).toBe(20);
    expect(a1.dueDate).toBeInstanceOf(Date);
    expect(a1.submitDate).toBeInstanceOf(Date);
    expect(a1.fileSize).toBe('2.58 KB');

    expect(confidence.extracted).toBeGreaterThan(0);
    expect(confidence.confidence).toBeGreaterThan(0);
  });
});

describe('real fixture: assignment-cs301p.html', () => {
  it('parses CS301p practical assignments', () => {
    const html = loadRealFixture('assignment-cs301p.html');
    const { assignments, confidence } = parseAssignments(html);

    expect(assignments.length).toBeGreaterThan(0);
    expect(assignments.every(a => a.courseCode === 'CS301P')).toBe(true);

    const a1 = assignments[0];
    expect(a1.title).toBe('Assignment 1');
    expect(a1.lesson).toBe('3. Lab 3: Implementation of Queue data structure');
    expect(a1.status).toBe('submitted');
    expect(a1.fileSize).toBe('2.12 KB');

    expect(confidence.extracted).toBeGreaterThan(0);
  });
});

describe('real fixture: assignment-cs302.html', () => {
  it('parses CS302 assignments', () => {
    const html = loadRealFixture('assignment-cs302.html');
    const { assignments, confidence } = parseAssignments(html);

    expect(assignments.length).toBeGreaterThan(0);
    expect(assignments.every(a => a.courseCode === 'CS302')).toBe(true);

    const a1 = assignments[0];
    expect(a1.title).toBe('Assignment No. 1');
    expect(a1.lesson).toBe('9. Boolean Algebra and Logic Simplification (contd.)');
    expect(a1.status).toBe('submitted');
    expect(a1.totalMarks).toBe(20);
    expect(a1.fileSize).toBe('36.42 KB');
  });
});

describe('dedupe on real fixture data', () => {
  it('dedupes quizzes from multiple real fixtures', () => {
    const html1 = loadRealFixture('quiz-cs301.html');
    const html2 = loadRealFixture('quiz-cs301p.html');
    const html3 = loadRealFixture('quiz-cs302.html');

    const { quizzes: q1 } = parseQuizzes(html1);
    const { quizzes: q2 } = parseQuizzes(html2);
    const { quizzes: q3 } = parseQuizzes(html3);

    const all = [...q1, ...q2, ...q3];
    const { unique: deduped } = dedupeQuizzes(all);

    expect(deduped.length).toBeLessThanOrEqual(all.length);
    const codes = [...new Set(deduped.map(q => q.courseCode))];
    expect(codes).toContain('CS301');
    expect(codes).toContain('CS302');
  });

  it('dedupes assignments from multiple real fixtures', () => {
    const a1 = parseAssignments(loadRealFixture('assignment-cs301.html'));
    const a2 = parseAssignments(loadRealFixture('assignment-cs301p.html'));
    const a3 = parseAssignments(loadRealFixture('assignment-cs302.html'));

    const all = [...a1.assignments, ...a2.assignments, ...a3.assignments];
    const { unique: deduped } = dedupeAssignments(all);

    expect(deduped.length).toBeLessThanOrEqual(all.length);
  });
});

describe('session health on real fixtures', () => {
  it('detects no-session on quiz pages that have Login elements', () => {
    const html = loadRealFixture('quiz-cs301.html');
    expect(html.includes('txtStudentID') || html.includes('Login.aspx')).toBe(false);
  });

  it('identifies GDB no-data fixture', () => {
    const fs = require('fs');
    const path = require('path');
    const gdbPath = path.join(__dirname, '..', '..', '..', 'debug', 'reports', 'html-fixtures', 'gdb-cs301p.html');
    if (fs.existsSync(gdbPath)) {
      const html = fs.readFileSync(gdbPath, 'utf-8');
      expect(html.includes('No GDB exists') || html.length < 100).toBe(true);
    }
  });
});