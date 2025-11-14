# Claude Agent AI Provider

[![npm version](https://badge.fury.io/js/claude-agent-ai-provider.svg)](https://www.npmjs.com/package/claude-agent-ai-provider)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Use Claude with the AI SDK — unlock agent capabilities, tool calling, and streaming with a simple, standardized interface.

A seamless bridge between [Vercel's AI SDK](https://sdk.vercel.ai/) and [Anthropic's Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/typescript). Write AI applications using familiar AI SDK patterns while leveraging Claude's powerful agent capabilities under the hood.

## Why Use This?

- **🎯 Familiar API**: Use AI SDK's `generateText()`, `generateObject()`, and `streamText()` with Claude models
- **🤖 Agent Capabilities**: Full Claude Agent SDK integration with multi-step reasoning and tool calling
- **🔄 Streaming Support**: Real-time text streaming with event monitoring
- **📊 Structured Data**: Extract structured data with type-safe schemas using Zod
- **🛠️ Tool Calling**: Let Claude use tools and APIs to accomplish complex tasks
- **💎 TypeScript First**: Fully typed with comprehensive IntelliSense support
- **⚡ Production Ready**: Built with Bun, thoroughly tested, and optimized for performance

## Features

✅ Full AI SDK v5 `LanguageModelV2` compatibility
✅ Claude Agent SDK integration with multi-step agent capabilities
✅ Streaming and non-streaming text generation
✅ Tool calling with automatic format translation
✅ Structured data extraction with `generateObject()`
✅ Usage tracking (tokens, costs, caching)
✅ Type-safe with full TypeScript support

## Installation

```bash
npm install claude-agent-ai-provider ai
# or
bun add claude-agent-ai-provider ai
```

> **Note**: Make sure to set your `ANTHROPIC_API_KEY` environment variable.

## Use Cases

Perfect for building:

- 🤖 **AI Chatbots**: Conversational interfaces with streaming responses
- 📊 **Data Extraction**: Parse resumes, invoices, documents into structured data
- 🔧 **AI Agents**: Multi-step workflows with tool calling capabilities
- ✍️ **Content Generation**: Blogs, emails, code, creative writing
- 🎯 **Classification**: Sentiment analysis, intent detection, content moderation
- 🔍 **Analysis**: Code review, document summarization, data insights

## Quick Start

```typescript
import { generateText } from 'ai';
import { claude } from 'claude-agent-ai-provider';

const { text } = await generateText({
  model: claude('sonnet'),
  prompt: 'Explain TypeScript in one sentence.',
});

console.log(text);
```

## Usage Examples

### 📝 Text Generation with `generateText()`

Generate text responses with full conversation support:

```typescript
import { generateText } from 'ai';
import { claude } from 'claude-agent-ai-provider';

// Simple text generation
const { text } = await generateText({
  model: claude('sonnet'),
  prompt: 'Write a haiku about coding.',
});

// With system prompts and conversation history
const { text: response } = await generateText({
  model: claude('sonnet'),
  system: 'You are a helpful coding assistant. Be concise.',
  messages: [
    { role: 'user', content: 'What is TypeScript?' },
    { role: 'assistant', content: 'TypeScript is a typed superset of JavaScript...' },
    { role: 'user', content: 'What are its main benefits?' },
  ],
});
```

### 🔧 Tool Calling with Agents

Enable Claude to use tools for complex tasks:

```typescript
import { generateText, tool } from 'ai';
import { claude } from 'claude-agent-ai-provider';
import { z } from 'zod';

const result = await generateText({
  model: claude('sonnet'),
  tools: {
    getWeather: tool({
      description: 'Get the current weather for a location',
      parameters: z.object({
        location: z.string().describe('City name'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72,
        condition: 'Sunny',
      }),
    }),
  },
  prompt: 'What is the weather in San Francisco?',
});

console.log(result.text);
// Claude will call the getWeather tool and incorporate the result
```

### 📊 Structured Data with `generateObject()`

Extract structured data from unstructured text:

```typescript
import { generateObject } from 'ai';
import { claude } from 'claude-agent-ai-provider';
import { z } from 'zod';

// Extract user information from text
const { object } = await generateObject({
  model: claude('sonnet'),
  schema: z.object({
    name: z.string(),
    email: z.string().email(),
    skills: z.array(z.string()),
    yearsExperience: z.number(),
  }),
  prompt: `Extract information: "John Doe is a senior developer with 8 years
           of experience in React, TypeScript, and Node.js.
           Email: john@example.com"`,
});

console.log(object);
// {
//   name: "John Doe",
//   email: "john@example.com",
//   skills: ["React", "TypeScript", "Node.js"],
//   yearsExperience: 8
// }
```

### 🎯 Classification with Enums

Classify content into predefined categories:

```typescript
import { generateObject } from 'ai';
import { claude } from 'claude-agent-ai-provider';

const { object: sentiment } = await generateObject({
  model: claude('haiku'), // Use faster Haiku for simple tasks
  output: 'enum',
  enum: ['positive', 'negative', 'neutral'],
  prompt: 'Analyze sentiment: "This product exceeded my expectations!"',
});

