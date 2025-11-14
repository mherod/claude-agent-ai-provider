/**
 * Tools Example
 * Demonstrates how to use tools with the Claude Agent AI Provider
 */

import { claude } from '../index.ts';
import type { LanguageModelV2FunctionTool } from '@ai-sdk/provider';

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║       Claude Agent AI Provider - Tools Example         ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Define tools using AI SDK v5 format
const tools: LanguageModelV2FunctionTool[] = [
  {
    type: 'function',
    name: 'get_weather',
    description: 'Get the current weather for a location',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA',
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'The temperature unit to use',
        },
      },
      required: ['location'],
    },
  },
  {
    type: 'function',
    name: 'calculate',
    description: 'Perform a mathematical calculation',
    inputSchema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'The mathematical expression to evaluate, e.g. "2 + 2"',
        },
      },
      required: ['expression'],
    },
  },
  {
    type: 'function',
    name: 'search_database',
    description: 'Search a database for information',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
        },
      },
      required: ['query'],
    },
  },
];

console.log('📋 Defined Tools:');
console.log('─'.repeat(50));
tools.forEach((tool, index) => {
  console.log(`${index + 1}. ${tool.name}`);
  console.log(`   Description: ${tool.description}`);
  const props = tool.inputSchema.properties;
  console.log(`   Parameters:`, props ? Object.keys(props).join(', ') : 'none');
});
console.log();

// Create model with tools
console.log('🔧 Creating Model with Tools:');
console.log('─'.repeat(50));
const model = claude('sonnet');
console.log('✓ Model created:', model.modelId);
console.log('✓ Provider:', model.provider);
console.log();

// Show the request structure
console.log('📤 AI SDK Request Structure:');
console.log('─'.repeat(50));
const exampleRequest = {
  prompt: [
    {
      role: 'user' as const,
      content: [
        {
          type: 'text' as const,
          text: 'What is the weather in San Francisco? Also calculate 15 * 8.',
        },
      ],
    },
  ],
  tools,
  maxOutputTokens: 1000,
};

console.log('Prompt:', exampleRequest.prompt[0]?.content[0]?.text);
console.log('Tools provided:', tools.map(t => t.name).join(', '));
console.log('Max tokens:', exampleRequest.maxOutputTokens);
console.log();

// Show what happens internally
console.log('🔄 Provider Processing:');
console.log('─'.repeat(50));
console.log('1. Extract tools from AI SDK format');
console.log('   Tools:', tools.map(t => `"${t.name}"`).join(', '));
console.log();

console.log('2. Build Agent SDK options:');
console.log('   {');
console.log('     model: "claude-3-5-sonnet-20241022",');
console.log(`     allowedTools: [${tools.map(t => `"${t.name}"`).join(', ')}],`);
console.log('   }');
console.log();

console.log('3. Convert prompt to Agent SDK format');
console.log('   "User: What is the weather in San Francisco? Also calculate 15 * 8."');
console.log();

console.log('4. Call Agent SDK query()');
console.log('   query({ prompt, options })');
console.log();

console.log('5. Agent SDK response flow:');
console.log('   → SDKAssistantMessage with tool_use blocks');
console.log('   → Provider converts to LanguageModelV2Content');
console.log('   → Returns tool calls in AI SDK format');
console.log();

// Show expected response structure
console.log('📥 Expected AI SDK Response:');
console.log('─'.repeat(50));
console.log('For non-streaming (doGenerate):');
console.log('{');
console.log('  content: [');
console.log('    {');
console.log('      type: "tool-call",');
console.log('      toolCallId: "toolu_123",');
console.log('      toolName: "get_weather",');
console.log('      input: { location: "San Francisco, CA" }');
console.log('    },');
console.log('    {');
console.log('      type: "tool-call",');
console.log('      toolCallId: "toolu_456",');
console.log('      toolName: "calculate",');
console.log('      input: { expression: "15 * 8" }');
console.log('    }');
console.log('  ],');
console.log('  finishReason: "tool-calls",');
console.log('  usage: { inputTokens: 120, outputTokens: 80, ... }');
console.log('}');
console.log();

