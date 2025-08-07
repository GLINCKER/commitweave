import { readFile } from 'fs/promises';
import chalk from 'chalk';
import { prompt } from 'enquirer';
import { load, save, mergeConfigs } from '../../utils/configStore.js';
import { createDiff, formatDiffItem, validateConfigVersion, getDiffSummary } from '../../utils/configDiff.js';
import { ConfigSchema } from '../../types/config.js';
import { handleAsync } from '../../utils/errorHandler.js';

export interface ImportOptions {
  dryRun?: boolean;
  autoConfirm?: boolean;
}

/**
 * Import configuration command
 * Usage: commitweave import <path|url> [--dry-run] [--yes]
 */
export async function importConfig(source: string, options: ImportOptions = {}): Promise<void> {
  await handleAsync(async () => {
    console.log(chalk.blue('📥 Importing configuration...'));
    console.log(chalk.gray(`   Source: ${source}`));
    
    // Load new configuration
    let newConfigData: any;
    try {
      if (source.startsWith('http://') || source.startsWith('https://')) {
        // Fetch from URL
        console.log(chalk.gray('   Fetching from remote URL...'));
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        newConfigData = await response.json();
      } else {
        // Read from file
        console.log(chalk.gray('   Reading from local file...'));
        const fileContent = await readFile(source, 'utf-8');
        newConfigData = JSON.parse(fileContent);
      }
    } catch (error) {
      throw new Error(`Failed to load configuration from ${source}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Validate version compatibility
    const versionCheck = validateConfigVersion(newConfigData);
    if (!versionCheck.valid) {
      console.log(chalk.red('❌ ' + versionCheck.message));
      console.log(chalk.yellow('💡 Please update the configuration to version "1.0" before importing.'));
      process.exit(1);
    }
    
    console.log(chalk.green('✅ ' + versionCheck.message));
    
    // Validate schema
    try {
      ConfigSchema.parse(newConfigData);
    } catch (error) {
      throw new Error(`Configuration schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Load current configuration
    const currentConfig = await load();
    
    // Create diff
    const diff = createDiff(currentConfig, newConfigData);
    const summary = getDiffSummary(diff);
    
    if (diff.length === 0) {
      console.log(chalk.yellow('🤔 No changes detected. Configuration is already up to date.'));
      return;
    }
    
    // Display diff
    console.log(chalk.cyan('\n📊 Configuration Changes:'));
    console.log(chalk.gray('─'.repeat(60)));
    
    for (const item of diff) {
      const formatted = formatDiffItem(item);
      switch (item.type) {
        case 'added':
          console.log(chalk.green(formatted));
          break;
        case 'modified':
          console.log(chalk.yellow(formatted));
          break;
        case 'removed':
          console.log(chalk.red(formatted));
          break;
      }
    }
    
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.cyan(`📈 Summary: ${summary.added} added, ${summary.modified} modified, ${summary.removed} removed`));
    
    // Dry run mode
    if (options.dryRun) {
      console.log(chalk.blue('\n🧪 Dry run mode - no changes will be applied.'));
      return;
    }
    
    // Confirmation
    let shouldApply = options.autoConfirm || false;
    
    if (!shouldApply) {
      const response = await prompt({
        type: 'confirm',
        name: 'apply',
        message: 'Apply these changes to your configuration?',
        initial: false
      }) as { apply: boolean };
      
      shouldApply = response.apply;
    }
    
    if (!shouldApply) {
      console.log(chalk.yellow('✨ Import cancelled - no changes applied.'));
      return;
    }
    
    // Merge and save configuration
    const mergedConfig = mergeConfigs(currentConfig, newConfigData);
    await save(mergedConfig);
    
    console.log(chalk.green('✅ Configuration imported successfully!'));
    console.log(chalk.gray('   Changes have been applied to your local configuration.'));
  });
}

/**
 * Parse import command arguments
 */
export function parseImportArgs(args: string[]): { source: string; options: ImportOptions } {
  let source = '';
  const options: ImportOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--yes' || arg === '-y') {
      options.autoConfirm = true;
    } else if (!arg.startsWith('--') && !source) {
      source = arg;
    }
  }
  
  if (!source) {
    throw new Error('Configuration source path or URL is required');
  }
  
  return { source, options };
}