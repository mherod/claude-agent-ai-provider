/**
 * E2E Example: Streaming with tools
 *
 * This example demonstrates:
 * - Tool calling during streaming
 * - Monitoring tool execution in streams
 * - Multi-step streaming workflows
 * - Real-time progress updates
 */

import { streamText, tool } from 'ai';
import { claude } from '../index.ts';
import { z } from 'zod';

async function streamingWithSingleTool() {
  console.log('=== Example 1: Streaming with Single Tool ===\n');

  const { fullStream } = streamText({
    model: claude('sonnet'),
    prompt: 'What is the weather in San Francisco?',
    tools: {
      getWeather: tool({
        description: 'Get the current weather for a location',
        parameters: z.object({
          location: z.string(),
        }),
        execute: async ({ location }) => {
          console.log(`\n[Tool Executing] Getting weather for ${location}...`);
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
          return {
            location,
            temperature: 72,
            condition: 'Sunny',
            humidity: 65,
          };
        },
      }),
    },
  });

  for await (const part of fullStream) {
    switch (part.type) {
      case 'text':
        process.stdout.write(part.text);
        break;

      case 'tool-call':
        console.log(`\n[Tool Call] ${part.toolName}(${JSON.stringify(part.input)})`);
        break;

      case 'tool-result':
        console.log(`[Tool Result] ${part.toolName}:`, part.output);
        console.log('');
        break;

      case 'finish':
        console.log('\n[Finish Reason]:', part.finishReason);
        break;
    }
  }
  console.log('\n');
}

async function streamingWithMultipleTools() {
  console.log('\n=== Example 2: Streaming with Multiple Tools ===\n');

  const { fullStream } = streamText({
    model: claude('sonnet'),
    prompt: 'Search for "TypeScript tutorial" and analyze the first result.',
    tools: {
      webSearch: tool({
        description: 'Search the web for information',
        parameters: z.object({
          query: z.string(),
        }),
        execute: async ({ query }) => {
          console.log(`\n[Search] Searching for: "${query}"...`);
          return {
            results: [
              {
                title: 'TypeScript Official Documentation',
                url: 'https://www.typescriptlang.org/docs/',
                snippet: 'Learn TypeScript from the official documentation...',
              },
            ],
          };
        },
      }),
      analyzeContent: tool({
        description: 'Analyze web content',
        parameters: z.object({
          url: z.string(),
          aspects: z.array(z.string()),
        }),
        execute: async ({ url, aspects }) => {
          console.log(`\n[Analyze] Analyzing ${url} for:`, aspects.join(', '));
          return {
            url,
            summary: 'Comprehensive TypeScript guide with examples',
            quality: 'high',
            readability: 'excellent',
          };
        },
      }),
    },
    maxSteps: 5,
  });

  let stepCount = 0;

  for await (const part of fullStream) {
    switch (part.type) {
      case 'start-step':
        stepCount++;
        console.log(`\n--- Step ${stepCount} Started ---`);
        break;

      case 'text':
        process.stdout.write(part.text);
        break;

      case 'tool-call':
        console.log(`\n[Tool Call] ${part.toolName}`);
        break;

      case 'tool-result':
        console.log(`[Tool Result] ✓`);
        break;

      case 'finish-step':
        console.log(`\n--- Step ${stepCount} Finished (${part.finishReason}) ---`);
        break;
    }
  }
  console.log('\n');
}

