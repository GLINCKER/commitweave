#!/usr/bin/env tsx

/**
 * AI functionality testing script for CommitWeave
 * Tests AI commit creation in both CLI and simulates VS Code extension behavior
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  name: string;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
}

class AIFunctionalityTester {
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

  private async executeCommand(command: string, args: string[], timeout = 10000, input?: string): Promise<{ stdout: string; stderr: string; code: number }> {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'test' }
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

      // Send input if provided
      if (input) {
        child.stdin?.write(input);
        child.stdin?.end();
      }

      // Handle timeout
      setTimeout(() => {
        if (!child.killed) {
          child.kill();
          resolve({ stdout, stderr: 'Command timed out', code: 124 });
        }
      }, timeout);
    });
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.testResults.push({
        name,
        success: true,
        duration
      });
      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        name,
        success: false,
        error: error.message,
        duration
      });
      console.log(`❌ ${name} (${duration}ms)`);
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

  async testMockAIProvider(): Promise<void> {
    // Test with mock AI provider (no API key required)
    const mockConfig = {
      version: '1.0',
      emojiEnabled: true,
      conventionalCommits: true,
      maxSubjectLength: 50,
      commitTypes: [
        { type: 'feat', emoji: '✨', description: 'A new feature' },
        { type: 'fix', emoji: '🐛', description: 'A bug fix' }
      ]
    };

    this.createTestConfig(mockConfig);

    // Test AI command with mock provider
    const result = await this.executeCommand('node', [this.cliPath, '--ai'], 15000);
    
    if (result.code !== 0) {
      throw new Error(`AI command failed with exit code ${result.code}: ${result.stderr}`);
    }

    if (!result.stdout.includes('Mock AI') && !result.stdout.includes('commit message')) {
      throw new Error('AI command did not produce expected output with mock provider');
    }
  }

  async testAICommandHelp(): Promise<void> {
    const result = await this.executeCommand('node', [this.cliPath, '--ai', '--help'], 5000);
    
    if (result.code !== 0) {
      throw new Error(`AI help command failed: ${result.stderr}`);
    }

    if (!result.stdout.includes('AI') || !result.stdout.includes('commit')) {
      throw new Error('AI help output does not contain expected content');
    }
  }

  async testConfigurationValidation(): Promise<void> {
    // Test with valid AI configuration
    const aiConfig = {
      version: '1.0',
      emojiEnabled: true,
      conventionalCommits: true,
      maxSubjectLength: 50,
      ai: {
        provider: 'mock',
        maxTokens: 150
      },
      commitTypes: [
        { type: 'feat', emoji: '✨', description: 'A new feature' }
      ]
    };

    this.createTestConfig(aiConfig);

    const result = await this.executeCommand('node', [this.cliPath, 'doctor'], 5000);
    
    if (result.code !== 0) {
      throw new Error(`Doctor command failed: ${result.stderr}`);
    }

    if (!result.stdout.includes('healthy')) {
      throw new Error('Configuration validation did not pass');
    }
  }

  async testAIProviderFallback(): Promise<void> {
    // Test AI provider fallback behavior
    const invalidAIConfig = {
      version: '1.0',
      emojiEnabled: true,
      conventionalCommits: true,
      ai: {
        provider: 'invalid-provider'
      },
      commitTypes: [
        { type: 'feat', emoji: '✨', description: 'A new feature' }
      ]
    };

    this.createTestConfig(invalidAIConfig);

    const result = await this.executeCommand('node', [this.cliPath, '--ai'], 10000);
    
    // Should gracefully handle invalid provider and fall back
    if (result.code === 0) {
      // Success is acceptable if it falls back gracefully
      if (!result.stdout.includes('Mock') && !result.stderr.includes('fallback')) {
        console.log('   Warning: No clear fallback indication found');
      }
    } else {
      // Non-zero exit is also acceptable if error is handled gracefully
      if (!result.stderr.includes('provider') && !result.stderr.includes('AI')) {
        throw new Error('AI provider error not properly handled');
      }
    }
  }

  async testVSCodeExtensionSimulation(): Promise<void> {
    // Simulate VS Code extension behavior by testing CLI integration
    // This tests the same underlying functionality the extension uses
    
    // Test 1: Check if CLI is available (extension detection)
    const versionResult = await this.executeCommand('node', [this.cliPath, '--version'], 3000);
    if (versionResult.code !== 0) {
      throw new Error('CLI not available for VS Code extension integration');
    }

    // Test 2: Test configuration loading (extension settings)
    const listResult = await this.executeCommand('node', [this.cliPath, 'list'], 5000);
    if (listResult.code !== 0) {
      throw new Error('Configuration loading failed for extension simulation');
    }

    // Test 3: Test doctor command (extension health check)
    const doctorResult = await this.executeCommand('node', [this.cliPath, 'doctor'], 5000);
    if (doctorResult.code !== 0) {
      throw new Error('Health check failed for extension simulation');
    }
  }

  async testErrorHandling(): Promise<void> {
    // Test various error conditions
    const errorTests = [
      {
        name: 'Invalid command',
        args: ['invalid-command'],
        expectError: true
      },
      {
        name: 'Missing configuration',
        setup: () => {
          const configPath = path.join(process.cwd(), 'glinr-commit.json');
          if (fs.existsSync(configPath)) {
            fs.renameSync(configPath, configPath + '.backup');
          }
        },
        cleanup: () => {
          const configPath = path.join(process.cwd(), 'glinr-commit.json');
          const backupPath = configPath + '.backup';
          if (fs.existsSync(backupPath)) {
            fs.renameSync(backupPath, configPath);
          }
        },
        args: ['list'],
        expectError: false // Should work with defaults
      }
    ];

    for (const test of errorTests) {
      if (test.setup) test.setup();
      
      try {
        const result = await this.executeCommand('node', [this.cliPath, ...test.args], 5000);
        
        if (test.expectError && result.code === 0) {
          throw new Error(`Expected error for ${test.name} but command succeeded`);
        }
        
        if (!test.expectError && result.code !== 0) {
          throw new Error(`Unexpected error for ${test.name}: ${result.stderr}`);
        }
      } finally {
        if (test.cleanup) test.cleanup();
      }
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🤖 CommitWeave AI Functionality Testing');
    console.log('=========================================');
    console.log('');

    // Verify CLI exists
    if (!fs.existsSync(this.cliPath)) {
      console.log('❌ CLI binary not found. Run npm run build first.');
      return;
    }

    try {
      await this.runTest('Mock AI Provider Test', () => this.testMockAIProvider());
      await this.runTest('AI Command Help', () => this.testAICommandHelp());
      await this.runTest('Configuration Validation', () => this.testConfigurationValidation());
      await this.runTest('AI Provider Fallback', () => this.testAIProviderFallback());
      await this.runTest('VS Code Extension Simulation', () => this.testVSCodeExtensionSimulation());
      await this.runTest('Error Handling', () => this.testErrorHandling());

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
    
    console.log('');
    console.log('📊 AI Testing Summary');
    console.log('====================');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
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
    
    if (failed === 0) {
      console.log('🎉 All AI functionality tests passed!');
      console.log('✨ CLI AI features are working correctly');
      console.log('🧩 VS Code extension integration is ready');
    } else {
      console.log('⚠️ Some AI tests failed. Please check the errors above.');
    }
  }
}

async function main() {
  const tester = new AIFunctionalityTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}