console.log(sentiment); // 'positive'
```

### 🌊 Real-Time Streaming with `streamText()`

Stream responses for interactive experiences:

```typescript
import { streamText } from 'ai';
import { claude } from 'claude-agent-ai-provider';

const { textStream } = streamText({
  model: claude('sonnet'),
  prompt: 'Write a short story about a robot learning to paint.',
});

// Stream text as it's generated
for await (const chunk of textStream) {
  process.stdout.write(chunk);
}
```

### 🔄 Streaming with Full Event Access

Monitor all streaming events including tool calls:

```typescript
import { streamText, tool } from 'ai';
import { claude } from 'claude-agent-ai-provider';
import { z } from 'zod';

const { fullStream } = streamText({
  model: claude('sonnet'),
  tools: {
    calculateSum: tool({
      description: 'Calculate the sum of numbers',
      parameters: z.object({
        numbers: z.array(z.number()),
      }),
      execute: async ({ numbers }) => ({
        sum: numbers.reduce((a, b) => a + b, 0),
      }),
    }),
  },
  prompt: 'What is 25 + 17 + 33?',
});

for await (const part of fullStream) {
  switch (part.type) {
    case 'text-delta':
      process.stdout.write(part.textDelta);
      break;
    case 'tool-call':
      console.log(`\nCalling tool: ${part.toolName}`);
      break;
    case 'tool-result':
      console.log(`Tool result:`, part.result);
      break;
  }
}
```

### ⚙️ Advanced Configuration

Customize model behavior and settings:

```typescript
import { generateText } from 'ai';
import { claude } from 'claude-agent-ai-provider';

const result = await generateText({
  model: claude('opus', {
    // Provider config (optional)
    timeout: 120000,
  }, {
    // Model settings (optional)
    maxTokens: 4096,
    temperature: 0.7,
  }),
  prompt: 'Write creative content...',
});
```

## Architecture

This provider acts as a bridge between two SDKs:

```
AI SDK (AI Apps) → Claude Agent AI Provider → Claude Agent SDK → Claude API
```

### Key Components

- **`ClaudeProvider`**: Implements `ProviderV2` interface
- **`ClaudeLanguageModel`**: Implements `LanguageModelV2` interface
- **Message Converters**: Translate between AI SDK and Agent SDK formats
- **Streaming Adapters**: Convert Agent SDK async generators to ReadableStreams

## Available Models

The Claude Agent SDK uses simplified model tier names that automatically map to the latest version:

- `'sonnet'` - Latest Sonnet model (currently Claude 4.5)
- `'opus'` - Latest Opus model (currently Claude 4.1)
- `'haiku'` - Latest Haiku model (currently Claude 4.5)
- `'inherit'` - Inherit model from parent context

## API Reference

### `claude(modelId, config?, settings?)`

Creates a language model instance directly.

**Parameters:**
- `modelId`: Claude model identifier
- `config?`: Provider configuration (API key, base URL, etc.)
- `settings?`: Model-specific settings (max tokens, temperature, etc.)

**Returns:** `LanguageModelV2`

### `createClaudeProvider(config?)`

Creates a provider instance for creating multiple models.

**Parameters:**
- `config?`: Provider configuration

**Returns:** `ClaudeProvider`

## More Examples

This package includes **18+ comprehensive examples** covering real-world use cases. Browse the [`examples/`](./examples) directory or check the [examples documentation](./examples/README.md).

### 📝 Text Generation Examples
- **Basic**: Simple generation, system prompts, conversations, settings
- **Tools**: Single tool, multiple tools, multi-step workflows, tool choice
- **Advanced**: Callbacks, error handling, abort signals, complex workflows
- **Real-world**: Content summarization, data analysis, code generation, decision making

### 📊 Structured Data Examples
- **Basic**: Objects, arrays, enums, nested structures
- **Extraction**: Resume parsing, article metadata, product info, email parsing
- **Synthetic**: Test data generation, mock APIs, database records
- **Validation**: Content moderation, sentiment analysis, intent classification

### 🌊 Streaming Examples
- **Basic**: textStream, fullStream, callbacks, multiple consumption
- **Tools**: Real-time tool execution, progress monitoring
- **Real-world**: Chatbot, live code generation, analysis, abort control

### 🔧 Advanced Tool Calling
- **Multi-step**: `stopWhen` conditions, `prepareStep` callbacks
- **Lifecycle**: Tool input hooks (`onInputStart`, `onInputDelta`, `onInputAvailable`)
- **Progress**: Preliminary results with generator functions
- **Context**: Active tools, context passing, execution options

Run any example:
```bash
bun examples/e2e-generate-text-basic.ts
bun examples/e2e-generate-object-extraction.ts
bun examples/e2e-stream-text-real-world.ts
```

## Development

```bash
# Install dependencies
bun install

# Run typecheck
bun run typecheck

# Run tests
bun test
```

## Testing

```bash
bun test
```

All tests pass ✓

## License

MIT

## Credits

Built on top of:
- [AI SDK](https://sdk.vercel.ai/) by Vercel
- [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/typescript) by Anthropic
