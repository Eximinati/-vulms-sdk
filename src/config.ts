export type RequiredConfig = Required<SDKConfig>;

export interface SDKConfig {
  debug?: boolean;
  snapshots?: boolean;
  traceRequests?: boolean;
  retries?: number;
  timeout?: number;
  userAgent?: string;
}

export const DEFAULT_SDK_CONFIG: Required<SDKConfig> = {
  debug: false,
  snapshots: false,
  traceRequests: false,
  retries: 3,
  timeout: 30000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

export function mergeConfig(input: SDKConfig = {}): Required<SDKConfig> {
  return {
    debug: input.debug ?? DEFAULT_SDK_CONFIG.debug,
    snapshots: input.snapshots ?? DEFAULT_SDK_CONFIG.snapshots,
    traceRequests: input.traceRequests ?? DEFAULT_SDK_CONFIG.traceRequests,
    retries: input.retries ?? DEFAULT_SDK_CONFIG.retries,
    timeout: input.timeout ?? DEFAULT_SDK_CONFIG.timeout,
    userAgent: input.userAgent ?? DEFAULT_SDK_CONFIG.userAgent,
  };
}
