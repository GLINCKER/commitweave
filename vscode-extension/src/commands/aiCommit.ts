import * as vscode from 'vscode';
import { getWorkspaceFolder, getGitStatus, executeCommitWeave, stageAllChanges } from '../utils/gitUtils';

/**
 * Register the AI Commit command
 */
export function registerAiCommitCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('commitweave.ai', async () => {
    try {
      await executeAiCommit();
    } catch (error) {
      vscode.window.showErrorMessage(`CommitWeave AI: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  context.subscriptions.push(disposable);
}

/**
 * Execute the AI commit command using the CLI
 */
export async function executeAiCommit() {
  // Get the workspace folder
  const workspaceFolder = getWorkspaceFolder();
  if (!workspaceFolder) {
    throw new Error('No workspace folder found. Please open a project folder.');
  }

  // Get git status
  const gitStatus = await getGitStatus(workspaceFolder);
  
  if (!gitStatus.isRepository) {
    throw new Error('This is not a git repository. Please initialize git first: git init');
  }

  // Check for staged changes
  if (gitStatus.stagedFiles === 0) {
    if (gitStatus.modifiedFiles === 0 && gitStatus.untrackedFiles === 0) {
      throw new Error('No changes detected. Make some changes first and try again.');
    }

    const selection = await vscode.window.showWarningMessage(
      `No staged changes found. Found ${gitStatus.modifiedFiles} modified and ${gitStatus.untrackedFiles} untracked files. Would you like to stage all changes first?`,
      'Stage All Changes',
      'Cancel'
    );
    
    if (selection === 'Stage All Changes') {
      await stageAllChanges(workspaceFolder);
      vscode.window.showInformationMessage('All changes staged successfully!');
    } else {
      return;
    }
  }

  // Create output channel for CommitWeave
  const outputChannel = vscode.window.createOutputChannel('CommitWeave AI');
  outputChannel.show(true);
  
  // Show status info
  outputChannel.appendLine('🤖 CommitWeave AI - Intelligent Commit Creator');
  outputChannel.appendLine('==========================================');
  outputChannel.appendLine(`📂 Repository: ${workspaceFolder}`);
  outputChannel.appendLine(`🌿 Branch: ${gitStatus.branch || 'unknown'}`);
  outputChannel.appendLine(`📋 Staged files: ${gitStatus.stagedFiles}`);
  outputChannel.appendLine('');
  outputChannel.appendLine('🔍 Analyzing staged changes with AI...');
  outputChannel.appendLine('💡 Note: If no API key is configured, mock AI will be used.');
  outputChannel.appendLine('');

  try {
    // Run commitweave CLI with AI flag
    await executeCommitWeave(['--ai'], workspaceFolder, outputChannel);
    vscode.window.showInformationMessage('CommitWeave: AI commit completed!');
  } catch (error: any) {
    outputChannel.appendLine(`❌ Error: ${error.message}`);
    
    // Provide helpful suggestions for common AI errors
    if (error.message.includes('API key')) {
      outputChannel.appendLine('💡 Tip: Configure your AI API key in glinr-commit.json');
      outputChannel.appendLine('💡 Use the Configure command to set up AI providers');
    } else if (error.message.includes('rate limit')) {
      outputChannel.appendLine('💡 Tip: You have exceeded your AI API rate limit. Try again later.');
    } else if (error.message.includes('network')) {
      outputChannel.appendLine('💡 Tip: Check your internet connection and try again.');
    }
    
    throw error;
  }
}

