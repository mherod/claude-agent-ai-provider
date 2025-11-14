/**
 * Message format converters between AI SDK and Claude Agent SDK
 */

import type {
  LanguageModelV2Prompt,
  LanguageModelV2Message,
  LanguageModelV2Content,
  LanguageModelV2Usage,
} from '@ai-sdk/provider';
import type {
  SDKMessage,
  SDKAssistantMessage,
  SDKUserMessage,
  SDKResultMessage,
} from '@anthropic-ai/claude-agent-sdk';

/**
 * Converts AI SDK prompt format to a plain text string for Agent SDK
 * For the initial implementation, we'll convert to a simple text prompt
 */
export function convertPromptToAgentSDKFormat(prompt: LanguageModelV2Prompt): string {
  const parts: string[] = [];

  for (const message of prompt) {
    if (message.role === 'system') {
      // System messages will be handled separately in options
      continue;
    }

    const rolePrefix = message.role === 'user' ? 'User:' : 'Assistant:';
    const contentText = extractTextFromContent(message.content);

    if (contentText) {
      parts.push(`${rolePrefix} ${contentText}`);
    }
  }

  return parts.join('\n\n');
}

/**
 * Extracts text content from AI SDK message content (non-system messages)
 */
function extractTextFromContent(
  content: Array<{ type: string; text?: string }>
): string {
  const textParts: string[] = [];

  for (const part of content) {
    if (part.type === 'text' && part.text) {
      textParts.push(part.text);
    }
    // TODO: Handle other content types (images, files, etc.)
  }

  return textParts.join(' ');
}

/**
 * Extracts system prompt from AI SDK messages
 */
export function extractSystemPrompt(prompt: LanguageModelV2Prompt): string | undefined {
  for (const message of prompt) {
    if (message.role === 'system') {
      // System content is a string
      return message.content;
    }
  }
  return undefined;
}

/**
 * Converts Agent SDK assistant message to AI SDK content format
 */
export function convertAssistantMessageToContent(
  message: SDKAssistantMessage
): LanguageModelV2Content[] {
  const content: LanguageModelV2Content[] = [];

  // Extract text from the message
  const messageContent = message.message?.content;
  if (Array.isArray(messageContent)) {
    for (const block of messageContent) {
      if (block.type === 'text') {
        content.push({
          type: 'text',
          text: block.text,
        });
      } else if (block.type === 'tool_use') {
        // Convert tool use to AI SDK format
        content.push({
          type: 'tool-call',
          toolCallId: block.id,
          toolName: block.name,
          input: block.input,
        });
      }
    }
  }

  return content;
}

/**
 * Converts Agent SDK result to AI SDK usage format
 */
export function convertResultToUsage(result: SDKResultMessage): LanguageModelV2Usage {
  const usage = result.usage;

  return {
    inputTokens: usage?.input_tokens ?? 0,
    outputTokens: usage?.output_tokens ?? 0,
    totalTokens:
      (usage?.input_tokens ?? 0) +
      (usage?.output_tokens ?? 0) +
      (usage?.cache_creation_input_tokens ?? 0) +
      (usage?.cache_read_input_tokens ?? 0),
    cachedInputTokens: usage?.cache_read_input_tokens,
  };
}

/**
 * Converts Agent SDK stop reason to AI SDK finish reason
 */
export function convertStopReason(
  stopReason?: string
): 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown' {
  switch (stopReason) {
    case 'end_turn':
      return 'stop';
    case 'max_tokens':
      return 'length';
    case 'tool_use':
      return 'tool-calls';
    case 'stop_sequence':
      return 'stop';
    default:
      return 'unknown';
  }
}

/**
 * Collects all assistant messages from Agent SDK message stream
 */
export async function collectAssistantMessages(
  messageIterator: AsyncIterable<SDKMessage>
): Promise<{
  content: LanguageModelV2Content[];
  finishReason: 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown';
  usage: LanguageModelV2Usage;
  result?: SDKResultMessage;
}> {
  const allContent: LanguageModelV2Content[] = [];
  let finalResult: SDKResultMessage | undefined;
  let lastStopReason: string | undefined;

  for await (const message of messageIterator) {
    if (message.type === 'assistant') {
      const messageContent = convertAssistantMessageToContent(message);
      allContent.push(...messageContent);
      lastStopReason = message.message?.stop_reason;
    } else if (message.type === 'result') {
      finalResult = message;
    }
  }

  const usage = finalResult ? convertResultToUsage(finalResult) : {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };

  return {
    content: allContent,
    finishReason: convertStopReason(lastStopReason),
    usage,
    result: finalResult,
  };
}
