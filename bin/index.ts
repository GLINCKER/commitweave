#!/usr/bin/env node

// Performance tracking
import { maybeReport } from '../src/utils/perf.js';

// Core imports needed for startup
import { join } from 'path';
import { readFile } from 'fs/promises';
import { parseFlags, shouldUseFancyUI, isInteractiveMode, isConfigCommand } from '../src/cli/flags.js';
import { lazy } from '../src/utils/lazyImport.js';

// Lazy imports - only load when needed
let chalk: any;
let ConfigSchema: any;
let defaultConfig: any;

async function loadConfig(): Promise<any> {
  // Lazy load config dependencies
  if (!ConfigSchema || !defaultConfig) {
    const [configModule, defaultConfigModule] = await Promise.all([
      lazy(() => import('../src/types/config.js')),
      lazy(() => import('../src/config/defaultConfig.js'))
    ]);
    ConfigSchema = configModule.ConfigSchema;
    defaultConfig = defaultConfigModule.defaultConfig;
  }

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
  const flags = parseFlags();
  
  // Load chalk for basic output (lazy loaded)
  if (!chalk) {
    chalk = (await lazy(() => import('chalk'))).default;
  }

  // Handle version flag quickly for benchmarks
  if (flags.version) {
    const pkg = JSON.parse(await readFile(join(process.cwd(), 'package.json'), 'utf-8'));
    console.log(pkg.version || '0.1.0-beta.4');
    maybeReport();
    return;
  }

  const useFancyUI = shouldUseFancyUI(flags);
  const interactive = isInteractiveMode(flags);
  const isConfig = isConfigCommand(flags);
  
  // Show beautiful banner for interactive mode (gated behind fancy UI flag)
  if (interactive && useFancyUI) {
    const { printBanner, showLoadingAnimation, printFeatureHighlight } = 
      await lazy(() => import('../src/ui/banner.js'));
    printBanner();
    await showLoadingAnimation('Initializing Commitweave', 1500);
    console.log('');
    printFeatureHighlight();
  } else if (!flags.plain) {
    // Show minimal banner for non-plain mode
    const { BRAND_COLORS } = await lazy(() => import('../src/ui/banner.js'));
    console.log(chalk.hex(BRAND_COLORS.primary).bold('🧶 Commitweave'));
    console.log(chalk.hex(BRAND_COLORS.muted)('Smart, structured, and beautiful git commits'));
    if (!isConfig && !flags.version) {
      console.log(chalk.hex(BRAND_COLORS.muted)('Powered by ') + 
                  chalk.hex(BRAND_COLORS.accent).bold('GLINR STUDIOS') + 
                  chalk.hex(BRAND_COLORS.muted)(' • ') + 
                  chalk.hex(BRAND_COLORS.primary)('@typeweaver\n'));
    }
  }

  try {
    // Handle configuration commands first
    if (flags.export) {
      const { exportConfig, parseExportArgs } = await lazy(() => import('../src/cli/commands/exportConfig.js'));
      const options = parseExportArgs(flags._.slice(1));
      await exportConfig(options);
      maybeReport();
      return;
    }

    if (flags.import) {
      const { importConfig, parseImportArgs } = await lazy(() => import('../src/cli/commands/importConfig.js'));
      const { source, options } = parseImportArgs(flags._);
      await importConfig(source, options);
      maybeReport();
      return;
    }

    if (flags.list) {
      const { listConfig } = await lazy(() => import('../src/cli/commands/listConfig.js'));
      await listConfig();
      maybeReport();
      return;
    }

    if (flags.reset) {
      const { resetConfig, parseResetArgs } = await lazy(() => import('../src/cli/commands/resetConfig.js'));
      const options = parseResetArgs(flags._.slice(1));
      await resetConfig(options);
      maybeReport();
      return;
    }

    if (flags.doctor) {
      const { doctorConfig } = await lazy(() => import('../src/cli/commands/doctorConfig.js'));
      await doctorConfig();
      maybeReport();
      return;
    }

    // Handle AI flag directly without prompting
    if (flags.ai) {
      console.log(''); // Add some spacing after the compact banner
      await handleAICommitCommand(useFancyUI);
      maybeReport();
      return;
    }

    // Handle other direct commands
    if (flags.init) {
      await handleInitCommand();
      maybeReport();
      return;
    }

    if (flags.check) {
      await handleCheckCommand();
      maybeReport();
      return;
    }

    if (flags.help) {
      showHelp();
      maybeReport();
      return;
    }

    // Default interactive mode with enhanced UI
    const { BRAND_COLORS } = await lazy(() => import('../src/ui/banner.js'));
    const { prompt } = await lazy(() => import('enquirer'));
    
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
          name: 'config', 
          message: '⚙️  Configuration',
          hint: 'Manage your CommitWeave settings'
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
        await handleCreateCommand(useFancyUI);
        break;
      case 'ai':
        await handleAICommitCommand(useFancyUI);
        break;
      case 'init':
        await handleInitCommand();
        break;
      case 'check':
        await handleCheckCommand();
        break;
      case 'config':
        await handleConfigSubmenu();
        break;
      case 'help':
        showHelp();
        break;
    }
    
    maybeReport();
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      const { BRAND_COLORS } = await lazy(() => import('../src/ui/banner.js')).catch(() => ({ 
        BRAND_COLORS: {
          muted: '#6c757d',
          primary: '#8b008b',
          accent: '#e94057'
        } 
      }));
      console.log(chalk.hex(BRAND_COLORS.muted)('\n👋 Thanks for using Commitweave!'));
      console.log(chalk.hex(BRAND_COLORS.primary)('   Happy committing! 🧶✨'));
      console.log(chalk.hex(BRAND_COLORS.muted)('   ') + 
                  chalk.hex(BRAND_COLORS.accent).bold('GLINR STUDIOS') + 
                  chalk.hex(BRAND_COLORS.muted)(' • ') + 
                  chalk.hex(BRAND_COLORS.primary)('@typeweaver'));
      globalThis.process?.exit?.(0);
    }
    const { BRAND_COLORS } = await lazy(() => import('../src/ui/banner.js')).catch(() => ({ 
        BRAND_COLORS: { error: '#ff6b6b' } 
      }));
    console.error(chalk.hex(BRAND_COLORS.error)('💥 An error occurred:'), error);
    maybeReport();
    globalThis.process?.exit?.(1);
  }
}

