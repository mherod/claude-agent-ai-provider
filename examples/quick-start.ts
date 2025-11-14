/**
 * Quick Start Example
 *
 * The simplest possible example to get started with the Claude Agent AI Provider
 * and AI SDK's generateText() function.
 */

import { generateText } from 'ai';
import { claude } from '../index.ts';

// Make sure ANTHROPIC_API_KEY is set in your environment
// export ANTHROPIC_API_KEY="your-api-key-here"

const result = await generateText({
  model: claude('sonnet'),
  prompt: 'Explain what AI SDK is in one sentence.',
});

console.log(result.text);
