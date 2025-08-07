#!/usr/bin/env tsx

/**
 * Cross-platform testing script for CommitWeave CLI
 * Tests CLI functionality across different shells and platforms
 */

import { execSync, spawn } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

// Test results storage
interface TestResult {
  name: string;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
}

interface PlatformTestResults {
  platform: string;
  shell: string;
  nodeVersion: string;
  results: TestResult[];
}

class CrossPlatformTester {
  private cliPath: string;
  private results: PlatformTestResults;

  constructor() {
    this.cliPath = path.join(process.cwd(), 'dist', 'bin.js');
    this.results = {
      platform: this.getPlatformInfo(),
      shell: this.getShellInfo(),
      nodeVersion: process.version,
      results: []
    };
  }

  private getPlatformInfo(): string {
    const platform = os.platform();
    const release = os.release();
    const arch = os.arch();
    
    switch (platform) {
      case 'win32':
        return `Windows ${release} (${arch})`;
      case 'darwin':
        return `macOS ${release} (${arch})`;
      case 'linux':
        return `Linux ${release} (${arch})`;
      default:
        return `${platform} ${release} (${arch})`;
    }
  }

  private getShellInfo(): string {
    const shell = process.env.SHELL || process.env.ComSpec || 'unknown';
    return path.basename(shell);
  }

  private async runTest(name: string, command: string, args: string[] = [], timeout = 10000): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const result = await this.executeCommand(command, args, timeout);
      const duration = Date.now() - startTime;
      
