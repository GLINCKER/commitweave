#!/usr/bin/env tsx

import { validateCommit, parseCommitMessage } from './check-commit.js';
import { defaultConfig } from '../src/config/defaultConfig.js';
import chalk from 'chalk';

/**
 * Test various commit message validation scenarios
 */

const testCases = [
  {
    name: 'Valid conventional commit',
    message: 'feat(auth): add user login functionality',
    shouldPass: true
  },
  {
    name: 'Invalid commit type',
    message: 'featur: add login',
    shouldPass: false
  },
  {
    name: 'Missing commit type',
    message: 'add login functionality',
    shouldPass: false
  },
  {
    name: 'Subject too long',
    message:
      'feat: this is a very very very long subject line that exceeds the maximum allowed length for commit messages and should trigger validation errors',
    shouldPass: false
  },
  {
    name: 'Subject ends with period',
    message: 'feat: add user authentication.',
    shouldPass: false
  },
  {
    name: 'Subject starts with uppercase',
    message: 'feat: Add user authentication',
    shouldPass: false
  },
  {
    name: 'Breaking change',
    message: 'feat!: add new authentication system',
    shouldPass: true
  },
  {
    name: 'With scope and body',
    message:
      'fix(api): resolve user authentication issue\n\nThis commit fixes the authentication middleware that was causing\nusers to be logged out unexpectedly.',
    shouldPass: true
  }
];

async function testValidation() {
  console.log(chalk.blue('🧪 Testing Commit Message Validation'));
  console.log(chalk.gray('='.repeat(60)));
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(chalk.cyan(`Testing: ${testCase.name}`));
    console.log(chalk.gray('─'.repeat(40)));

    try {
      const parsed = parseCommitMessage(testCase.message);
      const validation = validateCommit(parsed, defaultConfig);

      const actuallyPassed = validation.valid;
      const expectedToPass = testCase.shouldPass;

      if (actuallyPassed === expectedToPass) {
        console.log(chalk.green('✅ PASS'));
        passed++;

        if (!validation.valid) {
          console.log(chalk.yellow('   Validation errors (as expected):'));
          validation.errors.forEach(error => {
            console.log(chalk.gray(`   • ${error}`));
          });
        }
      } else {
        console.log(chalk.red('❌ FAIL'));
        failed++;
        console.log(chalk.red(`   Expected: ${expectedToPass ? 'VALID' : 'INVALID'}`));
        console.log(chalk.red(`   Actual: ${actuallyPassed ? 'VALID' : 'INVALID'}`));

        if (!validation.valid) {
          console.log(chalk.yellow('   Errors:'));
          validation.errors.forEach(error => {
            console.log(chalk.gray(`   • ${error}`));
          });
        }
      }
    } catch (error) {
      console.log(chalk.red('❌ ERROR'));
      console.log(chalk.red(`   ${error instanceof Error ? error.message : 'Unknown error'}`));
      failed++;
    }

    console.log('');
  }

  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.green(`✅ Passed: ${passed}`));
  console.log(chalk.red(`❌ Failed: ${failed}`));
  console.log(chalk.blue(`📊 Total: ${passed + failed}`));

  if (failed === 0) {
    console.log(chalk.green('\n🎉 All validation tests passed!'));
  } else {
    console.log(chalk.red('\n💥 Some tests failed'));
    process.exit(1);
  }
}

async function main() {
  await testValidation();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testValidation };
