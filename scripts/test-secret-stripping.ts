#!/usr/bin/env tsx

import chalk from 'chalk';
import { stripSecrets, createMinimalConfig } from '../src/utils/configDiff.js';
import { exportConfig } from '../src/cli/commands/exportConfig.js';
import { defaultConfig } from '../src/config/defaultConfig.js';

/**
 * Comprehensive test for secret stripping functionality
 */

interface TestCase {
  name: string;
  input: any;
  expected: {
    shouldRedact: string[];
    shouldPreserve: string[];
    shouldNotContain: string[];
  };
}

const testCases: TestCase[] = [
  {
    name: 'Basic API key redaction',
    input: {
      apiKey: 'sk-1234567890abcdef',
      model: 'gpt-4',
      provider: 'openai'
    },
    expected: {
      shouldRedact: ['apiKey'],
      shouldPreserve: ['model', 'provider'],
      shouldNotContain: ['sk-1234567890abcdef']
    }
  },
  {
    name: 'Claude configuration',
    input: {
      claude: {
        enabled: true,
        apiKey: 'claude-api-key-123',
        model: 'claude-3-haiku-20240307',
        maxTokens: 4000
      }
    },
    expected: {
      shouldRedact: ['claude.apiKey'],
      shouldPreserve: ['claude.enabled', 'claude.model', 'claude.maxTokens'],
      shouldNotContain: ['claude-api-key-123']
    }
  },
  {
    name: 'Nested secrets',
    input: {
      ai: {
        openai: {
          apiKey: 'openai-secret-key',
          model: 'gpt-4'
        },
        anthropic: {
          apiToken: 'anthropic-token-456',
          model: 'claude-3-sonnet'
        }
      }
    },
    expected: {
      shouldRedact: ['ai.openai.apiKey', 'ai.anthropic.apiToken'],
      shouldPreserve: ['ai.openai.model', 'ai.anthropic.model'],
      shouldNotContain: ['openai-secret-key', 'anthropic-token-456']
    }
  },
  {
    name: 'Multiple secret patterns',
    input: {
      database: {
        password: 'super-secret-password',
        connectionString: 'postgresql://user:pass@host/db',
        apiKey: 'db-api-key',
        secretToken: 'secret-token-123'
      }
    },
    expected: {
      shouldRedact: ['database.password', 'database.apiKey', 'database.secretToken'],
      shouldPreserve: ['database.connectionString'],
      shouldNotContain: ['super-secret-password', 'db-api-key', 'secret-token-123']
    }
  },
  {
    name: 'Empty and undefined secrets',
    input: {
      apiKey: '',
      secretToken: undefined,
      password: null,
      validKey: 'actual-key'
    },
    expected: {
      shouldRedact: ['validKey'],
      shouldPreserve: ['apiKey', 'secretToken', 'password'],
      shouldNotContain: ['actual-key']
    }
  },
  {
    name: 'Case insensitive matching',
    input: {
      API_KEY: 'uppercase-key',
      apikey: 'lowercase-key',
      ApiKey: 'camelcase-key',
      SECRET: 'uppercase-secret',
      Token: 'title-case-token'
    },
    expected: {
      shouldRedact: ['API_KEY', 'apikey', 'ApiKey', 'SECRET', 'Token'],
      shouldPreserve: [],
      shouldNotContain: ['uppercase-key', 'lowercase-key', 'camelcase-key', 'uppercase-secret', 'title-case-token']
    }
  }
];

