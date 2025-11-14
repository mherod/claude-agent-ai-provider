# Examples

This directory contains comprehensive examples demonstrating how to use the Claude Agent AI Provider with the AI SDK's `generateText()` and `generateObject()` functions.

## Prerequisites

1. Set your Anthropic API key:
   ```bash
   export ANTHROPIC_API_KEY="your-api-key-here"
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

## Running Examples

All examples use Bun for execution:

```bash
# Run any example with:
bun examples/<example-file>.ts
```

## E2E Examples with `generateText()`

### 1. Basic Text Generation (`e2e-generate-text-basic.ts`)

**What it demonstrates:**
- Simple text generation
- System prompts
- Conversation history with messages
- Custom generation settings (temperature, maxOutputTokens)
- Usage tracking

**Run it:**
```bash
bun examples/e2e-generate-text-basic.ts
```

**Key concepts:**
- Using `prompt` for simple queries
- Using `system` to set model behavior
- Using `messages` for multi-turn conversations
- Adjusting creativity with `temperature`

---

### 2. Tool Calling (`e2e-generate-text-tools.ts`)

**What it demonstrates:**
- Single tool execution
- Multiple tools in one request
- Multi-step agent workflows
- Tool choice control (forcing specific tools)
- Step-by-step execution tracking

**Run it:**
```bash
bun examples/e2e-generate-text-tools.ts
```

**Key concepts:**
- Defining tools with `tool()` and Zod schemas
- Tool execution with async functions
- Tracking tool calls and results
- Using `maxSteps` for multi-step reasoning
- Controlling tool selection with `toolChoice`

**Example tools:**
- `getWeather` - Simulated weather API
- `calculate` - Basic arithmetic operations
- `sqrt` - Mathematical calculations

---

### 3. Advanced Features (`e2e-generate-text-advanced.ts`)

**What it demonstrates:**
- `onStepFinish` callback for monitoring
- Error handling in tool execution
- Abort signals for request cancellation
- Complex multi-step workflows with database queries
- Stop sequences

**Run it:**
```bash
bun examples/e2e-generate-text-advanced.ts
```

**Key concepts:**
- Monitoring execution with `onStepFinish`
- Graceful error handling
- Request cancellation with `AbortController`
- Building complex agentic workflows
- Using stop sequences to control output

**Complex workflow example:**
Demonstrates a multi-step database query workflow:
1. Look up user by name
2. Find user's orders
3. Calculate total spending

---

### 4. Real-World Use Cases (`e2e-generate-text-real-world.ts`)

**What it demonstrates:**
- Content summarization
- Data analysis with tools
- Code generation
- AI-powered decision making
- Email drafting

**Run it:**
```bash
bun examples/e2e-generate-text-real-world.ts
```

**Practical applications:**
1. **Content Summarization** - Converting long articles into bullet points
2. **Data Analysis** - Analyzing sales data with custom metrics calculations
3. **Code Generation** - Creating TypeScript functions with proper documentation
4. **Decision Making** - Product recommendations based on criteria
5. **Email Drafting** - Professional business communication

---

## E2E Examples with `generateObject()`

### 1. Basic Object Generation (`e2e-generate-object-basic.ts`)

**What it demonstrates:**
- Object generation with Zod schemas
- Array generation for collections
- Enum generation for classifications
- No-schema JSON generation
- Complex nested object structures

**Run it:**
```bash
bun examples/e2e-generate-object-basic.ts
```

**Key concepts:**
- Defining schemas with Zod
- Different output modes (object, array, enum, no-schema)
- Nested and complex data structures
- Recipe generation, character creation, genre classification

---

### 2. Information Extraction (`e2e-generate-object-extraction.ts`)

**What it demonstrates:**
- Resume/CV parsing
- Article metadata extraction
- Product information extraction
- Email parsing and action item extraction

**Run it:**
```bash
bun examples/e2e-generate-object-extraction.ts
```

**Practical applications:**
- HR automation - extracting structured data from resumes
- Content management - parsing article metadata
- E-commerce - structured product information
- Email processing - extracting action items and meetings

**Example schemas:**
- Personal information, work experience, education, skills
- Article title, author, tags, statistics, sentiment
- Product specs, pricing, availability, reviews
- Email headers, action items, meetings, priorities

---

### 3. Synthetic Data Generation (`e2e-generate-object-synthetic.ts`)

**What it demonstrates:**
- Test user profile generation
- Mock API response creation
- Sample database records
- Event calendar data
- Analytics dashboard data

**Run it:**
```bash
bun examples/e2e-generate-object-synthetic.ts
```

**Practical applications:**
- **Testing** - Generate realistic test data for QA
- **Development** - Mock API responses for frontend development
- **Demos** - Create sample data for product demonstrations
- **Prototyping** - Populate prototypes with realistic data

**Generated data types:**
- User profiles with preferences
- E-commerce orders with addresses
- Blog posts with comments
- Corporate events with attendees
- Analytics metrics with time series

---

### 4. Classification & Validation (`e2e-generate-object-validation.ts`)

**What it demonstrates:**
- Content moderation
- User intent classification
- Detailed sentiment analysis
- Data validation and formatting
- Document classification

**Run it:**
```bash
bun examples/e2e-generate-object-validation.ts
```

**Practical applications:**
1. **Content Moderation** - Automatically flag inappropriate content
2. **Customer Support** - Route tickets based on intent classification
3. **Sentiment Analysis** - Analyze reviews and feedback
4. **Data Cleaning** - Validate and format user input
5. **Document Management** - Auto-classify and tag documents

**Example use cases:**
- Detecting spam, hate speech, threats in user comments
- Classifying customer messages (support, billing, complaints)
- Analyzing review sentiment with aspect-based analysis
- Formatting addresses, phone numbers, personal data
- Classifying documents by type and confidentiality level

---

## E2E Examples with `streamText()`

### 1. Basic Streaming (`e2e-stream-text-basic.ts`)

**What it demonstrates:**
- Basic text streaming with `textStream`
- Full stream with all events using `fullStream`
- Streaming with system prompts
- Callbacks during streaming (`onChunk`, `onFinish`)
- Multiple ways to consume streams
- Multi-turn conversations
- Temperature control effects on streaming

**Run it:**
```bash
bun examples/e2e-stream-text-basic.ts
```

**Key concepts:**
- Iterating over `textStream` for real-time text
- Using `fullStream` for complete event tracking (start, text, finish, error)
- Accessing final results after streaming (text, usage)
- Monitoring stream progress with callbacks
- Streaming conversations with message history

**Stream consumption patterns:**
```typescript
// Pattern 1: textStream for simple text-only streaming
for await (const textPart of textStream) {
  process.stdout.write(textPart);
}

