/**
 * E2E Example: Advanced Tool Calling Features
 *
 * This example demonstrates advanced tool calling capabilities:
 * - stopWhen conditions for controlling multi-step execution
 * - prepareStep callback for customizing each step
 * - Tool input lifecycle hooks (onInputStart, onInputDelta, onInputAvailable)
 * - Preliminary tool results with AsyncIterable/generators
 * - Active tools for limiting available tools
 * - Context passing to tools
 * - Tool execution options (messages, abort signals)
 */

import { generateText, streamText, tool, stepCountIs } from 'ai';
import { claude } from '../index.ts';
import { z } from 'zod';

async function stopWhenExample() {
  console.log('=== Example 1: stopWhen Conditions ===\n');

  const { text, steps } = await generateText({
    model: claude('sonnet'),
    tools: {
      searchDatabase: tool({
        description: 'Search the database for information',
        inputSchema: z.object({
          query: z.string(),
        }),
        execute: async ({ query }) => {
          console.log(`[Tool] Searching database for: ${query}`);
          return {
            results: [
              { id: 1, name: 'Product A', price: 99.99 },
              { id: 2, name: 'Product B', price: 149.99 },
            ],
          };
        },
      }),
      calculateTotal: tool({
        description: 'Calculate total price',
        inputSchema: z.object({
          prices: z.array(z.number()),
        }),
        execute: async ({ prices }) => {
          const total = prices.reduce((sum, price) => sum + price, 0);
          console.log(`[Tool] Calculated total: $${total}`);
          return { total };
        },
      }),
    },
    stopWhen: stepCountIs(5), // Stop after maximum 5 steps
    prompt: 'Find products in the database and calculate their total price.',
  });

  console.log('\n--- Response ---');
  console.log(text);
  console.log(`\n--- Steps: ${steps.length} ---`);
  steps.forEach((step, i) => {
    console.log(`Step ${i + 1}:`);
    console.log(`  Tool Calls: ${step.toolCalls.length}`);
    console.log(`  Tool Results: ${step.toolResults.length}`);
    console.log(`  Finish Reason: ${step.finishReason}`);
  });
}

async function prepareStepExample() {
  console.log('\n\n=== Example 2: prepareStep Callback ===\n');

  let stepExecutions = 0;

  const { text, steps } = await generateText({
    model: claude('sonnet'),
    tools: {
      analyzeData: tool({
        description: 'Analyze data with specific parameters',
        inputSchema: z.object({
          dataset: z.string(),
          depth: z.enum(['shallow', 'deep']),
        }),
        execute: async ({ dataset, depth }) => {
          console.log(`[Tool] Analyzing ${dataset} with ${depth} analysis`);
          return {
            dataset,
            depth,
            insights: ['Insight 1', 'Insight 2', 'Insight 3'],
          };
        },
      }),
      validateResults: tool({
        description: 'Validate analysis results',
        inputSchema: z.object({
          results: z.array(z.string()),
        }),
        execute: async ({ results }) => {
          console.log(`[Tool] Validating ${results.length} results`);
          return { valid: true, count: results.length };
        },
      }),
    },
    prepareStep: async ({ stepNumber, steps, messages }) => {
      stepExecutions++;
      console.log(`\n[prepareStep] Preparing step ${stepNumber + 1}`);
      console.log(`  Previous steps: ${steps.length}`);
      console.log(`  Messages in history: ${messages.length}`);

      if (stepNumber === 0) {
        // First step: force using analyzeData tool
        return {
          toolChoice: { type: 'tool', toolName: 'analyzeData' },
        };
      }

      if (stepNumber === 1) {
        // Second step: limit to only validateResults tool
        return {
          activeTools: ['validateResults'],
        };
      }

      // Compress message history for longer conversations
      if (messages.length > 10) {
        console.log('  Compressing message history...');
        return {
          messages: messages.slice(-5), // Keep only last 5 messages
        };
      }

      return {};
    },
    stopWhen: stepCountIs(3),
    prompt: 'Analyze the sales dataset and validate the results.',
  });

  console.log('\n--- Response ---');
  console.log(text);
  console.log(`\n--- Stats ---`);
  console.log(`Steps executed: ${steps.length}`);
  console.log(`prepareStep calls: ${stepExecutions}`);
}

