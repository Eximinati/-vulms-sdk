import { describe, it, expect } from 'vitest';
import { parseCoursesFromHome } from '../../src/parsers/course-parser';

describe('parseCoursesFromHome', () => {
  it('should parse courses from anchor links with Course.aspx href', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <div id="courses">
    <a href="Course.aspx?code=CS101">CS101 - Programming Fundamentals</a>
    <a href="Course.aspx?code=CS201">CS201 - Data Structures</a>
    <a href="Course.aspx?code=MTH301">MTH301 - Calculus</a>
  </div>
</body>
</html>`;

    const courses = parseCoursesFromHome(html);
    expect(courses).toHaveLength(3);

    expect(courses[0]).toEqual({
      code: 'CS101',
      title: 'Programming Fundamentals',
    });
    expect(courses[1]).toEqual({
      code: 'CS201',
      title: 'Data Structures',
    });
    expect(courses[2]).toEqual({
      code: 'MTH301',
      title: 'Calculus',
    });
  });

  it('should parse courses from text when href has no code param', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <a href="Course.aspx?id=101">CS101 - Programming Fundamentals</a>
  <a href="Course.aspx?id=201">CS201 Data Structures</a>
</body>
</html>`;

    const courses = parseCoursesFromHome(html);
    expect(courses).toHaveLength(2);
    expect(courses[0].code).toBe('CS101');
    expect(courses[1].code).toBe('CS201');
  });

  it('should deduplicate courses with same code', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <a href="Course.aspx?code=CS101">CS101 - Programming Fundamentals</a>
  <a href="Course.aspx?code=CS101">CS101 - Programming</a>
</body>
</html>`;

    const courses = parseCoursesFromHome(html);
    expect(courses).toHaveLength(1);
  });

  it('should return empty array when no courses found', () => {
    const html = '<html><body>No courses here</body></html>';
    const courses = parseCoursesFromHome(html);
    expect(courses).toEqual([]);
  });
});