// Pattern 2: fullStream for all events
for await (const part of fullStream) {
  switch (part.type) {
    case 'text': /* handle text */
    case 'finish': /* handle completion */
    case 'error': /* handle errors */
  }
}
```

---

### 2. Streaming with Tools (`e2e-stream-text-tools.ts`)

**What it demonstrates:**
- Tool execution during streaming
- Monitoring tool calls in real-time
- Multi-step streaming workflows
- Progress tracking for long operations
- Tool choice control in streaming mode
- Partial tool results as they arrive

**Run it:**
```bash
bun examples/e2e-stream-text-tools.ts
```

**Key concepts:**
- Handling `tool-call` events in stream
- Processing `tool-result` events
- Tracking multi-step execution with `start-step` and `finish-step`
- Using `maxSteps` to control streaming workflows
- Forcing tool selection with `toolChoice`

**Event types:**
- `start-step` - New step begins
- `text` - Text delta from model
- `tool-call` - Model wants to execute a tool
- `tool-result` - Tool execution completed
- `finish-step` - Step completed
- `finish` - Full generation completed

**Example tools:**
- `getWeather` - Simulated API with async delays
- `webSearch` - Multi-step search and analysis
- `fibonacci` - Mathematical calculations
- `processItem` - Batch processing with progress

---

### 3. Real-World Streaming Applications (`e2e-stream-text-real-world.ts`)

**What it demonstrates:**
- Chatbot with streaming responses
- Live code generation with syntax detection
- Real-time document analysis
- Progressive content creation with progress tracking
- Error handling in streams
- Interactive code assistant with tools
- Streaming markdown renderer with element counting
- Abort control for long-running streams

**Run it:**
```bash
bun examples/e2e-stream-text-real-world.ts
```

**Practical applications:**

1. **Chatbot Simulation** - Streaming conversational responses with realistic delays
2. **Live Code Generation** - Real-time code streaming with code block detection
3. **Real-Time Analysis** - Document analysis with metric extraction tools
4. **Progressive Content Creation** - Blog post generation with word/paragraph counting
5. **Error Handling** - Graceful error recovery in streaming contexts
6. **Interactive Assistant** - Code debugging with real-time tool execution
7. **Markdown Rendering** - Live markdown generation with element tracking
8. **Abort Control** - Canceling long-running streams with `AbortController`

**Advanced patterns:**
```typescript
// Pattern 1: Real-time analytics
let wordCount = 0;
for await (const part of fullStream) {
  if (part.type === 'text') {
    wordCount += part.text.split(/\s+/).length;
  }
}

// Pattern 2: Abort control
const abortController = new AbortController();
setTimeout(() => abortController.abort(), 2000);

