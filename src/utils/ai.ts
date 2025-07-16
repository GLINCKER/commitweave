import type { AISummaryOptions, CommitSuggestion, AIProvider } from '../types/ai.js';

export type { AISummaryOptions, CommitSuggestion, AIProvider };

export class MockAIProvider implements AIProvider {
  isConfigured(): boolean {
    return false;
  }

  async generateCommitMessage(_diff: string, _options?: AISummaryOptions): Promise<CommitSuggestion> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      type: 'feat',
      subject: 'AI-generated commit message (mock)',
      body: 'This is a placeholder AI-generated commit message. To enable real AI summaries, configure an AI provider in your config.',
      confidence: 0.8,
      reasoning: 'Mock AI provider - not a real analysis'
    };
  }
}

export class OpenAIProvider implements AIProvider {
  private apiKey: string | undefined;
  private _model: string;

  constructor(apiKey?: string, model = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this._model = model;
  }

  get model(): string {
    return this._model;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generateCommitMessage(_diff: string, _options?: AISummaryOptions): Promise<CommitSuggestion> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    throw new Error('OpenAI integration not yet implemented - this is a placeholder');
  }
}

export class AnthropicProvider implements AIProvider {
  private apiKey: string | undefined;
  private _model: string;

  constructor(apiKey?: string, model = 'claude-3-haiku-20240307') {
    this.apiKey = apiKey;
    this._model = model;
  }

  get model(): string {
    return this._model;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generateCommitMessage(_diff: string, _options?: AISummaryOptions): Promise<CommitSuggestion> {
    if (!this.isConfigured()) {
      throw new Error('Anthropic API key not configured');
    }

    throw new Error('Anthropic integration not yet implemented - this is a placeholder');
  }
}

export function createAIProvider(options?: AISummaryOptions): AIProvider {
  const provider = options?.provider || 'mock';
  
  switch (provider) {
    case 'openai':
      return new OpenAIProvider(options?.apiKey, options?.model);
    case 'anthropic':
      return new AnthropicProvider(options?.apiKey, options?.model);
    default:
      return new MockAIProvider();
  }
}

export async function generateCommitSuggestion(
  diff: string, 
  options?: AISummaryOptions
): Promise<CommitSuggestion> {
  const provider = createAIProvider(options);
  
  if (!provider.isConfigured() && options?.provider && options.provider !== 'mock') {
    console.warn(`AI provider ${options.provider} not configured, falling back to mock`);
    return createAIProvider({ ...options, provider: 'mock' }).generateCommitMessage(diff, options);
  }
  
  return provider.generateCommitMessage(diff, options);
}

export function isAIConfigured(options?: AISummaryOptions): boolean {
  const provider = createAIProvider(options);
  return provider.isConfigured();
}