export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, ...meta: unknown[]): void;
  info(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  error(message: string, ...meta: unknown[]): void;
  child(prefix: string): Logger;
}

export class DebugLogger implements Logger {
  private enabled: boolean;
  private prefix: string;

  constructor(enabled: boolean = false, prefix: string = '') {
    this.enabled = enabled;
    this.prefix = prefix;
  }

  debug(message: string, ...meta: unknown[]): void {
    if (this.enabled) {
      console.debug(`[DEBUG${this.prefix ? `:${this.prefix}` : ''}] ${message}`, ...meta);
    }
  }

  info(message: string, ...meta: unknown[]): void {
    if (this.enabled) {
      console.info(`[INFO${this.prefix ? `:${this.prefix}` : ''}] ${message}`, ...meta);
    }
  }

  warn(message: string, ...meta: unknown[]): void {
    console.warn(`[WARN${this.prefix ? `:${this.prefix}` : ''}] ${message}`, ...meta);
  }

  error(message: string, ...meta: unknown[]): void {
    console.error(`[ERROR${this.prefix ? `:${this.prefix}` : ''}] ${message}`, ...meta);
  }

  child(prefix: string): Logger {
    return new DebugLogger(this.enabled, this.prefix ? `${this.prefix}:${prefix}` : prefix);
  }
}

export const logger = new DebugLogger();

export const noopLogger: Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
  child() { return noopLogger; },
};