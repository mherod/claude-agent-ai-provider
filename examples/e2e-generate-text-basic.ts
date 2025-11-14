/**
 * E2E Example: Basic text generation with generateText()
 *
 * This example demonstrates:
 * - Simple text generation
 * - System prompts
 * - Usage tracking
 */

import { generateText } from 'ai';
import { claude } from '../index.ts';

async function basicGeneration() {
  console.log('=== Example 1: Simple Text Generation ===\n');

  const result = await generateText({
    model: claude('sonnet'),
    prompt: 'Explain what TypeScript is in 2 sentences.',
  });

  console.log('Generated Text:', result.text);
  console.log('\nFinish Reason:', result.finishReason);
  console.log('Usage:', result.usage);
  console.log('Total Usage:', result.totalUsage);
}

async function generationWithSystemPrompt() {
  console.log('\n\n=== Example 2: Generation with System Prompt ===\n');

  const result = await generateText({
    model: claude('haiku'),
    system: 'You are a helpful assistant that explains technical concepts in simple terms suitable for beginners.',
    prompt: 'What is an API?',
  });

  console.log('Generated Text:', result.text);
  console.log('\nUsage:', result.usage);
}

async function generationWithMessages() {
  console.log('\n\n=== Example 3: Generation with Conversation History ===\n');

  const result = await generateText({
    model: claude('sonnet'),
    messages: [
      {
        role: 'user',
        content: 'What is your favorite programming language?',
      },
      {
        role: 'assistant',
        content: 'I don\'t have personal preferences, but I can help you learn about many programming languages!',
      },
      {
        role: 'user',
        content: 'Tell me about JavaScript then.',
      },
    ],
  });

  console.log('Generated Text:', result.text);
  console.log('\nUsage:', result.usage);
}

async function generationWithSettings() {
  console.log('\n\n=== Example 4: Generation with Custom Settings ===\n');

  const result = await generateText({
    model: claude('sonnet'),
    prompt: 'Write a creative story opening about a robot.',
    temperature: 0.9,
    maxOutputTokens: 150,
  });

  console.log('Generated Text:', result.text);
  console.log('\nFinish Reason:', result.finishReason);
  console.log('Usage:', result.usage);
}

async function main() {
  try {
    await basicGeneration();
    await generationWithSystemPrompt();
    await generationWithMessages();
    await generationWithSettings();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
