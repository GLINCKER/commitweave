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