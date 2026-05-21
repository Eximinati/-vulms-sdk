import { describe, it, expect } from 'vitest';
import { parseLectures } from '../../src/parsers/lecture-parser';

describe('parseLectures', () => {
  it('should parse lectures from table layout with course grouping', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3>CS101 - Programming Fundamentals</h3>
  <table>
    <tr><th>Title</th><th>Type</th><th>Duration</th><th>Status</th></tr>
    <tr><td>Introduction</td><td>Video</td><td>45 min</td><td>Watched</td></tr>
    <tr><td>Variables</td><td>Video</td><td>50 min</td><td>New</td></tr>
  </table>
</body>
</html>`;

    const lectures = parseLectures(html);
    expect(lectures).toHaveLength(2);
    expect(lectures[0].courseCode).toBe('CS101');
    expect(lectures[0].title).toBe('Introduction');
    expect(lectures[0].type).toBe('Video');
    expect(lectures[0].duration).toBe('45 min');
    expect(lectures[0].status).toBe('watched');
    expect(lectures[1].status).toBe('new');
  });

  it('should parse unwatched status', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <table>
    <tr><th>Title</th><th>Status</th></tr>
    <tr><td>Functions</td><td>Unwatched</td></tr>
  </table>
</body>
</html>`;

    const lectures = parseLectures(html);
    expect(lectures).toHaveLength(1);
    expect(lectures[0].status).toBe('unwatched');
  });

  it('should parse new status by default when no status indicator', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <div class="lecture-card">
    <div class="title">Introduction</div>
  </div>
</body>
</html>`;

    const lectures = parseLectures(html);
    expect(lectures).toHaveLength(1);
    expect(lectures[0].status).toBe('new');
  });

  it('should parse lecture type and duration from card layout', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3>CS101 - Programming</h3>
  <div class="lecture-card">
    <div class="title">Lecture 1</div>
    <div class="type">Video</div>
    <div class="duration">45 min</div>
    <div class="status">Watched</div>
    <a href="/Video.aspx?id=1">Watch</a>
  </div>
</body>
</html>`;

    const lectures = parseLectures(html);
    expect(lectures).toHaveLength(1);
    expect(lectures[0].courseCode).toBe('CS101');
    expect(lectures[0].type).toBe('Video');
    expect(lectures[0].duration).toBe('45 min');
    expect(lectures[0].status).toBe('watched');
    expect(lectures[0].url).toBe('/Video.aspx?id=1');
  });

  it('should extract week number', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <table>
    <tr><th>Title</th><th>Week</th></tr>
    <tr><td>Lecture 1</td><td>Week 1</td></tr>
  </table>
</body>
</html>`;

    const lectures = parseLectures(html);
    expect(lectures).toHaveLength(1);
    expect(lectures[0].week).toBe(1);
  });

  it('should return empty array when no lectures found', () => {
    expect(parseLectures('<html><body>No lectures</body></html>')).toEqual([]);
  });
});
