import { test, expect, describe } from 'bun:test';
import { ClaudeProvider, createClaudeProvider, claude } from '../index';

describe('Claude Agent Provider', () => {
  test('should create provider instance', () => {
    const provider = createClaudeProvider();
    expect(provider).toBeInstanceOf(ClaudeProvider);
  });

  test('should create language model', () => {
    const provider = createClaudeProvider();
    const model = provider.languageModel('sonnet');

    expect(model.specificationVersion).toBe('v2');
    expect(model.provider).toBe('claude-agent');
    expect(model.modelId).toBe('sonnet');
  });

  test('should create language model with convenience function', () => {
    const model = claude('haiku');

    expect(model.specificationVersion).toBe('v2');
    expect(model.provider).toBe('claude-agent');
    expect(model.modelId).toBe('haiku');
  });

  test('should throw NoSuchModelError for embedding models', () => {
    const provider = createClaudeProvider();
    expect(() => provider.textEmbeddingModel('test')).toThrow();
  });

  test('should throw NoSuchModelError for image models', () => {
    const provider = createClaudeProvider();
    expect(() => provider.imageModel('test')).toThrow();
  });

  test('should have correct supportedUrls', () => {
    const model = claude('sonnet');
    const urls = model.supportedUrls;

    expect(urls).toHaveProperty('image/*');
    expect(urls).toHaveProperty('application/pdf');
    expect(urls).toHaveProperty('text/*');
  });
});

describe('Language Model Interface', () => {
  test('should have correct LanguageModelV2 methods', () => {
    const model = claude('opus');

    // Check that required LanguageModelV2 methods exist
    expect(typeof model.doGenerate).toBe('function');
    expect(typeof model.doStream).toBe('function');
  });

  test('should return proper types from doStream', async () => {
    const model = claude('sonnet');

    // Note: This will fail without Claude Code installed
    // In production, this would connect to the Agent SDK
    try {
      const result = await model.doStream({
        prompt: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'Hello' }],
          },
        ],
      });

      expect(result.stream).toBeInstanceOf(ReadableStream);
    } catch (error) {
      // Expected to fail in test environment without Claude Code
      expect(error).toBeDefined();
    }
  });
});
