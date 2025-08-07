import { writeFile } from 'fs/promises';
import chalk from 'chalk';
import { load } from '../../utils/configStore.js';
import { stripSecrets, createMinimalConfig } from '../../utils/configDiff.js';
import { handleAsync } from '../../utils/errorHandler.js';

export interface ExportOptions {
  output?: string;
  format?: 'minimal' | 'full';
}

/**
 * Export configuration command
 * Usage: commitweave export [--output file] [--format minimal|full]
 */
export async function exportConfig(options: ExportOptions = {}): Promise<void> {
  await handleAsync(async () => {
    console.log(chalk.blue('📤 Exporting configuration...'));

    // Load current configuration
    const config = await load();

    // Process configuration based on format
    let exportConfig;
    if (options.format === 'minimal') {
      exportConfig = createMinimalConfig(config);
      console.log(chalk.gray('   Using minimal format (core settings only)'));
    } else {
      exportConfig = stripSecrets(config);
      console.log(chalk.gray('   Using full format (secrets redacted)'));
    }

    // Convert to JSON
    const configJson = JSON.stringify(exportConfig, null, 2);

    // Output to file or stdout
    if (options.output) {
      await writeFile(options.output, configJson, 'utf-8');
      console.log(chalk.green(`✅ Configuration exported to: ${options.output}`));
    } else {
      console.log(chalk.gray('─'.repeat(50)));
      console.log(configJson);
      console.log(chalk.gray('─'.repeat(50)));
    }

    console.log(chalk.gray(`   Format: ${options.format || 'full'}`));
    console.log(chalk.gray(`   Version: ${config.version}`));
    console.log(chalk.gray(`   Secrets: ${options.format === 'full' ? 'redacted' : 'excluded'}`));
  });
}

/**
 * Parse export command arguments
 */
export function parseExportArgs(args: string[]): ExportOptions {
  const options: ExportOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--output' || arg === '-o') {
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        options.output = nextArg;
        i++; // Skip next arg
      }
    } else if (arg === '--format' || arg === '-f') {
      const nextArg = args[i + 1];
      if (nextArg === 'minimal' || nextArg === 'full') {
        options.format = nextArg;
        i++; // Skip next arg
      }
    }
  }

  return options;
}
