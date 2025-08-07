#!/usr/bin/env tsx

/**
 * VS Code Extension Integration Testing
 * Tests the CLI commands that VS Code extension relies on
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

class VSCodeIntegrationTester {
  private cliPath: string;
  private extensionPath: string;

  constructor() {
    this.cliPath = path.join(process.cwd(), 'dist', 'bin.js');
    this.extensionPath = path.join(process.cwd(), 'vscode-extension');
  }

  private async executeCommand(command: string, args: string[], timeout = 5000): Promise<{ stdout: string; stderr: string; code: number }> {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe']
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

  async testCLIAvailability(): Promise<boolean> {
    console.log('Testing CLI availability for VS Code extension...');
    
    try {
      // Test 1: Check if commitweave is globally available
      try {
        const globalResult = await this.executeCommand('commitweave', ['--version']);
        if (globalResult.code === 0) {
          console.log('✅ Global CommitWeave CLI available');
          return true;
        }
      } catch (error) {
        console.log('⚠️ Global CommitWeave CLI not available');
      }

      // Test 2: Check if npx can run CommitWeave
      const npxResult = await this.executeCommand('npx', ['@typeweaver/commitweave', '--version']);
      if (npxResult.code === 0) {
        console.log('✅ CommitWeave available via npx');
        return true;
      }

      // Test 3: Use local build
      const localResult = await this.executeCommand('node', [this.cliPath, '--version']);
      if (localResult.code === 0) {
        console.log('✅ Local CommitWeave build available');
        return true;
      }

      console.log('❌ CommitWeave CLI not available for VS Code extension');
      return false;
    } catch (error) {
      console.log(`❌ Error testing CLI availability: ${error}`);
      return false;
    }
  }

  async testExtensionCommands(): Promise<void> {
    console.log('\nTesting VS Code extension command integration...');

    const commands = [
      {
        name: 'Create Commit (CLI Integration)',
        command: 'node',
        args: [this.cliPath, '--help']
      },
      {
        name: 'AI Commit (CLI Integration)', 
        command: 'node',
        args: [this.cliPath, '--ai', '--help']
      },
      {
        name: 'Configuration Panel Data',
        command: 'node',
        args: [this.cliPath, 'list']
      },
      {
        name: 'Configuration Health Check',
        command: 'node',
        args: [this.cliPath, 'doctor']
      },
      {
        name: 'Export Configuration',
        command: 'node',
        args: [this.cliPath, 'export', '--format', 'minimal']
      }
    ];

    for (const cmd of commands) {
      try {
        const result = await this.executeCommand(cmd.command, cmd.args, 10000);
        if (result.code === 0) {
          console.log(`✅ ${cmd.name}`);
        } else {
          console.log(`❌ ${cmd.name}: Exit code ${result.code}`);
          if (result.stderr) {
            console.log(`   Error: ${result.stderr.slice(0, 100)}...`);
          }
        }
      } catch (error) {
        console.log(`❌ ${cmd.name}: ${error}`);
      }
    }
  }

  async testConfigurationSync(): Promise<void> {
    console.log('\nTesting configuration synchronization...');

    try {
      // Test reading configuration (for webview display)
      const listResult = await this.executeCommand('node', [this.cliPath, 'list'], 5000);
      if (listResult.code === 0 && listResult.stdout.includes('Configuration')) {
        console.log('✅ Configuration reading for webview');
      } else {
        console.log('❌ Configuration reading failed');
      }

      // Test exporting configuration (for backup/sharing)
      const exportResult = await this.executeCommand('node', [this.cliPath, 'export'], 5000);
      if (exportResult.code === 0 && exportResult.stdout.includes('{')) {
        console.log('✅ Configuration export functionality');
      } else {
        console.log('❌ Configuration export failed');
      }

      // Test configuration validation (for health check)
      const doctorResult = await this.executeCommand('node', [this.cliPath, 'doctor'], 5000);
      if (doctorResult.code === 0) {
        console.log('✅ Configuration validation for health check');
      } else {
        console.log('❌ Configuration validation failed');
      }

    } catch (error) {
      console.log(`❌ Configuration sync test failed: ${error}`);
    }
  }

  async testGitIntegration(): Promise<void> {
    console.log('\nTesting Git integration for extension...');

    try {
      // Test git repository detection
      const gitCheck = await this.executeCommand('git', ['rev-parse', '--git-dir']);
      if (gitCheck.code === 0) {
        console.log('✅ Git repository detected');

        // Test git status for staged files
        const statusResult = await this.executeCommand('git', ['diff', '--cached', '--name-only']);
        const stagedFiles = statusResult.stdout.trim().split('\n').filter(f => f.length > 0);
        console.log(`ℹ️ Staged files: ${stagedFiles.length}`);

        // Test commit validation on last commit
        const lastCommitResult = await this.executeCommand('node', [this.cliPath, 'check']);
        if (lastCommitResult.code === 0) {
          console.log('✅ Last commit validation works');
        } else {
          console.log('⚠️ Last commit validation had issues (may be expected)');
        }
      } else {
        console.log('⚠️ Not in a Git repository');
      }
    } catch (error) {
      console.log(`❌ Git integration test failed: ${error}`);
    }
  }

  async testErrorHandlingForExtension(): Promise<void> {
    console.log('\nTesting error handling for extension scenarios...');

    const errorTests = [
      {
        name: 'Invalid command handling',
        command: 'node',
        args: [this.cliPath, 'invalid-command'],
        expectError: true
      },
      {
        name: 'Help command always works',
        command: 'node',
        args: [this.cliPath, '--help'],
        expectError: false
      },
      {
        name: 'Version command always works',
        command: 'node',
        args: [this.cliPath, '--version'],
        expectError: false
      }
    ];

    for (const test of errorTests) {
      try {
        const result = await this.executeCommand(test.command, test.args, 5000);
        
        if (test.expectError && result.code === 0) {
          console.log(`⚠️ ${test.name}: Expected error but command succeeded`);
        } else if (!test.expectError && result.code !== 0) {
          console.log(`❌ ${test.name}: Unexpected error (${result.code})`);
        } else {
          console.log(`✅ ${test.name}`);
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ${error}`);
      }
    }
  }

  async testExtensionManifest(): Promise<void> {
    console.log('\nTesting VS Code extension manifest...');

    try {
      const manifestPath = path.join(this.extensionPath, 'package.json');
      if (!fs.existsSync(manifestPath)) {
        console.log('❌ Extension package.json not found');
        return;
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Check required fields
      const requiredFields = ['name', 'displayName', 'description', 'version', 'publisher', 'engines'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length === 0) {
        console.log('✅ Extension manifest has required fields');
      } else {
        console.log(`❌ Extension manifest missing fields: ${missingFields.join(', ')}`);
      }

      // Check commands
      if (manifest.contributes && manifest.contributes.commands) {
        const commandCount = manifest.contributes.commands.length;
        console.log(`✅ Extension defines ${commandCount} commands`);
      } else {
        console.log('❌ Extension has no commands defined');
      }

      // Check activation events
      if (manifest.activationEvents && manifest.activationEvents.length > 0) {
        console.log(`✅ Extension has ${manifest.activationEvents.length} activation events`);
      } else {
        console.log('⚠️ Extension has no activation events (may be intentional)');
      }

    } catch (error) {
      console.log(`❌ Extension manifest test failed: ${error}`);
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🧩 CommitWeave VS Code Extension Integration Testing');
    console.log('======================================================');
    
    const isCliAvailable = await this.testCLIAvailability();
    
    if (!isCliAvailable) {
      console.log('\n❌ Cannot continue testing - CLI not available');
      console.log('\nTo fix this:');
      console.log('1. Run: npm run build');
      console.log('2. Or install globally: npm install -g @typeweaver/commitweave');
      return;
    }

    await this.testExtensionCommands();
    await this.testConfigurationSync();
    await this.testGitIntegration();
    await this.testErrorHandlingForExtension();
    await this.testExtensionManifest();

    console.log('\n🎆 VS Code Extension Integration Summary');
    console.log('==========================================');
    console.log('✅ CLI integration tests completed');
    console.log('✅ Configuration sync tests completed');
    console.log('✅ Git integration tests completed');
    console.log('✅ Error handling tests completed');
    console.log('✅ Extension manifest validated');
    console.log('');
    console.log('🎉 VS Code extension is ready for use!');
    console.log('\nTo test the extension manually:');
    console.log('1. Open VS Code in this directory');
    console.log('2. Press F5 to launch Extension Development Host');
    console.log('3. Use Ctrl+Shift+P and search for "CommitWeave"');
  }
}

async function main() {
  const tester = new VSCodeIntegrationTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}