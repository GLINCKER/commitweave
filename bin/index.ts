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

// Helper function to analyze diff statistics
function analyzeDiffStats(diff: string) {
  const lines = diff.split('\n');
  const files = new Set<string>();
  let additions = 0;
  let deletions = 0;
  
  for (const line of lines) {
    if (line.startsWith('+++') || line.startsWith('---')) {
      const match = line.match(/[ab]\/(.*)/);
      if (match && match[1] !== 'dev/null') {
        files.add(match[1]);
      }
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      additions++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;
    }
  }
  
  return {
    filesChanged: files.size,
    files: Array.from(files),
    additions,
    deletions
  };
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
    console.log(pkg.version || '1.1.0');
    maybeReport();
    return;
  }

  // Load configuration to check UI preferences
  const config = await loadConfig();
  const useFancyUI = shouldUseFancyUI(flags, config);
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
    
    let response;
    try {
      response = await prompt({
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
    } catch (error) {
      // Handle Ctrl+C or other interruptions gracefully
      console.log(chalk.yellow('\n👋 Goodbye! Use --help to see all available commands.'));
      process.exit(0);
    }

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
    
    // Check if AI is configured, fall back to mock if not
    let aiConfig = config.ai;
    if (!aiConfig || (!aiConfig.apiKey && aiConfig.provider !== 'mock')) {
      console.log(chalk.yellow('⚠️  AI API key not configured, falling back to mock AI provider'));
      console.log(chalk.gray('   This will generate placeholder commit messages for demonstration'));
      console.log(chalk.cyan('   💡 To enable real AI: configure your API key in ') + chalk.white('glinr-commit.json'));
      console.log('');
      
      // Use mock provider configuration
      aiConfig = {
        provider: 'mock',
        apiKey: '',
        model: 'mock'
      };
    }

    // Initialize git with progress indicator
    const { simpleGit } = await lazy(() => import('simple-git'));
    const { withProgress } = await lazy(() => import('../src/ui/progress.js'));
    
    let git;
    let diff;
    
    try {
      git = await withProgress('🔍 Connecting to repository...', async () => {
        const git = simpleGit();
        // Check if we're in a git repository
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
          throw new Error('Not a git repository');
        }
        return git;
      });
    } catch (error) {
      console.error(chalk.red('❌ Not a git repository'));
      console.log(chalk.yellow('💡 Solution: Initialize a git repository'));
      console.log(chalk.gray('   Quick fix: ') + chalk.cyan('git init'));
      console.log(chalk.gray('   Or navigate to an existing repo: ') + chalk.cyan('cd your-project'));
      console.log(chalk.gray('   🎯 Need help? Run: ') + chalk.cyan('commitweave --help'));
      return;
    }

    try {
      // Get staged diff with progress
      diff = await withProgress('📊 Analyzing staged changes...', async (progress) => {
        const diff = await git.diff(['--cached']);
        
        if (!diff || diff.trim().length === 0) {
          throw new Error('No staged changes found');
        }
        
        const lines = diff.split('\n').length;
        progress.update(`📊 Analyzed ${lines} lines of changes`);
        return diff;
      });
    } catch (error) {
      console.error(chalk.red('❌ No staged changes found'));
      console.log(chalk.yellow('💡 Solution: Stage your changes first'));
      console.log(chalk.gray('   Stage all changes: ') + chalk.cyan('git add .'));
      console.log(chalk.gray('   Stage specific files: ') + chalk.cyan('git add src/file.ts'));
      console.log(chalk.gray('   📊 Check status: ') + chalk.cyan('git status'));
      console.log(chalk.gray('   🎯 Then retry: ') + chalk.cyan('commitweave ai'));
      return;
    }

    // Show diff summary
    const diffStats = analyzeDiffStats(diff);
    console.log(chalk.green(`✨ Detected changes in ${diffStats.filesChanged} files`));
    console.log(chalk.gray(`   📊 ${diffStats.additions} additions, ${diffStats.deletions} deletions`));
    if (diffStats.files.length <= 5) {
      console.log(chalk.gray('   📁 Files: ') + diffStats.files.map(f => chalk.cyan(f)).join(', '));
    } else {
      console.log(chalk.gray(`   📁 Files: ${diffStats.files.slice(0, 3).map(f => chalk.cyan(f)).join(', ')} and ${diffStats.files.length - 3} more...`));
    }
    console.log('');

    // Generate AI summary with progress
    const { generateAISummary } = await lazy(() => import('../src/utils/ai.js'));
    const { subject, body } = await withProgress('🤖 Generating commit message...', async (progress) => {
      progress.update('🤖 AI is analyzing your code changes...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay to show progress
      
      progress.update('✨ Creating commit message...');
      const result = await generateAISummary(diff, aiConfig!);
      
      progress.update('🎯 Commit message ready!');
      return result;
    });

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
  const { execSync } = await lazy(() => import('child_process'));
  const { readFile } = await lazy(() => import('fs/promises'));
  const { join } = await lazy(() => import('path'));

  interface ValidationResult {
    valid: boolean;
    errors: string[];
  }

  interface ParsedCommit {
    type?: string;
    scope?: string | undefined;
    breaking?: boolean;
    subject?: string;
    body?: string | undefined;
    footer?: string | undefined;
  }

  // Load configuration
  async function loadConfig() {
    try {
      const configPath = join(process.cwd(), 'glinr-commit.json');
      const configFile = await readFile(configPath, 'utf-8');
      const configData = JSON.parse(configFile);
      const { ConfigSchema } = await lazy(() => import('../src/types/config.js'));
      return ConfigSchema.parse(configData);
    } catch (error) {
      const { defaultConfig } = await lazy(() => import('../src/config/defaultConfig.js'));
      return defaultConfig;
    }
  }

  // Get latest commit message
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

  // Check if commit is special (merge, revert, etc.)
  function isSpecialCommit(message: string): boolean {
    const header = message.split('\n')[0] || '';
    return header.startsWith('Merge ') || 
           header.startsWith('Revert ') || 
           header.startsWith('fixup! ') || 
           header.startsWith('squash! ') ||
           header.toLowerCase().includes('initial commit');
  }

  // Parse conventional commit message
  function parseCommitMessage(message: string): ParsedCommit {
    const lines = message.split('\n');
    const header = lines[0] || '';
    
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
        subject,
        body: bodyText || undefined,
        footer: undefined
      };
    }
    
    return { subject: header };
  }

  // Validate commit message
  function validateCommitMessage(commit: ParsedCommit, config: any): ValidationResult {
    const errors: string[] = [];
    
    if (!commit.type) {
      errors.push('Missing commit type (e.g., feat, fix, docs)');
      return { valid: false, errors };
    }
    
    const validTypes = config.commitTypes.map((t: any) => t.type);
    if (!validTypes.includes(commit.type)) {
      errors.push(`Invalid commit type "${commit.type}". Valid types: ${validTypes.join(', ')}`);
    }
    
    if (!commit.subject || commit.subject.length === 0) {
      errors.push('Missing commit subject');
    } else {
      if (commit.subject.length > config.maxSubjectLength) {
        errors.push(`Subject too long (${commit.subject.length}/${config.maxSubjectLength} chars)`);
      }
      
      if (commit.subject.endsWith('.')) {
        errors.push('Subject should not end with a period');
      }
      
      if (commit.subject !== commit.subject.toLowerCase()) {
        errors.push('Subject should be in lowercase');
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  // Main check logic
  try {
    const config = await loadConfig();
    const commitMessage = getLatestCommitMessage();
    
    console.log(chalk.hex('#8b008b').bold('🔍 Checking latest commit message...\n'));
    
    if (isSpecialCommit(commitMessage)) {
      console.log(chalk.yellow('⚠️  Special commit detected (merge/revert/fixup/initial)'));
      console.log(chalk.gray('   Skipping conventional commit validation'));
      console.log(chalk.green('✅ Check complete'));
      return;
    }
    
    const parsed = parseCommitMessage(commitMessage);
    const validation = validateCommitMessage(parsed, config);
    
    console.log(chalk.gray('Latest commit:'));
    console.log(chalk.cyan(`"${commitMessage.split('\n')[0]}"`));
    console.log('');
    
    if (validation.valid) {
      console.log(chalk.green('✅ Commit message follows conventional commit format'));
      if (parsed.type) {
        const commitType = config.commitTypes.find((t: any) => t.type === parsed.type);
        if (commitType) {
          console.log(chalk.gray(`   Type: ${commitType.emoji} ${parsed.type} - ${commitType.description}`));
        }
      }
    } else {
      console.log(chalk.red('❌ Commit message validation failed:'));
      validation.errors.forEach(error => {
        console.log(chalk.red(`   • ${error}`));
      });
      console.log('');
      console.log(chalk.yellow('💡 Example valid commit:'));
      console.log(chalk.green('   feat: add user authentication'));
      console.log(chalk.green('   fix(api): resolve login timeout issue'));
    }
  } catch (error) {
    console.error(chalk.red('❌ Validation failed:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
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