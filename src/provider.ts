/**
 * Main provider factory for Claude Agent AI Provider
 */

import type {
  ProviderV2,
  LanguageModelV2,
  EmbeddingModelV2,
  ImageModelV2,
} from '@ai-sdk/provider';
import { NoSuchModelError } from '@ai-sdk/provider';
import type { ClaudeProviderConfig, ClaudeModelId, ClaudeModelSettings } from './types';
import { ClaudeLanguageModel } from './language-model';

/**
 * Claude Agent Provider implementation
 * Implements the AI SDK v5 ProviderV2 interface
 */
export class ClaudeProvider implements ProviderV2 {
  private config: ClaudeProviderConfig;

  constructor(config: ClaudeProviderConfig = {}) {
    this.config = config;
  }

  /**
   * Creates a language model instance
   * Returns LanguageModelV2 interface for compatibility
   */
  languageModel(modelId: string, settings?: ClaudeModelSettings): LanguageModelV2 {
    return new ClaudeLanguageModel(modelId as ClaudeModelId, this.config, settings);
  }

  /**
   * Creates a text embedding model instance
   * Throws NoSuchModelError as embedding models are not supported
   */
  textEmbeddingModel(modelId: string): EmbeddingModelV2<string> {
    throw new NoSuchModelError({
      modelId,
      modelType: 'textEmbeddingModel',
      message: 'Text embedding models are not supported by this provider.',
    });
  }

  /**
   * Creates an image model instance
   * Throws NoSuchModelError as image generation is not supported
   */
  imageModel(modelId: string): ImageModelV2 {
    throw new NoSuchModelError({
      modelId,
      modelType: 'imageModel',
      message: 'Image generation is not supported by this provider.',
    });
  }
}

/**
 * Factory function to create a Claude provider instance
 */
export function createClaudeProvider(config?: ClaudeProviderConfig): ClaudeProvider {
  return new ClaudeProvider(config);
}

/**
 * Convenience function to create a Claude language model directly
 * Returns LanguageModelV2 interface for compatibility
 */
export function claude(
  modelId: ClaudeModelId,
  config?: ClaudeProviderConfig,
  settings?: ClaudeModelSettings
): LanguageModelV2 {
  const provider = new ClaudeProvider(config);
  return provider.languageModel(modelId, settings);
}
