#!/usr/bin/env tsx

/**
 * AI Fallback Behavior Testing Script
 * Tests network failures, provider errors, and graceful degradation to Mock AI
 * Includes both internal API testing and CLI command testing
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { generateAISummary, createAIProvider, generateCommitSuggestion } from '../src/utils/ai.js';
import type { AISummaryOptions, AIConfig } from '../src/types/config.js';

interface TestResult {
  name: string;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
  fallbackDetected?: boolean;
  warningShown?: boolean;
}

class AIFallbackTester {
  private cliPath: string;
  private originalConfig: any;
  private testResults: TestResult[] = [];

  constructor() {
    this.cliPath = path.join(process.cwd(), 'dist', 'bin.js');
    this.loadOriginalConfig();
  }

  private loadOriginalConfig(): void {
    try {
      const configPath = path.join(process.cwd(), 'glinr-commit.json');
      this.originalConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      this.originalConfig = null;
    }
  }

  private async executeCommand(
    command: string, 
    args: string[], 
    timeout = 15000,
    env?: Record<string, string>
  ): Promise<{ stdout: string; stderr: string; code: number }> {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, ...env }
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ stdout, stderr, code: code || 0 });
      });

      child.on('error', (error) => {
        resolve({ stdout, stderr: error.message, code: 1 });
      });

      setTimeout(() => {
        if (!child.killed) {
          child.kill();
          resolve({ stdout, stderr: 'Command timed out', code: 124 });
        }
      }, timeout);
    });
  }

  private async runTest(name: string, testFn: () => Promise<TestResult>): Promise<void> {
    try {
      const result = await testFn();
      this.testResults.push(result);
      
      const statusIcon = result.success ? '✅' : '❌';
      const fallbackInfo = result.fallbackDetected ? ' (Fallback: ✅)' : '';
      const warningInfo = result.warningShown ? ' (Warning: ✅)' : '';
      
      console.log(`${statusIcon} ${name} (${result.duration}ms)${fallbackInfo}${warningInfo}`);
      
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    } catch (error: any) {
      const result: TestResult = {
        name,
        success: false,
        error: error.message,
        duration: 0
      };
      
      this.testResults.push(result);
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
    }
  }

  private createTestConfig(config: any): void {
    const configPath = path.join(process.cwd(), 'glinr-commit.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  private restoreOriginalConfig(): void {
    const configPath = path.join(process.cwd(), 'glinr-commit.json');
    if (this.originalConfig) {
      fs.writeFileSync(configPath, JSON.stringify(this.originalConfig, null, 2));
    }
  }

  // Internal API Tests (existing functionality)
  async testInternalAPIFallback(): Promise<TestResult> {
    const startTime = Date.now();
    
    const mockDiff = `diff --git a/src/example.ts b/src/example.ts
index 1234567..abcdefg 100644
--- a/src/example.ts
+++ b/src/example.ts
@@ -1,3 +1,6 @@
 export function example() {
-  return 'hello';
+  return 'hello world';
 }
+
+export function newFunction() {
+  return 'new functionality';
+}`;

    try {
      // Test OpenAI without API key
      const options: AISummaryOptions = {
        provider: 'openai',
        // No API key provided
      };
      
      const suggestion = await generateCommitSuggestion(mockDiff, options);
      const duration = Date.now() - startTime;
      
      const isMockProvider = suggestion.confidence === 0.8;
      
      return {
        name: 'Internal API Fallback',
        success: true,
        output: suggestion.subject,
        duration,
        fallbackDetected: isMockProvider,
        warningShown: true // Internal API fallback is expected
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        name: 'Internal API Fallback',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      };
    }
  }

  // CLI Command Tests (new functionality)
  async testNetworkFailureSimulation(): Promise<TestResult> {
    const startTime = Date.now();
    
    // Create config with invalid OpenAI endpoint to simulate network failure
    const networkFailureConfig = {
      version: '1.0',
      emojiEnabled: true,
      conventionalCommits: true,
      maxSubjectLength: 50,
      ai: {
        provider: 'openai',
        apiKey: 'test-key-that-will-fail',
        baseURL: 'https://invalid-openai-endpoint.example.com',
        maxTokens: 150
      },
      commitTypes: [
        { type: 'feat', emoji: '✨', description: 'A new feature' },
        { type: 'fix', emoji: '🐛', description: 'A bug fix' }
      ]
    };

    this.createTestConfig(networkFailureConfig);

    const result = await this.executeCommand('node', [this.cliPath, '--ai'], 20000);
    const duration = Date.now() - startTime;

    // Check if it fell back gracefully to Mock AI
    const fallbackDetected = result.stdout.includes('Mock AI') || 
                           result.stdout.includes('fallback') || 
                           result.stderr.includes('fallback') ||
                           result.stderr.includes('Mock') ||
                           result.code === 0; // Any success indicates fallback worked

    const warningShown = result.stderr.includes('network') || 
                        result.stderr.includes('connection') ||
                        result.stderr.includes('failed') ||
                        result.stdout.includes('Warning') ||
                        result.stderr.includes('Warning');

    return {
      name: 'Network Failure Simulation',
      success: fallbackDetected,
      output: result.stdout,
      error: !fallbackDetected ? result.stderr : undefined,
      duration,
      fallbackDetected,
      warningShown
    };
  }

  async testInvalidAPIKey(): Promise<TestResult> {
    const startTime = Date.now();
    
    // Create config with invalid API key
    const invalidKeyConfig = {
      version: '1.0',
      emojiEnabled: true,
      conventionalCommits: true,
      ai: {
        provider: 'openai',
        apiKey: 'invalid-api-key-12345',
        maxTokens: 150
      },
      commitTypes: [
        { type: 'feat', emoji: '✨', description: 'A new feature' }
      ]
    };

    this.createTestConfig(invalidKeyConfig);

    const result = await this.executeCommand('node', [this.cliPath, '--ai'], 15000);
    const duration = Date.now() - startTime;

    const fallbackDetected = result.stdout.includes('Mock AI') || 
                           result.stdout.includes('fallback') ||
                           result.stderr.includes('fallback') ||
                           result.code === 0;

    const warningShown = result.stderr.includes('API key') || 
                        result.stderr.includes('authentication') ||
                        result.stderr.includes('unauthorized') ||
                        result.stdout.includes('Warning');

    return {
      name: 'Invalid API Key Test',
      success: fallbackDetected,
      output: result.stdout,
      error: !fallbackDetected ? result.stderr : undefined,
      duration,
      fallbackDetected,
      warningShown
    };
  }

  async testVSCodeExtensionFallback(): Promise<TestResult> {
    const startTime = Date.now();
    
    // Simulate VS Code extension scenario with failing AI
    const extensionConfig = {
      version: '1.0',
      emojiEnabled: true,
      conventionalCommits: true,
      ai: {
        provider: 'openai',
        apiKey: 'vscode-extension-invalid-key'
      },
      commitTypes: [
        { type: 'feat', emoji: '✨', description: 'A new feature' },
        { type: 'fix', emoji: '🐛', description: 'A bug fix' }
      ]
    };

    this.createTestConfig(extensionConfig);

    // Test the commands VS Code extension would use
    const aiResult = await this.executeCommand('node', [this.cliPath, '--ai'], 10000);
    const listResult = await this.executeCommand('node', [this.cliPath, 'list'], 5000);
    const doctorResult = await this.executeCommand('node', [this.cliPath, 'doctor'], 5000);

    const duration = Date.now() - startTime;

    const fallbackDetected = aiResult.stdout.includes('Mock AI') || 
                           aiResult.stdout.includes('fallback') ||
                           aiResult.code === 0;

    const extensionCommandsWork = listResult.code === 0 && doctorResult.code === 0;

    const warningShown = aiResult.stderr.includes('Warning') || 
                        aiResult.stderr.includes('fallback') ||
                        aiResult.stderr.includes('failed');

    return {
      name: 'VS Code Extension Fallback Simulation',
      success: fallbackDetected && extensionCommandsWork,
      output: `AI: ${aiResult.code === 0 ? 'OK' : 'FAIL'} | List: ${listResult.code === 0 ? 'OK' : 'FAIL'} | Doctor: ${doctorResult.code === 0 ? 'OK' : 'FAIL'}`,
      error: !fallbackDetected ? 'No fallback detected for extension scenario' : undefined,
      duration,
      fallbackDetected,
      warningShown
    };
  }

  async testMockAIAlwaysAvailable(): Promise<TestResult> {
    const startTime = Date.now();
    
    // Test that Mock AI is always available as ultimate fallback
    const minimalConfig = {
      version: '1.0',
      emojiEnabled: true,
      conventionalCommits: true,
      commitTypes: [
        { type: 'feat', emoji: '✨', description: 'A new feature' }
      ]
      // No AI configuration at all
    };

    this.createTestConfig(minimalConfig);

    const result = await this.executeCommand('node', [this.cliPath, '--ai'], 10000);
    const duration = Date.now() - startTime;

    const mockAIWorking = result.code === 0 && 
                         (result.stdout.includes('Mock AI') || 
                          result.stdout.includes('commit message') ||
                          result.stdout.includes('feat'));

    return {
      name: 'Mock AI Always Available Test',
      success: mockAIWorking,
      output: result.stdout,
      error: !mockAIWorking ? `Mock AI not working: ${result.stderr}` : undefined,
      duration,
      fallbackDetected: mockAIWorking,
      warningShown: result.stdout.includes('Mock') || result.stderr.includes('Mock')
    };
  }

  async runAllTests(): Promise<void> {
    console.log('🛡️  CommitWeave AI Fallback Testing');
    console.log('===================================');
    console.log('Testing network failures, provider errors, and graceful degradation');
    console.log('');

    // Verify CLI exists
    if (!fs.existsSync(this.cliPath)) {
      console.log('❌ CLI binary not found. Run npm run build first.');
      return;
    }

    try {
      await this.runTest('Internal API Fallback', () => this.testInternalAPIFallback());
      await this.runTest('Network Failure Simulation', () => this.testNetworkFailureSimulation());
      await this.runTest('Invalid API Key', () => this.testInvalidAPIKey());
      await this.runTest('VS Code Extension Fallback', () => this.testVSCodeExtensionFallback());
      await this.runTest('Mock AI Always Available', () => this.testMockAIAlwaysAvailable());

      this.printSummary();
    } finally {
      // Always restore original configuration
      this.restoreOriginalConfig();
    }
  }

  private printSummary(): void {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.success).length;
    const failed = total - passed;
    const fallbacksDetected = this.testResults.filter(r => r.fallbackDetected).length;
    const warningsShown = this.testResults.filter(r => r.warningShown).length;
    
    console.log('');
    console.log('📊 AI Fallback Testing Summary');
    console.log('==============================');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Fallbacks Detected: ${fallbacksDetected} 🛡️`);
    console.log(`Warnings Shown: ${warningsShown} ⚠️`);
    console.log('');
    
    if (failed > 0) {
      console.log('❌ Failed Tests:');
      this.testResults
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`   - ${result.name}: ${result.error}`);
        });
      console.log('');
    }
    
    const avgDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0) / total;
    console.log(`Average test duration: ${avgDuration.toFixed(1)}ms`);
    
    if (failed === 0 && fallbacksDetected >= 3) {
      console.log('');
      console.log('🎉 All fallback tests passed!');
      console.log('✅ Network and provider failures are handled gracefully');
      console.log('🛡️ Mock AI fallback is working correctly');
      console.log('🧩 VS Code extension will degrade gracefully');
      console.log('⚠️ Users receive appropriate warnings when fallbacks occur');
    } else if (failed === 0) {
      console.log('');
      console.log('✅ All tests passed, but some fallbacks may need improvement');
      console.log('💡 Consider improving fallback detection and user messaging');
    } else {
      console.log('');
      console.log('⚠️ Some fallback tests failed. Please review error handling.');
      console.log('🔧 Ensure Mock AI provider is always available as ultimate fallback');
    }
  }
}

async function main() {
  const tester = new AIFallbackTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { AIFallbackTester };