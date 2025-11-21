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
 * Checks if a Claude binary path is valid and returns its version
 * @returns The version string (e.g., "2.0.49") or null if invalid
 */
function getClaudeVersion(path: string): string | null {
  try {
    const proc = Bun.spawnSync(['sh', '-c', `"${path}" --version 2>&1`]);
    const output = new TextDecoder().decode(proc.stdout).trim();
    // Extract version number from output like "2.0.49 (Claude Code)"
    const match = output.match(/(\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Checks if a version string is 2.x or higher
 */
function isModernVersion(version: string): boolean {
  const major = parseInt(version.split('.')[0], 10);
  return major >= 2;
}

/**
 * Automatically detects the Claude Code executable path
 * Prioritizes native Claude 2.x binary over older npm installations
 * Caches the result to avoid repeated lookups
 * @returns The path to the Claude executable, or null if not found
 */
export function detectClaudeBinaryPath(): string | null {
  // Return cached result if available
  if (cachedClaudePath !== undefined) {
    return cachedClaudePath;
  }

  try {
    // Common locations for native Claude Code installation
    const commonPaths = [
      `${process.env.HOME}/.claude/local/claude`,  // Standard install location
      '/usr/local/bin/claude',                      // Homebrew/system install
      '/opt/homebrew/bin/claude',                   // Homebrew on Apple Silicon
    ];

    // Check common native installation paths first
    for (const path of commonPaths) {
      const version = getClaudeVersion(path);
      if (version && isModernVersion(version)) {
        cachedClaudePath = path;
        return cachedClaudePath;
      }
    }

    // Fall back to `which claude` but verify it's a modern version
    const whichPath = Bun.which('claude');
    if (whichPath) {
      const version = getClaudeVersion(whichPath);
      if (version && isModernVersion(version)) {
        cachedClaudePath = whichPath;
        return cachedClaudePath;
      }
    }

    // No suitable Claude binary found
    cachedClaudePath = null;
    return null;
  } catch (error) {
    // If detection fails, cache null and return null
    cachedClaudePath = null;
    return null;
  }
}
