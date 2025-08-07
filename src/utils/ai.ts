import type { AISummaryOptions, CommitSuggestion, AIProvider } from '../types/ai.js';
import type { AIConfig } from '../types/config.js';
import { lazy } from './lazyImport.js';

export type { AISummaryOptions, CommitSuggestion, AIProvider };

// Error classes are now lazy-loaded in provider files

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

// Provider classes are now in separate files for lazy loading

export async function createAIProvider(options?: AISummaryOptions): Promise<AIProvider> {
  const provider = options?.provider || 'mock';
  
  switch (provider) {
    case 'openai': {
      const { OpenAIProvider } = await lazy(() => import('./providers/openai.js'));
      return new OpenAIProvider(options?.apiKey, options?.model);
    }
    case 'anthropic': {
      const { AnthropicProvider } = await lazy(() => import('./providers/anthropic.js'));
      return new AnthropicProvider(options?.apiKey, options?.model);
    }
    default:
      return new MockAIProvider();
  }
}

export async function generateCommitSuggestion(
  diff: string, 
  options?: AISummaryOptions
): Promise<CommitSuggestion> {
  const provider = await createAIProvider(options);
  
  if (!provider.isConfigured() && options?.provider && options.provider !== 'mock') {
    const chalk = (await lazy(() => import('chalk'))).default;
    console.log(chalk.yellow(`⚠️  ${options.provider} provider not configured, falling back to mock AI`));
    console.log(chalk.gray(`   💡 Configure your ${options.provider} API key to enable real AI suggestions`));
    const fallbackProvider = await createAIProvider({ ...options, provider: 'mock' });
    return fallbackProvider.generateCommitMessage(diff, options);
  }
  
  return provider.generateCommitMessage(diff, options);
}

export async function isAIConfigured(options?: AISummaryOptions): Promise<boolean> {
  const provider = await createAIProvider(options);
  return provider.isConfigured();
}

/**
 * Generate AI-powered commit summary from git diff
 * @param diff - Git diff string
 * @param config - AI configuration
 * @returns Promise resolving to subject and body
 */
export async function generateAISummary(
  diff: string, 
  config: AIConfig
): Promise<{ subject: string; body: string }> {
  // Convert AIConfig to AISummaryOptions
  const options: AISummaryOptions = {
    provider: config.provider || 'mock'
  };

  // Only set optional properties if they exist
  if (config.apiKey) options.apiKey = config.apiKey;
  if (config.model) options.model = config.model;
  if (config.temperature !== undefined) options.temperature = config.temperature;
  if (config.maxTokens !== undefined) options.maxTokens = config.maxTokens;

  // If no API key provided for a real provider, fall back to mock
  if (!config.apiKey && config.provider && config.provider !== 'mock') {
    options.provider = 'mock';
  }

  try {
    const suggestion = await generateCommitSuggestion(diff, options);
    
    // Format the subject line with conventional commit format
    let subject = suggestion.subject;
    if (suggestion.type) {
      const scope = suggestion.scope ? `(${suggestion.scope})` : '';
      subject = `${suggestion.type}${scope}: ${suggestion.subject}`;
    }

    // Ensure subject line is within limit (≤ 50 chars ideally)
    if (subject.length > 50) {
      subject = subject.substring(0, 47) + '...';
    }

    return {
      subject,
      body: suggestion.body || ''
    };
  } catch (error) {
    // Fallback to mock if AI provider fails
    const chalk = (await lazy(() => import('chalk'))).default;
    console.log(chalk.yellow('⚠️  AI provider encountered an error, falling back to mock AI'));
    console.log(chalk.gray(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    
    const mockProvider = new MockAIProvider();
    const suggestion = await mockProvider.generateCommitMessage(diff);
    
    return {
      subject: suggestion.subject,
      body: suggestion.body || ''
    };
  }
}