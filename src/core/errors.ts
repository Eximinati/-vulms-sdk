export interface VulmsErrorOptions {
  code?: string;
  operation?: string;
  recoverable?: boolean;
  cause?: Error;
}

export class VulmsError extends Error {
  public readonly code: string;
  public readonly operation?: string;
  public readonly recoverable: boolean;
  public readonly cause?: Error;

  constructor(message: string, options: VulmsErrorOptions = {}) {
    super(message);
    this.name = 'VulmsError';
    this.code = options.code ?? 'UNKNOWN_ERROR';
    this.operation = options.operation;
    this.recoverable = options.recoverable ?? false;
    this.cause = options.cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VulmsError);
    }
  }
}

export class AuthenticationError extends VulmsError {
  constructor(message: string, options: Omit<VulmsErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'AUTH_ERROR', recoverable: true });
    this.name = 'AuthenticationError';
  }
}

export class SessionExpiredError extends VulmsError {
  constructor(message: string, options: Omit<VulmsErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'SESSION_EXPIRED', recoverable: true });
    this.name = 'SessionExpiredError';
  }
}

export class NavigationError extends VulmsError {
  constructor(message: string, options: Omit<VulmsErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'NAVIGATION_ERROR', recoverable: false });
    this.name = 'NavigationError';
  }
}

export class ValidationError extends VulmsError {
  constructor(message: string, options: Omit<VulmsErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'VALIDATION_ERROR', recoverable: false });
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends VulmsError {
  constructor(message: string, options: Omit<VulmsErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'RATE_LIMITED', recoverable: true });
    this.name = 'RateLimitError';
  }
}

export class ParsingError extends VulmsError {
  constructor(message: string, options: Omit<VulmsErrorOptions, 'code'> = {}) {
    super(message, { ...options, code: 'PARSING_ERROR', recoverable: false });
    this.name = 'ParsingError';
  }
}
