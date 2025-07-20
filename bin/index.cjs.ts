#!/usr/bin/env node

// CommonJS version of the CLI entrypoint
const { prompt } = require('enquirer');
const { writeFile, access, readFile } = require('fs/promises');
const { join } = require('path');

// Dynamic import for ESM-only chalk
let chalk: any;
let createCommitFlow: any;
let stageAllAndCommit: any;
let generateAISummary: any;
let simpleGit: any;
let ConfigSchema: any;
let defaultConfig: any;
let bannerModule: any;

async function loadConfig() {
  try {
    if (!ConfigSchema || !defaultConfig) {
      const configModule = require('../dist/lib/types/config.js');
      const defaultConfigModule = require('../dist/lib/config/defaultConfig.js');
      ConfigSchema = configModule.ConfigSchema;
      defaultConfig = defaultConfigModule.defaultConfig;
    }
    
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
  
  // Load dynamic dependencies
  if (!chalk) {
    chalk = await import('chalk');
    chalk = chalk.default;
  }
  
  if (!bannerModule) {
    bannerModule = require('../dist/lib/ui/banner.js');
  }
  
  // Show beautiful banner for interactive mode
  if (isInteractiveMode) {
    bannerModule.printBanner();
    await bannerModule.showLoadingAnimation('Initializing Commitweave', 1500);
    console.log('');
    bannerModule.printFeatureHighlight();
  } else {
    // Show compact banner for direct commands
    console.log(chalk.cyan.bold('🧶 Commitweave'));
    console.log(chalk.gray('Smart, structured, and beautiful git commits\n'));
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
      await showHelp();
      return;
    }

    // Default interactive mode with enhanced UI
    console.log(chalk.cyan.bold('🚀 What would you like to do today?'));
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
        await showHelp();
        break;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      console.log(chalk.gray('\n👋 Thanks for using Commitweave!'));
      console.log(chalk.cyan('   Happy committing! 🧶✨'));
      process.exit(0);
    }
    console.error(chalk.red('💥 An error occurred:'), error);
    process.exit(1);
  }
}

async function handleInitCommand() {
  // Load chalk dynamically since it's ESM-only
  if (!chalk) {
    chalk = await import('chalk');
    chalk = chalk.default;
  }
  
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
    
    process.exit(1);
  }
}

async function handleCreateCommand() {
  // Load dependencies dynamically
  if (!chalk) {
    chalk = await import('chalk');
    chalk = chalk.default;
  }
  if (!createCommitFlow) {
    const module = require('../dist/lib/cli/createCommitFlow.js');
    createCommitFlow = module.createCommitFlow;
  }
  if (!stageAllAndCommit) {
    const module = require('../dist/lib/utils/git.js');
    stageAllAndCommit = module.stageAllAndCommit;
  }

  try {
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
    
    process.exit(1);
  }
}

async function handleAICommitCommand() {
  try {
    console.log(chalk.magenta('╭─────────────────────────────────────────────╮'));
    console.log(chalk.magenta('│') + chalk.bold.white('         🤖 AI Commit Assistant             ') + chalk.magenta('│'));
    console.log(chalk.magenta('╰─────────────────────────────────────────────╯'));
    console.log('');

    await bannerModule.showLoadingAnimation('Loading AI configuration', 600);

    // Load configuration
    const config = await loadConfig();
    if (!config.ai) {
      console.log(chalk.yellow('⚠️  AI configuration not found'));
      console.log(chalk.gray('   Let\'s set that up for you!'));
      console.log(chalk.cyan('   Run: ') + chalk.white('commitweave init') + chalk.gray(' to configure AI'));
      return;
    }

    await bannerModule.showLoadingAnimation('Connecting to repository', 400);

    // Load dependencies
    if (!simpleGit) {
      const gitModule = require('simple-git');
      simpleGit = gitModule.simpleGit;
    }
    if (!generateAISummary) {
      const aiModule = require('../dist/lib/utils/ai.js');
      generateAISummary = aiModule.generateAISummary;
    }

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

    await bannerModule.showLoadingAnimation('Analyzing staged changes', 800);

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
    await bannerModule.showLoadingAnimation('AI is analyzing your code', 2000);
    const { subject, body } = await generateAISummary(diff, config.ai);

    // Show preview
    console.log(chalk.green('\n✨ AI-generated commit message:'));
    console.log(chalk.cyan('┌─ Subject:'));
    console.log(chalk.white(`│  ${subject}`));
    if (body && body.trim()) {
      console.log(chalk.cyan('├─ Body:'));
      body.split('\n').forEach((line: string) => {
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
    
    process.exit(1);
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
    // Load dependencies
    const { execSync } = require('child_process');
    
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
    
    // Check if this is a special commit that should be excluded from validation
    if (isSpecialCommit(commitMessage)) {
      console.log('✓ Special commit detected (merge/revert/fixup) - skipping validation');
      process.exit(0);
    }
    
    // Use inline validation logic for CommonJS compatibility
    const validation = validateCommitMessage(commitMessage, config);
    
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

function parseCommitMessage(message: string) {
  const lines = message.split('\n');
  const header = lines[0] || '';
  
  // Match conventional commit format: type(scope)!: subject
  const conventionalPattern = /^(\w+)(\([^)]+\))?(!)?\s*:\s*(.+)$/;
  const match = header.match(conventionalPattern);
  
  if (match) {
    const [, type, scopeWithParens, breaking, subject] = match;
    const scope = scopeWithParens ? scopeWithParens.slice(1, -1) : undefined;
    
    return {
      type,
      scope,
      breaking: !!breaking,
      subject: subject?.trim(),
      body: lines.slice(2).join('\n').trim() || undefined,
      footer: undefined
    };
  }
  
  // If not conventional format, treat entire header as subject
  return {
    subject: header.trim(),
    body: lines.slice(2).join('\n').trim() || undefined
  };
}

function validateCommitMessage(message: string, config: any) {
  const errors: string[] = [];
  const parsed = parseCommitMessage(message);
  
  // Check if conventional commits are required
  if (config.conventionalCommits) {
    if (!parsed.type) {
      errors.push('Conventional commit format required: type(scope): subject');
      errors.push('Valid types: ' + config.commitTypes.map((ct: any) => ct.type).join(', '));
    } else {
      // Validate commit type
      const validTypes = config.commitTypes.map((ct: any) => ct.type);
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

async function showHelp() {
  // Load chalk dynamically since it's ESM-only
  if (!chalk) {
    chalk = await import('chalk');
    chalk = chalk.default;
  }
  
  console.log(chalk.bold('\n📖 Commitweave Help\n'));
  console.log('Available commands:');
  console.log(chalk.cyan('  commitweave') + '          Start interactive commit creation');
  console.log(chalk.cyan('  commitweave --ai') + '      Generate AI-powered commit message');
  console.log(chalk.cyan('  commitweave check') + '     Validate latest commit message');
  console.log(chalk.cyan('  commitweave init') + '      Initialize configuration file');
  console.log(chalk.cyan('  commitweave --help') + '    Show this help message');
  console.log('\nFor more information, visit: https://github.com/typeweaver/commitweave');
}

// Check if this file is being run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };