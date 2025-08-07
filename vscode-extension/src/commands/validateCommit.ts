import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { validateCommitMessage, formatValidationResults } from '../utils/commitValidator';

/**
 * Register the Validate Commit command
 */
export function registerValidateCommitCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('commitweave.validateCommit', async () => {
    try {
      await executeValidateCommit();
    } catch (error) {
      vscode.window.showErrorMessage(`CommitWeave Validate: ${error}`);
    }
  });

  context.subscriptions.push(disposable);
}

/**
 * Execute commit validation
 */
export async function executeValidateCommit() {
  const workspaceFolder = getWorkspaceFolder();
  if (!workspaceFolder) {
    throw new Error('No workspace folder found. Please open a project folder.');
  }

  // Check if we're in a git repository
  if (!(await isGitRepository(workspaceFolder))) {
    vscode.window.showErrorMessage('This is not a git repository.');
    return;
  }

  try {
    // Get the latest commit message
    const commitMessage = await getLatestCommitMessage(workspaceFolder);
    
    if (!commitMessage) {
      vscode.window.showWarningMessage('No commits found in this repository.');
      return;
    }

    // Validate the commit message
    const result = validateCommitMessage(commitMessage);
    const formattedResult = formatValidationResults(result);

    // Create output channel and show results
    const outputChannel = vscode.window.createOutputChannel('CommitWeave Validation');
    outputChannel.clear();
    outputChannel.appendLine('🧶 CommitWeave - Commit Message Validation');
    outputChannel.appendLine('='.repeat(50));
    outputChannel.appendLine('');
    outputChannel.appendLine(`Latest commit message:`);
    outputChannel.appendLine(`"${commitMessage}"`);
    outputChannel.appendLine('');
    outputChannel.appendLine(formattedResult);
    
    if (!result.isValid) {
      outputChannel.appendLine('');
      outputChannel.appendLine('💡 Tips for better commit messages:');
      outputChannel.appendLine('  - Use conventional commit format: type(scope): subject');
      outputChannel.appendLine('  - Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert');
      outputChannel.appendLine('  - Keep subject line under 50 characters');
      outputChannel.appendLine('  - Use imperative mood: "add" not "added" or "adds"');
      outputChannel.appendLine('  - Start subject with lowercase');
      outputChannel.appendLine('  - Don\'t end subject with a period');
    }
    
    outputChannel.show();

    // Show summary message
    if (result.isValid) {
      vscode.window.showInformationMessage('✅ Latest commit message follows conventional commit standards!');
    } else {
      const action = await vscode.window.showWarningMessage(
        `❌ Latest commit has ${result.errors.length} error(s) and ${result.warnings.length} warning(s)`,
        'View Details',
        'Amend Commit'
      );

      if (action === 'View Details') {
        outputChannel.show();
      } else if (action === 'Amend Commit') {
        // Open git amend workflow
        const newMessage = await vscode.window.showInputBox({
          prompt: 'Enter corrected commit message',
          value: commitMessage,
          ignoreFocusOut: true,
          validateInput: (value) => {
            const validation = validateCommitMessage(value);
            if (!validation.isValid) {
              return validation.errors[0];
            }
            return null;
          }
        });

        if (newMessage) {
          try {
            await amendCommit(newMessage, workspaceFolder);
            vscode.window.showInformationMessage('✅ Commit amended successfully!');
            vscode.commands.executeCommand('git.refresh');
          } catch (error) {
            vscode.window.showErrorMessage(`Failed to amend commit: ${error}`);
          }
        }
      }
    }

  } catch (error) {
    vscode.window.showErrorMessage(`Failed to validate commit: ${error}`);
  }
}

/**
 * Get the latest commit message
 */
async function getLatestCommitMessage(cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['log', '-1', '--pretty=format:%s%n%n%b'], { cwd });
    let output = '';
    
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Git command failed with exit code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

/**
 * Amend the latest commit with a new message
 */
async function amendCommit(message: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['commit', '--amend', '-m', message], { cwd });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Git amend failed with exit code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

/**
 * Get the current workspace folder
 */
function getWorkspaceFolder(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }
  return workspaceFolders[0].uri.fsPath;
}

/**
 * Check if the current directory is a git repository
 */
async function isGitRepository(cwd: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn('git', ['rev-parse', '--git-dir'], { cwd });
    child.on('close', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}