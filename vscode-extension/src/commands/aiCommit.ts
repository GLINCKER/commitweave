import * as vscode from 'vscode';
import { spawn } from 'child_process';

/**
 * Register the AI Commit command
 */
export function registerAiCommitCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('commitweave.ai', async () => {
    try {
      await executeAiCommit();
    } catch (error) {
      vscode.window.showErrorMessage(`CommitWeave AI: ${error}`);
    }
  });

  context.subscriptions.push(disposable);
}

/**
 * Execute the AI commit command using the CLI
 */
async function executeAiCommit() {
  // Get the workspace folder
  const workspaceFolder = getWorkspaceFolder();
  if (!workspaceFolder) {
    throw new Error('No workspace folder found. Please open a project folder.');
  }

  // Check if we're in a git repository
  if (!(await isGitRepository(workspaceFolder))) {
    throw new Error('This is not a git repository. Please initialize git first: git init');
  }

  // Check for staged changes
  if (!(await hasStagedChanges(workspaceFolder))) {
    const selection = await vscode.window.showWarningMessage(
      'No staged changes found. Would you like to stage all changes first?',
      'Stage All Changes',
      'Cancel'
    );
    
    if (selection === 'Stage All Changes') {
      await executeCommand('git', ['add', '.'], workspaceFolder);
      vscode.window.showInformationMessage('All changes staged successfully!');
    } else {
      return;
    }
  }

  // Create output channel for CommitWeave
  const outputChannel = vscode.window.createOutputChannel('CommitWeave AI');
  outputChannel.show(true);

  try {
    // Try to run commitweave with AI flag
    await executeCommitWeave(['--ai'], workspaceFolder, outputChannel);
    vscode.window.showInformationMessage('CommitWeave: AI commit completed!');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // CommitWeave CLI not found
      const selection = await vscode.window.showErrorMessage(
        'CommitWeave CLI not found. Please install it globally.',
        'Install Instructions',
        'Use Local Version'
      );

      if (selection === 'Install Instructions') {
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/GLINCKER/commitweave#installation'));
      } else if (selection === 'Use Local Version') {
        // Try with npx
        try {
          await executeCommand('npx', ['@typeweaver/commitweave', '--ai'], workspaceFolder, outputChannel);
          vscode.window.showInformationMessage('CommitWeave: AI commit completed!');
        } catch (npxError) {
          vscode.window.showErrorMessage('Failed to run CommitWeave with npx. Please install globally: npm i -g @typeweaver/commitweave');
        }
      }
    } else {
      throw error;
    }
  }
}

/**
 * Execute CommitWeave CLI with given arguments
 */
async function executeCommitWeave(args: string[], cwd: string, outputChannel?: vscode.OutputChannel): Promise<void> {
  return executeCommand('commitweave', args, cwd, outputChannel);
}

/**
 * Execute a command in the integrated terminal or output channel
 */
async function executeCommand(
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
          outputChannel.appendLine('✅ AI commit completed successfully');
        }
        resolve();
      } else {
        reject(new Error(`AI commit failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
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
  try {
    await executeCommand('git', ['rev-parse', '--git-dir'], cwd);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if there are staged changes in the repository
 */
async function hasStagedChanges(cwd: string): Promise<boolean> {
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
async function executeCommandWithOutput(command: string, args: string[], cwd: string): Promise<string> {
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