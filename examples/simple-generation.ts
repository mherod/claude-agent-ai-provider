/**
 * Simple generation example
 * This example attempts to use the provider to generate text
 */

import { claude } from '../index.ts';

async function main() {
  console.log('Creating Claude model...');
  const model = claude('sonnet');

  console.log('Model created:');
  console.log('  - Provider:', model.provider);
  console.log('  - Model ID:', model.modelId);
  console.log('  - Spec Version:', model.specificationVersion);

  console.log('\nAttempting generation...');

  try {
    const result = await model.doGenerate({
      prompt: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Say "Hello from the AI SDK bridge!" and nothing else.',
            },
          ],
        },
      ],
    });

    console.log('\n✅ Generation successful!');
    console.log('\nResponse:');
    console.log('─'.repeat(50));

    // Display content
    for (const content of result.content) {
      if (content.type === 'text') {
        console.log(content.text);
      }
    }

    console.log('─'.repeat(50));
    console.log('\nMetadata:');
    console.log('  Finish Reason:', result.finishReason);
    console.log('  Input Tokens:', result.usage.inputTokens);
    console.log('  Output Tokens:', result.usage.outputTokens);
    console.log('  Total Tokens:', result.usage.totalTokens);

  } catch (error) {
    console.error('\n❌ Generation failed:');

    if (error instanceof Error) {
      console.error('  Error:', error.name);
      console.error('  Message:', error.message);

      if (error.message.includes('Claude Code process')) {
        console.log('\n💡 Note: The Agent SDK requires Claude Code to be installed.');
        console.log('   The provider is working correctly, but needs Claude Code');
        console.log('   to actually communicate with the Claude API.');
        console.log('\n   To use this provider:');
        console.log('   1. Install Claude Code from https://claude.ai/download');
        console.log('   2. Set ANTHROPIC_API_KEY environment variable');
        console.log('   3. Run this example again');
      }
    } else {
      console.error('  Unknown error:', error);
    }
  }
}

main();