console.log('For streaming (doStream):');
console.log('Stream events:');
console.log('  → { type: "tool-call", toolCallId: "toolu_123", toolName: "get_weather", ... }');
console.log('  → { type: "tool-call", toolCallId: "toolu_456", toolName: "calculate", ... }');
console.log('  → { type: "finish", finishReason: "tool-calls", usage: {...} }');
console.log();

// Show tool execution flow
console.log('🔁 Complete Tool Execution Flow:');
console.log('─'.repeat(50));
console.log('1. Model requests tools:');
console.log('   AI SDK → Provider → Agent SDK → Claude API');
console.log('   Response includes tool calls in content');
console.log();

console.log('2. Application executes tools:');
console.log('   const weatherResult = await getWeather("San Francisco, CA");');
console.log('   const calcResult = await calculate("15 * 8");');
console.log();

console.log('3. Send tool results back:');
console.log('   Next request includes tool results in prompt:');
console.log('   {');
console.log('     role: "tool",');
console.log('     content: [');
console.log('       {');
console.log('         type: "tool-result",');
console.log('         toolCallId: "toolu_123",');
console.log('         toolName: "get_weather",');
console.log('         output: { type: "text", value: "72°F, sunny" }');
console.log('       },');
console.log('       {');
console.log('         type: "tool-result",');
console.log('         toolCallId: "toolu_456",');
console.log('         toolName: "calculate",');
console.log('         output: { type: "text", value: "120" }');
console.log('       }');
console.log('     ]');
console.log('   }');
console.log();

console.log('4. Model uses tool results:');
console.log('   Provider translates tool results → Agent SDK');
console.log('   Agent SDK sends to Claude API');
console.log('   Claude generates final response using tool results');
console.log();

// Show actual usage code
console.log('💻 Code Example:');
console.log('─'.repeat(50));
console.log(`
import { claude } from 'claude-agent-ai-provider';

const model = claude('sonnet');

// First request with tools
const result = await model.doGenerate({
  prompt: [
    {
      role: 'user',
      content: [{ type: 'text', text: 'What is the weather in SF?' }]
    }
  ],
  tools: [
    {
      type: 'function',
      name: 'get_weather',
      description: 'Get weather for a location',
      inputSchema: {
        type: 'object',
        properties: {
          location: { type: 'string' }
        },
        required: ['location']
      }
    }
  ]
});

// Check for tool calls
for (const content of result.content) {
  if (content.type === 'tool-call') {
    console.log('Tool:', content.toolName);
    console.log('Args:', content.input);

    // Execute tool
    const toolResult = await executeWeatherTool(content.input);

    // Send result back in next request
    await model.doGenerate({
      prompt: [
        // ... previous messages ...
        {
          role: 'tool',
          content: [{
            type: 'tool-result',
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            output: { type: 'text', value: toolResult }
          }]
        }
      ]
    });
  }
}
`);

// Summary
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║                  ✅ Tools Support                       ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log('✓ AI SDK tool definitions → Agent SDK allowedTools');
console.log('✓ Agent SDK tool_use blocks → AI SDK tool-call content');
console.log('✓ AI SDK tool results → Agent SDK tool result messages');
console.log('✓ Bidirectional tool call translation');
console.log('✓ Supports function tools with JSON Schema parameters');
console.log('✓ Streaming and non-streaming tool calls');
console.log();

console.log('📚 Key Points:');
console.log('  • Tools are defined using AI SDK v5 LanguageModelV2FunctionTool format');
console.log('  • Provider extracts tool names for Agent SDK allowedTools');
console.log('  • Tool calls come back in content array with type "tool-call"');
console.log('  • Tool results are sent in subsequent requests with role "tool"');
console.log('  • Provider handles all format conversions automatically');
console.log();

console.log('🚀 The provider fully supports AI SDK tool calling patterns!');
