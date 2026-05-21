import { describe, it, expect } from 'vitest';
import { parseAssignments } from '../../src/parsers/assignment-parser';
import * as fs from 'fs';

describe('parseAssignments', () => {
  it('should parse assignment tile structure from real VULMS HTML', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Assignment</title></head>
<body>
  <h3 class="m-subheader__title">CS301 - Data Structures</h3>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment # 1</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblPayableAmount_0">8. Implementation of Stack</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">Apr 30, 2026</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">20.00</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0">Submitted</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblSubmitDate_0">Apr 25, 2026 03:39 PM</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblFilesize_0">2.58 KB</span>
</body>
</html>`;

    const { assignments, confidence } = parseAssignments(html);
    expect(assignments).toHaveLength(1);
    expect(assignments[0]).toMatchObject({
      courseCode: 'CS301',
      title: 'Assignment # 1',
      lesson: '8. Implementation of Stack',
      totalMarks: 20,
      status: 'submitted',
      fileSize: '2.58 KB',
    });
    expect(confidence.extracted).toBe(1);
    expect(confidence.confidence).toBeGreaterThan(0);
  });

  it('should parse submitted status', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3 class="m-subheader__title">CS101 - Intro</h3>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment 1</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0">Submitted</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">May 15, 2024</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">10</span>
</body>
</html>`;

    const { assignments } = parseAssignments(html);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].status).toBe('submitted');
  });

  it('should parse result_declared status', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3 class="m-subheader__title">CS201 - Data Structures</h3>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment 1</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblObtainedMarks_0">8</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0">Result Declared</span>
</body>
</html>`;

    const { assignments } = parseAssignments(html);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].status).toBe('result_declared');
    expect(assignments[0].obtainedMarks).toBe(8);
  });

  it('should parse missed status', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3 class="m-subheader__title">CS301 - Data Structures</h3>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment 1</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0">Not Submitted</span>
</body>
</html>`;

    const { assignments } = parseAssignments(html);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].status).toBe('missed');
  });

  it('should parse pending status by default', () => {
    const futureYear = new Date().getFullYear() + 1;
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3 class="m-subheader__title">CS301 - Data Structures</h3>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment 1</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">Aug 01, ${futureYear}</span>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_1">Assignment 2</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblDueDate_1">Aug 01, ${futureYear}</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_1">10</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_1"></span>
</body>
</html>`;

    const { assignments } = parseAssignments(html);
    expect(assignments).toHaveLength(2);
    const emptySubmit = assignments.find(a => a.title === 'Assignment 2');
    expect(emptySubmit?.status).toBe('pending');
  });

  it('should return empty when no assignments found', () => {
    const html = '<html><body>No assignments</body></html>';
    const { assignments, confidence } = parseAssignments(html);
    expect(assignments).toEqual([]);
    expect(confidence.extracted).toBe(0);
    expect(confidence.confidence).toBeLessThan(1);
  });

  it('should parse real VULMS assignment fixture', () => {
    const html = fs.readFileSync('tests/fixtures/assignments.html', 'utf8');
    const { assignments, confidence } = parseAssignments(html);
    expect(assignments.length).toBeGreaterThan(0);
    expect(assignments[0].courseCode).toBe('CS301');
    expect(assignments[0].title).toBe('Assignment # 1');
    expect(confidence.extracted).toBeGreaterThan(0);
  });

  it('should classify submitted assignment with due date as submitted', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3 class="m-subheader__title">CS101 - Intro</h3>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment 1</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0">Submitted</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">Jan 01, 2020</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblSubmitDate_0">Dec 25, 2019 10:00 AM</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">10</span>
</body>
</html>`;

    const { assignments } = parseAssignments(html);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].status).toBe('submitted');
  });

  it('should classify unsubmitted + future due date as pending', () => {
    const futureYear = new Date().getFullYear() + 1;
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3 class="m-subheader__title">CS101 - Intro</h3>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment 1</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0"></span>
  <span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">Dec 01, ${futureYear}</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">10</span>
</body>
</html>`;

    const { assignments } = parseAssignments(html);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].status).toBe('pending');
  });

  it('should classify unsubmitted + past due date as missed', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3 class="m-subheader__title">CS101 - Intro</h3>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment 1</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0"></span>
  <span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">Jan 01, 2020</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">10</span>
</body>
</html>`;

    const { assignments } = parseAssignments(html);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].status).toBe('missed');
  });

  it('should classify rawStatus=Expired as missed', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3 class="m-subheader__title">CS101 - Intro</h3>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment 1</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0">Expired</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">Jan 01, 2020</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">10</span>
</body>
</html>`;

    const { assignments } = parseAssignments(html);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].status).toBe('missed');
  });

  it('should classify rawStatus=Result Declared as result_declared', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3 class="m-subheader__title">CS101 - Intro</h3>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment 1</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0">Result Declared</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblObtainedMarks_0">15</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">20</span>
</body>
</html>`;

    const { assignments } = parseAssignments(html);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].status).toBe('result_declared');
    expect(assignments[0].obtainedMarks).toBe(15);
  });

  it('should classify unsubmitted + invalid due date as pending fallback', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3 class="m-subheader__title">CS101 - Intro</h3>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment 1</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0"></span>
  <span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">-</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">10</span>
</body>
</html>`;

    const { assignments } = parseAssignments(html);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].status).toBe('pending');
  });

  it('should classify MTH202 real fixture as missed (past due, no submission)', () => {
    const html = fs.readFileSync('debug/navigation/assignments/MTH202.html', 'utf8');
    const { assignments } = parseAssignments(html, undefined, { courseCode: 'MTH202' });
    expect(assignments.length).toBeGreaterThan(0);
    for (const a of assignments) {
      expect(a.status).toBe('missed');
    }
  });

  it('should classify submitted assignment even when due date is past', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3 class="m-subheader__title">CS101 - Intro</h3>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment 1</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0">Submitted</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblDueDate_0">Jan 01, 2020</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblSubmitDate_0">Dec 30, 2019 05:00 PM</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblTotalMarks_0">10</span>
</body>
</html>`;

    const { assignments } = parseAssignments(html);
    expect(assignments).toHaveLength(1);
    expect(assignments[0].status).toBe('submitted');
    expect(assignments[0].dueDate).toBeDefined();
    expect(assignments[0].submitDate).toBeDefined();
  });
});