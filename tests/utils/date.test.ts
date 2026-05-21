import { describe, it, expect } from 'vitest';
import { parseVulmsDate } from '../../src/utils/date';

describe('parseVulmsDate', () => {
  it('should parse dd-MMM-yyyy format', () => {
    const result = parseVulmsDate('15-May-2024');
    expect(result).toBeInstanceOf(Date);
    expect(result!.getDate()).toBe(15);
    expect(result!.getMonth()).toBe(4);
    expect(result!.getFullYear()).toBe(2024);
  });

  it('should parse dd MMM yyyy format with spaces', () => {
    const result = parseVulmsDate('15 May 2024');
    expect(result).toBeInstanceOf(Date);
    expect(result!.getDate()).toBe(15);
    expect(result!.getMonth()).toBe(4);
    expect(result!.getFullYear()).toBe(2024);
  });

  it('should parse dd/MMM/yyyy format with slashes', () => {
    const result = parseVulmsDate('15/May/2024');
    expect(result).toBeInstanceOf(Date);
    expect(result!.getDate()).toBe(15);
    expect(result!.getMonth()).toBe(4);
    expect(result!.getFullYear()).toBe(2024);
  });

  it('should parse dd/mm/yyyy numeric format', () => {
    const result = parseVulmsDate('15/05/2024');
    expect(result).toBeInstanceOf(Date);
    expect(result!.getDate()).toBe(15);
    expect(result!.getMonth()).toBe(4);
    expect(result!.getFullYear()).toBe(2024);
  });

  it('should parse mm/dd/yyyy when month comes first', () => {
    const result = parseVulmsDate('05/15/2024');
    expect(result).toBeInstanceOf(Date);
    expect(result!.getDate()).toBe(15);
    expect(result!.getMonth()).toBe(4);
    expect(result!.getFullYear()).toBe(2024);
  });

  it('should parse long month name format', () => {
    const result = parseVulmsDate('May 15, 2024');
    expect(result).toBeInstanceOf(Date);
    expect(result!.getMonth()).toBe(4);
    expect(result!.getDate()).toBe(15);
    expect(result!.getFullYear()).toBe(2024);
  });

  it('should return null for N/A', () => {
    expect(parseVulmsDate('N/A')).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(parseVulmsDate('')).toBeNull();
  });

  it('should return null for dash', () => {
    expect(parseVulmsDate('-')).toBeNull();
  });

  it('should return null for invalid date string', () => {
    expect(parseVulmsDate('not-a-date')).toBeNull();
  });
});
