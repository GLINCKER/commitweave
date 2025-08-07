import { readFileSync } from 'fs';
import { join } from 'path';
import { lazy } from '../utils/lazyImport.js';
import type { Config, CommitType } from '../types/config.js';

// Lazy loaded dependencies
let chalk: any;
let enquirer: any;
let CommitBuilder: any;
let ConfigSchema: any;
let defaultConfig: any;

interface CommitFlowResult {
  message: string;
  cancelled: boolean;
}

interface CommitInput {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  breakingChange: boolean;
}

export async function createCommitFlow(): Promise<CommitFlowResult> {
  try {
    // Load chalk for basic output
    if (!chalk) {
      chalk = (await lazy(() => import('chalk'))).default;
    }
    
    const config = await loadConfig();
    const input = await collectUserInput(config);
    
    if (!input) {
      return { message: '', cancelled: true };
    }

    const commitMessage = await buildCommitMessage(config, input);
    const confirmed = await showPreviewAndConfirm(commitMessage);
    
    if (!confirmed) {
      console.log(chalk.yellow('✨ Commit cancelled'));
      return { message: '', cancelled: true };
    }

    return { message: commitMessage, cancelled: false };
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
    return { message: '', cancelled: true };
  }
}

async function loadConfig(): Promise<Config> {
  // Lazy load config dependencies
  if (!ConfigSchema || !defaultConfig) {
    const [configModule, defaultConfigModule] = await Promise.all([
      lazy(() => import('../types/config.js')),
      lazy(() => import('../config/defaultConfig.js'))
    ]);
    ConfigSchema = configModule.ConfigSchema;
    defaultConfig = defaultConfigModule.defaultConfig;
  }
  
  try {
    const configPath = join(process.cwd(), 'glinr-commit.json');
    const configFile = readFileSync(configPath, 'utf-8');
    const configData = JSON.parse(configFile);
    return ConfigSchema.parse(configData);
  } catch (error) {
    if (!chalk) {
      chalk = (await lazy(() => import('chalk'))).default;
    }
    console.log(chalk.yellow('⚠️  Config file not found or invalid, using default configuration'));
    return defaultConfig;
  }
}

async function collectUserInput(config: Config): Promise<CommitInput | null> {
  try {
    // Lazy load enquirer
    if (!enquirer) {
      enquirer = (await lazy(() => import('enquirer'))).default;
    }
    
    if (!chalk) {
      chalk = (await lazy(() => import('chalk'))).default;
    }
    
    const typeChoices = config.commitTypes.map((type: CommitType) => ({
      name: `${type.emoji} ${type.type}`,
      message: `${type.emoji} ${chalk.bold(type.type)} - ${type.description}`,
      value: type.type
    }));

    const answers = await enquirer.prompt([
      {
        type: 'select',
        name: 'type',
        message: 'Select the type of change you are committing:',
        choices: typeChoices
      },
      {
        type: 'input',
        name: 'scope',
        message: 'What is the scope of this change? (optional):',
        required: false
      },
      {
        type: 'input',
        name: 'subject',
        message: `Write a short, imperative description of the change (max ${config.maxSubjectLength} chars):`,
        required: true,
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Subject is required';
          }
          if (input.length > config.maxSubjectLength) {
            return `Subject must be ${config.maxSubjectLength} characters or less`;
          }
          return true;
        }
      },
      {
        type: 'text',
        name: 'body',
        message: 'Provide a longer description of the change (optional):',
        required: false,
        multiline: true
      },
      {
        type: 'confirm',
        name: 'breakingChange',
        message: 'Are there any breaking changes?',
        initial: false
      }
    ]) as CommitInput;

    return answers;
  } catch (error) {
    if (error instanceof Error && error.message === '') {
      return null;
    }
    throw error;
  }
}

async function buildCommitMessage(config: Config, input: CommitInput): Promise<string> {
  // Lazy load CommitBuilder
  if (!CommitBuilder) {
    const builderModule = await lazy(() => import('../core/commitBuilder.js'));
    CommitBuilder = builderModule.CommitBuilder;
  }
  
  const builder = new CommitBuilder(config);
  
  builder
    .setType(input.type)
    .setSubject(input.subject)
    .setBreakingChange(input.breakingChange);

  if (input.scope?.trim()) {
    builder.setScope(input.scope.trim());
  }

  if (input.body?.trim()) {
    builder.setBody(input.body.trim());
  }

  return builder.build();
}

async function showPreviewAndConfirm(message: string): Promise<boolean> {
  if (!chalk) {
    chalk = (await lazy(() => import('chalk'))).default;
  }
  if (!enquirer) {
    enquirer = (await lazy(() => import('enquirer'))).default;
  }
  
  console.log('\n' + chalk.cyan('📋 Commit Message Preview:'));
  console.log(chalk.gray('─'.repeat(50)));
  
  const lines = message.split('\n');
  lines.forEach((line, index) => {
    if (index === 0) {
      console.log(chalk.green.bold(line));
    } else if (line.trim() === '') {
      console.log('');
    } else {
      console.log(chalk.white(line));
    }
  });
  
  console.log(chalk.gray('─'.repeat(50)));

  const { confirmed } = await enquirer.prompt({
    type: 'confirm',
    name: 'confirmed',
    message: 'Do you want to use this commit message?',
    initial: true
  }) as { confirmed: boolean };

  return confirmed;
}