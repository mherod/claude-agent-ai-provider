# Claude Agent AI Provider

A custom AI SDK provider that bridges the [AI SDK](https://sdk.vercel.ai/) to the [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/typescript), enabling agent capabilities with Claude models through a standardized interface.

## Features

✅ **Full AI SDK v5 LanguageModelV2 compatibility**
✅ **Claude Agent SDK integration** with multi-step agent capabilities
✅ **Streaming and non-streaming generation**
✅ **Tool calling support** (translates between AI SDK and Agent SDK formats)
✅ **Proper usage tracking** including tokens and costs
✅ **Type-safe** with full TypeScript support
✅ **Built with Bun** for optimal performance

## Installation

```bash
bun add @anthropic-ai/claude-agent-sdk ai
```

## Quick Start

```typescript
import { claude } from 'claude-agent-ai-provider';

// Create a model instance
const model = claude('sonnet');

// Generate text
const result = await model.doGenerate({
  prompt: [
    {
      role: 'user',
      content: [{ type: 'text', text: 'Hello! Tell me about AI.' }],
    },
  ],
});

console.log(result.content);
```

## Usage

### Basic Generation

```typescript
import { claude } from 'claude-agent-ai-provider';

const model = claude('sonnet');

const result = await model.doGenerate({
  prompt: [
    { role: 'user', content: [{ type: 'text', text: 'Your prompt here' }] },
  ],
});
```

### Streaming

```typescript
const result = await model.doStream({
  prompt: [
    { role: 'user', content: [{ type: 'text', text: 'Count from 1 to 5' }] },
  ],
});

const reader = result.stream.getReader();
while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  if (value.type === 'text-delta') {
    process.stdout.write(value.delta);
  }
}
```

### With Custom Settings

```typescript
import { createClaudeProvider } from 'claude-agent-ai-provider';

// The provider automatically picks up ANTHROPIC_API_KEY from environment
const provider = createClaudeProvider({
  timeout: 120000, // Optional: custom timeout
});

const model = provider.languageModel('opus', {
  maxTokens: 4096,
  temperature: 0.7,
  agent: {
    enabled: true,
    maxSteps: 10,
  },
});
```

### With System Prompts

```typescript
const result = await model.doGenerate({
  prompt: [
    {
      role: 'system',
      content: 'You are a helpful coding assistant.',
    },
    {
      role: 'user',
      content: [{ type: 'text', text: 'Explain async/await' }],
    },
  ],
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

## Examples

Comprehensive examples demonstrating real-world usage patterns:

### E2E Examples with AI SDK

**generateText() - Text Generation**
```bash
# Basic text generation (prompts, system messages, conversations)
bun examples/e2e-generate-text-basic.ts

# Tool calling (single, multiple, multi-step workflows)
bun examples/e2e-generate-text-tools.ts

# Advanced features (callbacks, error handling, abort signals)
bun examples/e2e-generate-text-advanced.ts

# Real-world use cases (summarization, data analysis, code generation)
bun examples/e2e-generate-text-real-world.ts
```

**generateObject() - Structured Data Generation**
```bash
# Basic object generation (objects, arrays, enums, no-schema)
bun examples/e2e-generate-object-basic.ts

# Information extraction (resume parsing, article metadata, email parsing)
bun examples/e2e-generate-object-extraction.ts

# Synthetic data (test data, mock APIs, database records)
bun examples/e2e-generate-object-synthetic.ts

# Classification & validation (content moderation, sentiment, data validation)
bun examples/e2e-generate-object-validation.ts
```

**streamText() - Real-Time Text Streaming**
```bash
# Basic streaming (textStream, fullStream, callbacks, conversations)
bun examples/e2e-stream-text-basic.ts

# Streaming with tools (real-time tool execution, progress monitoring)
bun examples/e2e-stream-text-tools.ts

# Real-world streaming (chatbot, live code gen, analysis, abort control)
bun examples/e2e-stream-text-real-world.ts
```

**Advanced Tool Calling**
```bash
# Advanced features (stopWhen, prepareStep, hooks, generators, active tools, context)
bun examples/e2e-advanced-tool-calling.ts
```

### Basic Provider Examples

```bash
# Direct provider usage
bun examples/basic-usage.ts
bun examples/simple-generation.ts
bun examples/provider-demo.ts
```

See the [examples/README.md](examples/README.md) for detailed documentation.

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
