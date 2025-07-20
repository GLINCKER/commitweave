#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { ConfigSchema, type Config } from '../src/types/config.js';
import { defaultConfig } from '../src/config/defaultConfig.js';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface ParsedCommit {
  type?: string | undefined;
  scope?: string | undefined;
  breaking?: boolean | undefined;
  subject?: string | undefined;
  body?: string | undefined;
  footer?: string | undefined;
}

/**
 * Load configuration from glinr-commit.json or use defaults
 */
async function loadConfig(): Promise<Config> {
  try {
    const configPath = join(process.cwd(), 'glinr-commit.json');
    const configFile = await readFile(configPath, 'utf-8');
    const configData = JSON.parse(configFile);
    return ConfigSchema.parse(configData);
  } catch (error) {
    return defaultConfig;
  }
}

/**
 * Get the latest commit message using git
 */
function getLatestCommitMessage(): string {
  try {
    const message = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' });
    return message.trim();
  } catch (error) {
    console.error('Error: Failed to read commit message from git');
    console.error('Make sure you are in a git repository with at least one commit');
    process.exit(1);
  }
}

/**
 * Check if commit message is a special Git commit type that should be excluded from validation
 */
function isSpecialCommit(message: string): boolean {
  const header = message.split('\n')[0] || '';
  
  // Check for merge commits
  if (header.startsWith('Merge ')) {
    return true;
  }
  
  // Check for revert commits
  if (header.startsWith('Revert ')) {
    return true;
  }
  
  // Check for fixup commits
  if (header.startsWith('fixup! ') || header.startsWith('squash! ')) {
    return true;
  }
  
  // Check for initial commits
  if (header.toLowerCase().includes('initial commit')) {
    return true;
  }
  
  return false;
}

/**
 * Parse a conventional commit message
 */
function parseCommitMessage(message: string): ParsedCommit {
  const lines = message.split('\n');
  const header = lines[0] || '';
  
  // Match conventional commit format: type(scope)!: subject
  const conventionalPattern = /^(\w+)(\([^)]+\))?(!)?\s*:\s*(.+)$/;
  const match = header.match(conventionalPattern);
  
  if (match) {
    const [, type, scopeWithParens, breaking, subject] = match;
    const scope = scopeWithParens ? scopeWithParens.slice(1, -1) : undefined;
    const bodyText = lines.slice(2).join('\n').trim();
    
    return {
      type,
      scope,
      breaking: !!breaking,
      subject: subject?.trim(),
      body: bodyText || undefined,
      footer: undefined // Could be parsed more thoroughly if needed
    };
  }
  
  // If not conventional format, treat entire header as subject
  const bodyText = lines.slice(2).join('\n').trim();
  return {
    subject: header.trim(),
    body: bodyText || undefined
  };
}

/**
 * Validate a parsed commit against configuration
 */
function validateCommit(parsed: ParsedCommit, config: Config): ValidationResult {
  const errors: string[] = [];
  
  // Check if conventional commits are required
  if (config.conventionalCommits) {
    if (!parsed.type) {
      errors.push('Conventional commit format required: type(scope): subject');
      errors.push('Valid types: ' + config.commitTypes.map(ct => ct.type).join(', '));
    } else {
      // Validate commit type
      const validTypes = config.commitTypes.map(ct => ct.type);
      if (!validTypes.includes(parsed.type)) {
        errors.push(`Invalid commit type: ${parsed.type}`);
        errors.push('Valid types: ' + validTypes.join(', '));
      }
    }
  }
  
  // Check subject requirements
  if (!parsed.subject || parsed.subject.length === 0) {
    errors.push('Commit subject is required');
  } else {
    // Check subject length
    if (parsed.subject.length > config.maxSubjectLength) {
      errors.push(`Subject too long: ${parsed.subject.length} characters (max: ${config.maxSubjectLength})`);
    }
    
    // Check subject format (should not end with period)
    if (parsed.subject.endsWith('.')) {
      errors.push('Subject should not end with a period');
    }
    
    // Check subject case (should start with lowercase unless it's a proper noun)
    if (config.conventionalCommits && parsed.subject && parsed.subject[0] !== parsed.subject[0].toLowerCase()) {
      errors.push('Subject should start with lowercase letter');
    }
  }
  
  // Check body length if present
  if (parsed.body && config.maxBodyLength) {
    const bodyLines = parsed.body.split('\n');
    for (const line of bodyLines) {
      if (line.length > config.maxBodyLength) {
        errors.push(`Body line too long: ${line.length} characters (max: ${config.maxBodyLength})`);
        break;
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Main validation function
 */
async function main() {
  try {
    console.log('Checking commit message...');
    
    // Load configuration
    const config = await loadConfig();
    console.log('Configuration loaded');
    
    // Get commit message
    const commitMessage = getLatestCommitMessage();
    console.log('Latest commit message:');
    console.log(commitMessage);
    console.log('');
    
    // Check if this is a special commit that should be excluded from validation
    if (isSpecialCommit(commitMessage)) {
      console.log('✓ Special commit detected (merge/revert/fixup) - skipping validation');
      process.exit(0);
    }
    
    // Parse commit message
    const parsed = parseCommitMessage(commitMessage);
    
    // Validate commit
    const validation = validateCommit(parsed, config);
    
    if (validation.valid) {
      console.log('✓ Commit message is valid');
      process.exit(0);
    } else {
      console.log('✗ Commit message validation failed:');
      for (const error of validation.errors) {
        console.log(`  - ${error}`);
      }
      console.log('');
      console.log('Please fix the commit message and try again.');
      
      // Show helpful information
      if (config.conventionalCommits) {
        console.log('');
        console.log('Conventional commit format: type(scope): subject');
        console.log('Example: feat(auth): add user login functionality');
        console.log('');
        console.log('Available types:');
        for (const type of config.commitTypes) {
          console.log(`  ${type.type}: ${type.description}`);
        }
      }
      
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateCommit, parseCommitMessage, loadConfig, isSpecialCommit };