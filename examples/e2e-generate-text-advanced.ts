/**
 * E2E Example: Advanced generateText() features
 *
 * This example demonstrates:
 * - onStepFinish callback
 * - Error handling
 * - Abort signals
 * - Multi-step workflows
 */

import { generateText, tool } from 'ai';
import { claude } from '../index.ts';
import { z } from 'zod';

async function onStepFinishExample() {
  console.log('=== Example 1: Step Monitoring with onStepFinish ===\n');

  const steps: any[] = [];

  const result = await generateText({
    model: claude('sonnet'),
    prompt: 'Calculate 10 + 5, then multiply the result by 2.',
    tools: {
      calculate: tool({
        description: 'Perform arithmetic operations',
        parameters: z.object({
          operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
          a: z.number(),
          b: z.number(),
        }),
        execute: async ({ operation, a, b }) => {
          const operations = {
            add: a + b,
            subtract: a - b,
            multiply: a * b,
            divide: a / b,
          };
          return { result: operations[operation] };
        },
      }),
    },
    maxSteps: 5,
    onStepFinish: async (step) => {
      console.log(`\n[Step ${steps.length + 1} Finished]`);
      console.log('  Finish Reason:', step.finishReason);
      console.log('  Text Length:', step.text.length);
      console.log('  Tool Calls:', step.toolCalls.length);
      console.log('  Usage:', step.usage);
      steps.push(step);
    },
  });

  console.log('\n--- Final Result ---');
  console.log('Generated Text:', result.text);
  console.log('Total Steps:', steps.length);
  console.log('Total Usage:', result.totalUsage);
}

async function errorHandlingExample() {
  console.log('\n\n=== Example 2: Error Handling in Tools ===\n');

  const result = await generateText({
    model: claude('sonnet'),
    prompt: 'Divide 100 by 0 and tell me the result.',
    tools: {
      divide: tool({
        description: 'Divide two numbers',
        parameters: z.object({
          dividend: z.number(),
          divisor: z.number(),
        }),
        execute: async ({ dividend, divisor }) => {
          if (divisor === 0) {
            throw new Error('Cannot divide by zero');
          }
          return { result: dividend / divisor };
        },
      }),
    },
  });

  console.log('Generated Text:', result.text);
  console.log('Finish Reason:', result.finishReason);
}

async function abortSignalExample() {
  console.log('\n\n=== Example 3: Abort Signal ===\n');

  const abortController = new AbortController();

  // Set timeout to abort after 5 seconds
  const timeoutId = setTimeout(() => {
    console.log('\n[Aborting request after 5 seconds]');
    abortController.abort();
  }, 5000);

  try {
    const result = await generateText({
      model: claude('sonnet'),
      prompt: 'Write a very long story about artificial intelligence.',
      maxOutputTokens: 2000,
      abortSignal: abortController.signal,
    });

    clearTimeout(timeoutId);
    console.log('Generated Text:', result.text);
    console.log('Completed successfully');
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.log('Request was aborted as expected');
    } else {
      throw error;
    }
  }
}

async function complexWorkflowExample() {
  console.log('\n\n=== Example 4: Complex Multi-Step Workflow ===\n');

  const database = {
    users: [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
    ],
    orders: [
      { id: 101, userId: 1, product: 'Laptop', price: 999 },
      { id: 102, userId: 2, product: 'Mouse', price: 25 },
      { id: 103, userId: 1, product: 'Keyboard', price: 75 },
    ],
  };

  const result = await generateText({
    model: claude('sonnet'),
    prompt: 'Find all orders for user Alice and calculate the total amount spent.',
    tools: {
      getUserByName: tool({
        description: 'Get user information by name',
        parameters: z.object({
          name: z.string(),
        }),
        execute: async ({ name }) => {
          console.log(`[DB Query] Finding user: ${name}`);
          const user = database.users.find(u =>
            u.name.toLowerCase() === name.toLowerCase()
          );
          return user || null;
        },
      }),
      getOrdersByUserId: tool({
        description: 'Get all orders for a user by their ID',
        parameters: z.object({
          userId: z.number(),
        }),
        execute: async ({ userId }) => {
          console.log(`[DB Query] Finding orders for user ID: ${userId}`);
          return database.orders.filter(o => o.userId === userId);
        },
      }),
      calculateTotal: tool({
        description: 'Calculate the total price from a list of prices',
        parameters: z.object({
          prices: z.array(z.number()),
        }),
        execute: async ({ prices }) => {
          console.log(`[Calculation] Summing prices: ${prices.join(', ')}`);
          return { total: prices.reduce((sum, price) => sum + price, 0) };
        },
      }),
    },
    maxSteps: 10,
  });

  console.log('\n--- Final Result ---');
  console.log('Generated Text:', result.text);
  console.log('\nExecution Summary:');
  console.log('  Total Steps:', result.steps.length);
  console.log('  Total Tool Calls:', result.toolCalls.length);
  console.log('  Total Usage:', result.totalUsage);

  console.log('\n--- Step Details ---');
  result.steps.forEach((step, index) => {
    if (step.toolCalls.length > 0) {
      console.log(`\nStep ${index + 1}:`);
      step.toolCalls.forEach((call: any) => {
        console.log(`  - ${call.toolName}(${JSON.stringify(call.args)})`);
      });
    }
  });
}

async function stopSequencesExample() {
  console.log('\n\n=== Example 5: Stop Sequences ===\n');

  const result = await generateText({
    model: claude('sonnet'),
    prompt: 'List programming languages:\n1.',
    stopSequences: ['\n5.'], // Stop after listing 4 items
    maxOutputTokens: 200,
  });

  console.log('Generated Text:', result.text);
  console.log('\nFinish Reason:', result.finishReason);
  console.log('Usage:', result.usage);
}

async function main() {
  try {
    await onStepFinishExample();
    await errorHandlingExample();
    await abortSignalExample();
    await complexWorkflowExample();
    await stopSequencesExample();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
