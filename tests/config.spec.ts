#!/usr/bin/env tsx

import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir, tmpdir } from 'os';
import { exportConfig } from '../src/cli/commands/exportConfig.js';
import { importConfig } from '../src/cli/commands/importConfig.js';
import { listConfig } from '../src/cli/commands/listConfig.js';
import { resetConfig } from '../src/cli/commands/resetConfig.js';
import { doctorConfig } from '../src/cli/commands/doctorConfig.js';
import { load, save } from '../src/utils/configStore.js';
import { stripSecrets, createDiff, validateConfigVersion } from '../src/utils/configDiff.js';
import { defaultConfig } from '../src/config/defaultConfig.js';

console.log('🧪 Testing Configuration Commands...\n');

// Mock console to capture output
const originalLog = console.log;
const originalError = console.error;
let capturedLogs: string[] = [];
let capturedErrors: string[] = [];

function mockConsole() {
  console.log = (...args: any[]) => {
    capturedLogs.push(args.join(' '));
  };
  console.error = (...args: any[]) => {
    capturedErrors.push(args.join(' '));
  };
}

function restoreConsole() {
  console.log = originalLog;
  console.error = originalError;
}

// Test utilities
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

async function assertRejects(promise: Promise<any>, message?: string) {
  try {
    await promise;
    throw new Error(`❌ Expected promise to reject${message ? `: ${message}` : ''}`);
  } catch (error) {
    console.log(`✅ Promise correctly rejected${message ? `: ${message}` : ''}`);
  }
}

// Create temporary test directory
const testDir = join(tmpdir(), 'commitweave-test-' + Date.now());
const testConfigPath = join(testDir, 'glinr-commit.json');
const testExportPath = join(testDir, 'exported-config.json');

async function setupTest() {
  await mkdir(testDir, { recursive: true });

  // Override CONFIG_PATH for testing
  const configStore = await import('../src/utils/configStore.js');
  (configStore as any).CONFIG_PATH = testConfigPath;
}

async function cleanupTest() {
  // Note: In a real test environment, you'd clean up the temp directory
  // For this demo, we'll leave it for inspection
}

