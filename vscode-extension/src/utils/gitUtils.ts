import * as vscode from 'vscode';
import { spawn } from 'child_process';

/**
 * Git utilities for VS Code extension
 */

export interface GitStatus {
  isRepository: boolean;
  stagedFiles: number;
  modifiedFiles: number;
  untrackedFiles: number;
  branch?: string;
}

/**
 * Get the current workspace folder
 */
export function getWorkspaceFolder(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }
  return workspaceFolders[0].uri.fsPath;
}

/**
 * Check if the current directory is a git repository
 */
export async function isGitRepository(cwd: string): Promise<boolean> {
  try {
    await executeCommandWithOutput('git', ['rev-parse', '--git-dir'], cwd);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get comprehensive git status information
 */
export async function getGitStatus(cwd: string): Promise<GitStatus> {
  try {
    // Check if it's a git repository
    if (!(await isGitRepository(cwd))) {
      return {
        isRepository: false,
        stagedFiles: 0,
        modifiedFiles: 0,
        untrackedFiles: 0
      };
    }

    // Get status information
    const [stagedResult, modifiedResult, untrackedResult, branchResult] = await Promise.allSettled([
      executeCommandWithOutput('git', ['diff', '--cached', '--name-only'], cwd),
      executeCommandWithOutput('git', ['diff', '--name-only'], cwd),
      executeCommandWithOutput('git', ['ls-files', '--others', '--exclude-standard'], cwd),
      executeCommandWithOutput('git', ['branch', '--show-current'], cwd)
    ]);

    const stagedFiles = stagedResult.status === 'fulfilled' ? 
      stagedResult.value.trim().split('\n').filter(Boolean).length : 0;
    const modifiedFiles = modifiedResult.status === 'fulfilled' ? 
      modifiedResult.value.trim().split('\n').filter(Boolean).length : 0;
    const untrackedFiles = untrackedResult.status === 'fulfilled' ? 
      untrackedResult.value.trim().split('\n').filter(Boolean).length : 0;
    const branch = branchResult.status === 'fulfilled' ? 
      branchResult.value.trim() : undefined;

    return {
      isRepository: true,
      stagedFiles,
      modifiedFiles,
      untrackedFiles,
      branch
    };
  } catch (error) {
    return {
      isRepository: false,
      stagedFiles: 0,
      modifiedFiles: 0,
      untrackedFiles: 0
    };
  }
}

/**
 * Check if there are staged changes in the repository
 */
export async function hasStagedChanges(cwd: string): Promise<boolean> {
  try {
    const result = await executeCommandWithOutput('git', ['diff', '--cached', '--name-only'], cwd);
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Execute a command and return its output
 */
export async function executeCommandWithOutput(command: string, args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
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
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Execute a command with output to a channel
 */
export async function executeCommand(
  command: string, 
  args: string[], 
  cwd: string, 
  outputChannel?: vscode.OutputChannel
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (outputChannel) {
      outputChannel.appendLine(`> ${command} ${args.join(' ')}`);
    }

    const child = spawn(command, args, {
      cwd,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    child.stdout?.on('data', (data) => {
      const output = data.toString();
      if (outputChannel) {
        outputChannel.append(output);
      }
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString();
      if (outputChannel) {
        outputChannel.append(output);
      }
    });

    child.on('close', (code) => {
      if (code === 0) {
        if (outputChannel) {
          outputChannel.appendLine('✅ Command completed successfully');
        }
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Execute CommitWeave CLI with given arguments
 */
export async function executeCommitWeave(args: string[], cwd: string, outputChannel?: vscode.OutputChannel): Promise<void> {
  // First try the global installation
  try {
    await executeCommand('commitweave', args, cwd, outputChannel);
    return;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Global installation not found, try npx
      if (outputChannel) {
        outputChannel.appendLine('Global CommitWeave not found, trying npx...');
      }
      
      try {
        await executeCommand('npx', ['@typeweaver/commitweave', ...args], cwd, outputChannel);
        return;
      } catch (npxError: any) {
        if (npxError.code === 'ENOENT') {
          throw new Error('CommitWeave CLI not found. Please install it globally: npm i -g @typeweaver/commitweave');
        }
        throw npxError;
      }
    }
    throw error;
  }
}

/**
 * Initialize a git repository
 */
export async function initializeGitRepo(cwd: string): Promise<void> {
  await executeCommand('git', ['init'], cwd);
}

/**
 * Stage all changes
 */
export async function stageAllChanges(cwd: string): Promise<void> {
  await executeCommand('git', ['add', '.'], cwd);
}