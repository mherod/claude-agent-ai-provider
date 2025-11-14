/**
 * Basic usage example of the Claude Agent AI Provider
 */

import { claude } from '../index.ts';

// Example 1: Simple text generation
async function simpleGeneration() {
  console.log('=== Example 1: Simple Generation ===\n');

  const model = claude('sonnet');

  const result = await model.doGenerate({
    prompt: [
      {
        role: 'user',
        content: [{ type: 'text', text: 'Hello! Tell me about TypeScript.' }],
      },
    ],
  });

  console.log('Response:', result.content);
  console.log('Finish Reason:', result.finishReason);
  console.log('Usage:', result.usage);
}

// Example 2: Streaming generation
async function streamingGeneration() {
  console.log('\n=== Example 2: Streaming Generation ===\n');

  const model = claude('sonnet');

  const result = await model.doStream({
    prompt: [
      {
        role: 'user',
        content: [{ type: 'text', text: 'Count from 1 to 5.' }],
      },
    ],
  });

  // Read the stream
  const reader = result.stream.getReader();
  let done = false;

  while (!done) {
    const { value, done: streamDone } = await reader.read();
    done = streamDone;

    if (value) {
      if (value.type === 'text-delta') {
        process.stdout.write(value.delta);
      } else if (value.type === 'finish') {
        console.log('\n\nFinish Reason:', value.finishReason);
        console.log('Usage:', value.usage);
      }
    }
  }
}

// Example 3: With system prompt
async function withSystemPrompt() {
  console.log('\n=== Example 3: With System Prompt ===\n');

  const model = claude('haiku');

  const result = await model.doGenerate({
    prompt: [
      {
        role: 'system',
        content: 'You are a helpful assistant that speaks like a pirate.',
      },
      {
        role: 'user',
        content: [{ type: 'text', text: 'Hello! How are you today?' }],
      },
    ],
  });

  console.log('Response:', result.content);
}

// Run examples
async function main() {
  try {
    await simpleGeneration();
    await streamingGeneration();
    await withSystemPrompt();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
