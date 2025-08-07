import chalk from 'chalk';
import { load, getActiveConfigPath } from '../../utils/configStore.js';
import { stripSecrets } from '../../utils/configDiff.js';
import { handleAsync } from '../../utils/errorHandler.js';

/**
 * List current configuration command
 * Usage: commitweave list
 */
export async function listConfig(): Promise<void> {
  await handleAsync(async () => {
    console.log(chalk.blue('📋 Current Configuration'));
    console.log(chalk.gray('─'.repeat(50)));

    // Load and display config source
    const configPath = await getActiveConfigPath();
    if (configPath) {
      console.log(chalk.gray(`Source: ${configPath}`));
    } else {
      console.log(chalk.gray('Source: Default configuration (no config file found)'));
    }

    console.log('');

    // Load current configuration
    const config = await load();

    // Strip secrets for display
    const displayConfig = stripSecrets(config);

    // Pretty print configuration sections
    console.log(chalk.cyan('🎯 Core Settings:'));
    console.log(`  Version: ${chalk.white(displayConfig.version)}`);
    console.log(
      `  Emoji Enabled: ${displayConfig.emojiEnabled ? chalk.green('Yes') : chalk.red('No')}`
    );
    console.log(
      `  Conventional Commits: ${displayConfig.conventionalCommits ? chalk.green('Yes') : chalk.red('No')}`
    );
    console.log(`  Max Subject Length: ${chalk.white(displayConfig.maxSubjectLength)}`);
    console.log(`  Max Body Length: ${chalk.white(displayConfig.maxBodyLength)}`);

    console.log('\n' + chalk.cyan('📝 Commit Types:'));
    for (const type of displayConfig.commitTypes) {
      const aliases = type.aliases ? ` (${type.aliases.join(', ')})` : '';
      console.log(
        `  ${type.emoji} ${chalk.white(type.type)}${aliases} - ${chalk.gray(type.description)}`
      );
    }

    if (displayConfig.ai) {
      console.log('\n' + chalk.cyan('🤖 AI Configuration:'));
      console.log(`  Provider: ${chalk.white(displayConfig.ai.provider)}`);
      console.log(`  Model: ${displayConfig.ai.model || 'default'}`);
      console.log(`  API Key: ${displayConfig.ai.apiKey || '(not configured)'}`);
      console.log(`  Temperature: ${displayConfig.ai.temperature}`);
      console.log(`  Max Tokens: ${displayConfig.ai.maxTokens}`);
    }

    if (displayConfig.claude) {
      console.log('\n' + chalk.cyan('🔮 Claude Configuration:'));
      console.log(
        `  Enabled: ${displayConfig.claude.enabled ? chalk.green('Yes') : chalk.red('No')}`
      );
      console.log(`  Model: ${chalk.white(displayConfig.claude.model)}`);
      console.log(`  API Key: ${displayConfig.claude.apiKey || '(not configured)'}`);
      console.log(`  Max Tokens: ${displayConfig.claude.maxTokens}`);
    }

    if (displayConfig.hooks) {
      console.log('\n' + chalk.cyan('🔗 Git Hooks:'));
      if (displayConfig.hooks.preCommit && displayConfig.hooks.preCommit.length > 0) {
        console.log(`  Pre-commit: ${displayConfig.hooks.preCommit.join(', ')}`);
      }
      if (displayConfig.hooks.postCommit && displayConfig.hooks.postCommit.length > 0) {
        console.log(`  Post-commit: ${displayConfig.hooks.postCommit.join(', ')}`);
      }
      if (!displayConfig.hooks.preCommit?.length && !displayConfig.hooks.postCommit?.length) {
        console.log(chalk.gray('  (no hooks configured)'));
      }
    }

    console.log('\n' + chalk.gray('─'.repeat(50)));
    console.log(
      chalk.gray('💡 Use ') +
        chalk.cyan('commitweave export') +
        chalk.gray(' to save this configuration')
    );
    console.log(
      chalk.gray('💡 Use ') +
        chalk.cyan('commitweave doctor') +
        chalk.gray(' to validate configuration health')
    );
  });
}
