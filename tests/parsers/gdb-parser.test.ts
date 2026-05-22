import { describe, it, expect } from 'vitest';
import { parseGDBs } from '../../src/parsers/gdb-parser';
import * as fs from 'fs';

describe('parseGDBs', () => {
  it('should parse GDB cards with course grouping', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h3>CS101 - Programming</h3>
  <div class="gdb-card">
    <div class="title">GDB 1: Algorithms</div>
    <div class="due">25-May-2024</div>
    <div class="marks">5</div>
    <div class="status">Attempted</div>
  </div>
  <h3>CS201 - Data Structures</h3>
  <div class="gdb-card">
    <div class="title">GDB 1: Stack vs Queue</div>
    <div class="due">05-Jun-2024</div>
    <div class="result">Result Declared</div>
    <div class="marks-obtained">4</div>
  </div>
</body>
</html>`;

    const gdbs = parseGDBs(html);
    expect(gdbs).toHaveLength(2);
    expect(gdbs[0].courseCode).toBe('CS101');
    expect(gdbs[0].status).toBe('attempted');
    expect(gdbs[1].courseCode).toBe('CS201');
    expect(gdbs[1].status).toBe('result_declared');
    expect(gdbs[1].obtainedMarks).toBe(4);
  });

  it('should parse missed status', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <div class="gdb-card">
    <div class="title">GDB 2</div>
    <div class="status">Missed</div>
  </div>
</body>
</html>`;

    const gdbs = parseGDBs(html);
    expect(gdbs).toHaveLength(1);
    expect(gdbs[0].status).toBe('missed');
  });

  it('should parse pending status by default', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <div class="gdb-card">
    <div class="title">GDB 3</div>
    <div class="due">30-Jun-2024</div>
  </div>
</body>
</html>`;

    const gdbs = parseGDBs(html);
    expect(gdbs).toHaveLength(1);
    expect(gdbs[0].status).toBe('pending');
  });

  it('should parse total marks', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <div class="gdb-card">
    <div class="title">GDB 1</div>
    <div class="marks">10</div>
  </div>
</body>
</html>`;

    const gdbs = parseGDBs(html);
    expect(gdbs).toHaveLength(1);
    expect(gdbs[0].totalMarks).toBe(10);
  });

  it('should return empty array when no GDBs found', () => {
    expect(parseGDBs('<html><body>No GDBs</body></html>')).toEqual([]);
  });

  it('should handle table-based layout', () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <table>
    <tr><th>CS101 - Programming</th></tr>
    <tr><td>GDB 1</td><td>Discussion</td><td>25-May-2024</td></tr>
  </table>
</body>
</html>`;

    const gdbs = parseGDBs(html);
    expect(gdbs).toHaveLength(1);
    expect(gdbs[0].courseCode).toBe('CS101');
    expect(gdbs[0].title).toBe('GDB 1');
  });

  it('should return empty array for empty GDB page fixture', () => {
    const html = fs.readFileSync('tests/fixtures/gdb-empty-page.html', 'utf8');
    const gdbs = parseGDBs(html);
    expect(gdbs).toHaveLength(0);
  });
});
