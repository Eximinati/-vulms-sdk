import type { Logger } from './logger';
import { noopLogger } from './logger';

export type FailureType =
  | 'timeout'
  | 'empty_response'
  | 'redirect_loop'
  | 'session_drift'
  | 'invalid_viewstate'
  | 'partial_render'
  | 'unknown';

export interface TransientFailure {
  type: FailureType;
  occurredAt: number;
  url?: string;
  message: string;
  recoverable: boolean;
  retryable: boolean;
}

export interface RecoveryAction {
  action: 'retry' | 'refresh_state' | 'relogin' | 'skip' | 'abort';
  delayMs?: number;
  reason: string;
}

export class TransientFailureDetector {
  private logger: Logger;
  private recentFailures: TransientFailure[] = [];
  private maxHistorySize = 50;

  constructor(logger: Logger = noopLogger) {
    this.logger = logger;
  }

  detectFailure(error: Error | string, url?: string, responseHtml?: string): TransientFailure {
    const message = typeof error === 'string' ? error : error.message;
    const now = Date.now();

    let type: FailureType = 'unknown';
    let recoverable = false;
    let retryable = false;

    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('timeout') || lowerMsg.includes('etimedout') || lowerMsg.includes('request timeout')) {
      type = 'timeout';
      recoverable = true;
      retryable = true;
    } else if (lowerMsg.includes('invalid viewstate') || lowerMsg.includes('viewstate')) {
      type = 'invalid_viewstate';
      recoverable = true;
      retryable = true;
    } else if (lowerMsg.includes('empty') || lowerMsg.includes('no content')) {
      type = 'empty_response';
      recoverable = true;
      retryable = true;
    } else if (lowerMsg.includes('redirect') && lowerMsg.includes('loop')) {
      type = 'redirect_loop';
      recoverable = true;
      retryable = false;
    } else if (responseHtml) {
      if (responseHtml.includes('login') && responseHtml.includes('username')) {
        type = 'session_drift';
        recoverable = true;
        retryable = true;
      } else if (this.isPartialRender(responseHtml)) {
        type = 'partial_render';
        recoverable = true;
        retryable = true;
      }
    }

    const failure: TransientFailure = {
      type,
      occurredAt: now,
      url,
      message,
      recoverable,
      retryable,
    };

    this.addToHistory(failure);
    this.logger.debug(`[FAILURE DETECTOR] type=${type} recoverable=${recoverable} retryable=${retryable}`);

    return failure;
  }

  private isPartialRender(html: string): boolean {
    const hasAspNetForm = html.includes('__VIEWSTATE') || html.includes('__EVENTVALIDATION');
    const hasContent = html.length > 1000;
    const hasLogin = html.toLowerCase().includes('txtusername');
    const hasEmptyBody = html.includes('<body') && html.match(/<body[^>]*>\s*<\/body>/i) !== null;

    return hasAspNetForm && !hasContent && !hasLogin && !hasEmptyBody;
  }

  getRecommendedRecovery(failure: TransientFailure): RecoveryAction {
    switch (failure.type) {
      case 'timeout':
        return {
          action: 'retry',
          delayMs: 1000,
          reason: 'timeout, safe to retry after delay',
        };

      case 'empty_response':
        return {
          action: 'retry',
          delayMs: 500,
          reason: 'empty response, retry may yield full content',
        };

      case 'invalid_viewstate':
        return {
          action: 'refresh_state',
          delayMs: 200,
          reason: 'viewstate invalid, refresh form state and retry',
        };

      case 'partial_render':
        return {
          action: 'retry',
          delayMs: 500,
          reason: 'partial render, retry may complete',
        };

      case 'session_drift':
        return {
          action: 'relogin',
          delayMs: 0,
          reason: 'session drift, full relogin required',
        };

      case 'redirect_loop':
        return {
          action: 'abort',
          delayMs: 0,
          reason: 'redirect loop detected, abort to prevent infinite loop',
        };

      default:
        return {
          action: 'retry',
          delayMs: 1000,
          reason: 'unknown failure, attempt retry',
        };
    }
  }

  shouldRetry(failure: TransientFailure, attemptCount: number, maxAttempts: number = 3): boolean {
    if (!failure.retryable) return false;
    if (attemptCount >= maxAttempts) return false;

    const recentSameType = this.recentFailures.filter(f =>
      f.type === failure.type && Date.now() - f.occurredAt < 30000
    ).length;

    if (recentSameType >= 3) {
      this.logger.warn(`[FAILURE DETECTOR] Too many ${failure.type} failures in short window, stopping retries`);
      return false;
    }

    return true;
  }

  private addToHistory(failure: TransientFailure): void {
    this.recentFailures.push(failure);
    if (this.recentFailures.length > this.maxHistorySize) {
      this.recentFailures.shift();
    }
  }

  getFailureHistory(): TransientFailure[] {
    return [...this.recentFailures];
  }

  getFailureRate(windowMs: number = 60000): number {
    const now = Date.now();
    const recent = this.recentFailures.filter(f => now - f.occurredAt < windowMs);
    return recent.length / (windowMs / 1000);
  }

  reset(): void {
    this.recentFailures = [];
    this.logger.debug('[FAILURE DETECTOR] History reset');
  }
}

export function createFailureDetector(logger?: Logger): TransientFailureDetector {
  return new TransientFailureDetector(logger);
}

export async function withTransientFailureRecovery<T>(
  operation: () => Promise<T>,
  detector: TransientFailureDetector,
  options: {
    maxRetries?: number;
    onRecovery?: (action: RecoveryAction) => void;
  } = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err as Error;
      const failure = detector.detectFailure(lastError);

      if (!detector.shouldRetry(failure, attempt, maxRetries)) {
        throw lastError;
      }

      const recovery = detector.getRecommendedRecovery(failure);

      if (recovery.action === 'abort') {
        throw lastError;
      }

      if (recovery.action === 'relogin') {
        throw new Error('Session drift - relogin required');
      }

      if (options.onRecovery) {
        options.onRecovery(recovery);
      }

      if (recovery.delayMs) {
        await new Promise(resolve => setTimeout(resolve, recovery.delayMs));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}