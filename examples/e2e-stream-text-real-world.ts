/**
 * E2E Example: Real-world streaming applications
 *
 * This example demonstrates:
 * - Chat applications
 * - Live code generation
 * - Real-time analysis
 * - Progressive content creation
 */

import { streamText, tool } from 'ai';
import { claude } from '../index.ts';
import { z } from 'zod';

async function chatbotSimulation() {
  console.log('=== Example 1: Chatbot with Streaming Responses ===\n');

  const conversationHistory = [
    { role: 'user' as const, content: 'Hi! I need help with my code.' },
    { role: 'assistant' as const, content: 'Hello! I\'d be happy to help with your code. What are you working on?' },
    { role: 'user' as const, content: 'I\'m trying to write a function that validates email addresses.' },
  ];

  const { textStream } = streamText({
    model: claude('sonnet'),
    system: 'You are a helpful coding assistant. Provide clear, concise answers with code examples.',
    messages: conversationHistory,
  });

  process.stdout.write('Assistant: ');
  for await (const text of textStream) {
    process.stdout.write(text);
    // Simulate streaming delay for realistic chat experience
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  console.log('\n');
}

async function liveCodeGeneration() {
  console.log('\n=== Example 2: Live Code Generation ===\n');

  const { fullStream } = streamText({
    model: claude('sonnet'),
    prompt: 'Write a TypeScript function to fetch user data from an API with error handling.',
    temperature: 0.3, // Lower temperature for more deterministic code
  });

  let codeBuffer = '';
  let inCodeBlock = false;

  console.log('Generating code...\n');

  for await (const part of fullStream) {
    if (part.type === 'text') {
      codeBuffer += part.text;

      // Detect code blocks
      if (part.text.includes('```')) {
        inCodeBlock = !inCodeBlock;
      }

      // Visual indicator for code vs explanation
      if (inCodeBlock) {
        process.stdout.write(part.text);
      } else {
        process.stdout.write(part.text);
      }
    }
  }

  console.log('\n\n[Code Generation Complete]');
  console.log('Total length:', codeBuffer.length, 'characters');
}

async function realTimeAnalysis() {
  console.log('\n\n=== Example 3: Real-Time Document Analysis ===\n');

  const document = `
    Sales Report Q4 2024

    Total Revenue: $1.2M (up 15% from Q3)
    New Customers: 450 (growth of 22%)
    Customer Retention: 94%
    Top Product: Widget Pro (35% of revenue)
    Challenges: Increased competition in the widget market
  `;

  const { fullStream } = streamText({
    model: claude('sonnet'),
    prompt: `Analyze this sales report and provide key insights:\n\n${document}`,
    tools: {
      extractMetric: tool({
        description: 'Extract a specific metric from the data',
        parameters: z.object({
          metric: z.string(),
          value: z.string(),
          trend: z.enum(['up', 'down', 'stable']),
        }),
        execute: async ({ metric, value, trend }) => {
          console.log(`\n[Metric Extracted] ${metric}: ${value} (${trend})`);
          return { metric, value, trend };
        },
      }),
    },
  });

  let insights = '';

  for await (const part of fullStream) {
    if (part.type === 'text') {
      insights += part.text;
      process.stdout.write(part.text);
    }
  }

  console.log('\n\n[Analysis Complete]');
}

async function progressiveContentCreation() {
  console.log('\n\n=== Example 4: Progressive Content Creation ===\n');

  const { fullStream, onFinish } = streamText({
    model: claude('sonnet'),
    prompt: 'Write a technical blog post about serverless computing (about 3 paragraphs).',
    onStepFinish: async (step) => {
      // Track progress
      const progress = Math.min(100, (step.usage.outputTokens ?? 0) / 5); // Rough estimate
      console.log(`\n[Progress: ${progress.toFixed(0)}%]`);
    },
  });

  let wordCount = 0;
  let paragraphs = 0;

  console.log('Creating content...\n');
  console.log('---\n');

  for await (const part of fullStream) {
    if (part.type === 'text') {
      process.stdout.write(part.text);

      // Count words and paragraphs in real-time
      wordCount += part.text.split(/\s+/).filter(w => w.length > 0).length;
      if (part.text.includes('\n\n')) {
        paragraphs++;
      }
    }
  }

  console.log('\n\n---');
  console.log(`\n[Content Stats]`);
  console.log(`  Words: ~${wordCount}`);
  console.log(`  Paragraphs: ~${paragraphs}`);
}

async function streamingWithErrorHandling() {
  console.log('\n\n=== Example 5: Streaming with Error Handling ===\n');

  try {
    const { fullStream } = streamText({
      model: claude('sonnet'),
      prompt: 'Explain quantum computing.',
      onError: async (error) => {
        console.error('\n[Error Occurred]:', error);
      },
    });

    for await (const part of fullStream) {
      if (part.type === 'text') {
        process.stdout.write(part.text);
      } else if (part.type === 'error') {
        console.error('\n[Stream Error]:', part.error);
      }
    }
  } catch (error) {
    console.error('\n[Fatal Error]:', error);
  }

  console.log('\n');
}

async function interactiveAssistant() {
  console.log('\n=== Example 6: Interactive Code Assistant ===\n');

  const { fullStream } = streamText({
    model: claude('sonnet'),
    prompt: 'Help me fix this code: const x = [1,2,3]; console.log(x[5].toUpperCase());',
    tools: {
      analyzeCode: tool({
        description: 'Analyze code for issues',
        parameters: z.object({
          code: z.string(),
          issueType: z.string(),
        }),
        execute: async ({ code, issueType }) => {
          console.log(`\n[Analyzing] Issue type: ${issueType}`);
          return {
            issueType,
            severity: 'error',
            line: 1,
            message: 'Cannot call toUpperCase on undefined (array index out of bounds)',
          };
        },
      }),
      suggestFix: tool({
        description: 'Suggest a code fix',
        parameters: z.object({
          issue: z.string(),
          suggestion: z.string(),
        }),
        execute: async ({ issue, suggestion }) => {
          console.log(`\n[Suggestion] ${suggestion}`);
          return { issue, suggestion, confidence: 'high' };
        },
      }),
    },
  });

  console.log('Assistant: ');
  for await (const part of fullStream) {
    if (part.type === 'text') {
      process.stdout.write(part.text);
    }
  }
  console.log('\n');
}

async function streamingMarkdownRenderer() {
  console.log('\n=== Example 7: Streaming Markdown Content ===\n');

  const { fullStream } = streamText({
    model: claude('sonnet'),
    prompt: 'Create a README.md file for a TypeScript project that uses AI SDK.',
  });

  let content = '';
  let headingCount = 0;
  let codeBlockCount = 0;

  console.log('[Rendering Markdown]\n');

  for await (const part of fullStream) {
    if (part.type === 'text') {
      content += part.text;

      // Count markdown elements as they stream
      if (part.text.match(/^#{1,6}\s/m)) {
        headingCount++;
      }
      if (part.text.includes('```')) {
        codeBlockCount++;
      }

      process.stdout.write(part.text);
    } else if (part.type === 'finish') {
      console.log('\n\n[Markdown Stats]');
      console.log(`  Headings: ${headingCount}`);
      console.log(`  Code Blocks: ${Math.floor(codeBlockCount / 2)}`); // Each block has 2 backticks
      console.log(`  Total Size: ${content.length} chars`);
    }
  }
  console.log('');
}

async function streamingWithAbort() {
  console.log('\n=== Example 8: Streaming with Abort Control ===\n');

  const abortController = new AbortController();

  // Set up auto-abort after 2 seconds
  const timeoutId = setTimeout(() => {
    console.log('\n\n[Aborting stream after 2 seconds...]');
    abortController.abort();
  }, 2000);

  try {
    const { fullStream } = streamText({
      model: claude('sonnet'),
      prompt: 'Write a very long essay about the history of computing (at least 1000 words).',
      abortSignal: abortController.signal,
      onAbort: async () => {
        console.log('\n[Stream was aborted]');
      },
    });

    console.log('Streaming (will abort after 2 seconds):\n');

    for await (const part of fullStream) {
      if (part.type === 'text') {
        process.stdout.write(part.text);
      } else if (part.type === 'abort') {
        console.log('\n[Abort event received]');
        break;
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('\n[Stream successfully aborted]');
    } else {
      throw error;
    }
  } finally {
    clearTimeout(timeoutId);
  }

  console.log('');
}

async function main() {
  try {
    await chatbotSimulation();
    await liveCodeGeneration();
    await realTimeAnalysis();
    await progressiveContentCreation();
    await streamingWithErrorHandling();
    await interactiveAssistant();
    await streamingMarkdownRenderer();
    await streamingWithAbort();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
