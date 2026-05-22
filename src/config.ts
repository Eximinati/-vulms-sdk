import type { LogLevel } from './utils/logger';

export interface SDKConfig {
  debug?: boolean;
  logger?: LogLevel;
  snapshots?: boolean;
  traceRequests?: boolean;
  retries?: number;
  timeout?: number;
  cache?: boolean;
  cacheTtlMs?: number;
  debugDashboard?: boolean;
  userAgent?: string;
}

export interface RequiredSDKConfig {
  debug: boolean;
  logger: LogLevel;
  snapshots: boolean;
  traceRequests: boolean;
  retries: number;
  timeout: number;
  cache: boolean;
  cacheTtlMs: number;
  debugDashboard: boolean;
  userAgent: string;
}

export const DEFAULT_SDK_CONFIG: RequiredSDKConfig = {
  debug: false,
  logger: 'warn',
  snapshots: false,
  traceRequests: false,
  retries: 3,
  timeout: 30000,
  cache: true,
  cacheTtlMs: 5 * 60 * 1000,
  debugDashboard: false,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

export function mergeConfig(input: SDKConfig = {}): RequiredSDKConfig {
  return {
    debug: input.debug ?? DEFAULT_SDK_CONFIG.debug,
    logger: input.logger ?? DEFAULT_SDK_CONFIG.logger,
    snapshots: input.snapshots ?? DEFAULT_SDK_CONFIG.snapshots,
    traceRequests: input.traceRequests ?? DEFAULT_SDK_CONFIG.traceRequests,
    retries: input.retries ?? DEFAULT_SDK_CONFIG.retries,
    timeout: input.timeout ?? DEFAULT_SDK_CONFIG.timeout,
    cache: input.cache ?? DEFAULT_SDK_CONFIG.cache,
    cacheTtlMs: input.cacheTtlMs ?? DEFAULT_SDK_CONFIG.cacheTtlMs,
    debugDashboard: input.debugDashboard ?? DEFAULT_SDK_CONFIG.debugDashboard,
    userAgent: input.userAgent ?? DEFAULT_SDK_CONFIG.userAgent,
  };
}