async function toolInputLifecycleHooks() {
  console.log('\n\n=== Example 3: Tool Input Lifecycle Hooks ===\n');

  const result = streamText({
    model: claude('sonnet'),
    tools: {
      fetchUserData: tool({
        description: 'Fetch user data from API',
        inputSchema: z.object({
          userId: z.string(),
          includeOrders: z.boolean(),
          includePreferences: z.boolean(),
        }),
        onInputStart: () => {
          console.log('[Hook] Tool input generation started');
        },
        onInputDelta: ({ inputTextDelta }) => {
          process.stdout.write('.');
        },
        onInputAvailable: ({ input }) => {
          console.log('\n[Hook] Complete input received:');
          console.log(JSON.stringify(input, null, 2));
        },
        execute: async ({ userId, includeOrders, includePreferences }) => {
          console.log(`[Tool] Fetching data for user ${userId}`);
          await new Promise(resolve => setTimeout(resolve, 500));
          return {
            userId,
            name: 'John Doe',
            email: 'john@example.com',
            orders: includeOrders ? ['order1', 'order2'] : undefined,
            preferences: includePreferences ? { theme: 'dark' } : undefined,
          };
        },
      }),
    },
    prompt: 'Get user data for user ID "user123" including their orders and preferences.',
  });

  console.log('Streaming response:');
  for await (const part of result.fullStream) {
    if (part.type === 'text') {
      process.stdout.write(part.text);
    }
  }
  console.log('\n');
}

async function preliminaryToolResults() {
  console.log('\n\n=== Example 4: Preliminary Tool Results (Streaming Progress) ===\n');

  const result = streamText({
    model: claude('sonnet'),
    tools: {
      processLargeFile: tool({
        description: 'Process a large file with progress updates',
        inputSchema: z.object({
          filename: z.string(),
          operation: z.enum(['compress', 'encrypt', 'analyze']),
        }),
        async *execute({ filename, operation }) {
          console.log(`\n[Tool] Starting ${operation} on ${filename}`);

          // Yield preliminary status updates
          yield {
            status: 'starting' as const,
            progress: 0,
            message: `Initializing ${operation}...`,
            result: undefined,
          };

          await new Promise(resolve => setTimeout(resolve, 1000));

          yield {
            status: 'in-progress' as const,
            progress: 30,
            message: `${operation} in progress...`,
            result: undefined,
          };

          await new Promise(resolve => setTimeout(resolve, 1000));

          yield {
            status: 'in-progress' as const,
            progress: 70,
            message: `Almost done with ${operation}...`,
            result: undefined,
          };

          await new Promise(resolve => setTimeout(resolve, 1000));

          // Final result
          yield {
            status: 'complete' as const,
            progress: 100,
            message: `${operation} completed successfully`,
            result: {
              filename,
              operation,
              outputSize: '1.2 MB',
              duration: '3.0s',
            },
          };
        },
      }),
    },
    prompt: 'Process the file "large-dataset.csv" using compression.',
  });

  console.log('Watching tool execution progress:\n');
  for await (const part of result.fullStream) {
    if (part.type === 'tool-result') {
      const output = part.output as any;
      if (output.status) {
        console.log(`[${output.status.toUpperCase()}] ${output.progress}% - ${output.message}`);
      }
    } else if (part.type === 'text') {
      process.stdout.write(part.text);
    }
  }
  console.log('\n');
}

async function activeToolsExample() {
  console.log('\n\n=== Example 5: Active Tools (Limiting Available Tools) ===\n');

  const allTools = {
    readFile: tool({
      description: 'Read a file from disk',
      inputSchema: z.object({ path: z.string() }),
      execute: async ({ path }) => {
        console.log(`[Tool] Reading file: ${path}`);
        return { content: 'File contents here...', size: 1024 };
      },
    }),
    writeFile: tool({
      description: 'Write a file to disk',
      inputSchema: z.object({
        path: z.string(),
        content: z.string(),
      }),
      execute: async ({ path, content }) => {
        console.log(`[Tool] Writing file: ${path}`);
        return { success: true, bytesWritten: content.length };
      },
    }),
    deleteFile: tool({
      description: 'Delete a file from disk',
      inputSchema: z.object({ path: z.string() }),
      execute: async ({ path }) => {
        console.log(`[Tool] Deleting file: ${path}`);
        return { success: true, deleted: path };
      },
    }),
    listFiles: tool({
      description: 'List files in a directory',
      inputSchema: z.object({ directory: z.string() }),
      execute: async ({ directory }) => {
        console.log(`[Tool] Listing files in: ${directory}`);
        return { files: ['file1.txt', 'file2.txt', 'file3.txt'] };
      },
    }),
  };

  // Only allow read-only operations
  const { text } = await generateText({
    model: claude('sonnet'),
    tools: allTools,
    activeTools: ['readFile', 'listFiles'], // Limit to read-only tools
    prompt: 'List the files in /data directory and read file1.txt',
  });

  console.log('Response:');
  console.log(text);
}

