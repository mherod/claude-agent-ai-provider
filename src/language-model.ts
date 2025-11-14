/**
 * Language Model implementation for Claude Agent AI Provider
 * Bridges AI SDK to Claude Agent SDK
 */

import type {
  LanguageModelV2,
  LanguageModelV2CallOptions,
  LanguageModelV2StreamPart,
  LanguageModelV2Content,
  LanguageModelV2FinishReason,
  LanguageModelV2Usage,
  LanguageModelV2CallWarning,
} from '@ai-sdk/provider';

import { query } from '@anthropic-ai/claude-agent-sdk';
import type { Options as AgentSDKOptions, SDKMessage } from '@anthropic-ai/claude-agent-sdk';

import type { ClaudeProviderConfig, ClaudeModelSettings, ClaudeModelId } from './types';
import { convertToAISDKError } from './errors';
import {
  convertPromptToAgentSDKFormat,
  extractSystemPrompt,
  convertAssistantMessageToContent,
  convertStopReason,
  convertResultToUsage,
  collectAssistantMessages,
  stripMarkdownCodeBlocks,
} from './converters';

/**
 * Claude Agent Language Model implementation
 * Implements the AI SDK v5 LanguageModelV2 interface
 */
export class ClaudeLanguageModel implements LanguageModelV2 {
  readonly specificationVersion = 'v2' as const;
  readonly provider = 'claude-agent';
  readonly modelId: ClaudeModelId;

  private config: ClaudeProviderConfig;
  private settings: ClaudeModelSettings;

  constructor(
    modelId: ClaudeModelId,
    config: ClaudeProviderConfig = {},
    settings: ClaudeModelSettings = {}
  ) {
    this.modelId = modelId;
    this.config = config;
    this.settings = settings;
  }

