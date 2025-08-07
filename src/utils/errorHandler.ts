import chalk from 'chalk';
import type { AIError } from '../types/ai.js';
import { 
  ClaudeRateLimitError, 
  ClaudeValidationError, 
  OpenAIError, 
  NetworkTimeoutError, 
  GitRepoError, 
  InvalidConfigError,
  CommitValidationError 
} from '../types/ai.js';

/**
 * Maps AI errors to user-friendly messages with suggested actions
 */
function getErrorMessage(error: Error): { message: string; suggestion?: string } {
  if (error instanceof ClaudeRateLimitError) {
    return {
      message: 'Claude API rate limit exceeded',
      suggestion: 'Please wait a moment before trying again, or consider upgrading your Claude API plan'
    };
  }

  if (error instanceof ClaudeValidationError) {
    return {
      message: `Claude API validation error: ${error.message}`,
      suggestion: 'Check your API key and request parameters in your configuration'
    };
  }

  if (error instanceof OpenAIError) {
    return {
      message: `OpenAI API error: ${error.message}`,
      suggestion: 'Verify your OpenAI API key and quota in your configuration'
    };
  }

  if (error instanceof NetworkTimeoutError) {
    return {
      message: 'Network request timed out',
      suggestion: 'Check your internet connection and try again'
    };
  }

  if (error instanceof GitRepoError) {
    return {
      message: `Git repository error: ${error.message}`,
      suggestion: 'Ensure you are in a valid Git repository with staged changes'
    };
  }

  if (error instanceof InvalidConfigError) {
    return {
      message: `Configuration error: ${error.message}`,
      suggestion: 'Run "commitweave init" to reset your configuration or check glinr-commit.json'
    };
  }

  if (error instanceof CommitValidationError) {
    const suggestions = error.suggestions.length > 0 ? error.suggestions.join('\n   ') : 'Follow conventional commit guidelines';
    return {
      message: `Commit validation failed: ${error.message}`,
      suggestion: `Fix the commit message:\n   ${suggestions}`
    };
  }

  // Fallback for unknown errors
  return {
    message: `Unexpected error: ${error.message}`,
    suggestion: 'Please try again or report this issue if it persists'
  };
}

/**
 * Centralized async error handler that maps errors to friendly messages and exits gracefully
 */
export async function handleAsync<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const { message, suggestion } = getErrorMessage(error);

    // Display user-friendly error message
    console.error(chalk.red('💥 Error: ') + chalk.white(message));
    
    if (suggestion) {
      console.error(chalk.yellow('💡 Suggestion: ') + chalk.gray(suggestion));
    }

    console.error(chalk.gray('\nIf this problem persists, please check:'));
    console.error(chalk.gray('  • Your configuration file (glinr-commit.json)'));
    console.error(chalk.gray('  • Your API keys and network connection'));
    console.error(chalk.gray('  • That you are in a valid Git repository'));

    process.exit(1);
  }
}

/**
 * Synchronous error handler for non-async operations
 */
export function handleSync<T>(fn: () => T): T {
  try {
    return fn();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const { message, suggestion } = getErrorMessage(error);

    console.error(chalk.red('💥 Error: ') + chalk.white(message));
    
    if (suggestion) {
      console.error(chalk.yellow('💡 Suggestion: ') + chalk.gray(suggestion));
    }

    process.exit(1);
  }
}

/**
 * Check if an error is an AI-related error
 */
export function isAIError(error: unknown): error is AIError {
  return error instanceof ClaudeRateLimitError ||
         error instanceof ClaudeValidationError ||
         error instanceof OpenAIError ||
         error instanceof NetworkTimeoutError ||
         error instanceof GitRepoError ||
         error instanceof InvalidConfigError ||
         error instanceof CommitValidationError;
}

/**
 * Wrap a promise with a timeout to prevent hanging
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new NetworkTimeoutError(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}