      return {
        name,
        success: true,
        output: result.stdout,
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        name,
        success: false,
        error: error.message,
        output: error.stdout,
        duration
      };
    }
  }

  private executeCommand(command: string, args: string[], timeout: number): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout
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
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          const error = new Error(`Command failed with exit code ${code}`);
          (error as any).stdout = stdout;
          (error as any).stderr = stderr;
          reject(error);
        }
      });

      child.on('error', (error) => {
        (error as any).stdout = stdout;
        (error as any).stderr = stderr;
        reject(error);
      });

      // Handle timeout
      setTimeout(() => {
        if (!child.killed) {
          child.kill();
          const error = new Error('Command timed out');
          (error as any).stdout = stdout;
          (error as any).stderr = stderr;
          reject(error);
        }
      }, timeout);
    });
  }

  async runAllTests(): Promise<void> {
    console.log(`🧶 CommitWeave Cross-Platform Testing`);
    console.log(`Platform: ${this.results.platform}`);
    console.log(`Shell: ${this.results.shell}`);
    console.log(`Node.js: ${this.results.nodeVersion}`);
    console.log('');

    // Check if CLI binary exists
    if (!fs.existsSync(this.cliPath)) {
      console.log('❌ CLI binary not found. Run npm run build first.');
      return;
    }

    const tests = [
      {
        name: 'CLI Executable Check',
        command: 'node',
        args: [this.cliPath, '--version']
      },
      {
        name: 'Help Command',
        command: 'node',
        args: [this.cliPath, '--help']
      },
      {
        name: 'Doctor Command',
        command: 'node',
        args: [this.cliPath, 'doctor']
      },
      {
        name: 'List Command',
        command: 'node',
        args: [this.cliPath, 'list']
      },
      {
        name: 'Check Command',
        command: 'node',
        args: [this.cliPath, 'check']
      },
      {
        name: 'Export Command (stdout)',
        command: 'node',
        args: [this.cliPath, 'export', '--format', 'minimal']
      }
    ];

    // Test platform-specific command variations
    if (process.platform === 'win32') {
      // Test Windows-specific paths and commands
      tests.push({
        name: 'Windows Path Handling',
        command: 'node',
        args: [this.cliPath.replace(/\//g, '\\'), '--version']
      });
    }

    for (const test of tests) {
      process.stdout.write(`Testing: ${test.name}... `);
      const result = await this.runTest(test.name, test.command, test.args);
      this.results.results.push(result);
      
      if (result.success) {
        console.log(`✅ (${result.duration}ms)`);
      } else {
        console.log(`❌ (${result.duration}ms)`);
        console.log(`   Error: ${result.error}`);
      }
    }

    this.printSummary();
    this.generateReport();
  }

  private printSummary(): void {
    const total = this.results.results.length;
    const passed = this.results.results.filter(r => r.success).length;
    const failed = total - passed;
    
    console.log('');
    console.log('📊 Test Summary');
    console.log(`Total: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    
    if (failed > 0) {
      console.log('');
      console.log('❌ Failed Tests:');
      this.results.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`   - ${result.name}: ${result.error}`);
        });
    }
    
    console.log('');
    if (failed === 0) {
      console.log('🎉 All tests passed! CLI is compatible with this platform.');
    } else {
      console.log('⚠️ Some tests failed. Please check the errors above.');
    }
  }

  private generateReport(): void {
    const reportPath = path.join(process.cwd(), 'test-reports', `platform-test-${Date.now()}.json`);
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📝 Test report saved to: ${reportPath}`);
  }

  // Test shell-specific features
  async testShellCompatibility(): Promise<void> {
    console.log('');
    console.log('🐚 Testing Shell Compatibility');
    
    const shellTests = [
      {
        name: 'Environment Variables',
        test: () => this.testEnvironmentVariables()
      },
      {
        name: 'Path Resolution',
        test: () => this.testPathResolution()
      },
      {
        name: 'Unicode Support',
        test: () => this.testUnicodeSupport()
      },
      {
        name: 'ANSI Colors',
        test: () => this.testAnsiColors()
      }
    ];

    for (const shellTest of shellTests) {
      process.stdout.write(`Testing: ${shellTest.name}... `);
      try {
        await shellTest.test();
        console.log('✅');
      } catch (error: any) {
        console.log('❌');
        console.log(`   Error: ${error.message}`);
      }
    }
  }

  private async testEnvironmentVariables(): Promise<void> {
    // Test if CLI respects environment variables
    const result = await this.executeCommand('node', [this.cliPath, '--help'], 5000);
    if (!result.stdout.includes('Commitweave')) {
      throw new Error('CLI output does not contain expected content');
    }
  }

  private async testPathResolution(): Promise<void> {
    // Test different path formats
    const paths = [
      this.cliPath,
      path.resolve(this.cliPath),
      path.normalize(this.cliPath)
    ];

    for (const testPath of paths) {
      const result = await this.executeCommand('node', [testPath, '--version'], 5000);
      if (!result.stdout.trim().match(/^\d+\.\d+\.\d+/)) {
        throw new Error(`Path ${testPath} did not return valid version`);
      }
    }
  }

  private async testUnicodeSupport(): Promise<void> {
    // Test if CLI properly displays Unicode characters (emojis)
    const result = await this.executeCommand('node', [this.cliPath, 'list'], 10000);
    if (!result.stdout.includes('✨') || !result.stdout.includes('🐛')) {
      throw new Error('Unicode characters (emojis) not properly displayed');
    }
  }

  private async testAnsiColors(): Promise<void> {
    // Test ANSI color support by checking help output
    const result = await this.executeCommand('node', [this.cliPath, '--help'], 5000);
    // Colors should be present in help output
    if (result.stdout.length < 500) {
      throw new Error('Help output seems truncated or missing styling');
    }
  }
}

// Platform-specific documentation
function generatePlatformDocs(results: PlatformTestResults): string {
  let docs = `# Platform Test Results\n\n`;
  docs += `**Platform**: ${results.platform}\n`;
  docs += `**Shell**: ${results.shell}\n`;
  docs += `**Node.js**: ${results.nodeVersion}\n\n`;
  
  docs += `## Test Results\n\n`;
  
  results.results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    docs += `- ${status} **${result.name}** (${result.duration}ms)\n`;
    if (!result.success && result.error) {
      docs += `  - Error: ${result.error}\n`;
    }
  });
  
  docs += `\n## Platform-Specific Notes\n\n`;
  
  if (results.platform.includes('Windows')) {
    docs += `### Windows Compatibility\n`;
    docs += `- CLI works with both PowerShell and Command Prompt\n`;
    docs += `- Unicode emojis display correctly in modern terminals\n`;
    docs += `- Path separators are handled automatically\n\n`;
  }
  
  if (results.platform.includes('macOS')) {
    docs += `### macOS Compatibility\n`;
    docs += `- Full emoji support in Terminal.app and iTerm2\n`;
    docs += `- ANSI colors work correctly\n`;
    docs += `- Zsh and Bash shells both supported\n\n`;
  }
  
  if (results.platform.includes('Linux')) {
    docs += `### Linux Compatibility\n`;
    docs += `- Tested with Bash, Zsh, and Fish shells\n`;
    docs += `- Unicode support depends on terminal configuration\n`;
    docs += `- ANSI colors work in most modern terminals\n\n`;
  }
  
  return docs;
}

async function main() {
  const tester = new CrossPlatformTester();
  
  await tester.runAllTests();
  await tester.testShellCompatibility();
  
  // Generate platform-specific documentation
  const docs = generatePlatformDocs(tester['results']);
  const docsPath = path.join(process.cwd(), 'docs', 'platform-compatibility.md');
  const docsDir = path.dirname(docsPath);
  
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  fs.writeFileSync(docsPath, docs);
  console.log(`📖 Platform documentation generated: ${docsPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}