#!/usr/bin/env tsx

import { writeFileSync } from 'fs';
import { join } from 'path';
import type { Config } from '../src/types/config.js';
import { defaultConfig } from '../src/config/defaultConfig.js';
import { CommitBuilder } from '../src/core/commitBuilder.js';

/**
 * Test script to validate commit flow for all commit types with different configurations
 */

async function testCommitTypes() {
  console.log('🧪 Testing CommitWeave commit types...\n');

  const configs = [
    { ...defaultConfig, emojiEnabled: true, name: 'With Emojis' },
    { ...defaultConfig, emojiEnabled: false, name: 'Without Emojis' }
  ];

  let allPassed = true;

  for (const config of configs) {
    console.log(`📋 Testing ${config.name}`);
    console.log('─'.repeat(50));

    for (const commitType of config.commitTypes) {
      try {
        // Test basic commit message building
        const builder = new CommitBuilder(config);
        const message = builder
          .setType(commitType.type)
          .setSubject(`test ${commitType.type} functionality`)
          .build();

        // Test with scope
        const messageWithScope = builder
          .reset()
          .setType(commitType.type)
          .setScope('api')
          .setSubject(`test ${commitType.type} with scope`)
          .build();

        // Test with body
        const messageWithBody = builder
          .reset()
          .setType(commitType.type)
          .setSubject(`test ${commitType.type} with body`)
          .setBody('This is a longer description of the change')
          .build();

        // Test with breaking change
        const messageWithBreaking = builder
          .reset()
          .setType(commitType.type)
          .setSubject(`test ${commitType.type} breaking change`)
          .setBreakingChange(true)
          .build();

        // Validate structure
        const validation = builder.validate();
        if (!validation.valid) {
          console.log(`❌ ${commitType.type}: Validation failed - ${validation.errors.join(', ')}`);
          allPassed = false;
          continue;
        }

        // Check emoji inclusion
        const expectedEmoji = config.emojiEnabled ? commitType.emoji : '';
        const hasExpectedEmoji = config.emojiEnabled ? 
          message.includes(commitType.emoji) : 
          !message.includes(commitType.emoji);

        if (!hasExpectedEmoji) {
          console.log(`❌ ${commitType.type}: Emoji handling incorrect`);
          allPassed = false;
          continue;
        }

        // Display sample output
        console.log(`✅ ${commitType.type.padEnd(10)} | ${message.split('\n')[0]}`);

        // Show more detailed examples for first config only
        if (config.name === 'With Emojis') {
          console.log(`   ${' '.repeat(10)} | With scope: ${messageWithScope.split('\n')[0]}`);
          console.log(`   ${' '.repeat(10)} | With body: ${messageWithBody.split('\n')[0]}`);
          console.log(`   ${' '.repeat(10)} | Breaking: ${messageWithBreaking.split('\n')[0]}`);
        }

      } catch (error) {
        console.log(`❌ ${commitType.type}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
        allPassed = false;
      }
    }

    console.log('');
  }

  if (allPassed) {
    console.log('🎉 All commit types passed validation!');
  } else {
    console.log('💥 Some commit types failed validation');
    process.exit(1);
  }
}

/**
 * Test configuration loading and emoji handling
 */
async function testConfigHandling() {
  console.log('🔧 Testing configuration handling...\n');

  // Test with emoji enabled
  const configWithEmoji = { ...defaultConfig, emojiEnabled: true };
  const tempConfigPath1 = join(process.cwd(), 'test-config-emoji.json');
  writeFileSync(tempConfigPath1, JSON.stringify(configWithEmoji, null, 2));

  // Test with emoji disabled  
  const configWithoutEmoji = { ...defaultConfig, emojiEnabled: false };
  const tempConfigPath2 = join(process.cwd(), 'test-config-no-emoji.json');
  writeFileSync(tempConfigPath2, JSON.stringify(configWithoutEmoji, null, 2));

  console.log('✅ Test configurations created');
  console.log('📁 test-config-emoji.json - Emojis enabled');
  console.log('📁 test-config-no-emoji.json - Emojis disabled');
  console.log('');
  console.log('💡 To test interactively:');
  console.log('   1. Copy test-config-emoji.json to glinr-commit.json');
  console.log('   2. Run: npm run dev');
  console.log('   3. Copy test-config-no-emoji.json to glinr-commit.json');
  console.log('   4. Run: npm run dev again');
}

// Run tests
async function main() {
  await testCommitTypes();
  await testConfigHandling();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { testCommitTypes, testConfigHandling };