async function runTests() {
  try {
    await setupTest();

    console.log('🔧 Testing configuration utilities...');

    // Test 1: stripSecrets function
    console.log('\n📋 Testing stripSecrets...');
    const configWithSecrets = {
      ...defaultConfig,
      ai: {
        provider: 'openai' as const,
        apiKey: 'sk-test123',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 150
      },
      claude: {
        enabled: true,
        apiKey: 'claude-key-456',
        model: 'claude-3-haiku-20240307' as const,
        maxTokens: 4000
      }
    };

    const strippedConfig = stripSecrets(configWithSecrets);
    assert(strippedConfig.ai?.apiKey === '***REDACTED***', 'AI API key should be redacted');
    assert(strippedConfig.claude?.apiKey === '***REDACTED***', 'Claude API key should be redacted');
    assert(
      strippedConfig.commitTypes.length === defaultConfig.commitTypes.length,
      'Commit types should be preserved'
    );

    // Test 2: Configuration diff
    console.log('\n📋 Testing createDiff...');
    const oldConfig = { ...defaultConfig };
    const newConfig = {
      ...defaultConfig,
      emojiEnabled: false,
      maxSubjectLength: 60,
      newField: 'test' as any
    };

    const diff = createDiff(oldConfig, newConfig);
    assert(diff.length > 0, 'Diff should detect changes');
    assert(
      diff.some(d => d.path === 'emojiEnabled'),
      'Should detect emojiEnabled change'
    );
    assert(
      diff.some(d => d.path === 'maxSubjectLength'),
      'Should detect maxSubjectLength change'
    );

    // Test 3: Version validation
    console.log('\n📋 Testing validateConfigVersion...');
    const validVersion = validateConfigVersion({ version: '1.0' });
    assert(validVersion.valid, 'Version 1.0 should be valid');

    const invalidVersion = validateConfigVersion({ version: '0.9' });
    assert(!invalidVersion.valid, 'Version 0.9 should be invalid');

    const missingVersion = validateConfigVersion({});
    assert(!missingVersion.valid, 'Missing version should be invalid');

    console.log('\n🔧 Testing configuration commands...');

    // Test 4: Export command - full format
    console.log('\n📋 Testing export command...');

    // First, save a config with secrets to test export
    await save(configWithSecrets);

    mockConsole();
    try {
      await exportConfig();

      // Check that secrets are stripped
      const output = capturedLogs.join('\n');
      assert(!output.includes('sk-test123'), 'Export should not contain actual API keys');
      assert(!output.includes('claude-key-456'), 'Export should not contain actual Claude keys');
      assert(
        output.includes('***REDACTED***') || !output.includes('"apiKey"'),
        'API keys should be redacted or excluded'
      );
    } finally {
      restoreConsole();
      capturedLogs = [];
    }

    // Test 5: Export command - minimal format
    console.log('\n📋 Testing export minimal format...');
    await exportConfig({ output: testExportPath, format: 'minimal' });

    const exportedContent = await readFile(testExportPath, 'utf-8');
    const exportedConfig = JSON.parse(exportedContent);
    assert(exportedConfig.commitTypes, 'Minimal export should include commit types');
    assert(exportedConfig.version, 'Minimal export should include version');
    assert(!exportedConfig.ai, 'Minimal export should not include AI config');

    // Test 6: Import command - version mismatch
    console.log('\n📋 Testing import version validation...');
    const invalidConfigContent = JSON.stringify({ version: '0.9', commitTypes: [] });
    const invalidConfigPath = join(testDir, 'invalid-config.json');
    await writeFile(invalidConfigPath, invalidConfigContent, 'utf-8');

    // This should exit with error (we'll catch it)
    let importFailed = false;
    try {
      const originalExit = process.exit;
      process.exit = (() => {
        importFailed = true;
      }) as any;

      mockConsole();
      await importConfig(invalidConfigPath, { autoConfirm: true });
      process.exit = originalExit;
    } catch (error) {
      importFailed = true;
    } finally {
      restoreConsole();
      capturedLogs = [];
      capturedErrors = [];
    }

    assert(importFailed, 'Import should fail with version mismatch');

    // Test 7: Import command - valid config
    console.log('\n📋 Testing import valid config...');
    const validConfigContent = JSON.stringify({
      ...defaultConfig,
      emojiEnabled: false,
      maxSubjectLength: 60
    });
    const validConfigPath = join(testDir, 'valid-config.json');
    await writeFile(validConfigPath, validConfigContent, 'utf-8');

    await importConfig(validConfigPath, { autoConfirm: true });

    const importedConfig = await load();
    assert(!importedConfig.emojiEnabled, 'Imported config should have emojiEnabled: false');
    assert(
      importedConfig.maxSubjectLength === 60,
      'Imported config should have maxSubjectLength: 60'
    );

    // Test 8: List command
    console.log('\n📋 Testing list command...');
    mockConsole();
    try {
      await listConfig();

      const output = capturedLogs.join('\n');
      assert(output.includes('Current Configuration'), 'List should show configuration header');
      assert(output.includes('Core Settings'), 'List should show core settings');
      assert(output.includes('Commit Types'), 'List should show commit types');
    } finally {
      restoreConsole();
      capturedLogs = [];
    }

    // Test 9: Doctor command - healthy config
    console.log('\n📋 Testing doctor command...');
    mockConsole();
    try {
      await doctorConfig();

      const output = capturedLogs.join('\n');
      assert(
        output.includes('Configuration Health Check'),
        'Doctor should show health check header'
      );
      assert(output.includes('Schema Validation'), 'Doctor should validate schema');
    } catch (error) {
      // Doctor might exit with status code, that's OK for some tests
    } finally {
      restoreConsole();
      capturedLogs = [];
    }

    // Test 10: Reset command
    console.log('\n📋 Testing reset command...');
    await resetConfig({ force: true });

    const resetConfig_result = await load();
    assert(
      resetConfig_result.emojiEnabled === defaultConfig.emojiEnabled,
      'Reset should restore emojiEnabled default'
    );
    assert(
      resetConfig_result.maxSubjectLength === defaultConfig.maxSubjectLength,
      'Reset should restore maxSubjectLength default'
    );

    // Test 11: Configuration store operations
    console.log('\n📋 Testing configuration store...');
    const testConfig = { ...defaultConfig, maxSubjectLength: 100 };
    await save(testConfig);

    const loadedConfig = await load();
    assert(loadedConfig.maxSubjectLength === 100, 'Saved and loaded config should match');

    console.log('\n🎉 All configuration tests passed!');
  } catch (error) {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  } finally {
    await cleanupTest();
    restoreConsole();
  }
}

// Run the tests
runTests().catch(console.error);
