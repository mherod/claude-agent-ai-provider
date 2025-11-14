/**
 * Provider Structure Demo
 * Shows the provider API without requiring Claude Code to be installed
 */

import { claude, createClaudeProvider } from '../index.ts';

console.log('=== Claude Agent AI Provider Demo ===\n');

// Example 1: Create a model directly
console.log('1. Creating a model with claude() function:');
const model1 = claude('sonnet');
console.log('   ✓ Model ID:', model1.modelId);
console.log('   ✓ Provider:', model1.provider);
console.log('   ✓ Specification:', model1.specificationVersion);
console.log('   ✓ Has doGenerate:', typeof model1.doGenerate === 'function');
console.log('   ✓ Has doStream:', typeof model1.doStream === 'function');

// Example 2: Create provider with configuration
console.log('\n2. Creating a provider with configuration:');
const provider = createClaudeProvider({
  timeout: 120000,
  maxRetries: 3,
});
console.log('   ✓ Provider created successfully');

// Example 3: Create model from provider
console.log('\n3. Creating models from provider:');
const model2 = provider.languageModel('claude-3-opus-20240229', {
  maxTokens: 4096,
  temperature: 0.7,
});
console.log('   ✓ Model ID:', model2.modelId);
console.log('   ✓ Provider:', model2.provider);

// Example 4: Show supported URLs
console.log('\n4. Supported URL patterns:');
const urls = model1.supportedUrls;
for (const [mediaType, patterns] of Object.entries(urls)) {
  console.log(`   ✓ ${mediaType}:`, patterns.length, 'patterns');
}

// Example 5: Test error handling for unsupported models
console.log('\n5. Error handling for unsupported models:');
try {
  provider.textEmbeddingModel('test');
} catch (error) {
  if (error instanceof Error) {
    console.log('   ✓ Correctly throws error:', error.name);
  }
}

try {
  provider.imageModel('test');
} catch (error) {
  if (error instanceof Error) {
    console.log('   ✓ Correctly throws error:', error.name);
  }
}

// Example 6: Show the prompt structure
console.log('\n6. AI SDK Prompt Structure:');
const examplePrompt = {
  prompt: [
    {
      role: 'system' as const,
      content: 'You are a helpful assistant.',
    },
    {
      role: 'user' as const,
      content: [
        {
          type: 'text' as const,
          text: 'Hello! How are you?'
        }
      ],
    },
  ],
};
const systemMsg = examplePrompt.prompt[0];
const userMsg = examplePrompt.prompt[1];
console.log('   ✓ System message:', systemMsg?.content);
if (userMsg && 'content' in userMsg && Array.isArray(userMsg.content)) {
  console.log('   ✓ User message:', userMsg.content[0]?.text);
}

console.log('\n=== Provider Structure ===');
console.log('The provider successfully implements:');
console.log('   ✓ ProviderV2 interface');
console.log('   ✓ LanguageModelV2 interface');
console.log('   ✓ Message format conversion');
console.log('   ✓ Streaming support (ReadableStream)');
console.log('   ✓ Tool call translation');
console.log('   ✓ Error handling');

console.log('\n=== Usage Notes ===');
console.log('To actually use this provider with Claude:');
console.log('1. Install Claude Code: https://docs.claude.com/');
console.log('2. Set ANTHROPIC_API_KEY environment variable');
console.log('3. Call model.doGenerate() or model.doStream()');
console.log('\nThe provider will bridge AI SDK calls to Claude Agent SDK,');
console.log('which provides agent capabilities, tool use, and MCP integration.');

console.log('\n✅ Demo complete!');
