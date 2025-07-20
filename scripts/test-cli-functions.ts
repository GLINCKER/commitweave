#!/usr/bin/env tsx

import { createCommitFlow } from '../src/cli/createCommitFlow.js';
import { stageAllAndCommit } from '../src/utils/git.js';
import { defaultConfig } from '../src/config/defaultConfig.js';

async function runTests() {
  console.log('🧪 Testing CLI Functions...\n');

  // Test 1: Check if createCommitFlow function can be imported and initialized
  console.log('✅ Testing imports...');
  try {
    console.log('   - createCommitFlow imported successfully');
    console.log('   - stageAllAndCommit imported successfully');
    console.log('   - defaultConfig imported successfully');
  } catch (error) {
    console.error('❌ Import error:', error);
  }

  // Test 2: Test Git utility with dry run
  console.log('\n✅ Testing Git utility (dry run)...');
  try {
    const result = await stageAllAndCommit('test: checking git functionality', { dryRun: true });
    console.log('   Result:', result);
  } catch (error) {
    console.error('❌ Git utility error:', error instanceof Error ? error.message : error);
  }

  // Test 3: Check config structure
  console.log('\n✅ Testing config structure...');
  try {
    console.log('   - commitTypes count:', defaultConfig.commitTypes.length);
    console.log('   - emojiEnabled:', defaultConfig.emojiEnabled);
    console.log('   - conventionalCommits:', defaultConfig.conventionalCommits);
    console.log('   - First commit type:', defaultConfig.commitTypes[0]);
  } catch (error) {
    console.error('❌ Config error:', error);
  }

  console.log('\n🎉 CLI Functions test completed!');
}

runTests().catch(console.error);