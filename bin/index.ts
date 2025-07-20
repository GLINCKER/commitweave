#!/usr/bin/env node

import chalk from 'chalk';
import { prompt } from 'enquirer';
import { writeFile, access } from 'fs/promises';
import { join } from 'path';
import { createCommitFlow } from '../src/cli/createCommitFlow.js';
import { stageAllAndCommit } from '../src/utils/git.js';

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
        await handleCreateCommand();
        break;
      case 'init':
        await handleInitCommand();
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

async function handleInitCommand() {
  try {
    const configPath = join(process.cwd(), 'glinr-commit.json');
    
    // Check if file already exists
    let fileExists = false;
    try {
      await access(configPath);
      fileExists = true;
    } catch {
      // File doesn't exist, which is fine
    }
    
    if (fileExists) {
      console.log(chalk.yellow('⚠️  Configuration file already exists!'));
      
      const { overwrite } = await prompt({
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to overwrite the existing glinr-commit.json?',
        initial: false
      }) as { overwrite: boolean };
      
      if (!overwrite) {
        console.log(chalk.gray('Configuration initialization cancelled.'));
        return;
      }
    }
    
    // Basic configuration structure
    const basicConfig = {
      commitTypes: [
        { type: "feat", emoji: "✨", description: "New feature" },
        { type: "fix", emoji: "🐛", description: "Bug fix" },
        { type: "docs", emoji: "📚", description: "Documentation changes" },
        { type: "style", emoji: "💎", description: "Code style changes" },
        { type: "refactor", emoji: "📦", description: "Code refactoring" },
        { type: "test", emoji: "🚨", description: "Testing" },
        { type: "chore", emoji: "♻️", description: "Maintenance tasks" }
      ],
      emojiEnabled: true,
      conventionalCommits: true,
      maxSubjectLength: 50,
      maxBodyLength: 72
    };
    
    console.log(chalk.blue('📝 Creating configuration file...'));
    
    await writeFile(configPath, JSON.stringify(basicConfig, null, 2), 'utf-8');
    
    console.log(chalk.green('✅ Configuration file created successfully!'));
    console.log(chalk.gray(`   Location: ${configPath}`));
    console.log(chalk.cyan('\n🚀 Next steps:'));
    console.log(chalk.white('   • Run') + chalk.cyan(' commitweave ') + chalk.white('to start committing!'));
    console.log(chalk.white('   • Edit') + chalk.cyan(' glinr-commit.json ') + chalk.white('to customize your settings'));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to create configuration file:'));
    
    if (error instanceof Error) {
      console.error(chalk.red('   ' + error.message));
    } else {
      console.error(chalk.red('   Unknown error occurred'));
    }
    
    globalThis.process?.exit?.(1);
  }
}

async function handleCreateCommand() {
  try {
    console.log(chalk.blue('\n🚀 Starting commit creation...\n'));
    
    const result = await createCommitFlow();
    
    if (result.cancelled) {
      console.log(chalk.yellow('✨ Commit creation cancelled'));
      return;
    }
    
    console.log(chalk.blue('\n📦 Staging files and creating commit...\n'));
    
    const commitResult = await stageAllAndCommit(result.message);
    console.log(chalk.green('✅ ' + commitResult));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to create commit:'));
    
    if (error instanceof Error) {
      console.error(chalk.red('   ' + error.message));
      
      if (error.message.includes('Not a git repository')) {
        console.log(chalk.yellow('\n💡 Tip: Initialize a git repository with "git init"'));
      } else if (error.message.includes('No staged changes')) {
        console.log(chalk.yellow('\n💡 Tip: Make some changes to your files first'));
      }
    } else {
      console.error(chalk.red('   Unknown error occurred'));
    }
    
    globalThis.process?.exit?.(1);
  }
}

function showHelp() {
  console.log(chalk.bold('\n📖 Commitweave Help\n'));
  console.log('Available commands:');
  console.log(chalk.cyan('  commitweave') + '        Start interactive commit creation');
  console.log(chalk.cyan('  commitweave init') + '    Initialize configuration file');
  console.log(chalk.cyan('  commitweave --help') + '  Show this help message');
  console.log('\nFor more information, visit: https://github.com/GLINCKER/commitweave');
}

// Check if this file is being run directly (ESM only)
if (typeof import.meta !== 'undefined' && typeof globalThis.process !== 'undefined' && import.meta.url === `file://${globalThis.process.argv[1]}`) {
  main().catch(console.error);
}

export { main };