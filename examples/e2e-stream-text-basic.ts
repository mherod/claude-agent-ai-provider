/**
 * E2E Example: Basic text streaming with streamText()
 *
 * This example demonstrates:
 * - Basic text streaming
 * - textStream vs fullStream
 * - Streaming with system prompts
 * - Monitoring stream progress
 */

import { streamText } from 'ai';
import { claude } from '../index.ts';

async function basicStreaming() {
  console.log('=== Example 1: Basic Text Streaming ===\n');

  const { textStream } = streamText({
    model: claude('sonnet'),
    prompt: 'Count from 1 to 10 slowly, with a brief comment about each number.',
  });

  process.stdout.write('Response: ');
  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
  console.log('\n');
}

async function fullStreamExample() {
  console.log('\n=== Example 2: Full Stream with All Events ===\n');

  const { fullStream } = streamText({
    model: claude('sonnet'),
    prompt: 'Write a haiku about artificial intelligence.',
  });

  let fullText = '';

  for await (const part of fullStream) {
    switch (part.type) {
      case 'start':
        console.log('[Stream Started]');
        break;

      case 'text':
        process.stdout.write(part.text);
        fullText += part.text;
        break;

      case 'finish':
        console.log('\n\n[Stream Finished]');
        console.log('Finish Reason:', part.finishReason);
        console.log('Total Usage:', part.totalUsage);
        break;

      case 'error':
        console.error('[Error]:', part.error);
        break;
    }
  }
}

async function streamingWithSystemPrompt() {
  console.log('\n=== Example 3: Streaming with System Prompt ===\n');

  const { textStream } = streamText({
    model: claude('haiku'),
    system: 'You are a helpful coding assistant. Explain concepts concisely with code examples.',
    prompt: 'Explain async/await in JavaScript.',
  });

  process.stdout.write('Assistant: ');
  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
  console.log('\n');
}

async function streamingWithCallbacks() {
  console.log('\n=== Example 4: Streaming with Callbacks ===\n');

  let chunkCount = 0;
  let textLength = 0;

  const result = streamText({
    model: claude('sonnet'),
    prompt: 'Describe the water cycle in 3 paragraphs.',
    onChunk: async (chunk) => {
      chunkCount++;
      if (chunk.type === 'text') {
        textLength += chunk.text.length;
      }
    },
    onFinish: async (result) => {
      console.log('\n\n[Finished]');
      console.log('Total chunks:', chunkCount);
      console.log('Total text length:', textLength);
      console.log('Finish reason:', result.finishReason);
      console.log('Token usage:', result.usage);
    },
  });

  process.stdout.write('Response: ');
  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }
  console.log('\n');
}

async function multipleStreamConsumption() {
  console.log('\n=== Example 5: Consuming Stream Multiple Ways ===\n');

  const result = streamText({
    model: claude('sonnet'),
    prompt: 'Write three interesting facts about space.',
  });

  // Option 1: Stream the text in real-time
  console.log('--- Streaming Output ---');
  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }

  // Option 2: Get the complete text (after streaming is done)
  const completeText = await result.text;
  console.log('\n\n--- Complete Text ---');
  console.log('Length:', completeText.length, 'characters');

  // Option 3: Get usage info
  const usage = await result.usage;
  console.log('\n--- Usage Info ---');
  console.log('Input tokens:', usage.inputTokens);
  console.log('Output tokens:', usage.outputTokens);
  console.log('Total tokens:', usage.totalTokens);
}

async function streamingConversation() {
  console.log('\n\n=== Example 6: Streaming Multi-Turn Conversation ===\n');

  const messages = [
    {
      role: 'user' as const,
      content: 'What is TypeScript?',
    },
    {
      role: 'assistant' as const,
      content: 'TypeScript is a strongly typed programming language that builds on JavaScript.',
    },
    {
      role: 'user' as const,
      content: 'What are its main benefits?',
    },
  ];

  const { textStream } = streamText({
    model: claude('sonnet'),
    messages,
  });

  process.stdout.write('Assistant: ');
  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
  console.log('\n');
}

async function streamWithTemperature() {
  console.log('\n=== Example 7: Streaming with Temperature Control ===\n');

  console.log('Low Temperature (0.3) - More Focused:');
  const lowTemp = streamText({
    model: claude('sonnet'),
    prompt: 'Write a creative story opening.',
    temperature: 0.3,
  });

  for await (const textPart of lowTemp.textStream) {
    process.stdout.write(textPart);
  }

  console.log('\n\nHigh Temperature (0.9) - More Creative:');
  const highTemp = streamText({
    model: claude('sonnet'),
    prompt: 'Write a creative story opening.',
    temperature: 0.9,
  });

  for await (const textPart of highTemp.textStream) {
    process.stdout.write(textPart);
  }
  console.log('\n');
}

async function main() {
  try {
    await basicStreaming();
    await fullStreamExample();
    await streamingWithSystemPrompt();
    await streamingWithCallbacks();
    await multipleStreamConsumption();
    await streamingConversation();
    await streamWithTemperature();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
