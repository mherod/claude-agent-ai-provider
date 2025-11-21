/**
 * Example: Using customProvider with Claude Agent AI Provider
 * 
 * This example demonstrates how to create custom model configurations
 * and aliases using the AI SDK's customProvider function.
 */

import { generateText, customProvider, wrapLanguageModel, defaultSettingsMiddleware } from 'ai';
import { createClaudeProvider, claude } from 'claude-agent-ai-provider';

/**
 * Example 1: Custom provider with model aliases and settings
 */
async function exampleCustomAliases() {
  console.log('\n=== Example 1: Custom Model Aliases ===\n');

  // Create a custom provider with predefined model configurations
  const myClaude = customProvider({
    languageModels: {
      // Fast model - Haiku with lower temperature for concise responses
      'claude-fast': wrapLanguageModel({
        model: claude('haiku'),
        middleware: defaultSettingsMiddleware({
          settings: {
            temperature: 0.3,
            maxTokens: 1024,
          },
        }),
      }),

      // Creative model - Sonnet with high temperature for creative writing
      'claude-creative': wrapLanguageModel({
        model: claude('sonnet'),
        middleware: defaultSettingsMiddleware({
          settings: {
            temperature: 0.9,
            maxTokens: 4096,
          },
        }),
      }),

      // Technical model - Opus with moderate temperature for code/technical content
      'claude-technical': wrapLanguageModel({
        model: claude('opus'),
        middleware: defaultSettingsMiddleware({
          settings: {
            temperature: 0.5,
            maxTokens: 8192,
          },
        }),
      }),

      // Direct model references (no custom settings)
      'claude-sonnet': claude('sonnet'),
      'claude-opus': claude('opus'),
      'claude-haiku': claude('haiku'),
    },
    // Fallback provider for any model IDs not defined above
    fallbackProvider: createClaudeProvider(),
  });

  // Use the fast model for quick responses
  console.log('Using claude-fast...');
  const fastResult = await generateText({
    model: myClaude.languageModel('claude-fast'),
    prompt: 'Explain TypeScript in one sentence.',
  });
  console.log('Response:', fastResult.text);
  console.log('Tokens:', fastResult.usage);

  // Use the creative model for creative writing
  console.log('\nUsing claude-creative...');
  const creativeResult = await generateText({
    model: myClaude.languageModel('claude-creative'),
    prompt: 'Write a haiku about coding.',
  });
  console.log('Response:', creativeResult.text);

  // Use direct model reference
  console.log('\nUsing direct model reference (claude-sonnet)...');
  const directResult = await generateText({
    model: myClaude.languageModel('claude-sonnet'),
    prompt: 'What is the difference between let and const?',
  });
  console.log('Response:', directResult.text);
}

/**
 * Example 2: Custom provider with fallback
 */
async function exampleWithFallback() {
  console.log('\n=== Example 2: Using Fallback Provider ===\n');

  const myProvider = customProvider({
    languageModels: {
      // Only define one custom model
      'my-custom-model': wrapLanguageModel({
        model: claude('haiku'),
        middleware: defaultSettingsMiddleware({
          settings: { temperature: 0.2 },
        }),
      }),
    },
    // Fallback handles any other model IDs
    fallbackProvider: createClaudeProvider(),
  });

  // Uses custom model
  console.log('Using custom model...');
  const customResult = await generateText({
    model: myProvider.languageModel('my-custom-model'),
    prompt: 'Brief explanation of JavaScript closures.',
  });
  console.log('Response:', customResult.text);

  // Uses fallback provider (creates model from fallback)
  console.log('\nUsing fallback provider...');
  const fallbackResult = await generateText({
    model: myProvider.languageModel('sonnet'), // Not in custom models, uses fallback
    prompt: 'Explain async/await in JavaScript.',
  });
  console.log('Response:', fallbackResult.text);
}

/**
 * Example 3: Multi-provider setup
 */
async function exampleMultiProvider() {
  console.log('\n=== Example 3: Multiple Provider Instances ===\n');

  // Create different provider instances with different configs
  const provider1 = createClaudeProvider({
    // Provider 1 config
  });

  const provider2 = createClaudeProvider({
    // Provider 2 config (could have different settings)
  });

  // Use providers directly
  const model1 = provider1.languageModel('sonnet');
  const model2 = provider2.languageModel('haiku');

  console.log('Using provider 1 (sonnet)...');
  const result1 = await generateText({
    model: model1,
    prompt: 'What is React?',
  });
  console.log('Response:', result1.text);

  console.log('\nUsing provider 2 (haiku)...');
  const result2 = await generateText({
    model: model2,
    prompt: 'What is Vue?',
  });
  console.log('Response:', result2.text);
}

/**
 * Main execution
 */
async function main() {
  try {
    await exampleCustomAliases();
    await exampleWithFallback();
    await exampleMultiProvider();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  main();
}

