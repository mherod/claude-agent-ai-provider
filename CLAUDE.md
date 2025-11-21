# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a custom AI SDK provider that bridges the [AI SDK v5](https://sdk.vercel.ai/) to the [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/typescript), enabling agent capabilities with Claude models through a standardized interface. The provider implements the AI SDK's `ProviderV2` and `LanguageModelV2` interfaces.

## Development Commands

All commands use Bun (not Node.js, npm, or pnpm):

```bash
# Install dependencies
bun install

# Run type checking
bun run typecheck

# Run tests
bun test

# Build the project
bun run build

# Run examples (quick start)
bun examples/quick-start.ts

# Run E2E examples with AI SDK
# generateText() - Text generation
bun examples/e2e-generate-text-basic.ts      # Basic text generation
bun examples/e2e-generate-text-tools.ts      # Tool calling
bun examples/e2e-generate-text-advanced.ts   # Advanced features
bun examples/e2e-generate-text-real-world.ts # Real-world use cases

# generateObject() - Structured data generation
bun examples/e2e-generate-object-basic.ts       # Objects, arrays, enums
bun examples/e2e-generate-object-extraction.ts  # Information extraction
bun examples/e2e-generate-object-synthetic.ts   # Synthetic/test data
bun examples/e2e-generate-object-validation.ts  # Classification & validation

# streamText() - Real-time text streaming
bun examples/e2e-stream-text-basic.ts      # Basic streaming, textStream vs fullStream
bun examples/e2e-stream-text-tools.ts      # Streaming with tool execution
bun examples/e2e-stream-text-real-world.ts # Real-world streaming applications

# Advanced tool calling features
bun examples/e2e-advanced-tool-calling.ts  # stopWhen, prepareStep, hooks, generators

# Run provider examples (lower-level API)
bun examples/basic-usage.ts
bun examples/simple-generation.ts
```

**Bun-specific rules:**
- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Bun automatically loads .env, so don't use dotenv
- Import test utilities from `bun:test`: `import { test, expect, describe } from "bun:test"`

## Architecture

### Core Data Flow

```
AI SDK (User Apps) → ClaudeProvider → ClaudeLanguageModel → Message Converters → Claude Agent SDK → Claude API
```

The provider translates between two different message formats:
- **AI SDK format**: `LanguageModelV2Prompt` with role-based messages
- **Agent SDK format**: Plain text prompts with system prompts handled separately

### Key Components

**src/provider.ts** (src/provider.ts:19-77):
- `ClaudeProvider` - Implements `ProviderV2` interface
- `claude()` - Convenience factory function for creating models
- Only supports language models (not embeddings or image generation)

**src/language-model.ts** (src/language-model.ts:34-254):
- `ClaudeLanguageModel` - Implements `LanguageModelV2` interface
- `doGenerate()` - Non-streaming text generation (collects all messages from Agent SDK async generator)
- `doStream()` - Streaming generation (converts Agent SDK async generator to ReadableStream)
- Automatically picks up `ANTHROPIC_API_KEY` from environment via Agent SDK

**src/converters.ts** (src/converters.ts:1-181):
- `convertPromptToAgentSDKFormat()` - Converts AI SDK prompts to plain text format with role prefixes
- `extractSystemPrompt()` - Extracts system messages from AI SDK prompts
- `convertAssistantMessageToContent()` - Converts Agent SDK messages to AI SDK content blocks
- `collectAssistantMessages()` - Collects all messages from Agent SDK stream for non-streaming mode
- Handles text blocks and tool use blocks

**src/types.ts** (src/types.ts:1-135):
- `ClaudeProviderConfig` - Provider configuration (API key auto-detected from env, Claude binary auto-detected)
- `ClaudeModelSettings` - Model-specific settings (maxTokens, temperature, agent config)
- `ClaudeModelId` - Supported Claude model identifiers

**src/utils.ts** (src/utils.ts:34-56):
- `detectClaudeBinaryPath()` - Automatically detects Claude Code executable using `Bun.which('claude')`
- Caches detection result to avoid repeated lookups
- Returns `null` if binary not found in PATH

**src/errors.ts** (src/errors.ts:1-100):
- Custom error classes that extend `ClaudeProviderError`
- `convertToAISDKError()` - Maps HTTP errors to AI SDK error types

### Message Flow Details