const { fullStream } = streamText({
  model: claude('sonnet'),
  prompt: 'Long task...',
  abortSignal: abortController.signal,
  onAbort: async () => {
    console.log('Stream aborted');
  },
});
```

---

## Advanced Tool Calling

### Advanced Tool Calling Features (`e2e-advanced-tool-calling.ts`)

**What it demonstrates:**
- `stopWhen` conditions for controlling multi-step execution
- `prepareStep` callback for customizing each step
- Tool input lifecycle hooks (`onInputStart`, `onInputDelta`, `onInputAvailable`)
- Preliminary tool results with AsyncIterable/generators for progress updates
- Active tools for limiting available tools
- Context passing to tools with `experimental_context`
- Tool execution options (messages, abort signals, tool call IDs)
- Response messages for conversation history management

**Run it:**
```bash
bun examples/e2e-advanced-tool-calling.ts
```

**Key concepts:**

**1. stopWhen Conditions**
- Control when multi-step execution stops
- Use `stepCountIs(n)` to limit maximum steps
- More flexible than simple `maxSteps`

**2. prepareStep Callback**
- Customize settings for each step
- Force specific tool choices per step
- Compress message history for long conversations
- Limit active tools dynamically

**3. Tool Input Lifecycle Hooks**
- `onInputStart` - Called when input generation begins (streaming only)
- `onInputDelta` - Called for each chunk during streaming
- `onInputAvailable` - Called when complete input is available and validated

**4. Preliminary Tool Results**
- Use generator functions (`async *execute`) to yield progress updates
- Stream status updates during long-running operations
- Final yield is the actual result

**5. Active Tools**
- Limit which tools are available to the model
- Useful for security (e.g., read-only mode)
- Maintains type safety with full tool set

**6. Context Passing**
- Pass application context to tools via `experimental_context`
- Access user permissions, session data, etc.
- Context available in tool execution options

**7. Tool Execution Options**
- Access conversation messages in tools
- Forward abort signals to long-running operations
- Use tool call IDs for tracking

**Advanced patterns:**
```typescript
// Pattern 1: stopWhen with conditions
const { steps } = await generateText({
  model: claude('sonnet'),
  tools: { /* ... */ },
  stopWhen: stepCountIs(5),
  prompt: 'Complex multi-step task',
});

// Pattern 2: prepareStep for dynamic control
prepareStep: async ({ stepNumber, steps, messages }) => {
  if (stepNumber === 0) {
    return { toolChoice: { type: 'tool', toolName: 'firstTool' } };
  }
  if (messages.length > 20) {
    return { messages: messages.slice(-10) }; // Compress history
  }
  return {};
}

// Pattern 3: Preliminary results with generators
async *execute({ filename }) {
  yield { status: 'starting', progress: 0 };
  await doWork();
  yield { status: 'in-progress', progress: 50 };
  await doMoreWork();
  yield { status: 'complete', progress: 100, result: data };
}