  /**
   * Supported URL patterns by media type that this provider can handle natively
   * Format: Record<mediaTypePattern, RegExp[]>
   */
  get supportedUrls(): Record<string, RegExp[]> {
    return {
      // Images - data URLs
      'image/*': [/^data:image\/(png|jpeg|jpg|gif|webp);base64,/],
      // Documents - HTTP(S) URLs
      'application/pdf': [/^https?:\/\//i],
      'text/*': [/^https?:\/\//i],
    };
  }

  /**
   * Builds Agent SDK options from AI SDK call options
   * Uses Claude Agent SDK defaults wherever possible
   */
  private buildAgentSDKOptions(options: LanguageModelV2CallOptions): AgentSDKOptions {
    let systemPrompt = extractSystemPrompt(options.prompt);

    // Start with minimal config - let Agent SDK use its defaults
    const agentOptions: AgentSDKOptions = {
      model: this.modelId,
      // Agent SDK automatically:
      // - Picks up ANTHROPIC_API_KEY from environment
      // - Uses default cwd (process.cwd())
      // - Loads settings from ~/.claude/settings.json by default
    };

    // Handle structured output (generateObject) by forcing JSON-only mode
    if (options.responseFormat?.type === 'json') {
      const jsonInstructions = [
        'You must respond with ONLY valid JSON. Do not include any explanatory text, markdown formatting, or comments.',
        'Output a single JSON object that matches the required schema.',
        'Do not wrap the JSON in markdown code blocks or add any text before or after the JSON.',
      ];

      if (options.responseFormat.schema) {
        jsonInstructions.push(
          `The JSON must conform to this schema: ${JSON.stringify(options.responseFormat.schema)}`
        );
      }

      if (options.responseFormat.description) {
        jsonInstructions.push(`Description: ${options.responseFormat.description}`);
      }

      // Prepend JSON instructions to system prompt
      const jsonSystemPrompt = jsonInstructions.join('\n');
      systemPrompt = systemPrompt
        ? `${jsonSystemPrompt}\n\n${systemPrompt}`
        : jsonSystemPrompt;
    }

    // Add system prompt if present
    if (systemPrompt) {
      agentOptions.systemPrompt = systemPrompt;
    }

    // Apply custom settings from provider config if specified
    if (this.settings.agent?.enabled) {
      agentOptions.agents = this.settings.agent.tools as any;
    }

    // Map tools if provided in options
    if (options.tools && options.tools.length > 0) {
      agentOptions.allowedTools = options.tools.map((tool) => {
        if ('type' in tool && tool.type === 'function') {
          return tool.name;
        }
        return 'unknown';
      }).filter(name => name !== 'unknown');
    }

    return agentOptions;
  }

  /**
   * Non-streaming generation method
   * Implements the LanguageModelV2 doGenerate interface
   */
  async doGenerate(options: LanguageModelV2CallOptions): Promise<{
    content: Array<LanguageModelV2Content>;
    finishReason: LanguageModelV2FinishReason;
    usage: LanguageModelV2Usage;
    warnings: Array<LanguageModelV2CallWarning>;
    request?: {
      body?: unknown;
    };
    response?: {
      headers?: Record<string, string>;
      body?: unknown;
    };
  }> {
    try {
      const warnings: Array<LanguageModelV2CallWarning> = [];

      // Convert AI SDK prompt to Agent SDK format
      const promptText = convertPromptToAgentSDKFormat(options.prompt);
      const agentOptions = this.buildAgentSDKOptions(options);

      // Call Agent SDK query() and collect all messages
      const queryResult = query({
        prompt: promptText,
        options: agentOptions,
      });

      // Collect all messages from the async generator
      let { content, finishReason, usage, result } = await collectAssistantMessages(queryResult);

      // Post-process JSON responses to strip markdown code blocks
      if (options.responseFormat?.type === 'json') {
        content = content.map((item) => {
          if (item.type === 'text' && typeof item.text === 'string') {
            return {
              ...item,
              text: stripMarkdownCodeBlocks(item.text),
            };
          }
          return item;
        });
      }

      return {
        content,
        finishReason,
        usage,
        warnings,
        response: result
          ? {
              body: result,
            }
          : undefined,
      };
    } catch (error) {
      throw convertToAISDKError(error);
    }
  }

  /**
   * Streaming generation method
   * Implements the LanguageModelV2 doStream interface
   */
  async doStream(options: LanguageModelV2CallOptions): Promise<{
    stream: ReadableStream<LanguageModelV2StreamPart>;
    request?: {
      body?: unknown;
    };
    response?: {
      headers?: Record<string, string>;
    };
  }> {
    try {
      // Convert AI SDK prompt to Agent SDK format
      const promptText = convertPromptToAgentSDKFormat(options.prompt);
      const agentOptions = this.buildAgentSDKOptions(options);

      // Call Agent SDK query()
      const queryResult = query({
        prompt: promptText,
        options: agentOptions,
      });

      // Create a ReadableStream that converts Agent SDK messages to AI SDK stream parts
      const stream = this.createStreamFromAgentSDK(queryResult);

      return {
        stream,
      };
    } catch (error) {
      throw convertToAISDKError(error);
    }
  }

  /**
   * Converts Agent SDK async generator to AI SDK ReadableStream
   */
  private createStreamFromAgentSDK(
    agentMessages: AsyncIterable<SDKMessage>
  ): ReadableStream<LanguageModelV2StreamPart> {
    const self = this;
    let textPartId = 0;

    return new ReadableStream<LanguageModelV2StreamPart>({
      async start(controller) {
        try {
          for await (const message of agentMessages) {
            // Handle different message types from Agent SDK
            if (message.type === 'assistant') {
              // Process assistant message content
              const messageContent = message.message?.content;
              if (Array.isArray(messageContent)) {
                for (const block of messageContent) {
                  if (block.type === 'text') {
                    // Stream text content as deltas
                    const id = `text-${textPartId++}`;
                    controller.enqueue({
                      type: 'text-delta',
                      id,
                      delta: block.text,
                    });
                  } else if (block.type === 'tool_use') {
                    // Stream tool calls
                    controller.enqueue({
                      type: 'tool-call',
                      toolCallId: block.id,
                      toolName: block.name,
                      input: JSON.stringify(block.input),
                    });
                  }
                }
              }
            } else if (message.type === 'result') {
              // Final result - send finish event
              const usage = convertResultToUsage(message);

              // Determine finish reason from result
              let finishReason: LanguageModelV2FinishReason = 'stop';
              if (message.subtype === 'success') {
                finishReason = 'stop';
              } else if (message.is_error) {
                finishReason = 'error';
              }

              controller.enqueue({
                type: 'finish',
                finishReason,
                usage,
              });
            }
          }

          controller.close();
        } catch (error) {
          controller.error(convertToAISDKError(error));
        }
      },
    });
  }
}
