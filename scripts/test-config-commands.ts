#!/usr/bin/env tsx

import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';
import { listConfig } from '../src/cli/commands/listConfig.js';
import { exportConfig, parseExportArgs } from '../src/cli/commands/exportConfig.js';
import { importConfig, parseImportArgs } from '../src/cli/commands/importConfig.js';
import { resetConfig, parseResetArgs } from '../src/cli/commands/resetConfig.js';
import { doctorConfig } from '../src/cli/commands/doctorConfig.js';
import { defaultConfig } from '../src/config/defaultConfig.js';

/**
 * End-to-end test for all configuration commands
 */

const TEST_CONFIG_PATH = join(process.cwd(), 'test-config.json');
const TEST_EXPORT_PATH = join(process.cwd(), 'test-export.json');

const testConfig = {
  ...defaultConfig,
  emojiEnabled: false,
  maxSubjectLength: 72,
  version: "1.0"
};

async function testConfigCommands() {
  console.log(chalk.blue('🧪 Testing Configuration Commands End-to-End'));
  console.log(chalk.gray('=' .repeat(60)));
  console.log('');

  let testsPassed = 0;
  let testsFailed = 0;

  // Helper function to capture console output
  function captureOutput(fn: () => Promise<void>): Promise<string> {
    return new Promise(async (resolve) => {
      const originalLog = console.log;
      const originalError = console.error;
      const outputs: string[] = [];
      
      console.log = (...args: any[]) => {
        outputs.push(args.join(' '));
      };
      console.error = (...args: any[]) => {
        outputs.push(args.join(' '));
      };
      
      try {
        await fn();
        console.log = originalLog;
        console.error = originalError;
        resolve(outputs.join('\n'));
      } catch (error) {
        console.log = originalLog;
        console.error = originalError;
        outputs.push(`Error: ${error instanceof Error ? error.message : 'Unknown'}`);
        resolve(outputs.join('\n'));
      }
    });
  }

  // Test 1: List Config (Default)
  console.log(chalk.cyan('1️⃣  Testing list command (default config)'));
  console.log(chalk.gray('─'.repeat(40)));
  
  try {
    const output = await captureOutput(() => listConfig());
    
    if (output.includes('📋 Current Configuration') && 
        output.includes('Core Settings')) {
      console.log(chalk.green('✅ PASS - List command works with default config'));
      testsPassed++;
    } else {
      console.log(chalk.red('❌ FAIL - List command output incomplete'));
      console.log(chalk.gray('Output preview:'), output.slice(0, 200) + '...');
      testsFailed++;
    }
  } catch (error) {
    console.log(chalk.red('❌ FAIL - List command threw error'));
    console.log(chalk.gray('Error:'), error);
    testsFailed++;
  }
  console.log('');

  // Test 2: Export Config (to stdout)
  console.log(chalk.cyan('2️⃣  Testing export command (stdout)'));
  console.log(chalk.gray('─'.repeat(40)));
  
  try {
    const exportOptions = parseExportArgs([]);
    const output = await captureOutput(() => exportConfig(exportOptions));
    
    if (output.includes('📤 Exporting configuration') && 
        output.includes('"commitTypes"') &&
        output.includes('"version"')) {
      console.log(chalk.green('✅ PASS - Export command works to stdout'));
      testsPassed++;
    } else {
      console.log(chalk.red('❌ FAIL - Export command output incomplete'));
      testsFailed++;
    }
  } catch (error) {
    console.log(chalk.red('❌ FAIL - Export command threw error'));
    console.log(chalk.gray('Error:'), error);
    testsFailed++;
  }
  console.log('');

  // Test 3: Export Config (to file)
  console.log(chalk.cyan('3️⃣  Testing export command (to file)'));
  console.log(chalk.gray('─'.repeat(40)));
  
  try {
    const exportOptions = parseExportArgs(['--output', TEST_EXPORT_PATH]);
    const output = await captureOutput(() => exportConfig(exportOptions));
    
    // Check if file was created
    const exportedContent = await readFile(TEST_EXPORT_PATH, 'utf-8');
    const exportedConfig = JSON.parse(exportedContent);
    
    if (output.includes('✅ Configuration exported to') && 
        exportedConfig.commitTypes &&
        exportedConfig.version) {
      console.log(chalk.green('✅ PASS - Export command works to file'));
      testsPassed++;
    } else {
      console.log(chalk.red('❌ FAIL - Export command file output incomplete'));
      testsFailed++;
    }
  } catch (error) {
    console.log(chalk.red('❌ FAIL - Export command to file threw error'));
    console.log(chalk.gray('Error:'), error);
    testsFailed++;
  }
  console.log('');

  // Test 4: Doctor Config (with default)
  console.log(chalk.cyan('4️⃣  Testing doctor command (default config)'));
  console.log(chalk.gray('─'.repeat(40)));
  
  try {
    const output = await captureOutput(() => doctorConfig());
    
    if (output.includes('🩺 Configuration Health Check') && 
        output.includes('Schema Validation') &&
        (output.includes('All checks passed') || output.includes('functional'))) {
      console.log(chalk.green('✅ PASS - Doctor command works'));
      testsPassed++;
    } else {
      console.log(chalk.red('❌ FAIL - Doctor command output incomplete'));
      testsFailed++;
    }
  } catch (error) {
    console.log(chalk.red('❌ FAIL - Doctor command threw error'));
    console.log(chalk.gray('Error:'), error);
    testsFailed++;
  }
  console.log('');

  // Test 5: Create test config file
  console.log(chalk.cyan('5️⃣  Creating test config file'));
  console.log(chalk.gray('─'.repeat(40)));
  
  try {
    await writeFile(TEST_CONFIG_PATH, JSON.stringify(testConfig, null, 2), 'utf-8');
    console.log(chalk.green('✅ PASS - Test config file created'));
    testsPassed++;
  } catch (error) {
    console.log(chalk.red('❌ FAIL - Could not create test config file'));
    console.log(chalk.gray('Error:'), error);
    testsFailed++;
  }
  console.log('');

  // Test 6: Import Config (dry run)
  console.log(chalk.cyan('6️⃣  Testing import command (dry run)'));
  console.log(chalk.gray('─'.repeat(40)));
  
  try {
    const { source, options } = parseImportArgs([TEST_CONFIG_PATH, '--dry-run']);
    const output = await captureOutput(() => importConfig(source, options));
    
    if (output.includes('📥 Importing configuration') && 
        output.includes('Dry run mode') &&
        output.includes('no changes will be applied')) {
      console.log(chalk.green('✅ PASS - Import command dry run works'));
      testsPassed++;
    } else {
      console.log(chalk.red('❌ FAIL - Import command dry run incomplete'));
      testsFailed++;
    }
  } catch (error) {
    console.log(chalk.red('❌ FAIL - Import command dry run threw error'));
    console.log(chalk.gray('Error:'), error);
    testsFailed++;
  }
  console.log('');

  // Test 7: Reset Config (with force)
  console.log(chalk.cyan('7️⃣  Testing reset command (forced)'));
  console.log(chalk.gray('─'.repeat(40)));
  
  try {
    const resetOptions = parseResetArgs(['--force']);
    const output = await captureOutput(() => resetConfig(resetOptions));
    
    if (output.includes('Reset Configuration') && 
        output.includes('✅ Configuration reset to defaults successfully')) {
      console.log(chalk.green('✅ PASS - Reset command works'));
      testsPassed++;
    } else {
      console.log(chalk.red('❌ FAIL - Reset command output incomplete'));
      testsFailed++;
    }
  } catch (error) {
    console.log(chalk.red('❌ FAIL - Reset command threw error'));
    console.log(chalk.gray('Error:'), error);
    testsFailed++;
  }
  console.log('');

  // Test 8: List Config (after reset)
  console.log(chalk.cyan('8️⃣  Testing list command (after reset)'));
  console.log(chalk.gray('─'.repeat(40)));
  
  try {
    const output = await captureOutput(() => listConfig());
    
    if (output.includes('📋 Current Configuration') && 
        output.includes('Core Settings')) {
      console.log(chalk.green('✅ PASS - List command works after reset'));
      testsPassed++;
    } else {
      console.log(chalk.red('❌ FAIL - List command after reset incomplete'));
      testsFailed++;
    }
  } catch (error) {
    console.log(chalk.red('❌ FAIL - List command after reset threw error'));
    console.log(chalk.gray('Error:'), error);
    testsFailed++;
  }
  console.log('');

  // Cleanup
  console.log(chalk.cyan('🧹 Cleaning up test files'));
  console.log(chalk.gray('─'.repeat(40)));
  
  try {
    await unlink(TEST_CONFIG_PATH).catch(() => {}); // Ignore if doesn't exist
    await unlink(TEST_EXPORT_PATH).catch(() => {}); // Ignore if doesn't exist
    console.log(chalk.green('✅ Cleanup completed'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  Some test files may remain'));
  }
  console.log('');

  // Summary
  console.log(chalk.gray('=' .repeat(60)));
  console.log(chalk.green(`✅ Passed: ${testsPassed}`));
  console.log(chalk.red(`❌ Failed: ${testsFailed}`));
  console.log(chalk.blue(`📊 Total: ${testsPassed + testsFailed}`));
  
  if (testsFailed === 0) {
    console.log(chalk.green('\n🎉 All configuration command tests passed!'));
    console.log(chalk.gray('   All config commands (list, export, import, reset, doctor) are working correctly'));
  } else {
    console.log(chalk.red('\n💥 Some configuration command tests failed'));
    console.log(chalk.gray('   Check the implementation of failing commands'));
    process.exit(1);
  }
}

async function main() {
  await testConfigCommands();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testConfigCommands };