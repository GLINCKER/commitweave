#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';
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
    console.error(chalk.red('❌ Error: Failed to read commit message from git'));
    console.error(chalk.yellow('💡 Make sure you are in a git repository with at least one commit'));
    console.error(chalk.gray('   Run: ') + chalk.cyan('git log --oneline -1') + chalk.gray(' to check recent commits'));
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
 * Find closest matching commit type using simple string similarity
 */
function findClosestType(input: string, validTypes: string[]): string | null {
  let closestMatch = null;
  let minDistance = Infinity;
  
  for (const type of validTypes) {
    const distance = levenshteinDistance(input.toLowerCase(), type.toLowerCase());
    if (distance < minDistance && distance <= 2) { // Only suggest if within 2 edit distance
      minDistance = distance;
      closestMatch = type;
    }
  }
  
  return closestMatch;
}

/**
 * Simple Levenshtein distance calculation
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Validate a parsed commit against configuration
 */
function validateCommit(parsed: ParsedCommit, config: Config): ValidationResult {
  const errors: string[] = [];
  
  // Check if conventional commits are required
  if (config.conventionalCommits) {
    if (!parsed.type) {
      errors.push('Missing conventional commit format');
      errors.push('📋 Expected format: type(scope): subject');
      errors.push('🔧 Example: feat(auth): add user login functionality');
      errors.push('✅ Valid types: ' + config.commitTypes.map(ct => ct.type).join(', '));
    } else {
      // Validate commit type
      const validTypes = config.commitTypes.map(ct => ct.type);
      if (!validTypes.includes(parsed.type)) {
        errors.push(`Unknown commit type: "${parsed.type}"`);
        const closestMatch = findClosestType(parsed.type, validTypes);
        if (closestMatch) {
          errors.push(`💡 Did you mean "${closestMatch}"?`);
        }
        errors.push('✅ Valid types: ' + validTypes.join(', '));
      }
    }
  }
  
  // Check subject requirements
  if (!parsed.subject || parsed.subject.length === 0) {
    errors.push('❌ Commit subject is missing');
    errors.push('💡 Add a brief description of your changes');
  } else {
    // Check subject length
    if (parsed.subject.length > config.maxSubjectLength) {
      const excess = parsed.subject.length - config.maxSubjectLength;
      errors.push(`📏 Subject too long: ${parsed.subject.length} characters (max: ${config.maxSubjectLength})`);
      errors.push(`💡 Remove ${excess} characters to meet the limit`);
      errors.push(`✂️  Try: "${parsed.subject.slice(0, config.maxSubjectLength - 3)}..."`);
    }
    
    // Check subject format (should not end with period)
    if (parsed.subject.endsWith('.')) {
      errors.push('🔤 Subject should not end with a period');
      errors.push(`✅ Use: "${parsed.subject.slice(0, -1)}"`);
    }
    
    // Check subject case (should start with lowercase unless it's a proper noun)
    if (config.conventionalCommits && parsed.subject && parsed.subject[0] !== parsed.subject[0].toLowerCase()) {
      errors.push('🔤 Subject should start with lowercase letter');
      errors.push(`✅ Use: "${parsed.subject[0].toLowerCase() + parsed.subject.slice(1)}"`);
    }
  }
  
  // Check body length if present
  if (parsed.body && config.maxBodyLength) {
    const bodyLines = parsed.body.split('\n');
    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i];
      if (line.length > config.maxBodyLength) {
        const excess = line.length - config.maxBodyLength;
        errors.push(`📝 Body line ${i + 1} too long: ${line.length} characters (max: ${config.maxBodyLength})`);
        errors.push(`💡 Remove ${excess} characters or split into multiple lines`);
        errors.push(`✂️  Consider: "${line.slice(0, config.maxBodyLength - 3)}..."`);
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
    console.log(chalk.blue('🔍 Checking commit message...'));
    
    // Load configuration
    const config = await loadConfig();
    console.log(chalk.gray('✓ Configuration loaded'));
    
    // Get commit message
    const commitMessage = getLatestCommitMessage();
    console.log(chalk.cyan('\n📝 Latest commit message:'));
    console.log(chalk.white('┌' + '─'.repeat(50)));
    commitMessage.split('\n').forEach(line => {
      console.log(chalk.white('│ ') + chalk.gray(line));
    });
    console.log(chalk.white('└' + '─'.repeat(50)));
    
    // Check if this is a special commit that should be excluded from validation
    if (isSpecialCommit(commitMessage)) {
      console.log(chalk.green('✅ Special commit detected (merge/revert/fixup) - skipping validation'));
      process.exit(0);
    }
    
    // Parse commit message
    const parsed = parseCommitMessage(commitMessage);
    
    // Validate commit
    const validation = validateCommit(parsed, config);
    
    if (validation.valid) {
      console.log(chalk.green('\n🎉 Commit message is valid!'));
      console.log(chalk.gray('   Your commit follows all conventional commit standards'));
      process.exit(0);
    } else {
      console.log(chalk.red('\n❌ Commit message validation failed:'));
      console.log(chalk.red('──────────────────────────────────────'));
      for (const error of validation.errors) {
        console.log(chalk.red('  • ') + chalk.white(error));
      }
      console.log('');
      console.log(chalk.yellow('🛠️  How to fix:'));
      
      // Show helpful information
      if (config.conventionalCommits) {
        console.log(chalk.cyan('\n📋 Conventional commit format: ') + chalk.white('type(scope): subject'));
        console.log(chalk.cyan('🔧 Example: ') + chalk.green('feat(auth): add user login functionality'));
        console.log('');
        console.log(chalk.cyan('✅ Available types:'));
        for (const type of config.commitTypes) {
          const emoji = config.emojiEnabled ? `${type.emoji} ` : '';
          console.log(chalk.white(`  ${emoji}${type.type.padEnd(10)} - ${type.description}`));
        }
      }
      
      console.log(chalk.gray('\n💡 Pro tips:'));
      console.log(chalk.gray('  • Keep subject line under 50 characters'));
      console.log(chalk.gray('  • Use imperative mood (e.g., "add" not "added")'));
      console.log(chalk.gray('  • Don\'t end subject line with a period'));
      console.log(chalk.gray('  • Use body to explain what and why, not how'));
      
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('💥 Error:'), error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateCommit, parseCommitMessage, loadConfig, isSpecialCommit };