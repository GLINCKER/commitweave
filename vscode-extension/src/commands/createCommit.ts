import * as vscode from 'vscode';
import { getWorkspaceFolder, initializeGitRepo, executeCommitWeave, getGitStatus } from '../utils/gitUtils';

/**
 * Register the Create Commit command
 */
export function registerCreateCommitCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('commitweave.create', async () => {
    try {
      await executeCreateCommit();
    } catch (error) {
      vscode.window.showErrorMessage(`CommitWeave: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  context.subscriptions.push(disposable);
}

/**
 * Execute the create commit command using the CLI
 */
export async function executeCreateCommit() {
  // Get the workspace folder
  const workspaceFolder = getWorkspaceFolder();
  if (!workspaceFolder) {
    throw new Error('No workspace folder found. Please open a project folder.');
  }

  // Get git status
  const gitStatus = await getGitStatus(workspaceFolder);
  
  if (!gitStatus.isRepository) {
    const selection = await vscode.window.showErrorMessage(
      'This is not a git repository. Would you like to initialize one?',
      'Initialize Git',
      'Cancel'
    );
    
    if (selection === 'Initialize Git') {
      await initializeGitRepo(workspaceFolder);
      vscode.window.showInformationMessage('Git repository initialized successfully!');
    } else {
      return;
    }
  }

  // Create output channel for CommitWeave
  const outputChannel = vscode.window.createOutputChannel('CommitWeave');
  outputChannel.show(true);
  
  // Show status info
  outputChannel.appendLine('🧶 CommitWeave - Interactive Commit Creator');
  outputChannel.appendLine('=====================================');
  if (gitStatus.isRepository) {
    outputChannel.appendLine(`📂 Repository: ${workspaceFolder}`);
    outputChannel.appendLine(`🌿 Branch: ${gitStatus.branch || 'unknown'}`);
    outputChannel.appendLine(`📋 Staged files: ${gitStatus.stagedFiles}`);
    outputChannel.appendLine(`📝 Modified files: ${gitStatus.modifiedFiles}`);
    outputChannel.appendLine(`❓ Untracked files: ${gitStatus.untrackedFiles}`);
    outputChannel.appendLine('');
  }

  try {
    // Run commitweave CLI
    await executeCommitWeave([], workspaceFolder, outputChannel);
    vscode.window.showInformationMessage('CommitWeave: Commit creation completed!');
  } catch (error: any) {
    outputChannel.appendLine(`❌ Error: ${error.message}`);
    throw error;
  }
}

