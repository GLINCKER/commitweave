#!/usr/bin/env tsx

import { AnthropicProvider } from '../src/utils/providers/anthropic.js';
import { ClaudeRateLimitError, ClaudeValidationError } from '../src/types/ai.js';

console.log('🧪 Testing AnthropicProvider...\n');

// Store original fetch
const originalFetch = global.fetch;

// Mock fetch function
function mockFetch(url: string, options?: RequestInit): Promise<Response> {
  const mockResponses = {
    success: {
      ok: true,
      status: 200,
      json: async () => ({
        content: [
          {
            text: '{"type":"feat","scope":"auth","subject":"add user authentication","body":"Implement JWT system","confidence":0.9,"reasoning":"Added new auth feature"}'
          }
        ]
      })
    },
    rateLimited: {
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    },
    badRequest: {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        error: { message: 'Invalid API key format' }
      })
    },
    timeout: {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    }
  };

  // Determine which mock response to use based on test context
  const testType = (global as any).currentTestType || 'success';
  const response = mockResponses[testType as keyof typeof mockResponses];

  return Promise.resolve(response as Response);
}

// Test utility functions
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

async function assertRejects(promise: Promise<any>, errorType?: any, message?: string) {
  try {
    await promise;
    throw new Error(`❌ Expected promise to reject${message ? `: ${message}` : ''}`);
  } catch (error) {
    if (errorType && !(error instanceof errorType)) {
      throw new Error(
        `❌ Expected error of type ${errorType.name}, got ${error.constructor.name}${message ? `: ${message}` : ''}`
      );
    }
    console.log(`✅ Promise correctly rejected${message ? `: ${message}` : ''}`);
  }
}

async function runTests() {
  try {
    // Replace global fetch with mock
    global.fetch = mockFetch as any;

    const mockApiKey = 'test-api-key';
    const mockModel = 'claude-3-haiku-20240307';
    const testDiff = 'diff --git a/file.ts b/file.ts\n+added line';

    console.log('🔧 Testing provider configuration...');

    // Test 1: Provider initialization
    const provider = new AnthropicProvider(mockApiKey, mockModel);
    assert(provider.isConfigured(), 'Provider should be configured with API key');
    assert(provider.model === mockModel, 'Provider should use specified model');

    // Test 2: Default model
    const defaultProvider = new AnthropicProvider(mockApiKey);
    assert(defaultProvider.model === 'claude-3-haiku-20240307', 'Should default to haiku model');

    // Test 3: Unconfigured provider
    const unconfiguredProvider = new AnthropicProvider();
    assert(
      !unconfiguredProvider.isConfigured(),
      'Provider should not be configured without API key'
    );

    console.log('\n🔧 Testing API interactions...');

    // Test 4: Successful response
    (global as any).currentTestType = 'success';
    const result = await provider.generateCommitMessage(testDiff);
    assert(result.type === 'feat', 'Should parse commit type correctly');
    assert(result.scope === 'auth', 'Should parse commit scope correctly');
    assert(result.subject === 'add user authentication', 'Should parse commit subject correctly');
    assert(result.confidence === 0.9, 'Should parse confidence correctly');

    console.log('\n🔧 Testing error handling...');

    // Test 5: Rate limit error
    (global as any).currentTestType = 'rateLimited';
    await assertRejects(
      provider.generateCommitMessage(testDiff),
      ClaudeRateLimitError,
      'Should throw ClaudeRateLimitError on 429 status'
    );

    // Test 6: Validation error
    (global as any).currentTestType = 'badRequest';
    await assertRejects(
      provider.generateCommitMessage(testDiff),
      ClaudeValidationError,
      'Should throw ClaudeValidationError on 400 status'
    );

    // Test 7: Unconfigured provider error
    await assertRejects(
      unconfiguredProvider.generateCommitMessage(testDiff),
      Error,
      'Should throw error when not configured'
    );

    console.log('\n🔧 Testing error classes...');

    // Test 8: Error class names
    const rateLimitError = new ClaudeRateLimitError('Test rate limit');
    const validationError = new ClaudeValidationError('Test validation');

    assert(
      rateLimitError.name === 'ClaudeRateLimitError',
      'ClaudeRateLimitError should have correct name'
    );
    assert(
      validationError.name === 'ClaudeValidationError',
      'ClaudeValidationError should have correct name'
    );
    assert(rateLimitError.message === 'Test rate limit', 'Should preserve custom error message');

    console.log('\n🔧 Testing configuration schema...');

    // Test 9: Configuration validation
    const { defaultConfig } = await import('../src/config/defaultConfig.js');
    assert(
      defaultConfig.claude !== undefined,
      'Default config should include Claude configuration'
    );
    assert(defaultConfig.claude?.enabled === false, 'Claude should be disabled by default');
    assert(
      defaultConfig.claude?.model === 'claude-3-haiku-20240307',
      'Should default to haiku model'
    );
    assert(defaultConfig.claude?.maxTokens === 4000, 'Should default to 4000 max tokens');
    assert(defaultConfig.version === '1.0', 'Should include version field');

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  } finally {
    // Restore original fetch
    global.fetch = originalFetch;
  }
}

// Run the tests
runTests().catch(console.error);
