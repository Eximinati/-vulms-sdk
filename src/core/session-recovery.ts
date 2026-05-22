import type { SessionState } from '../types/session';
import { AuthenticationError } from './errors';

export interface SessionHealth {
  isAuthenticated: boolean;
  isExpired: boolean;
  cookiesPresent: boolean;
  age?: number;
  message?: string;
}

export function checkSessionHealth(state: SessionState): SessionHealth {
  if (!state.isValid) {
    return {
      isAuthenticated: false,
      isExpired: false,
      cookiesPresent: false,
      message: 'Session is not authenticated. Call login() first.',
    };
  }

  if (!state.cookies) {
    return {
      isAuthenticated: false,
      isExpired: true,
      cookiesPresent: false,
      message: 'Session cookies are missing. Re-login required.',
    };
  }

  const hasSessionId = state.cookies.includes('ASP.NET_SessionId');
  if (!hasSessionId) {
    return {
      isAuthenticated: false,
      isExpired: true,
      cookiesPresent: true,
      message: 'ASP.NET_SessionId cookie missing. Re-login required.',
    };
  }

  return {
    isAuthenticated: true,
    isExpired: false,
    cookiesPresent: true,
    message: 'Session appears valid.',
  };
}

export function isSessionExpired(html: string): boolean {
  const loginIndicators = [
    'Login.aspx',
    'txtStudentID',
    'Incorrect username',
    'Invalid credentials',
    'Your session has expired',
    'session expired',
  ];

  return loginIndicators.some((indicator) => html.includes(indicator));
}

export function extractSessionExpiry(hint: string): Date | null {
  const patterns = [
    /session\s+(?:expires?|will\s+expire)\s+(?:at|on)\s+(.+?)(?:\.|$)/i,
    /(?:expires?|expire[sd]?)\s+(?:at|on)\s+(.+?)(?:\.|$)/i,
  ];

  for (const pattern of patterns) {
    const match = hint.match(pattern);
    if (match) return new Date(match[1]);
  }

  return null;
}

export class SessionRecovery {
  constructor(
    private state: SessionState,
    private reLoginFn: () => Promise<boolean>,
  ) {}

  async ensureValid(): Promise<void> {
    if (!this.state.isValid || !this.state.cookies) {
      throw new AuthenticationError('Session is not authenticated. Call login() first.');
    }
  }

  async recoverIfNeeded(validateFn: () => Promise<boolean>): Promise<boolean> {
    const health = checkSessionHealth(this.state);

    if (health.isAuthenticated && !health.isExpired) {
      const stillValid = await validateFn();
      if (stillValid) return true;
    }

    if (health.isExpired || !health.isAuthenticated) {
      const reconnected = await this.reLoginFn();
      if (reconnected) return true;
    }

    return false;
  }

  getHealth(): SessionHealth {
    return checkSessionHealth(this.state);
  }
}
