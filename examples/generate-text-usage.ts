/**
 * AI SDK generateText() Integration
 * Demonstrates using the Claude Agent Provider with the high-level AI SDK API
 */

import { generateText } from 'ai';
import { claude } from '../index.ts';

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   AI SDK generateText() with Claude Agent Provider       ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// This is how developers will actually use our provider!
// Instead of calling model.doGenerate() directly, they use the AI SDK's
// high-level generateText() function which handles message formatting,
// tool execution, retries, and more.

console.log('📚 Example 1: Basic Text Generation');
console.log('─'.repeat(60));
console.log(`
import { generateText } from 'ai';
import { claude } from 'claude-agent-ai-provider';

const result = await generateText({
  model: claude('sonnet'),
  prompt: 'Explain TypeScript in one sentence.',
});

console.log(result.text);
`);
console.log('This uses our LanguageModelV2 provider under the hood!');
console.log('The AI SDK calls model.doGenerate() internally.\n');

console.log('📚 Example 2: With System Prompt');
console.log('─'.repeat(60));
console.log(`
const result = await generateText({
  model: claude('sonnet'),
  system: 'You are a helpful coding assistant.',
  prompt: 'How do I use async/await in JavaScript?',
});
`);
console.log('System prompts are extracted and passed to Agent SDK.\n');

console.log('📚 Example 3: Multi-turn Conversation');
console.log('─'.repeat(60));
console.log(`
const result = await generateText({
  model: claude('opus'),
  messages: [
    { role: 'user', content: 'What is 15 * 8?' },
    { role: 'assistant', content: '15 * 8 = 120' },
    { role: 'user', content: 'Now multiply that by 3.' },
  ],
});

console.log(result.text); // "120 * 3 = 360"
`);
console.log('Messages are converted to Agent SDK format automatically.\n');

console.log('📚 Example 4: Tool Usage (Auto-Execution)');
console.log('─'.repeat(60));
console.log(`
import { z } from 'zod';
import { tool } from 'ai';

const result = await generateText({
  model: claude('sonnet'),
  prompt: 'What is the weather in San Francisco?',
  tools: {
    getWeather: tool({
      description: 'Get the weather for a location',
      parameters: z.object({
        location: z.string(),
      }),
      execute: async ({ location }) => {
        // This function runs automatically!
        return \`Weather in \${location}: 72°F, sunny\`;
      },
    }),
  },
});

// The AI SDK:
// 1. Calls model.doGenerate() with tools
// 2. Gets tool-call content from our provider
// 3. Executes the tool function
// 4. Calls model.doGenerate() again with results
// 5. Returns final text response

console.log(result.text);
// "The weather in San Francisco is 72°F and sunny."
`);
console.log('Tools are executed automatically by the AI SDK!\n');

console.log('📚 Example 5: Streaming with streamText()');
console.log('─'.repeat(60));
console.log(`
import { streamText } from 'ai';

const result = streamText({
  model: claude('haiku'),
  prompt: 'Count from 1 to 5.',
});

// The AI SDK calls model.doStream() internally
for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
`);
console.log('Streaming uses our doStream() implementation.\n');

console.log('📚 Example 6: Generation with Settings');
console.log('─'.repeat(60));
console.log(`
const result = await generateText({
  model: claude('sonnet'),
  prompt: 'Write a haiku about programming.',
  maxOutputTokens: 100,
  temperature: 0.7,
  stopSequences: ['END'],
});

console.log(result.text);
console.log('Tokens used:', result.usage);
`);
console.log('Settings are passed through to the provider.\n');

