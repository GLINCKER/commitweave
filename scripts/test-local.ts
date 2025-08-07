#!/usr/bin/env tsx

import { CommitBuilder } from '../src/core/commitBuilder.js';
import { defaultConfig } from '../src/config/defaultConfig.js';

console.log('🧪 Testing CommitBuilder...\n');

// Test sample commit
const builder = new CommitBuilder(defaultConfig);

const testCommit = builder.setType('feat').setScope('core').setSubject('add auth handler').build();

console.log('📋 Sample Commit Message:');
console.log('─'.repeat(40));
console.log(testCommit);
console.log('─'.repeat(40));

// Test with body and breaking change
console.log('\n🔧 Testing with body and breaking change...\n');

const complexCommit = builder
  .reset()
  .setType('feat')
  .setScope('api')
  .setSubject('implement new auth system')
  .setBody(
    'This introduces a new authentication system that supports\nmultiple providers and JWT tokens.'
  )
  .setBreakingChange(true)
  .build();

console.log('📋 Complex Commit Message:');
console.log('─'.repeat(40));
console.log(complexCommit);
console.log('─'.repeat(40));

// Test validation
console.log('\n✅ Testing validation...\n');

const validation = builder.validate();
console.log('Validation result:', validation);

console.log('\n🎉 Test completed!');
