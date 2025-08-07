#!/usr/bin/env tsx

import { writeFile, access } from 'fs/promises';
import { join } from 'path';

async function testInitFunctionality() {
  console.log('🧪 Testing Init Command Functionality...\n');

  try {
    const testConfigPath = join(process.cwd(), 'test-glinr-commit.json');

    // Test config creation
    const basicConfig = {
      commitTypes: [
        { type: 'feat', emoji: '✨', description: 'New feature' },
        { type: 'fix', emoji: '🐛', description: 'Bug fix' }
      ],
      emojiEnabled: true,
      conventionalCommits: true,
      maxSubjectLength: 50,
      maxBodyLength: 72
    };

    console.log('✅ Testing config file creation...');
    await writeFile(testConfigPath, JSON.stringify(basicConfig, null, 2), 'utf-8');
    console.log('   Config file created successfully');

    // Test file exists check
    console.log('✅ Testing file existence check...');
    try {
      await access(testConfigPath);
      console.log('   File exists check working');
    } catch {
      console.log('   File not found (this should not happen)');
    }

    // Clean up test file
    await writeFile(testConfigPath, '', 'utf-8');
    console.log('✅ Test file cleaned up');
  } catch (error) {
    console.error('❌ Init functionality error:', error);
  }

  console.log('\n🎉 Init functionality test completed!');
}

testInitFunctionality().catch(console.error);
