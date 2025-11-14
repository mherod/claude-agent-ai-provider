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
  statusCode?: number,
  url?: string,
  requestBody?: unknown
): Error {
  if (error instanceof Error) {
    // Handle specific HTTP status codes
    switch (statusCode) {
      case 401:
        return new ClaudeAuthenticationError(error.message, error);
      case 404:
        return new ClaudeModelNotFoundError(error.message, error);
      case 429:
        return new ClaudeRateLimitError(error.message, undefined, error);
      case 400:
        return new ClaudeInvalidRequestError(error.message, error);
      default:
        if (statusCode && statusCode >= 500) {
          return new APICallError({
            message: `Server error: ${error.message}`,
            url: url ?? 'unknown',
            requestBodyValues: requestBody ?? {},
            statusCode,
            cause: error,
          });
        }
        return new ClaudeProviderError(error.message, error);
    }
  }

  return new ClaudeProviderError('Unknown error occurred', error);
}
