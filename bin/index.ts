#!/usr/bin/env node

import chalk from 'chalk';
import { prompt } from 'enquirer';
import { writeFile, access, readFile } from 'fs/promises';
import { join } from 'path';
import { simpleGit } from 'simple-git';
import { createCommitFlow } from '../src/cli/createCommitFlow.js';
import { stageAllAndCommit } from '../src/utils/git.js';
import { generateAISummary } from '../src/utils/ai.js';
import { ConfigSchema, type Config } from '../src/types/config.js';
import { defaultConfig } from '../src/config/defaultConfig.js';
import { printBanner, showLoadingAnimation, printFeatureHighlight, BRAND_COLORS } from '../src/ui/banner.js';

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

async function main() {
  const args = process.argv.slice(2);
  const aiFlag = args.includes('--ai');
  const isInteractiveMode = !aiFlag && !args.includes('init') && !args.includes('check') && !args.includes('--help') && !args.includes('-h');
  
  // Show beautiful banner for interactive mode
  if (isInteractiveMode) {
    printBanner();
    await showLoadingAnimation('Initializing Commitweave', 1500);
    console.log('');
    printFeatureHighlight();
  } else {
    // Show compact banner for direct commands
    console.log(chalk.hex(BRAND_COLORS.primary).bold('🧶 Commitweave'));
    console.log(chalk.hex(BRAND_COLORS.muted)('Smart, structured, and beautiful git commits'));
    console.log(chalk.hex(BRAND_COLORS.muted)('Powered by ') + 
                chalk.hex(BRAND_COLORS.accent).bold('GLINR STUDIOS') + 
                chalk.hex(BRAND_COLORS.muted)(' • ') + 
                chalk.hex(BRAND_COLORS.primary)('@typeweaver\n'));
  }

  try {
    // Handle AI flag directly without prompting
    if (aiFlag) {
      console.log(''); // Add some spacing after the compact banner
      await handleAICommitCommand();
      return;
    }

    // Handle other direct commands
    if (args.includes('init')) {
      await handleInitCommand();
      return;
    }

    if (args.includes('check')) {
      await handleCheckCommand();
      return;
    }

    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      return;
    }

    // Default interactive mode with enhanced UI
    console.log(chalk.hex(BRAND_COLORS.accent).bold('🚀 What would you like to do today?'));
    console.log('');
    
    const response = await prompt({
      type: 'select',
      name: 'action',
      message: 'Choose an action:',
      choices: [
        { 
          name: 'create', 
          message: '📝 Create a new commit',
          hint: 'Interactive commit message builder'
        },
        { 
          name: 'ai', 
          message: '🤖 AI-powered commit',
          hint: 'Let AI analyze your changes and suggest a commit message'
        },
        { 
          name: 'init', 
          message: '⚙️  Setup configuration',
          hint: 'Initialize or update commitweave settings'
        },
        { 
          name: 'check', 
          message: '🔍 Validate commit',
          hint: 'Check if your latest commit follows conventions'
        },
        { 
          name: 'help', 
          message: '❓ Show help',
          hint: 'View all available commands and options'
        }
      ]
    });

    switch ((response as { action: string }).action) {
      case 'create':
        await handleCreateCommand();
        break;
      case 'ai':
        await handleAICommitCommand();
        break;
      case 'init':
        await handleInitCommand();
        break;
      case 'check':
        await handleCheckCommand();
        break;
      case 'help':
        showHelp();
        break;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      console.log(chalk.hex(BRAND_COLORS.muted)('\n👋 Thanks for using Commitweave!'));
      console.log(chalk.hex(BRAND_COLORS.primary)('   Happy committing! 🧶✨'));
      console.log(chalk.hex(BRAND_COLORS.muted)('   ') + 
                  chalk.hex(BRAND_COLORS.accent).bold('GLINR STUDIOS') + 
                  chalk.hex(BRAND_COLORS.muted)(' • ') + 
                  chalk.hex(BRAND_COLORS.primary)('@typeweaver'));
      globalThis.process?.exit?.(0);
    }
    console.error(chalk.hex(BRAND_COLORS.error)('💥 An error occurred:'), error);
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
    console.log(chalk.hex(BRAND_COLORS.primary)('╭─────────────────────────────────────────────╮'));
    console.log(chalk.hex(BRAND_COLORS.primary)('│') + chalk.bold.white('         🚀 Commit Creation Wizard           ') + chalk.hex(BRAND_COLORS.primary)('│'));
    console.log(chalk.hex(BRAND_COLORS.primary)('╰─────────────────────────────────────────────╯'));
    console.log('');
    
    await showLoadingAnimation('Preparing commit builder', 800);
    console.log('');
    
    const result = await createCommitFlow();
    
    if (result.cancelled) {
      console.log(chalk.hex(BRAND_COLORS.warning)('✨ Commit creation cancelled'));
      console.log(chalk.hex(BRAND_COLORS.muted)('   No worries, come back anytime! 🧶'));
      return;
    }
    
    console.log(chalk.hex(BRAND_COLORS.accent)('\n╭─────────────────────────────────────────────╮'));
    console.log(chalk.hex(BRAND_COLORS.accent)('│') + chalk.bold.white('         📦 Finalizing Your Commit          ') + chalk.hex(BRAND_COLORS.accent)('│'));
    console.log(chalk.hex(BRAND_COLORS.accent)('╰─────────────────────────────────────────────╯'));
    
    await showLoadingAnimation('Staging files and creating commit', 1200);
    
    const commitResult = await stageAllAndCommit(result.message);
    console.log(chalk.hex(BRAND_COLORS.success).bold('\n🎉 Success! ') + chalk.hex(BRAND_COLORS.success)(commitResult));
    console.log(chalk.hex(BRAND_COLORS.muted)('   Your commit has been created with style! ✨'));
    console.log(chalk.hex(BRAND_COLORS.muted)('   ') + 
                chalk.hex(BRAND_COLORS.accent).bold('GLINR STUDIOS') + 
                chalk.hex(BRAND_COLORS.muted)(' • ') + 
                chalk.hex(BRAND_COLORS.primary)('@typeweaver'));
    
  } catch (error) {
    console.log(chalk.red('\n💥 Oops! Something went wrong:'));
    
    if (error instanceof Error) {
      console.error(chalk.red('   ' + error.message));
      
      if (error.message.includes('Not a git repository')) {
        console.log(chalk.yellow('\n💡 Pro tip: Initialize a git repository first'));
        console.log(chalk.gray('   Run: ') + chalk.cyan('git init'));
      } else if (error.message.includes('No staged changes')) {
        console.log(chalk.yellow('\n💡 Pro tip: Stage some changes first'));
        console.log(chalk.gray('   Run: ') + chalk.cyan('git add .'));
      }
    } else {
      console.error(chalk.red('   Unknown error occurred'));
    }
    
    globalThis.process?.exit?.(1);
  }
}

