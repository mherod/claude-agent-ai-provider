/**
 * Utility functions for the Claude Agent AI Provider
 *
 * Note: Most API configuration is handled automatically by the Claude Agent SDK,
 * including API key detection from environment variables (ANTHROPIC_API_KEY)
 */

import type { ClaudeProviderConfig } from './types.ts';

// Cache for detected Claude binary path to avoid repeated lookups
let cachedClaudePath: string | null | undefined = undefined;

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

/**
 * Automatically detects the Claude Code executable path using `which claude`
 * Caches the result to avoid repeated lookups
 * @returns The path to the Claude executable, or null if not found
 */
export function detectClaudeBinaryPath(): string | null {
  // Return cached result if available
  if (cachedClaudePath !== undefined) {
    return cachedClaudePath;
  }

  try {
    // Use Bun's built-in which() function for cross-platform binary detection
    // This works on Unix-like systems (macOS, Linux) and Windows
    const path = Bun.which('claude');
    cachedClaudePath = path || null;
    return cachedClaudePath;
  } catch (error) {
    // If detection fails, cache null and return null
    cachedClaudePath = null;
    return null;
  }
}