// Pattern 4: Context-aware tools
execute: async (input, { experimental_context }) => {
  const ctx = experimental_context as AppContext;
  if (!ctx.permissions.includes('write')) {
    throw new Error('Permission denied');
  }
  // ...
}
```

**Example scenarios:**
1. **Database Query Workflow** - Multi-step with stopWhen
2. **Adaptive Tool Selection** - prepareStep for dynamic configuration
3. **Real-Time Progress** - Streaming tool execution updates
4. **Large File Processing** - Progress updates via generators
5. **Permission-Based Tools** - Context for access control
6. **Abortable Operations** - Cancel long-running tools
7. **Conversation History** - Managing response messages

---

## Other Examples

### Basic Usage (`basic-usage.ts`)

Simple examples using the provider directly without AI SDK's high-level functions.

```bash
bun examples/basic-usage.ts
```

### Provider Demo (`provider-demo.ts`)

Demonstrates provider instantiation and configuration.

```bash
bun examples/provider-demo.ts
```

## Understanding the Output

Each example shows:
- **Generated Text**: The final response from the model
- **Usage**: Token counts (input, output, total, cached)
- **Finish Reason**: Why generation stopped (stop, length, tool-calls, etc.)
- **Tool Calls**: Which tools were invoked (when applicable)
- **Tool Results**: What the tools returned
- **Steps**: Multi-step execution details

## Common Patterns

### generateText() Patterns

#### 1. Simple Text Generation
```typescript
const result = await generateText({
  model: claude('sonnet'),
  prompt: 'Your question here',
});
console.log(result.text);
```

#### 2. With System Prompt
```typescript
const result = await generateText({
  model: claude('sonnet'),
  system: 'You are a helpful assistant that...',
  prompt: 'Your question here',
});
```

#### 3. With Tools
```typescript
const result = await generateText({
  model: claude('sonnet'),
  prompt: 'Calculate 10 + 5',
  tools: {
    calculate: tool({
      description: 'Perform arithmetic',
      parameters: z.object({
        operation: z.enum(['add', 'subtract']),
        a: z.number(),
        b: z.number(),
      }),
      execute: async ({ operation, a, b }) => {
        return { result: operation === 'add' ? a + b : a - b };
      },
    }),
  },
});
```

#### 4. Multi-Step Workflows
```typescript
const result = await generateText({
  model: claude('sonnet'),
  prompt: 'Complex multi-step task',
  tools: { /* ... */ },
  maxSteps: 10,
  onStepFinish: (step) => {
    console.log(`Step completed: ${step.finishReason}`);
  },
});
```

### generateObject() Patterns

#### 1. Generate Typed Object
```typescript
const { object } = await generateObject({
  model: claude('sonnet'),
  schema: z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email(),
  }),
  prompt: 'Generate a user profile',
});
```

#### 2. Generate Array
```typescript
const { object } = await generateObject({
  model: claude('sonnet'),
  output: 'array',
  schema: z.object({
    productName: z.string(),
    price: z.number(),
  }),
  prompt: 'Generate 5 product listings',
});
```

#### 3. Classify with Enum
```typescript
const { object } = await generateObject({
  model: claude('sonnet'),
  output: 'enum',
  enum: ['positive', 'negative', 'neutral'],
  prompt: 'Classify the sentiment: "This product is great!"',
});
```

#### 4. Extract Information
```typescript
const { object } = await generateObject({
  model: claude('sonnet'),
  schema: z.object({
    name: z.string(),
    skills: z.array(z.string()),
    experience: z.number(),
  }),
  prompt: `Extract structured data from this resume: ${resumeText}`,
});
```

### streamText() Patterns

#### 1. Basic Streaming
```typescript
const { textStream } = streamText({
  model: claude('sonnet'),
  prompt: 'Write a story...',
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

#### 2. Full Stream with Events
```typescript
const { fullStream } = streamText({
  model: claude('sonnet'),
  prompt: 'Your question here',
});

for await (const part of fullStream) {
  switch (part.type) {
    case 'text':
      process.stdout.write(part.text);
      break;
    case 'tool-call':
      console.log(`Calling ${part.toolName}...`);
      break;
    case 'finish':
      console.log(`Done! Usage:`, part.totalUsage);
      break;
  }
}
```

#### 3. Streaming with Tools
```typescript
const { fullStream } = streamText({
  model: claude('sonnet'),
  prompt: 'What is the weather in SF?',
  tools: {
    getWeather: tool({
      description: 'Get weather for a location',
      parameters: z.object({
        location: z.string(),
      }),
      execute: async ({ location }) => {
        return { temp: 72, condition: 'Sunny' };
      },
    }),
  },
});

for await (const part of fullStream) {
  if (part.type === 'text') {
    process.stdout.write(part.text);
  }
}
```

#### 4. Abort Control
```typescript
const abortController = new AbortController();

// Cancel after 5 seconds
setTimeout(() => abortController.abort(), 5000);

const { textStream } = streamText({
  model: claude('sonnet'),
  prompt: 'Write a very long essay...',
  abortSignal: abortController.signal,
});

try {
  for await (const text of textStream) {
    process.stdout.write(text);
  }
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Stream was cancelled');
  }
}
```

## Tips

1. **Start Simple**: Begin with basic examples and gradually add complexity
2. **Use System Prompts**: Guide model behavior with clear system instructions
3. **Monitor Usage**: Track token usage to optimize costs
4. **Lower Temperature for Code**: Use `temperature: 0.3` or lower for code generation
5. **Higher Temperature for Creativity**: Use `temperature: 0.7-0.9` for creative writing
6. **Set Max Steps**: Limit multi-step workflows with `maxSteps` to prevent runaway costs
7. **Use onStepFinish**: Monitor long-running operations

## Troubleshooting

### "API key not found"
Make sure `ANTHROPIC_API_KEY` is set in your environment:
```bash
export ANTHROPIC_API_KEY="your-key"
```

### Import errors
Make sure dependencies are installed:
```bash
bun install
```

### Type errors
Run type checking:
```bash
bun run typecheck
```

## Next Steps

After exploring these examples:
1. Modify the examples to fit your use case
2. Create your own tools for domain-specific tasks
3. Experiment with different models and settings
4. Build complete applications using these patterns

## Resources

- [AI SDK Documentation](https://sdk.vercel.ai/)
- [Claude Agent SDK](https://docs.claude.com/en/docs/agent-sdk/typescript)
- [Anthropic API Documentation](https://docs.anthropic.com/)
