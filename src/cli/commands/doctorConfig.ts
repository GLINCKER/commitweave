import chalk from 'chalk';
import { load, getActiveConfigPath } from '../../utils/configStore.js';
import { ConfigSchema } from '../../types/config.js';
import { handleAsync } from '../../utils/errorHandler.js';

interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  suggestion?: string;
}

/**
 * Validate and report configuration health
 * Usage: commitweave doctor
 */
export async function doctorConfig(): Promise<void> {
  await handleAsync(async () => {
    console.log(chalk.blue('🩺 Configuration Health Check'));
    console.log(chalk.gray('─'.repeat(50)));

    const checks: HealthCheck[] = [];
    let config;

    try {
      // Load current configuration
      config = await load();

      // Basic schema validation
      try {
        ConfigSchema.parse(config);
        checks.push({
          name: 'Schema Validation',
          status: 'pass',
          message: 'Configuration follows the correct schema'
        });
      } catch (error) {
        checks.push({
          name: 'Schema Validation',
          status: 'fail',
          message: 'Configuration schema validation failed',
          suggestion: 'Run "commitweave reset" to restore valid configuration'
        });
      }

      // Version check
      if (config.version === '1.0') {
        checks.push({
          name: 'Version Compatibility',
          status: 'pass',
          message: 'Configuration version is current'
        });
      } else {
        checks.push({
          name: 'Version Compatibility',
          status: 'warn',
          message: `Configuration version is ${config.version || 'missing'}, expected 1.0`,
          suggestion: 'Consider updating your configuration'
        });
      }

      // Commit types validation
      if (config.commitTypes && config.commitTypes.length > 0) {
        checks.push({
          name: 'Commit Types',
          status: 'pass',
          message: `${config.commitTypes.length} commit types configured`
        });

        // Check for duplicate commit types
        const types = config.commitTypes.map(t => t.type);
        const duplicates = types.filter((type, index) => types.indexOf(type) !== index);
        if (duplicates.length > 0) {
          checks.push({
            name: 'Commit Type Duplicates',
            status: 'warn',
            message: `Duplicate commit types found: ${duplicates.join(', ')}`,
            suggestion: 'Remove duplicate commit types'
          });
        }
      } else {
        checks.push({
          name: 'Commit Types',
          status: 'fail',
          message: 'No commit types configured',
          suggestion: 'Add commit types or reset to defaults'
        });
      }

      // Length constraints validation
      if (config.maxSubjectLength > 0 && config.maxSubjectLength <= 100) {
        checks.push({
          name: 'Subject Length Limit',
          status: 'pass',
          message: `Subject length limited to ${config.maxSubjectLength} characters`
        });
      } else {
        checks.push({
          name: 'Subject Length Limit',
          status: 'warn',
          message: `Subject length limit is ${config.maxSubjectLength} (recommended: 50-72)`,
          suggestion: 'Consider setting a reasonable subject length limit'
        });
      }

      // AI configuration checks
      if (config.ai) {
        if (config.ai.provider === 'openai') {
          if (config.ai.apiKey) {
            checks.push({
              name: 'OpenAI Integration',
              status: 'pass',
              message: 'OpenAI API key is configured'
            });
          } else {
            checks.push({
              name: 'OpenAI Integration',
              status: 'warn',
              message: 'OpenAI provider selected but no API key configured',
              suggestion: 'Add your OpenAI API key to enable AI features'
            });
          }
        }

        if (config.ai.provider === 'anthropic') {
          if (config.ai.apiKey) {
            checks.push({
              name: 'Anthropic Integration',
              status: 'pass',
              message: 'Anthropic API key is configured'
            });
          } else {
            checks.push({
              name: 'Anthropic Integration',
              status: 'warn',
              message: 'Anthropic provider selected but no API key configured',
              suggestion: 'Add your Anthropic API key to enable AI features'
            });
          }
        }
      }

      // Claude configuration checks
      if (config.claude?.enabled) {
        if (config.claude.apiKey) {
          checks.push({
            name: 'Claude Integration',
            status: 'pass',
            message: 'Claude is enabled with API key configured'
          });
        } else {
          checks.push({
            name: 'Claude Integration',
            status: 'fail',
            message: 'Claude is enabled but no API key configured',
            suggestion: 'Add your Claude API key or disable Claude integration'
          });
        }

        // Check token limits
        if (config.claude.maxTokens < 100 || config.claude.maxTokens > 10000) {
          checks.push({
            name: 'Claude Token Limit',
            status: 'warn',
            message: `Claude max tokens is ${config.claude.maxTokens} (recommended: 1000-8000)`,
            suggestion: 'Consider adjusting the token limit for better responses'
          });
        }
      }

      // Configuration file check
      const configPath = await getActiveConfigPath();
      if (configPath) {
        checks.push({
          name: 'Configuration File',
          status: 'pass',
          message: `Configuration loaded from ${configPath}`
        });
      } else {
        checks.push({
          name: 'Configuration File',
          status: 'warn',
          message: 'No configuration file found, using defaults',
          suggestion: 'Run "commitweave init" to create a configuration file'
        });
      }
    } catch (error) {
      checks.push({
        name: 'Configuration Loading',
        status: 'fail',
        message: `Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestion: 'Check your configuration file syntax or run "commitweave reset"'
      });
    }

    // Display results
    let passCount = 0;
    let warnCount = 0;
    let failCount = 0;

    for (const check of checks) {
      let icon: string;
      let color: (str: string) => string;

      switch (check.status) {
        case 'pass':
          icon = '✅';
          color = chalk.green;
          passCount++;
          break;
        case 'warn':
          icon = '⚠️ ';
          color = chalk.yellow;
          warnCount++;
          break;
        case 'fail':
          icon = '❌';
          color = chalk.red;
          failCount++;
          break;
      }

      console.log(`${icon} ${chalk.bold(check.name)}: ${color(check.message)}`);
      if (check.suggestion) {
        console.log(`   ${chalk.gray('💡 ' + check.suggestion)}`);
      }
    }

    console.log(chalk.gray('─'.repeat(50)));

    // Summary
    if (failCount === 0 && warnCount === 0) {
      console.log(chalk.green('🎉 Configuration is healthy! All checks passed.'));
    } else if (failCount === 0) {
      console.log(chalk.yellow(`⚠️  Configuration has ${warnCount} warning(s) but is functional.`));
    } else {
      console.log(
        chalk.red(`💥 Configuration has ${failCount} error(s) that should be addressed.`)
      );
    }

    console.log(
      chalk.gray(`   Summary: ${passCount} passed, ${warnCount} warnings, ${failCount} errors`)
    );
    console.log('');

    if (failCount > 0 || warnCount > 0) {
      console.log(
        chalk.gray('💡 Use ') + chalk.cyan('commitweave reset') + chalk.gray(' to restore defaults')
      );
      console.log(
        chalk.gray('💡 Use ') +
          chalk.cyan('commitweave list') +
          chalk.gray(' to view current settings')
      );
    }

    // Exit with appropriate code
    if (failCount > 0) {
      process.exit(1);
    }
  });
}
