export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

export interface Logger {
  debug(message: string, ...meta: unknown[]): void;
  info(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  error(message: string, ...meta: unknown[]): void;
  trace(message: string, ...meta: unknown[]): void;
  child(prefix: string): Logger;
}

export class DebugLogger implements Logger {
  private level: LogLevel;
  private prefix: string;
  private priority: number;

  constructor(level: LogLevel | boolean = 'warn', prefix: string = '') {
    this.prefix = prefix;
    if (typeof level === 'boolean') {
      this.level = level ? 'debug' : 'warn';
    } else {
      this.level = level;
    }
    this.priority = LOG_LEVEL_PRIORITY[this.level];
  }

  debug(message: string, ...meta: unknown[]): void {
    if (this.priority >= LOG_LEVEL_PRIORITY.debug) {
      console.debug(`[DEBUG${this.prefix ? `:${this.prefix}` : ''}] ${message}`, ...meta);
    }
  }

  info(message: string, ...meta: unknown[]): void {
    if (this.priority >= LOG_LEVEL_PRIORITY.info) {
      console.info(`[INFO${this.prefix ? `:${this.prefix}` : ''}] ${message}`, ...meta);
    }
  }

  warn(message: string, ...meta: unknown[]): void {
    if (this.priority >= LOG_LEVEL_PRIORITY.warn) {
      console.warn(`[WARN${this.prefix ? `:${this.prefix}` : ''}] ${message}`, ...meta);
    }
  }

  error(message: string, ...meta: unknown[]): void {
    if (this.priority >= LOG_LEVEL_PRIORITY.error) {
      console.error(`[ERROR${this.prefix ? `:${this.prefix}` : ''}] ${message}`, ...meta);
    }
  }

  trace(message: string, ...meta: unknown[]): void {
    if (this.priority >= LOG_LEVEL_PRIORITY.trace) {
      console.trace(`[TRACE${this.prefix ? `:${this.prefix}` : ''}] ${message}`, ...meta);
    }
  }

  child(prefix: string): Logger {
    return new DebugLogger(this.level, this.prefix ? `${this.prefix}:${prefix}` : prefix);
  }
}

export const logger = new DebugLogger();

export const noopLogger: Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
  trace() {},
  child() { return noopLogger; },
};
