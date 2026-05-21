import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseAssignments } from '../../src/parsers/assignment-parser';
import { parseQuizzes } from '../../src/parsers/quiz-parser';
import { parseGDBs } from '../../src/parsers/gdb-parser';
import { parseLectures } from '../../src/parsers/lecture-parser';

function loadFixture(name: string): string {
  return readFileSync(join(__dirname, '..', 'fixtures', name), 'utf-8');
}

describe('fixture: assignments.html', () => {
  it('should parse all assignments from fixture', () => {
    const html = loadFixture('assignments.html');
    const { assignments } = parseAssignments(html);

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
  });
});

describe('fixture: quizzes.html', () => {
  it('should parse all quizzes from fixture with real ASP.NET tile repeater', () => {
    const html = loadFixture('quizzes.html');
    const { quizzes, confidence } = parseQuizzes(html);

    expect(quizzes).toHaveLength(3);

    expect(quizzes[0].courseCode).toBe('CS101');
    expect(quizzes[0].title).toBe('Quiz 1');
    expect(quizzes[0].availabilityStatus).toBe('closed');
    expect(quizzes[0].submissionStatus).toBe('submitted');
    expect(quizzes[0].resultStatus).toBe('declared');
    expect(quizzes[0].obtainedMarks).toBe(8);

    expect(quizzes[1].title).toBe('Quiz 2');
    expect(quizzes[1].submissionStatus).toBe('not_submitted');
    expect(quizzes[1].resultStatus).toBe('pending');

    expect(quizzes[2].title).toBe('Quiz 3');
    expect(quizzes[2].totalMarks).toBe(20);
    expect(quizzes[2].resultStatus).toBe('declared');
    expect(quizzes[2].obtainedMarks).toBe(15);

    expect(confidence.extracted).toBe(3);
    expect(confidence.skipped).toBe(1);
  });
});

describe('fixture: gdb.html', () => {
  it('should parse all GDBs from fixture', () => {
    const html = loadFixture('gdb.html');
    const gdbs = parseGDBs(html);

    expect(gdbs).toHaveLength(4);

    expect(gdbs[0].courseCode).toBe('CS101');
    expect(gdbs[0].status).toBe('attempted');

    expect(gdbs[1].courseCode).toBe('CS201');
    expect(gdbs[1].status).toBe('result_declared');
    expect(gdbs[1].obtainedMarks).toBe(4.5);

    expect(gdbs[2].status).toBe('missed');

    expect(gdbs[3].status).toBe('pending');
  });
});

describe('fixture: assignments-empty.html', () => {
  it('returns empty array for no-assignment page', () => {
    const html = loadFixture('assignments-empty.html');
    const { assignments } = parseAssignments(html);
    expect(assignments).toHaveLength(0);
  });
});

describe('fixture: session-expired.html', () => {
  it('detects session expired via login page', () => {
    const html = loadFixture('session-expired.html');
    expect(html.includes('Login.aspx') || html.includes('txtStudentID')).toBe(true);
  });
});

describe('fixture: assignments-multi-status.html', () => {
  it('parses all assignment statuses', () => {
    const html = loadFixture('assignments-multi-status.html');
    const { assignments } = parseAssignments(html);

    expect(assignments).toHaveLength(4);
    expect(assignments[0].status).toBe('submitted');
    expect(assignments[0].obtainedMarks).toBe(8);
    expect(assignments[1].status).toBe('missed');
    expect(assignments[2].status).toBe('missed');
    expect(assignments[3].status).toBe('result_declared');
    expect(assignments[3].obtainedMarks).toBe(14);
  });
});

describe('fixture: lectures.html', () => {
  it('should parse all lectures from fixture', () => {
    const html = loadFixture('lectures.html');
    const lectures = parseLectures(html);

    expect(lectures).toHaveLength(4);

    expect(lectures[0].courseCode).toBe('CS101');
    expect(lectures[0].title).toBe('Introduction to Programming');
    expect(lectures[0].type).toBe('Video');
    expect(lectures[0].duration).toBe('45 min');
    expect(lectures[0].status).toBe('watched');

    expect(lectures[1].status).toBe('watched');
    expect(lectures[2].status).toBe('new');
    expect(lectures[3].status).toBe('unwatched');
  });
});
