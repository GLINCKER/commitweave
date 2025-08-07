export interface AISummaryOptions {
  provider?: 'openai' | 'anthropic' | 'mock';
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface CommitSuggestion {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  confidence: number;
  reasoning: string;
}

export interface AIProvider {
  generateCommitMessage(diff: string, options?: AISummaryOptions): Promise<CommitSuggestion>;
  isConfigured(): boolean;
}

// Claude-specific error classes
export class ClaudeRateLimitError extends Error {
  constructor(message: string = 'Rate limited') {
    super(message);
    this.name = 'ClaudeRateLimitError';
  }
}

export class ClaudeValidationError extends Error {
  constructor(message: string = 'Validation error') {
    super(message);
    this.name = 'ClaudeValidationError';
  }
}

// OpenAI error classes (for completeness)
export class OpenAIError extends Error {
  constructor(message: string = 'OpenAI API error') {
    super(message);
    this.name = 'OpenAIError';
  }
}

// Additional error classes
export class NetworkTimeoutError extends Error {
  constructor(message: string = 'Network request timed out') {
    super(message);
    this.name = 'NetworkTimeoutError';
  }
}

export class GitRepoError extends Error {
  constructor(message: string = 'Git repository error') {
    super(message);
    this.name = 'GitRepoError';
  }
}

export class InvalidConfigError extends Error {
  constructor(message: string = 'Invalid configuration') {
    super(message);
    this.name = 'InvalidConfigError';
  }
}

export class CommitValidationError extends Error {
  public suggestions: string[];
  
  constructor(message: string, suggestions: string[] = []) {
    super(message);
    this.name = 'CommitValidationError';
    this.suggestions = suggestions;
  }
}

// Union type for all AI-related errors
export type AIError = ClaudeRateLimitError | ClaudeValidationError | OpenAIError | NetworkTimeoutError | GitRepoError | InvalidConfigError | CommitValidationError;