1. **doGenerate (non-streaming)** (src/language-model.ts:109-152):
   - Converts AI SDK prompt → Agent SDK text format
   - Calls Agent SDK `query()` which returns async generator
   - Uses `collectAssistantMessages()` to iterate through ALL messages
   - Returns collected content, usage, and finish reason

2. **doStream (streaming)** (src/language-model.ts:158-187):
   - Converts AI SDK prompt → Agent SDK text format
   - Calls Agent SDK `query()` which returns async generator
   - Creates ReadableStream that processes messages as they arrive
   - Emits `text-delta` parts for text blocks
   - Emits `tool-call` parts for tool use blocks
   - Emits `finish` part with usage when result message received

### Supported Models

The Claude Agent SDK uses simplified model tier names that automatically map to the latest version:

- `'sonnet'` - Latest Sonnet model (currently Claude 4.5)
- `'opus'` - Latest Opus model (currently Claude 4.1)
- `'haiku'` - Latest Haiku model (currently Claude 4.5)
- `'inherit'` - Inherit model from parent context

## Environment Setup

The Claude Agent SDK automatically picks up `ANTHROPIC_API_KEY` from environment variables. No manual API key configuration needed.

### Claude Binary Detection

The provider automatically detects the Claude Code executable in your system PATH:

- **Automatic Detection**: Uses `Bun.which('claude')` to find the binary automatically
- **Caching**: Detection result is cached to avoid repeated lookups
- **Manual Override**: You can specify a custom path via `pathToClaudeCodeExecutable` in `ClaudeProviderConfig`

**Usage Examples:**

```typescript
import { claude } from 'claude-agent-ai-provider';

// Automatic detection (default behavior)
const model = claude('sonnet');

// Manual path specification
const model = claude('sonnet', {
  pathToClaudeCodeExecutable: '/opt/homebrew/bin/claude'
});

// Using provider instance
import { createClaudeProvider } from 'claude-agent-ai-provider';

const provider = createClaudeProvider({
  pathToClaudeCodeExecutable: '/custom/path/to/claude'
});
```

The automatic detection runs when `pathToClaudeCodeExecutable` is not explicitly provided in the config. This works cross-platform (macOS, Linux, Windows).

## Examples Organization

**examples/quick-start.ts**: Minimal example showing simplest usage with AI SDK's `generateText()`

**E2E Examples (using AI SDK high-level functions):**

*generateText() examples:*
- `e2e-generate-text-basic.ts` - Simple generation, system prompts, conversations, settings
- `e2e-generate-text-tools.ts` - Tool definition, execution, multi-step workflows, tool choice
- `e2e-generate-text-advanced.ts` - Callbacks, error handling, abort signals, complex workflows
- `e2e-generate-text-real-world.ts` - Summarization, data analysis, code gen, decision making

*generateObject() examples:*
- `e2e-generate-object-basic.ts` - Objects, arrays, enums, no-schema, nested structures
- `e2e-generate-object-extraction.ts` - Resume parsing, metadata extraction, email parsing
- `e2e-generate-object-synthetic.ts` - Test data, mock APIs, database records, analytics
- `e2e-generate-object-validation.ts` - Content moderation, intent classification, sentiment

*streamText() examples:*
- `e2e-stream-text-basic.ts` - textStream vs fullStream, callbacks, multiple consumption
- `e2e-stream-text-tools.ts` - Real-time tool execution, progress monitoring, event handling
- `e2e-stream-text-real-world.ts` - Chatbot, live code gen, analysis, abort control

*Advanced tool calling:*
- `e2e-advanced-tool-calling.ts` - stopWhen, prepareStep, input hooks, generators, active tools, context

**Provider Examples (lower-level API):**
- `basic-usage.ts` - Direct provider usage with `doGenerate()` and `doStream()`
- `simple-generation.ts` - Basic examples
- `provider-demo.ts` - Provider configuration

All examples include detailed comments and console output showing usage, finish reasons, and token counts.

## Key Implementation Notes

- The provider delegates most functionality to the Claude Agent SDK rather than implementing raw HTTP calls
- System prompts are extracted from AI SDK prompts and passed as `systemPrompt` in Agent SDK options (src/converters.ts:63-71)
- Agent SDK `query()` returns an async generator of `SDKMessage` objects that must be fully iterated
- Tool calling support translates between AI SDK's function-based format and Agent SDK's tool format
- The provider supports both streaming (via ReadableStream) and non-streaming modes
- Usage tracking includes input tokens, output tokens, and cache tokens (cache_read_input_tokens)
- Examples require `ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN` environment variable

