export class VulmsError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'VulmsError';
  }
}

export class VulmsAuthError extends VulmsError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'VulmsAuthError';
  }
}

export class VulmsParsingError extends VulmsError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'VulmsParsingError';
  }
}