async function streamingProgress() {
  console.log('\n=== Example 3: Real-Time Progress Monitoring ===\n');

  const startTime = Date.now();
  let textChunks = 0;
  let toolCalls = 0;

  const { fullStream } = streamText({
    model: claude('sonnet'),
    prompt: 'Calculate the fibonacci sequence up to 10 numbers and explain the pattern.',
    tools: {
      fibonacci: tool({
        description: 'Calculate fibonacci numbers',
        parameters: z.object({
          count: z.number().describe('How many fibonacci numbers to generate'),
        }),
        execute: async ({ count }) => {
          const fib = [0, 1];
          for (let i = 2; i < count; i++) {
            fib.push(fib[i - 1] + fib[i - 2]);
          }
          return { sequence: fib };
        },
      }),
    },
    onStepFinish: async (step) => {
      const elapsed = Date.now() - startTime;
      console.log(`\n[Step Finished]`);
      console.log(`  Time elapsed: ${elapsed}ms`);
      console.log(`  Tokens used: ${step.usage.totalTokens}`);
      console.log(`  Text length: ${step.text.length} chars`);
    },
  });

  console.log('[Progress]');
  for await (const part of fullStream) {
    if (part.type === 'text') {
      textChunks++;
      process.stdout.write('.');
    } else if (part.type === 'tool-call') {
      toolCalls++;
      process.stdout.write('T');
    }
  }

  console.log(`\n\n[Summary]`);
  console.log(`  Text chunks: ${textChunks}`);
  console.log(`  Tool calls: ${toolCalls}`);
  console.log(`  Total time: ${Date.now() - startTime}ms`);
  console.log('');
}

async function streamingWithToolChoice() {
  console.log('\n=== Example 4: Streaming with Tool Choice Control ===\n');

  const tools = {
    getCurrentTime: tool({
      description: 'Get the current time',
      parameters: z.object({}),
      execute: async () => {
        return { time: new Date().toISOString() };
      },
    }),
    getRandomQuote: tool({
      description: 'Get a random inspirational quote',
      parameters: z.object({}),
      execute: async () => {
        return { quote: 'The only way to do great work is to love what you do.' };
      },
    }),
  };

  // Force a specific tool
  console.log('Forcing getCurrentTime tool:');
  const { textStream: stream1 } = streamText({
    model: claude('sonnet'),
    prompt: 'Give me some information.',
    tools,
    toolChoice: {
      type: 'tool',
      toolName: 'getCurrentTime',
    },
  });

  for await (const text of stream1) {
    process.stdout.write(text);
  }

  console.log('\n\nRequiring any tool:');
  const { textStream: stream2 } = streamText({
    model: claude('sonnet'),
    prompt: 'Give me some information.',
    tools,
    toolChoice: 'required',
  });

  for await (const text of stream2) {
    process.stdout.write(text);
  }
  console.log('\n');
}

async function streamingPartialToolResults() {
  console.log('\n\n=== Example 5: Streaming with Partial Tool Results ===\n');

  const { fullStream } = streamText({
    model: claude('sonnet'),
    prompt: 'Process these items: analyze data, generate report, send notification.',
    tools: {
      processItem: tool({
        description: 'Process a specific item',
        parameters: z.object({
          item: z.string(),
          action: z.string(),
        }),
        execute: async ({ item, action }) => {
          console.log(`\n[Processing] ${action} for ${item}...`);
          // Simulate async processing
          await new Promise(resolve => setTimeout(resolve, 300));
          return {
            item,
            action,
            status: 'completed',
            timestamp: new Date().toISOString(),
          };
        },
      }),
    },
  });

  const processedItems: any[] = [];

  for await (const part of fullStream) {
    switch (part.type) {
      case 'text':
        process.stdout.write(part.text);
        break;

      case 'tool-call':
        console.log(`\n→ Tool Call: ${part.toolName}`);
        console.log(`  Input:`, part.input);
        break;

      case 'tool-result':
        console.log(`✓ Tool Result`);
        processedItems.push(part.output);
        break;

      case 'finish':
        console.log(`\n\n[Summary] Processed ${processedItems.length} items`);
        processedItems.forEach((item, i) => {
          console.log(`  ${i + 1}. ${item.item} - ${item.status}`);
        });
        break;
    }
  }
  console.log('');
}

async function main() {
  try {
    await streamingWithSingleTool();
    await streamingWithMultipleTools();
    await streamingProgress();
    await streamingWithToolChoice();
    await streamingPartialToolResults();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