async function contextPassingExample() {
  console.log('\n\n=== Example 6: Context Passing to Tools ===\n');

  interface AppContext {
    userId: string;
    sessionId: string;
    permissions: string[];
  }

  const context: AppContext = {
    userId: 'user-123',
    sessionId: 'session-456',
    permissions: ['read', 'write'],
  };

  const { text } = await generateText({
    model: claude('sonnet'),
    tools: {
      accessResource: tool({
        description: 'Access a protected resource',
        inputSchema: z.object({
          resourceId: z.string(),
          action: z.enum(['read', 'write', 'delete']),
        }),
        execute: async ({ resourceId, action }, { experimental_context }) => {
          const ctx = experimental_context as AppContext;

          console.log(`[Tool] User ${ctx.userId} attempting ${action} on ${resourceId}`);
          console.log(`  Session: ${ctx.sessionId}`);
          console.log(`  Permissions: ${ctx.permissions.join(', ')}`);

          if (!ctx.permissions.includes(action)) {
            return {
              success: false,
              error: `Permission denied: ${action} not allowed`,
            };
          }

          return {
            success: true,
            resourceId,
            action,
            timestamp: new Date().toISOString(),
          };
        },
      }),
    },
    experimental_context: context,
    prompt: 'Read the resource "document-789"',
  });

  console.log('\nResponse:');
  console.log(text);
}

async function toolExecutionOptionsExample() {
  console.log('\n\n=== Example 7: Tool Execution Options (Messages & Abort Signal) ===\n');

  const abortController = new AbortController();

  // Simulate aborting after 2 seconds
  const timeoutId = setTimeout(() => {
    console.log('\n[Abort] Aborting long-running tool...\n');
    abortController.abort();
  }, 2000);

  try {
    const { text } = await generateText({
      model: claude('sonnet'),
      abortSignal: abortController.signal,
      tools: {
        fetchExternalData: tool({
          description: 'Fetch data from external API',
          inputSchema: z.object({ endpoint: z.string() }),
          execute: async ({ endpoint }, { abortSignal, messages }) => {
            console.log(`[Tool] Fetching from ${endpoint}`);
            console.log(`  Message history length: ${messages.length}`);

            // Simulate long-running fetch
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(resolve, 5000);

              abortSignal?.addEventListener('abort', () => {
                clearTimeout(timeout);
                reject(new Error('Fetch aborted'));
              });
            });

            return { data: 'Large dataset...', size: '10MB' };
          },
        }),
      },
      prompt: 'Fetch data from the external API endpoint "/api/large-dataset"',
    });

    console.log('Response:');
    console.log(text);
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message.includes('abort')) {
      console.log('[Result] Tool execution was successfully aborted');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

async function responseMessagesExample() {
  console.log('\n\n=== Example 8: Response Messages (Conversation History) ===\n');

  const messages: any[] = [
    {
      role: 'user',
      content: 'What tools do you have available?',
    },
  ];

  const { response, text } = await generateText({
    model: claude('sonnet'),
    messages,
    tools: {
      getTool: tool({
        description: 'Get information about available tools',
        inputSchema: z.object({ category: z.string() }),
        execute: async ({ category }) => {
          return {
            tools: ['analyzeData', 'generateReport', 'sendNotification'],
            category,
          };
        },
      }),
    },
    stopWhen: stepCountIs(2),
  });

  console.log('Initial response:', text);

  // Add response messages to conversation history
  messages.push(...response.messages);

  console.log(`\nConversation history now has ${messages.length} messages`);
  console.log('Message types:', messages.map(m => m.role).join(' -> '));

  // Continue the conversation
  messages.push({
    role: 'user',
    content: 'Use the getTool function to show me the data analysis tools.',
  });

  const { text: text2 } = await generateText({
    model: claude('sonnet'),
    messages,
    tools: {
      getTool: tool({
        description: 'Get information about available tools',
        inputSchema: z.object({ category: z.string() }),
        execute: async ({ category }) => {
          return {
            tools: ['analyzeData', 'generateReport', 'sendNotification'],
            category,
          };
        },
      }),
    },
  });

  console.log('\nFollow-up response:', text2);
}

async function main() {
  try {
    await stopWhenExample();
    await prepareStepExample();
    await toolInputLifecycleHooks();
    await preliminaryToolResults();
    await activeToolsExample();
    await contextPassingExample();
    await toolExecutionOptionsExample();
    await responseMessagesExample();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
