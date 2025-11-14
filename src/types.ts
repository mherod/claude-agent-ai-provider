/**
 * Core types and interfaces for the Claude Agent AI Provider
 */

/**
 * Configuration options for the Claude provider
 * Note: The underlying Agent SDK automatically picks up ANTHROPIC_API_KEY from environment
 */
export interface ClaudeProviderConfig {
  /**
   * Base URL for custom configurations (optional)
   * By default, Agent SDK uses Anthropic's default settings
   */
  baseURL?: string;

  /**
   * Custom headers to include in requests (optional)
   */
  headers?: Record<string, string>;

  /**
   * Request timeout in milliseconds (optional)
   * Agent SDK has its own default timeout
   */
  timeout?: number;

  /**
   * Maximum number of retries for failed requests (optional)
   * Agent SDK has its own retry logic
   */
  maxRetries?: number;
}

/**
 * Model-specific settings that can be configured per request
 */
export interface ClaudeModelSettings {
  /**
   * Maximum number of tokens to generate
   */
  maxTokens?: number;

  /**
   * Sampling temperature (0-1)
   */
  temperature?: number;

  /**
   * Top-p sampling parameter
   */
  topP?: number;

  /**
   * Top-k sampling parameter
   */
  topK?: number;

  /**
   * Stop sequences
   */
  stopSequences?: string[];

  /**
   * Enable extended thinking mode for complex reasoning
   */
  extendedThinking?: boolean;

  /**
   * Agent-specific configuration
   */
  agent?: {
    /**
     * Enable multi-step agent capabilities
     */
    enabled?: boolean;

    /**
     * Maximum number of agent steps
     */
    maxSteps?: number;

    /**
     * Tools available to the agent
     */
    tools?: unknown[];
  };
}

/**
 * Supported Claude model tiers
 * The Claude Agent SDK automatically uses the latest version for each tier
 */
export type ClaudeModelId =
  | 'sonnet'  // Latest Sonnet model (currently Claude 4.5)
  | 'opus'    // Latest Opus model (currently Claude 4.1)
  | 'haiku'   // Latest Haiku model (currently Claude 4.5)
  | 'inherit'; // Inherit model from parent context

/**
 * Response metadata from Claude API
 */
export interface ClaudeResponseMetadata {
  /**
   * Model used for generation
   */
  model: string;

  /**
   * Request ID for tracking
   */
  id: string;

  /**
   * Token usage information
   */
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationInputTokens?: number;
    cacheReadInputTokens?: number;
  };

  /**
   * Stop reason
   */
  stopReason?: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';
}
