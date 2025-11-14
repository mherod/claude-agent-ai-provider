/**
 * E2E Example: Tool calling with generateText()
 *
 * This example demonstrates:
 * - Tool definition and execution
 * - Multi-step agent behavior
 * - Tool results handling
 */

import { generateText, tool } from 'ai';
import { claude } from '../index.ts';
import { z } from 'zod';

async function weatherToolExample() {
  console.log('=== Example 1: Single Tool Call ===\n');

  const result = await generateText({
    model: claude('sonnet'),
    prompt: 'What is the weather in San Francisco?',
    tools: {
      getWeather: tool({
        description: 'Get the current weather for a location',
        parameters: z.object({
          location: z.string().describe('The city and state, e.g. San Francisco, CA'),
          unit: z.enum(['celsius', 'fahrenheit']).optional().describe('The unit for temperature'),
        }),
        execute: async ({ location, unit = 'fahrenheit' }) => {
          console.log(`[Tool Execution] Getting weather for ${location} in ${unit}`);
          // Simulate API call
          return {
            location,
            temperature: unit === 'celsius' ? 22 : 72,
            unit,
            condition: 'Partly cloudy',
            humidity: 65,
          };
        },
      }),
    },
  });

  console.log('Generated Text:', result.text);
  console.log('\nTool Calls:', result.toolCalls);
  console.log('\nTool Results:', result.toolResults);
  console.log('\nUsage:', result.usage);
}

async function multipleToolsExample() {
  console.log('\n\n=== Example 2: Multiple Tools ===\n');

  const result = await generateText({
    model: claude('sonnet'),
    prompt: 'What is 25 + 17, and what is the square root of 144?',
    tools: {
      calculate: tool({
        description: 'Perform basic arithmetic operations',
        parameters: z.object({
          operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
          a: z.number(),
          b: z.number(),
        }),
        execute: async ({ operation, a, b }) => {
          console.log(`[Tool Execution] Calculating: ${a} ${operation} ${b}`);
          switch (operation) {
            case 'add': return { result: a + b };
            case 'subtract': return { result: a - b };
            case 'multiply': return { result: a * b };
            case 'divide': return { result: a / b };
          }
        },
      }),
      sqrt: tool({
        description: 'Calculate the square root of a number',
        parameters: z.object({
          number: z.number().describe('The number to find the square root of'),
        }),
        execute: async ({ number }) => {
          console.log(`[Tool Execution] Calculating sqrt(${number})`);
          return { result: Math.sqrt(number) };
        },
      }),
    },
  });

  console.log('Generated Text:', result.text);
  console.log('\nTool Calls Count:', result.toolCalls.length);
  console.log('\nTool Results:', result.toolResults);
  console.log('\nUsage:', result.usage);
}

async function multiStepToolExample() {
  console.log('\n\n=== Example 3: Multi-Step Agent with Tools ===\n');

  const result = await generateText({
    model: claude('sonnet'),
    prompt: 'Find the weather in New York and London, then tell me which one is warmer.',
    tools: {
      getWeather: tool({
        description: 'Get the current weather for a location',
        parameters: z.object({
          location: z.string().describe('The city name'),
        }),
        execute: async ({ location }) => {
          console.log(`[Tool Execution] Getting weather for ${location}`);
          // Simulate different temperatures
          const temps: Record<string, number> = {
            'New York': 68,
            'London': 59,
          };
          return {
            location,
            temperature: temps[location] || 70,
            unit: 'fahrenheit',
            condition: 'Clear',
          };
        },
      }),
    },
    maxSteps: 5, // Allow multiple tool call steps
  });

  console.log('Generated Text:', result.text);
  console.log('\nTotal Steps:', result.steps.length);
  console.log('\nTool Calls:', result.toolCalls);
  console.log('\nTotal Usage:', result.totalUsage);

  // Show step-by-step execution
  console.log('\n--- Step-by-Step Execution ---');
  result.steps.forEach((step, index) => {
    console.log(`\nStep ${index + 1}:`);
    console.log('  Tool Calls:', step.toolCalls.length);
    console.log('  Text:', step.text.substring(0, 100) + '...');
    console.log('  Finish Reason:', step.finishReason);
  });
}

async function toolChoiceExample() {
  console.log('\n\n=== Example 4: Tool Choice Control ===\n');

  const tools = {
    getCurrentTime: tool({
      description: 'Get the current time',
      parameters: z.object({}),
      execute: async () => {
        console.log('[Tool Execution] Getting current time');
        return { time: new Date().toISOString() };
      },
    }),
    getRandomNumber: tool({
      description: 'Generate a random number',
      parameters: z.object({
        min: z.number(),
        max: z.number(),
      }),
      execute: async ({ min, max }) => {
        console.log(`[Tool Execution] Generating random number between ${min} and ${max}`);
        return { number: Math.floor(Math.random() * (max - min + 1)) + min };
      },
    }),
  };

  // Force specific tool
  const result = await generateText({
    model: claude('sonnet'),
    prompt: 'I need some information.',
    tools,
    toolChoice: {
      type: 'tool',
      toolName: 'getCurrentTime',
    },
  });

  console.log('Generated Text:', result.text);
  console.log('\nForced Tool Call:', result.toolCalls);
}

async function main() {
  try {
    await weatherToolExample();
    await multipleToolsExample();
    await multiStepToolExample();
    await toolChoiceExample();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