async function handleAICommitCommand() {
  try {
    console.log(chalk.hex(BRAND_COLORS.accent)('╭─────────────────────────────────────────────╮'));
    console.log(chalk.hex(BRAND_COLORS.accent)('│') + chalk.bold.white('         🤖 AI Commit Assistant             ') + chalk.hex(BRAND_COLORS.accent)('│'));
    console.log(chalk.hex(BRAND_COLORS.accent)('╰─────────────────────────────────────────────╯'));
    console.log('');

    await showLoadingAnimation('Loading AI configuration', 600);

    // Load configuration
    const config = await loadConfig();
    if (!config.ai) {
      console.log(chalk.yellow('⚠️  AI configuration not found'));
      console.log(chalk.gray('   Let\'s set that up for you!'));
      console.log(chalk.cyan('   Run: ') + chalk.white('commitweave init') + chalk.gray(' to configure AI'));
      return;
    }

    await showLoadingAnimation('Connecting to repository', 400);

    // Initialize git
    const git = simpleGit();
    
    // Check if we're in a git repository
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error(chalk.red('❌ Not a git repository'));
      console.log(chalk.yellow('💡 Pro tip: Initialize a git repository first'));
      console.log(chalk.gray('   Run: ') + chalk.cyan('git init'));
      return;
    }

    await showLoadingAnimation('Analyzing staged changes', 800);

    // Get staged diff
    const diff = await git.diff(['--cached']);
    
    if (!diff || diff.trim().length === 0) {
      console.error(chalk.red('❌ No staged changes found'));
      console.log(chalk.yellow('💡 Pro tip: Stage some changes first'));
      console.log(chalk.gray('   Run: ') + chalk.cyan('git add .') + chalk.gray(' or ') + chalk.cyan('git add <file>'));
      return;
    }

    console.log(chalk.green(`✨ Detected ${diff.split('\n').length} lines of changes`));
    console.log('');

    // Generate AI summary
    await showLoadingAnimation('AI is analyzing your code', 2000);
    const { subject, body } = await generateAISummary(diff, config.ai);

    // Show preview
    console.log(chalk.green('\n✨ AI-generated commit message:'));
    console.log(chalk.cyan('┌─ Subject:'));
    console.log(chalk.white(`│  ${subject}`));
    if (body && body.trim()) {
      console.log(chalk.cyan('├─ Body:'));
      body.split('\n').forEach(line => {
        console.log(chalk.white(`│  ${line}`));
      });
    }
    console.log(chalk.cyan('└─'));

    // Ask for confirmation or editing
    const action = await prompt({
      type: 'select',
      name: 'choice',
      message: 'What would you like to do with this AI-generated message?',
      choices: [
        { name: 'commit', message: '✅ Use this message and commit' },
        { name: 'edit', message: '✏️  Edit this message' },
        { name: 'regenerate', message: '🔄 Generate a new message' },
        { name: 'cancel', message: '❌ Cancel' }
      ]
    }) as { choice: string };

    switch (action.choice) {
      case 'commit':
        await commitWithMessage(subject, body);
        break;
      case 'edit':
        await editAndCommit(subject, body);
        break;
      case 'regenerate':
        console.log(chalk.blue('\n🔄 Regenerating AI message...'));
        await handleAICommitCommand(); // Recursive call
        break;
      case 'cancel':
        console.log(chalk.yellow('✨ AI commit cancelled'));
        break;
    }

  } catch (error) {
    console.error(chalk.red('❌ Failed to create AI commit:'));
    
    if (error instanceof Error) {
      console.error(chalk.red('   ' + error.message));
      
      if (error.message.includes('API key')) {
        console.log(chalk.yellow('\n💡 Tip: Configure your AI API key in glinr-commit.json'));
      }
    } else {
      console.error(chalk.red('   Unknown error occurred'));
    }
    
    globalThis.process?.exit?.(1);
  }
}

