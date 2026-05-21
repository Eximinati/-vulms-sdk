import { describe, it, expect } from 'vitest';
import { buildConfidence, isLowConfidence, fingerprintHtml } from '../../src/utils/confidence';

describe('buildConfidence', () => {
  it('returns 1.0 for perfect extraction', () => {
    const result = buildConfidence(5, 5, 0, [], 'test');
    expect(result.confidence).toBe(1);
    expect(result.extracted).toBe(5);
    expect(result.skipped).toBe(0);
  });

  it('applies skip penalty', () => {
    const result = buildConfidence(5, 10, 3, [], 'test');
    expect(result.confidence).toBeLessThan(0.5);
    expect(result.skipped).toBe(3);
  });

  it('applies warning penalty', () => {
    const result = buildConfidence(5, 5, 0, [{ code: 'W1', message: 'missing field' }], 'test');
    expect(result.confidence).toBeLessThan(1);
    expect(result.warnings).toHaveLength(1);
  });

  it('caps confidence at 0', () => {
    const result = buildConfidence(0, 10, 100, [], 'test');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });
});

describe('isLowConfidence', () => {
  it('returns true below threshold', () => {
    const result = buildConfidence(1, 10, 0, [], 'test');
    expect(isLowConfidence(result, 0.5)).toBe(true);
  });

  it('returns false at or above threshold', () => {
    const result = buildConfidence(5, 5, 0, [], 'test');
    expect(isLowConfidence(result, 0.5)).toBe(false);
  });
});

describe('fingerprintHtml', () => {
  it('generates fingerprint for real VULMS page', () => {
    const html = '<html><body><form><table></table><input name="__VIEWSTATE" /><div id="MainContent_gvTileRepeaterAssignment_Label3_0"></div></form></body></html>';
    const fp = fingerprintHtml(html, 'assignments');
    expect(fp).toContain('assignments');
    expect(fp).toContain('tables:1');
    expect(fp).toContain('vs:1');
    expect(fp).toContain('tile:1');
  });

  it('generates different fingerprint for empty page', () => {
    const empty = fingerprintHtml('<html><body><p>No content</p></body></html>', 'empty');
    expect(empty).toContain('no-tables');
    expect(empty).toContain('vs:0');
  });
});
