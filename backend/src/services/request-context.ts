import type { AppConfig } from '../config/env.js';

export interface RequestContext {
  config: AppConfig;
}

export function createRequestContext(config: AppConfig): RequestContext {
  return { config };
}