async function commitWithMessage(subject: string, body: string) {
  const fullMessage = body && body.trim() ? `${subject}\n\n${body}` : subject;
  
  console.log(chalk.blue('\n📦 Creating commit...\n'));
  const commitResult = await stageAllAndCommit(fullMessage);
  console.log(chalk.green('✅ ' + commitResult));
}

async function editAndCommit(subject: string, body: string) {
  const editedSubject = await prompt({
    type: 'input',
    name: 'subject',
    message: 'Edit commit subject:',
    initial: subject
  }) as { subject: string };

  const editedBody = await prompt({
    type: 'input',
    name: 'body',
    message: 'Edit commit body (optional):',
    initial: body || ''
  }) as { body: string };

  await commitWithMessage(editedSubject.subject, editedBody.body);
}

async function handleCheckCommand() {
  try {
    // Import the validation functions directly
    const { validateCommit, parseCommitMessage, loadConfig } = await import('../scripts/check-commit.js');
    const { execSync } = await import('child_process');
    
    console.log('Checking commit message...');
    
    // Load configuration
    const config = await loadConfig();
    console.log('Configuration loaded');
    
    // Get commit message
    let commitMessage: string;
    try {
      commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim();
    } catch (error) {
      console.error('Error: Failed to read commit message from git');
      console.error('Make sure you are in a git repository with at least one commit');
      process.exit(1);
    }
    
    console.log('Latest commit message:');
    console.log(commitMessage);
    console.log('');
    
    // Parse and validate commit message
    const parsed = parseCommitMessage(commitMessage);
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

function showHelp() {
  console.log(chalk.bold('\n📖 Commitweave Help\n'));
  console.log('Available commands:');
  console.log(chalk.cyan('  commitweave') + '          Start interactive commit creation');
  console.log(chalk.cyan('  commitweave --ai') + '      Generate AI-powered commit message');
  console.log(chalk.cyan('  commitweave check') + '     Validate latest commit message');
  console.log(chalk.cyan('  commitweave init') + '      Initialize configuration file');
  console.log(chalk.cyan('  commitweave --help') + '    Show this help message');
  console.log('\nFor more information, visit: https://github.com/GLINCKER/commitweave');
}

// Check if this file is being run directly (ESM only)
if (typeof import.meta !== 'undefined' && typeof globalThis.process !== 'undefined' && import.meta.url === `file://${globalThis.process.argv[1]}`) {
  main().catch(console.error);
}

export { main };