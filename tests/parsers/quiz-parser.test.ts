import { describe, it, expect } from 'vitest';
import { parseQuizzes } from '../../src/parsers/quiz-parser';

describe('parseQuizzes', () => {
  it('should return empty when no quiz elements found', () => {
    const html = '<html><body><p>No quizzes</p></body></html>';
    const { quizzes } = parseQuizzes(html);
    expect(quizzes).toHaveLength(0);
  });

  it('should parse tile repeater with all fields', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3 class="m-subheader__title">CS101 - Programming</h3>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_0">Quiz 1</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblStartDate_0">Jan 10,2026 12:00 AM</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblEndDate_0">Jan 15,2026 11:59 PM</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblTotalMarks_0">10</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblStatus_0">Closed</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblSubmitted_0">Submitted</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblGetMarks_0">8</span>
  </div>
</body>
</html>`;

    const { quizzes, confidence } = parseQuizzes(html);
    expect(quizzes).toHaveLength(1);
    expect(quizzes[0].courseCode).toBe('CS101');
    expect(quizzes[0].title).toBe('Quiz 1');
    expect(quizzes[0].totalMarks).toBe(10);
    expect(quizzes[0].availabilityStatus).toBe('closed');
    expect(quizzes[0].submissionStatus).toBe('submitted');
    expect(quizzes[0].resultStatus).toBe('declared');
    expect(quizzes[0].obtainedMarks).toBe(8);
    expect(confidence.confidence).toBeGreaterThan(0);
  });

  it('should skip helper labels like "Quiz Title:"', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_0">Quiz Title:</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblStartDate_0">-</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblEndDate_0">-</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblTotalMarks_0">-</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblStatus_0">-</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblSubmitted_0">-</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblGetMarks_0">-</span>
  </div>
</body>
</html>`;

    const { quizzes, confidence } = parseQuizzes(html);
    expect(quizzes).toHaveLength(0);
    expect(confidence.confidence).toBeLessThan(1);
  });

  it('should normalize availability status', () => {
    const html = `<!DOCTYPE html>
<html><body>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_0">Open Quiz</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblStatus_0">Open</span>
  </div>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_1">Closed Quiz</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblStatus_1">Closed</span>
  </div>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_2">Upcoming Quiz</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblStatus_2">-</span>
  </div>
</body></html>`;

    const { quizzes } = parseQuizzes(html);
    expect(quizzes).toHaveLength(3);
    expect(quizzes[0].availabilityStatus).toBe('open');
    expect(quizzes[1].availabilityStatus).toBe('closed');
    expect(quizzes[2].availabilityStatus).toBe('upcoming');
  });

  it('should normalize submission status', () => {
    const html = `<!DOCTYPE html>
<html><body>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_0">Q1</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblSubmitted_0">Submitted</span>
  </div>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_1">Q2</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblSubmitted_1">Not Submitted</span>
  </div>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_2">Q3</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblSubmitted_2">-</span>
  </div>
</body></html>`;

    const { quizzes } = parseQuizzes(html);
    expect(quizzes[0].submissionStatus).toBe('submitted');
    expect(quizzes[1].submissionStatus).toBe('not_submitted');
    expect(quizzes[2].submissionStatus).toBe('not_submitted');
  });

  it('should parse result marks when declared', () => {
    const html = `<!DOCTYPE html>
<html><body>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_0">Quiz</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblGetMarks_0">8.5</span>
  </div>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_1">Quiz2</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblGetMarks_1">-</span>
  </div>
</body></html>`;

    const { quizzes } = parseQuizzes(html);
    expect(quizzes[0].resultStatus).toBe('declared');
    expect(quizzes[0].obtainedMarks).toBe(8.5);
    expect(quizzes[1].resultStatus).toBe('pending');
    expect(quizzes[1].obtainedMarks).toBeUndefined();
  });

  it('should use forced courseCode when provided', () => {
    const html = `<!DOCTYPE html>
<html><body>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_0">Quiz</span>
  </div>
</body></html>`;

    const { quizzes } = parseQuizzes(html, undefined, { courseCode: 'MTH202' });
    expect(quizzes).toHaveLength(1);
    expect(quizzes[0].courseCode).toBe('MTH202');
  });

  it('should return confidence metadata', () => {
    const html = `<!DOCTYPE html>
<html><body>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_0">Quiz</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblStatus_0">Open</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblSubmitted_0">Not Submitted</span>
  </div>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_1">Quiz2</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblStatus_1">Closed</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblSubmitted_1">Submitted</span>
  </div>
</body></html>`;

    const { confidence } = parseQuizzes(html);
    expect(confidence.extracted).toBe(2);
    expect(confidence.skipped).toBe(0);
    expect(confidence.fingerprint).toContain('quizzes');
    expect(confidence.warnings).toHaveLength(0);
  });

  it('should extract practical course code (CS301P)', () => {
    const html = `<!DOCTYPE html>
<html><body>
  <h3 class="m-subheader__title">CS301P - Data Structures (Practical)</h3>
  <div class="row">
    <span id="MainContent_gvTileRepeaterQuiz_lblTitle_0">Lab 1</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblStatus_0">Open</span>
    <span id="MainContent_gvTileRepeaterQuiz_lblSubmitted_0">Not Submitted</span>
  </div>
</body></html>`;

    const { quizzes } = parseQuizzes(html);
    expect(quizzes).toHaveLength(1);
    expect(quizzes[0].courseCode).toBe('CS301P');
  });
});