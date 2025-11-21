/**
 * Error handling for the Claude Agent AI Provider
 */

import { APICallError } from '@ai-sdk/provider';

/**
 * Base error class for Claude provider errors
 */
export class ClaudeProviderError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ClaudeProviderError';
    this.cause = cause;
  }
}

/**
 * Error thrown when authentication fails
 */
export class ClaudeAuthenticationError extends ClaudeProviderError {
  constructor(message: string = 'Authentication failed. Check your API key.', cause?: unknown) {
    super(message, cause);
    this.name = 'ClaudeAuthenticationError';
  }
}

/**
 * Error thrown when rate limits are exceeded
 */
export class ClaudeRateLimitError extends ClaudeProviderError {
  constructor(
    message: string = 'Rate limit exceeded. Please retry later.',
    public readonly retryAfter?: number,
    cause?: unknown
  ) {
    super(message, cause);
    this.name = 'ClaudeRateLimitError';
  }
}

/**
 * Error thrown when the model is not found or not supported
 */
export class ClaudeModelNotFoundError extends ClaudeProviderError {
  constructor(modelId: string, cause?: unknown) {
    super(`Model '${modelId}' not found or not supported.`, cause);
    this.name = 'ClaudeModelNotFoundError';
  }
}

/**
 * Error thrown when the request is invalid
 */
export class ClaudeInvalidRequestError extends ClaudeProviderError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'ClaudeInvalidRequestError';
  }
}

/**
 * Converts HTTP response errors to standardized AI SDK errors
 */
export function convertToAISDKError(
  error: unknown,
  stderrOutput?: string[],
  statusCode?: number,
  url?: string,
  requestBody?: unknown
): Error {
  if (error instanceof Error) {
    // Enhance error message with stderr output if available
    let enhancedMessage = error.message;
    if (stderrOutput && stderrOutput.length > 0) {
      const stderrText = stderrOutput.join('\n').trim();
      if (stderrText) {
        enhancedMessage = `${error.message}\n\nClaude Code stderr output:\n${stderrText}`;
      }
    }

    // If no stderr output, add helpful debugging information
    if (!stderrOutput || stderrOutput.length === 0) {
      if (error.message.includes('Claude Code process exited with code 1')) {
        enhancedMessage = `${error.message}

Common causes:
  1. Missing authentication: Set ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN
     - Get API key from: https://console.anthropic.com/settings/keys
     - Or run: claude setup-token (for development)

  2. Claude Code binary not found or not executable
     - Check PATH includes Claude Code installation
     - Or set pathToClaudeCodeExecutable in provider config

  3. Invalid model or settings

Enable debug output with: DEBUG=1 environment variable`;
      }
    }

    // Handle specific HTTP status codes
    switch (statusCode) {
      case 401:
        return new ClaudeAuthenticationError(enhancedMessage, error);
      case 404:
        return new ClaudeModelNotFoundError(enhancedMessage, error);
      case 429:
        return new ClaudeRateLimitError(enhancedMessage, undefined, error);
      case 400:
        return new ClaudeInvalidRequestError(enhancedMessage, error);
      default:
        if (statusCode && statusCode >= 500) {
          return new APICallError({
            message: `Server error: ${enhancedMessage}`,
            url: url ?? 'unknown',
            requestBodyValues: requestBody ?? {},
            statusCode,
            cause: error,
          });
        }
        return new ClaudeProviderError(enhancedMessage, error);
    }
  }

  return new ClaudeProviderError('Unknown error occurred', error);
}
