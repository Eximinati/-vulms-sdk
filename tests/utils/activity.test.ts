import { describe, it, expect } from 'vitest';
import {
  normalizeStatus,
  parseMarks,
  parseTotalAndObtained,
  parseObtainedMarks,
  extractCodeFromText,
} from '../../src/utils/activity';

describe('normalizeStatus', () => {
  it('should detect result_declared', () => {
    expect(normalizeStatus('Result Declared')).toBe('result_declared');
    expect(normalizeStatus('Graded')).toBe('result_declared');
    expect(normalizeStatus('Marked')).toBe('result_declared');
  });

  it('should detect submitted', () => {
    expect(normalizeStatus('Submitted')).toBe('submitted');
    expect(normalizeStatus('Submission Date: 15-May')).toBe('submitted');
  });

  it('should detect attempted', () => {
    expect(normalizeStatus('Attempted')).toBe('attempted');
  });

  it('should detect missed', () => {
    expect(normalizeStatus('Missed')).toBe('missed');
    expect(normalizeStatus('Overdue')).toBe('missed');
    expect(normalizeStatus('Not Submitted')).toBe('missed');
    expect(normalizeStatus('Not Attempted')).toBe('missed');
  });

  it('should default to pending', () => {
    expect(normalizeStatus('Pending')).toBe('pending');
    expect(normalizeStatus('Some random text')).toBe('pending');
    expect(normalizeStatus('')).toBe('pending');
  });

  it('should check HTML content as fallback', () => {
    expect(normalizeStatus('No info', '<div class="result">Result Declared</div>')).toBe('result_declared');
  });
});

describe('parseMarks', () => {
  it('should parse integer marks', () => {
    expect(parseMarks('10')).toBe(10);
    expect(parseMarks('Total: 20')).toBe(20);
  });

  it('should parse decimal marks', () => {
    expect(parseMarks('4.5')).toBe(4.5);
    expect(parseMarks('Score: 18.75')).toBe(18.75);
  });

  it('should return undefined for non-numeric', () => {
    expect(parseMarks('N/A')).toBeUndefined();
    expect(parseMarks('')).toBeUndefined();
  });
});

describe('parseTotalAndObtained', () => {
  it('should parse fraction format', () => {
    expect(parseTotalAndObtained('8/10')).toEqual({ obtained: 8, total: 10 });
    expect(parseTotalAndObtained('18.5 / 20')).toEqual({ obtained: 18.5, total: 20 });
  });

  it('should return empty object for non-fraction', () => {
    expect(parseTotalAndObtained('10')).toEqual({});
    expect(parseTotalAndObtained('N/A')).toEqual({});
  });
});

describe('parseObtainedMarks', () => {
  it('should parse from fraction', () => {
    expect(parseObtainedMarks('8/10')).toBe(8);
  });

  it('should fall back to simple number', () => {
    expect(parseObtainedMarks('18')).toBe(18);
  });

  it('should return undefined for invalid input', () => {
    expect(parseObtainedMarks('N/A')).toBeUndefined();
  });
});

describe('extractCodeFromText', () => {
  it('should extract course code from text', () => {
    expect(extractCodeFromText('CS101 - Programming')).toBe('CS101');
    expect(extractCodeFromText('MTH301 Calculus')).toBe('MTH301');
  });

  it('should handle lowercase codes', () => {
    expect(extractCodeFromText('cs101 - Programming')).toBe('CS101');
  });

  it('should extract practical course codes (CS301P)', () => {
    expect(extractCodeFromText('CS301P - Data Structures Lab')).toBe('CS301P');
    expect(extractCodeFromText('CS301P')).toBe('CS301P');
    expect(extractCodeFromText('cs301p - Lab Course')).toBe('CS301P');
  });

  it('should return null for no match', () => {
    expect(extractCodeFromText('No code here')).toBeNull();
    expect(extractCodeFromText('')).toBeNull();
  });
});