### generateObject() Implementation (Added in v0.1.1)

**JSON Response Handling** (src/language-model.ts:82-105):
- When `options.responseFormat?.type === 'json'`, the provider injects explicit JSON-only instructions into the system prompt
- Instructions tell Claude to return ONLY valid JSON without markdown formatting or explanatory text
- JSON schema is included in instructions when provided via `responseFormat.schema`

**Markdown Stripping** (src/converters.ts:18-32):
- `stripMarkdownCodeBlocks()` removes `` ```json ``` `` wrappers from responses
- Handles cases where Claude adds explanatory text before code blocks
- Applied to all text content in `doGenerate()` when `responseFormat.type === 'json'` (src/language-model.ts:164-175)

**Why This Is Needed**:
- Claude Agent SDK doesn't have native structured output support like OpenAI's function calling
- We must use prompt engineering to force JSON-only responses
- Post-processing ensures clean JSON even when Claude adds markdown despite instructions

### Automatic Claude Binary Detection (Added in v0.2.0)

**Implementation** (src/language-model.ts:84-92, src/utils.ts:34-56):
- When `pathToClaudeCodeExecutable` is not provided in `ClaudeProviderConfig`, the provider automatically detects the Claude binary using `Bun.which('claude')`
- Detection result is cached in a module-level variable to avoid repeated lookups
- If detection fails or binary not found, the option is simply not set (Agent SDK will use its default behavior)

**Configuration Options** (src/types.ts:33-38):
- `pathToClaudeCodeExecutable?: string` - Optional path to Claude Code executable
- If provided, this path is used directly
- If not provided, automatic detection is attempted
- Example: `'/opt/homebrew/bin/claude'` (Homebrew on Apple Silicon)

**Benefits**:
- Zero-configuration setup for most users
- Works with standard Claude Code installations (Homebrew, npm global, etc.)
- Allows manual override for custom installations or non-standard paths
- Efficient caching prevents performance impact from repeated detection

## Publishing

### Release Workflow

The complete workflow for releasing a new version to npm:

```bash
# 1. Ensure you're logged into npm
npm whoami

# 2. Verify package contents (optional)
npm pack --dry-run

# 3. Bump version (auto-creates commit and tag)
npm version patch  # 0.1.0 -> 0.1.1 (bug fixes)
npm version minor  # 0.1.0 -> 0.2.0 (new features)
npm version major  # 0.1.0 -> 1.0.0 (breaking changes)

# 4. Publish to npm (runs prepublishOnly script automatically)
npm publish

# 5. Push version commit and tag to GitHub
git push && git push --tags

# 6. Create GitHub release with release notes
gh release create v0.2.0 \
  --title "v0.2.0 - Feature Name" \
  --notes "## Features
- Feature description
- Another feature

## Changes
- Change description
- Another change

## Usage
\`\`\`typescript
// Example usage
\`\`\`"
```

### Pre-Publish Checks

The `prepublishOnly` script automatically runs before publishing:
1. `bun run typecheck:src` - Type check source files
2. `bun run build` - Build JavaScript + TypeScript declarations
3. `bun test` - Run all tests

All checks must pass before the package is published.

### Version Bumping

- **Patch** (`npm version patch`): Bug fixes, small improvements (0.1.0 → 0.1.1)
- **Minor** (`npm version minor`): New features, backward compatible (0.1.0 → 0.2.0)
- **Major** (`npm version major`): Breaking changes (0.1.0 → 1.0.0)

The `npm version` command automatically:
- Updates `package.json` version
- Creates a git commit with message "chore: bump version to X.Y.Z"
- Creates a git tag `vX.Y.Z`

### Post-Publish Verification

After publishing, verify the release:

```bash
# Check published version
npm view claude-agent-ai-provider version

# Test installation in a clean directory
mkdir test-install && cd test-install
npm init -y
npm install claude-agent-ai-provider
```

## Authentication

The provider supports two authentication methods (both auto-detected from environment):

1. **Anthropic API Key**: Set `ANTHROPIC_API_KEY` for production use
2. **Claude Code OAuth Token**: Set `CLAUDE_CODE_OAUTH_TOKEN` for development (run `claude setup-token`)

Claude Code quota allows free development/testing without separate API costs.
