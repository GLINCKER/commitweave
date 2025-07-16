#!/usr/bin/env node

import chalk from 'chalk';
import { prompt } from 'enquirer';

async function main() {
  console.log(chalk.cyan.bold('Welcome to Commitweave 🧶'));
  console.log(chalk.gray('A modern CLI for smart, structured, and beautiful git commits\n'));

  try {
    const response = await prompt({
      type: 'select',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'create', message: '📝 Create a new commit' },
        { name: 'init', message: '⚙️  Initialize configuration' },
        { name: 'help', message: '❓ Show help' }
      ]
    });

    switch ((response as { action: string }).action) {
      case 'create':
        console.log(chalk.yellow('🚧 Commit creation coming soon!'));
        break;
      case 'init':
        console.log(chalk.yellow('🚧 Configuration setup coming soon!'));
        break;
      case 'help':
        showHelp();
        break;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      console.log(chalk.gray('\nGoodbye! 👋'));
      globalThis.process?.exit?.(0);
    }
    console.error(chalk.red('An error occurred:'), error);
    globalThis.process?.exit?.(1);
  }
}

function showHelp() {
  console.log(chalk.bold('\n📖 Commitweave Help\n'));
  console.log('Available commands:');
  console.log(chalk.cyan('  commitweave') + '        Start interactive commit creation');
  console.log(chalk.cyan('  commitweave init') + '    Initialize configuration file');
  console.log(chalk.cyan('  commitweave --help') + '  Show this help message');
  console.log('\nFor more information, visit: https://github.com/typeweaver/commitweave');
}

// Check if this file is being run directly (ESM only)
if (typeof import.meta !== 'undefined' && typeof globalThis.process !== 'undefined' && import.meta.url === `file://${globalThis.process.argv[1]}`) {
  main().catch(console.error);
}

export { main };