async function handleInitCommand() {
  try {
    const { access, writeFile } = await lazy(() => import('fs/promises'));
    const { prompt } = await lazy(() => import('enquirer'));
    
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

async function handleCreateCommand(useFancyUI: boolean = false) {
  try {
    const { BRAND_COLORS } = await lazy(() => import('../src/ui/banner.js'));
    
    if (useFancyUI) {
      const { showLoadingAnimation } = await lazy(() => import('../src/ui/banner.js'));
      console.log(chalk.hex(BRAND_COLORS.primary)('╭─────────────────────────────────────────────╮'));
      console.log(chalk.hex(BRAND_COLORS.primary)('│') + chalk.bold.white('         🚀 Commit Creation Wizard           ') + chalk.hex(BRAND_COLORS.primary)('│'));
      console.log(chalk.hex(BRAND_COLORS.primary)('╰─────────────────────────────────────────────╯'));
      console.log('');
      
      await showLoadingAnimation('Preparing commit builder', 800);
      console.log('');
    }
    
    const { createCommitFlow } = await lazy(() => import('../src/cli/createCommitFlow.js'));
    const result = await createCommitFlow();
    
    if (result.cancelled) {
      console.log(chalk.hex(BRAND_COLORS.warning)('✨ Commit creation cancelled'));
      console.log(chalk.hex(BRAND_COLORS.muted)('   No worries, come back anytime! 🧶'));
      return;
    }
    
    if (useFancyUI) {
      const { showLoadingAnimation } = await lazy(() => import('../src/ui/banner.js'));
      console.log(chalk.hex(BRAND_COLORS.accent)('\n╭─────────────────────────────────────────────╮'));
      console.log(chalk.hex(BRAND_COLORS.accent)('│') + chalk.bold.white('         📦 Finalizing Your Commit          ') + chalk.hex(BRAND_COLORS.accent)('│'));
      console.log(chalk.hex(BRAND_COLORS.accent)('╰─────────────────────────────────────────────╯'));
      
      await showLoadingAnimation('Staging files and creating commit', 1200);
    } else {
      console.log(chalk.blue('\n📦 Staging files and creating commit...'));
    }
    
    const { stageAllAndCommit } = await lazy(() => import('../src/utils/git.js'));
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

async function handleAICommitCommand(useFancyUI: boolean = false) {
  try {
    const { BRAND_COLORS } = await lazy(() => import('../src/ui/banner.js'));
    
    if (useFancyUI) {
      const { showLoadingAnimation } = await lazy(() => import('../src/ui/banner.js'));
      console.log(chalk.hex(BRAND_COLORS.accent)('╭─────────────────────────────────────────────╮'));
      console.log(chalk.hex(BRAND_COLORS.accent)('│') + chalk.bold.white('         🤖 AI Commit Assistant             ') + chalk.hex(BRAND_COLORS.accent)('│'));
      console.log(chalk.hex(BRAND_COLORS.accent)('╰─────────────────────────────────────────────╯'));
      console.log('');

      await showLoadingAnimation('Loading AI configuration', 600);
    }

    // Load configuration
    const config = await loadConfig();
    if (!config.ai) {
      console.log(chalk.yellow('⚠️  AI configuration not found'));
      console.log(chalk.gray('   Let\'s set that up for you!'));
      console.log(chalk.cyan('   Run: ') + chalk.white('commitweave init') + chalk.gray(' to configure AI'));
      return;
    }

    if (useFancyUI) {
      const { showLoadingAnimation } = await lazy(() => import('../src/ui/banner.js'));
      await showLoadingAnimation('Connecting to repository', 400);
    }

    // Initialize git
    const { simpleGit } = await lazy(() => import('simple-git'));
    const git = simpleGit();
    
    // Check if we're in a git repository
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error(chalk.red('❌ Not a git repository'));
      console.log(chalk.yellow('💡 Pro tip: Initialize a git repository first'));
      console.log(chalk.gray('   Run: ') + chalk.cyan('git init'));
      return;
    }

    if (useFancyUI) {
      const { showLoadingAnimation } = await lazy(() => import('../src/ui/banner.js'));
      await showLoadingAnimation('Analyzing staged changes', 800);
    }

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
    if (useFancyUI) {
      const { showLoadingAnimation } = await lazy(() => import('../src/ui/banner.js'));
      await showLoadingAnimation('AI is analyzing your code', 2000);
    } else {
      console.log('🤖 Analyzing your changes with AI...');
    }
    
    const { generateAISummary } = await lazy(() => import('../src/utils/ai.js'));
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
    const { prompt } = await lazy(() => import('enquirer'));
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
  const { stageAllAndCommit } = await lazy(() => import('../src/utils/git.js'));
  const commitResult = await stageAllAndCommit(fullMessage);
  console.log(chalk.green('✅ ' + commitResult));
}

async function editAndCommit(subject: string, body: string) {
  const { prompt } = await lazy(() => import('enquirer'));
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
  console.log('Check command not yet optimized for performance mode.');
  console.log('Use: npx tsx scripts/check-commit.ts for now.');
  process.exit(0);
}

async function handleConfigSubmenu() {
  const { BRAND_COLORS } = await lazy(() => import('../src/ui/banner.js'));
  const { prompt } = await lazy(() => import('enquirer'));
  
  console.log(chalk.hex(BRAND_COLORS.accent).bold('⚙️  Configuration Management'));
  console.log('');
  
  const response = await prompt({
    type: 'select',
    name: 'configAction',
    message: 'Choose a configuration action:',
    choices: [
      { 
        name: 'list', 
        message: '📋 List current configuration',
        hint: 'View your current settings'
      },
      { 
        name: 'export', 
        message: '📤 Export configuration',
        hint: 'Save configuration to file or stdout'
      },
      { 
        name: 'import', 
        message: '📥 Import configuration',
        hint: 'Load configuration from file or URL'
      },
      { 
        name: 'doctor', 
        message: '🩺 Check configuration health',
        hint: 'Validate and diagnose configuration issues'
      },
      { 
        name: 'reset', 
        message: '🔄 Reset to defaults',
        hint: 'Restore original configuration'
      }
    ]
  });

  switch ((response as { configAction: string }).configAction) {
    case 'list':
      const { listConfig } = await lazy(() => import('../src/cli/commands/listConfig.js'));
      await listConfig();
      break;
    case 'export':
      const { exportConfig } = await lazy(() => import('../src/cli/commands/exportConfig.js'));
      await exportConfig();
      break;
    case 'import':
      console.log(chalk.yellow('💡 To import a configuration, use: commitweave import <path-or-url>'));
      break;
    case 'doctor':
      const { doctorConfig } = await lazy(() => import('../src/cli/commands/doctorConfig.js'));
      await doctorConfig();
      break;
    case 'reset':
      const { resetConfig } = await lazy(() => import('../src/cli/commands/resetConfig.js'));
      await resetConfig();
      break;
  }
}

function showHelp() {
  console.log(chalk.bold('\n📖 Commitweave Help\n'));
  console.log('Available commands:');
  
  console.log(chalk.cyan('\n🚀 Commit Commands:'));
  console.log(chalk.cyan('  commitweave') + '            Start interactive commit creation');
  console.log(chalk.cyan('  commitweave --ai') + '        Generate AI-powered commit message');
  console.log(chalk.cyan('  commitweave check') + '       Validate latest commit message');
  
  console.log(chalk.cyan('\n⚙️  Configuration Commands:'));
  console.log(chalk.cyan('  commitweave list') + '        Show current configuration');
  console.log(chalk.cyan('  commitweave export') + '      Export configuration to file/stdout');
  console.log(chalk.cyan('    --output <file>') + '       Export to specific file');
  console.log(chalk.cyan('    --format minimal|full') + ' Export format (default: full)');
  console.log(chalk.cyan('  commitweave import <path>') + ' Import configuration from file/URL');
  console.log(chalk.cyan('    --dry-run') + '            Preview changes without applying');
  console.log(chalk.cyan('    --yes') + '                Auto-confirm import');
  console.log(chalk.cyan('  commitweave reset') + '       Reset configuration to defaults');
  console.log(chalk.cyan('    --force') + '              Skip confirmation prompt');
  console.log(chalk.cyan('  commitweave doctor') + '      Validate configuration health');
  
  console.log(chalk.cyan('\n🛠️  Setup Commands:'));
  console.log(chalk.cyan('  commitweave init') + '        Initialize configuration file');
  console.log(chalk.cyan('  commitweave --help') + '      Show this help message');
  
  console.log('\nFor more information, visit: https://github.com/GLINCKER/commitweave');
}

// Check if this file is being run directly
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}

export { main };