console.log('📚 Example 7: Complete Real-World Example');
console.log('─'.repeat(60));
console.log(`
import { generateText } from 'ai';
import { claude } from 'claude-agent-ai-provider';
import { z } from 'zod';
import { tool } from 'ai';

async function analyzeSentiment(text: string) {
  const result = await generateText({
    model: claude('sonnet'),
    system: 'You are a sentiment analysis expert.',
    prompt: \`Analyze the sentiment of: "\${text}"\`,
    tools: {
      recordSentiment: tool({
        description: 'Record the sentiment analysis result',
        parameters: z.object({
          sentiment: z.enum(['positive', 'negative', 'neutral']),
          score: z.number().min(0).max(1),
          keywords: z.array(z.string()),
        }),
        execute: async ({ sentiment, score, keywords }) => {
          // Save to database, analytics, etc.
          console.log('Recorded:', { sentiment, score, keywords });
          return 'Sentiment recorded successfully';
        },
      }),
    },
  });

  return result;
}

const analysis = await analyzeSentiment(
  'I love using the AI SDK with Claude!'
);
console.log(analysis.text);
`);
console.log('Complete integration with automatic tool execution!\n');

console.log('🔄 How It All Works Together:');
console.log('─'.repeat(60));
console.log(`
┌─────────────────────────────────────────────────────┐
│  Developer Code (using AI SDK)                      │
│  • generateText({ model: claude(...), ... })        │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  AI SDK Core                                        │
│  • Message formatting                               │
│  • Tool execution orchestration                     │
│  • Retry logic                                      │
│  • Response parsing                                 │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Our Provider (LanguageModelV2)                     │
│  • model.doGenerate(options)                        │
│  • model.doStream(options)                          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Message Conversion Layer                           │
│  • AI SDK format → Agent SDK format                 │
│  • Extract system prompts                           │
│  • Map tool definitions                             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Claude Agent SDK                                   │
│  • query({ prompt, options })                       │
│  • Returns AsyncIterable<SDKMessage>                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Response Conversion Layer                          │
│  • SDKMessage → LanguageModelV2Content              │
│  • AsyncIterable → ReadableStream (for streaming)   │
│  • Extract usage, finish reason, etc.               │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  AI SDK Core                                        │
│  • Execute tools if needed                          │
│  • Format final response                            │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Developer Code                                     │
│  • result.text                                      │
│  • result.toolCalls                                 │
│  • result.usage                                     │
└─────────────────────────────────────────────────────┘
`);

console.log('\n✨ Key Benefits of Using generateText():');
console.log('─'.repeat(60));
console.log('✓ Automatic tool execution (no manual tool call handling)');
console.log('✓ Built-in retry logic and error handling');
console.log('✓ Response streaming support');
console.log('✓ Standardized message format');
console.log('✓ Usage tracking and telemetry');
console.log('✓ Multi-turn conversation support');
console.log('✓ Compatible with all AI SDK features\n');

console.log('💡 Installation & Setup:');
console.log('─'.repeat(60));
console.log(`
# Install packages
npm install ai claude-agent-ai-provider

# Set environment variable
export ANTHROPIC_API_KEY="your-key-here"

# Use in your code
import { generateText } from 'ai';
import { claude } from 'claude-agent-ai-provider';

const result = await generateText({
  model: claude('sonnet'),
  prompt: 'Hello!',
});
`);

console.log('\n🎯 Comparison: Direct Provider vs AI SDK:');
console.log('─'.repeat(60));
console.log(`
Direct Provider (Low-Level):
  const model = claude('sonnet');
  const result = await model.doGenerate({
    prompt: [
      { role: 'user', content: [{ type: 'text', text: 'Hello!' }] }
    ]
  });
  // You handle tool execution manually
  // You format messages yourself
  // More control, but more work

AI SDK generateText() (High-Level):
  const result = await generateText({
    model: claude('sonnet'),
    prompt: 'Hello!',
  });
  // Tools execute automatically
  // Message formatting handled
  // Simpler API, less boilerplate
`);

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║                      ✅ Complete!                         ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('Our provider is a drop-in replacement for any AI SDK provider!');
console.log('Just swap out openai() for claude() and everything works.\n');

console.log('🚀 Ready to use with:');
console.log('  • generateText() - Text generation with tools');
console.log('  • streamText() - Streaming responses');
console.log('  • generateObject() - Structured output generation');
console.log('  • streamObject() - Streaming structured output');
console.log('  • All AI SDK features!\n');
