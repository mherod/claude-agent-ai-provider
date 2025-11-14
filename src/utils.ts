/**
 * Utility functions for the Claude Agent AI Provider
 *
 * Note: Most API configuration is handled automatically by the Claude Agent SDK,
 * including API key detection from environment variables (ANTHROPIC_API_KEY)
 */

import type { ClaudeProviderConfig } from './types.ts';

/**
 * Sleep utility for retry logic (if needed)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Exponential backoff for retries (if needed)
 */
export function calculateBackoff(retryCount: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, retryCount), 30000);
}

/**
 * Helper to merge custom headers if provided
 */
export function mergeHeaders(config?: ClaudeProviderConfig): Record<string, string> | undefined {
  return config?.headers;
}