async function testSecretStripping() {
  console.log(chalk.blue('🔒 Testing Secret Stripping Functionality'));
  console.log(chalk.gray('=' .repeat(60)));
  console.log('');

  let passed = 0;
  let failed = 0;

  // Helper function to get nested value
  function getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current && typeof current === 'object') {
        current = current[key];
      } else {
        return undefined;
      }
    }
    return current;
  }

  for (const testCase of testCases) {
    console.log(chalk.cyan(`Testing: ${testCase.name}`));
    console.log(chalk.gray('─'.repeat(40)));
    
    try {
      const stripped = stripSecrets(testCase.input);
      const strippedJson = JSON.stringify(stripped, null, 2);
      
      let testPassed = true;
      const errors: string[] = [];
      
      // Check redacted fields
      for (const path of testCase.expected.shouldRedact) {
        const value = getNestedValue(stripped, path);
        if (value !== '***REDACTED***') {
          errors.push(`Field ${path} should be redacted but is: ${value}`);
          testPassed = false;
        }
      }
      
      // Check preserved fields
      for (const path of testCase.expected.shouldPreserve) {
        const originalValue = getNestedValue(testCase.input, path);
        const strippedValue = getNestedValue(stripped, path);
        if (originalValue !== strippedValue) {
          errors.push(`Field ${path} should be preserved but changed from ${originalValue} to ${strippedValue}`);
          testPassed = false;
        }
      }
      
      // Check that sensitive values are not in output
      for (const sensitiveValue of testCase.expected.shouldNotContain) {
        if (strippedJson.includes(sensitiveValue)) {
          errors.push(`Sensitive value "${sensitiveValue}" should not appear in stripped output`);
          testPassed = false;
        }
      }
      
      if (testPassed) {
        console.log(chalk.green('✅ PASS'));
        passed++;
      } else {
        console.log(chalk.red('❌ FAIL'));
        errors.forEach(error => {
          console.log(chalk.red(`   • ${error}`));
        });
        failed++;
      }
      
    } catch (error) {
      console.log(chalk.red('❌ ERROR'));
      console.log(chalk.red(`   ${error instanceof Error ? error.message : 'Unknown error'}`));
      failed++;
    }
    
    console.log('');
  }

  // Test real configuration with secrets
  console.log(chalk.cyan('Testing: Real configuration with secrets'));
  console.log(chalk.gray('─'.repeat(40)));
  
  try {
    const configWithSecrets = {
      ...defaultConfig,
      ai: {
        provider: 'openai' as const,
        apiKey: 'sk-proj-abcdef1234567890',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 150
      },
      claude: {
        enabled: true,
        apiKey: 'claude-key-xyz789',
        model: 'claude-3-haiku-20240307' as const,
        maxTokens: 4000
      }
    };
    
    const stripped = stripSecrets(configWithSecrets);
    const strippedJson = JSON.stringify(stripped, null, 2);
    
    // Verify all sensitive data is redacted
    const sensitiveValues = ['sk-proj-abcdef1234567890', 'claude-key-xyz789'];
    let realConfigPassed = true;
    
    for (const sensitive of sensitiveValues) {
      if (strippedJson.includes(sensitive)) {
        console.log(chalk.red(`❌ Sensitive value "${sensitive}" found in stripped output`));
        realConfigPassed = false;
      }
    }
    
    // Verify redaction markers are present
    if (!strippedJson.includes('***REDACTED***')) {
      console.log(chalk.red('❌ No redaction markers found'));
      realConfigPassed = false;
    }
    
    // Verify non-sensitive data is preserved
    if (!stripped.commitTypes || stripped.commitTypes.length === 0) {
      console.log(chalk.red('❌ Commit types were not preserved'));
      realConfigPassed = false;
    }
    
    if (realConfigPassed) {
      console.log(chalk.green('✅ PASS - Real configuration properly redacted'));
      passed++;
    } else {
      console.log(chalk.red('❌ FAIL - Real configuration redaction failed'));
      failed++;
    }
    
  } catch (error) {
    console.log(chalk.red('❌ ERROR - Real configuration test failed'));
    console.log(chalk.red(`   ${error instanceof Error ? error.message : 'Unknown error'}`));
    failed++;
  }
  
  console.log('');

  // Test minimal config creation (should exclude secrets entirely)
  console.log(chalk.cyan('Testing: Minimal config creation'));
  console.log(chalk.gray('─'.repeat(40)));
  
  try {
    const configWithSecrets = {
      ...defaultConfig,
      ai: {
        provider: 'openai' as const,
        apiKey: 'sk-test-123',
        model: 'gpt-4'
      }
    };
    
    const minimal = createMinimalConfig(configWithSecrets);
    const minimalJson = JSON.stringify(minimal, null, 2);
    
    let minimalPassed = true;
    
    // Should not contain any secrets
    if (minimalJson.includes('sk-test-123')) {
      console.log(chalk.red('❌ Minimal config contains secrets'));
      minimalPassed = false;
    }
    
    // Should not contain AI config at all
    if (minimal.ai !== undefined || minimalJson.includes('"ai"')) {
      console.log(chalk.red('❌ Minimal config contains AI configuration'));
      minimalPassed = false;
    }
    
    // Should contain essential fields
    const essentialFields = ['version', 'commitTypes', 'emojiEnabled', 'conventionalCommits'];
    for (const field of essentialFields) {
      if (!minimalJson.includes(`"${field}"`)) {
        console.log(chalk.red(`❌ Minimal config missing essential field: ${field}`));
        minimalPassed = false;
      }
    }
    
    if (minimalPassed) {
      console.log(chalk.green('✅ PASS - Minimal config properly excludes secrets'));
      passed++;
    } else {
      console.log(chalk.red('❌ FAIL - Minimal config creation failed'));
      failed++;
    }
    
  } catch (error) {
    console.log(chalk.red('❌ ERROR - Minimal config test failed'));
    console.log(chalk.red(`   ${error instanceof Error ? error.message : 'Unknown error'}`));
    failed++;
  }
  
  console.log('');
  
  // Summary
  console.log(chalk.gray('=' .repeat(60)));
  console.log(chalk.green(`✅ Passed: ${passed}`));
  console.log(chalk.red(`❌ Failed: ${failed}`));
  console.log(chalk.blue(`📊 Total: ${passed + failed}`));
  
  if (failed === 0) {
    console.log(chalk.green('\n🔒 All secret stripping tests passed!'));
    console.log(chalk.gray('   Sensitive data is properly redacted during export'));
    console.log(chalk.gray('   Minimal configs exclude secrets entirely'));
    console.log(chalk.gray('   Non-sensitive configuration is preserved'));
  } else {
    console.log(chalk.red('\n💥 Some secret stripping tests failed'));
    console.log(chalk.gray('   Review the secret stripping implementation'));
    process.exit(1);
  }
}

async function main() {
  await testSecretStripping();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testSecretStripping };