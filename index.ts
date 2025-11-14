/**
 * Claude Agent AI Provider
 * A custom AI SDK provider with agent capabilities
 */

// Export provider classes
export { ClaudeProvider, createClaudeProvider, claude } from './src/provider';

// Export language model class
export { ClaudeLanguageModel } from './src/language-model';

// Export types
export type {
  ClaudeProviderConfig,
  ClaudeModelSettings,
  ClaudeModelId,
  ClaudeResponseMetadata,
} from './src/types';

// Export errors
export {
  ClaudeProviderError,
  ClaudeAuthenticationError,
  ClaudeRateLimitError,
  ClaudeModelNotFoundError,
  ClaudeInvalidRequestError,
  convertToAISDKError,
} from './src/errors';

// Re-export AI SDK types for convenience
export type {
  LanguageModelV2,
  LanguageModelV2CallOptions,
  LanguageModelV2StreamPart,
  LanguageModelV2Content,
  LanguageModelV2FinishReason,
  LanguageModelV2Usage,
  ProviderV2,
} from '@ai-sdk/provider';