import { describe, it, expect } from 'vitest';
import { checkSessionHealth, isSessionExpired, extractSessionExpiry } from '../../src/core/session-recovery';

describe('checkSessionHealth', () => {
  it('returns expired when not authenticated', () => {
    const health = checkSessionHealth({ cookies: '', isValid: false });
    expect(health.isAuthenticated).toBe(false);
    expect(health.isExpired).toBe(false);
    expect(health.cookiesPresent).toBe(false);
  });

  it('returns expired when cookies missing', () => {
    const health = checkSessionHealth({ cookies: '', isValid: true });
    expect(health.isAuthenticated).toBe(false);
    expect(health.isExpired).toBe(true);
  });

  it('returns expired when ASP.NET_SessionId missing', () => {
    const health = checkSessionHealth({ cookies: 'other=value', isValid: true });
    expect(health.isAuthenticated).toBe(false);
    expect(health.isExpired).toBe(true);
  });

  it('returns valid with all cookies', () => {
    const health = checkSessionHealth({ cookies: 'ASP.NET_SessionId=abc123', isValid: true });
    expect(health.isAuthenticated).toBe(true);
    expect(health.isExpired).toBe(false);
    expect(health.cookiesPresent).toBe(true);
  });
});

describe('isSessionExpired', () => {
  it('returns true for login page', () => {
    expect(isSessionExpired('<html><form id="Login.aspx">')).toBe(true);
  });

  it('returns true for session expired message', () => {
    expect(isSessionExpired('Your session has expired. Please login again.')).toBe(true);
  });

  it('returns true for txtStudentID', () => {
    expect(isSessionExpired('<input id="txtStudentID">')).toBe(true);
  });

  it('returns false for normal page', () => {
    expect(isSessionExpired('<html><body><h1>Assignments</h1></body></html>')).toBe(false);
  });
});

describe('extractSessionExpiry', () => {
  it('extracts date from text', () => {
    const date = extractSessionExpiry('Session expires on Jan 15, 2026 at midnight');
    expect(date).toBeInstanceOf(Date);
  });

  it('returns null when no date found', () => {
    expect(extractSessionExpiry('No date here')).toBeNull();
  });
});
