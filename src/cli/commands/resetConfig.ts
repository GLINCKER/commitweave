import chalk from 'chalk';
import { prompt } from 'enquirer';
import { save } from '../../utils/configStore.js';
import { defaultConfig } from '../../config/defaultConfig.js';
import { handleAsync } from '../../utils/errorHandler.js';

export interface ResetOptions {
  force?: boolean;
}

/**
 * Reset configuration to defaults command
 * Usage: commitweave reset [--force]
 */
export async function resetConfig(options: ResetOptions = {}): Promise<void> {
  await handleAsync(async () => {
    console.log(chalk.yellow('⚠️  Reset Configuration'));
    console.log(chalk.gray('This will restore all settings to their default values.'));
    console.log(chalk.gray('Any custom configuration will be lost.'));
    console.log('');
    
    // Show what will be reset
    console.log(chalk.cyan('🔄 Default settings that will be restored:'));
    console.log(`  • ${defaultConfig.commitTypes.length} default commit types`);
    console.log(`  • Emoji support: ${defaultConfig.emojiEnabled ? 'enabled' : 'disabled'}`);
    console.log(`  • Conventional commits: ${defaultConfig.conventionalCommits ? 'enabled' : 'disabled'}`);
    console.log(`  • Subject length limit: ${defaultConfig.maxSubjectLength} characters`);
    console.log(`  • Body length limit: ${defaultConfig.maxBodyLength} characters`);
    console.log(`  • Claude integration: ${defaultConfig.claude?.enabled ? 'enabled' : 'disabled'}`);
    console.log('');
    
    // Confirmation
    let shouldReset = options.force || false;
    
    if (!shouldReset) {
      const response = await prompt({
        type: 'confirm',
        name: 'reset',
        message: 'Are you sure you want to reset your configuration to defaults?',
        initial: false
      }) as { reset: boolean };
      
      shouldReset = response.reset;
    }
    
    if (!shouldReset) {
      console.log(chalk.yellow('✨ Reset cancelled - configuration unchanged.'));
      return;
    }
    
    // Reset to defaults
    await save(defaultConfig);
    
    console.log(chalk.green('✅ Configuration reset to defaults successfully!'));
    console.log(chalk.gray('   Your local glinr-commit.json has been updated.'));
    console.log('');
    console.log(chalk.gray('💡 Use ') + chalk.cyan('commitweave list') + chalk.gray(' to view the default configuration'));
    console.log(chalk.gray('💡 Use ') + chalk.cyan('commitweave init') + chalk.gray(' to customize your settings'));
  });
}

/**
 * Parse reset command arguments
 */
export function parseResetArgs(args: string[]): ResetOptions {
  const options: ResetOptions = {};
  
  for (const arg of args) {
    if (arg === '--force' || arg === '-f') {
      options.force = true;
    }
  }
  
  return options;
}