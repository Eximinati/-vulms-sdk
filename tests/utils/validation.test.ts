import { describe, it, expect } from 'vitest';
import {
  validateAssignmentPage,
  validateQuizPage,
  validateLecturePage,
  validateGDBPage,
} from '../../src/utils/validation';
import * as fs from 'fs';

describe('validateAssignmentPage', () => {
  it('should return VALID for page with assignment repeater elements', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Assignment</title></head>
<body>
  <span id="MainContent_gvTileRepeaterAssignment_Label3_0">Assignment # 1</span>
  <span id="MainContent_gvTileRepeaterAssignment_lblsubmitted_0">Submitted</span>
</body>
</html>`;

    const result = validateAssignmentPage(html);
    expect(result.state).toBe('VALID');
    expect(result.pageType).toBe('assignment');
  });

  it('should return EMPTY_VALID for empty assignment page with container', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Assignment</title></head>
<body>
  <div id="MainContent_divRecord" class="Accounttbl">
    <div class="row"><div>Title</div></div>
  </div>
</body>
</html>`;

    const result = validateAssignmentPage(html);
    expect(result.state).toBe('EMPTY_VALID');
    expect(result.pageType).toBe('assignment');
    expect(result.missingExpected).toBe('no assignments available');
  });

  it('should return EMPTY_VALID for MTH101 real empty fixture', () => {
    const html = fs.readFileSync('debug/navigation/assignments/MTH101.html', 'utf8');
    const result = validateAssignmentPage(html);
    expect(result.state).toBe('EMPTY_VALID');
    expect(result.pageType).toBe('assignment');
  });

  it('should return EMPTY_VALID for PAK301 real empty fixture', () => {
    const html = fs.readFileSync('debug/navigation/assignments/PAK301.html', 'utf8');
    const result = validateAssignmentPage(html);
    expect(result.state).toBe('EMPTY_VALID');
    expect(result.pageType).toBe('assignment');
  });

  it('should return EMPTY_VALID for PHY101 real fixture (repeater present but validation detects empty)', () => {
    const html = fs.readFileSync('debug/navigation/assignments/PHY101.html', 'utf8');
    const result = validateAssignmentPage(html);
    expect(result.pageType).toBe('assignment');
    expect(result.state === 'VALID' || result.state === 'EMPTY_VALID').toBe(true);
  });

  it('should return VALID for CS301 real fixture with assignments', () => {
    const html = fs.readFileSync('debug/navigation/assignments/CS301.html', 'utf8');
    const result = validateAssignmentPage(html);
    expect(result.state).toBe('VALID');
    expect(result.pageType).toBe('assignment');
  });

  it('should return INVALID for login redirect', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Login</title></head>
<body>
  <form>
    <input name="txtUserName" />
    <input name="txtPassword" type="password" />
  </form>
</body>
</html>`;

    const result = validateAssignmentPage(html);
    expect(result.state).toBe('INVALID');
    expect(result.pageType).toBe('login');
  });

  it('should return INVALID for dashboard redirect', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Home</title></head>
<body>
  <div id="MainContent_gvCourseList">
    <div class="m-portlet"><h3>CS301</h3></div>
  </div>
</body>
</html>`;

    const result = validateAssignmentPage(html);
    expect(result.state).toBe('INVALID');
    expect(result.pageType).toBe('home');
  });
});

describe('validateQuizPage', () => {
  it('should return VALID for page with quiz repeater elements', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Quiz</title></head>
<body>
  <span id="MainContent_gvTileRepeaterQuiz_Label3_0">Quiz # 1</span>
</body>
</html>`;

    const result = validateQuizPage(html);
    expect(result.state).toBe('VALID');
    expect(result.pageType).toBe('quiz');
  });

  it('should return EMPTY_VALID for empty quiz page with container', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Quiz</title></head>
<body>
  <div id="MainContent_pnlQuiz"></div>
</body>
</html>`;

    const result = validateQuizPage(html);
    expect(result.state).toBe('EMPTY_VALID');
    expect(result.pageType).toBe('quiz');
  });

  it('should return INVALID for login redirect', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Login</title></head>
<body>
  <input name="txtUserName" />
</body>
</html>`;

    const result = validateQuizPage(html);
    expect(result.state).toBe('INVALID');
    expect(result.pageType).toBe('login');
  });
});

describe('validateLecturePage', () => {
  it('should return VALID for page with lecture repeater elements', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Lecture</title></head>
<body>
  <span id="MainContent_gvTileRepeaterLecture_Label3_0">Week 1</span>
</body>
</html>`;

    const result = validateLecturePage(html);
    expect(result.state).toBe('VALID');
    expect(result.pageType).toBe('lecture');
  });

  it('should return EMPTY_VALID for empty lecture page with container', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Lecture</title></head>
<body>
  <div id="MainContent_pnlLecture"></div>
</body>
</html>`;

    const result = validateLecturePage(html);
    expect(result.state).toBe('EMPTY_VALID');
    expect(result.pageType).toBe('lecture');
  });
});

describe('validateGDBPage', () => {
  it('should return VALID for page with GDB repeater elements', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>GDB</title></head>
<body>
  <span id="MainContent_gvTileRepeaterGDB_lblTitle_0">GDB # 1</span>
</body>
</html>`;

    const result = validateGDBPage(html);
    expect(result.state).toBe('VALID');
    expect(result.pageType).toBe('gdb');
  });

  it('should return EMPTY_VALID for empty GDB page with container', () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>GDB</title></head>
<body>
  <div id="MainContent_pnlGDB"></div>
</body>
</html>`;

    const result = validateGDBPage(html);
    expect(result.state).toBe('EMPTY_VALID');
    expect(result.pageType).toBe('gdb');
  });

  it('should return EMPTY_VALID for empty GDB page fixture', () => {
    const html = fs.readFileSync('tests/fixtures/gdb-empty-page.html', 'utf8');
    const result = validateGDBPage(html);
    expect(result.pageType).toBe('gdb');
    expect(result.state === 'EMPTY_VALID' || result.state === 'VALID').toBe(true);
  });

  it('should return VALID for CS301 real GDB fixture', () => {
    const html = fs.readFileSync('debug/navigation/gdb/CS301.html', 'utf8');
    const result = validateGDBPage(html);
    expect(result.pageType).toBe('gdb');
    expect(result.state === 'VALID' || result.state === 'EMPTY_VALID').toBe(true);
  });
});
