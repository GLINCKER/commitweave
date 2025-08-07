import * as vscode from 'vscode';
import { registerCreateCommitCommand } from './commands/createCommit';
import { registerAiCommitCommand } from './commands/aiCommit';
import { registerConfigureCommand } from './commands/configure';

/**
 * Activate the CommitWeave VS Code extension
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('CommitWeave extension is now active!');

  // Register all commands
  registerCreateCommitCommand(context);
  registerAiCommitCommand(context);
  registerConfigureCommand(context);

  // Show welcome message on first activation
  const hasShownWelcome = context.globalState.get('commitweave.hasShownWelcome', false);
  if (!hasShownWelcome) {
    vscode.window.showInformationMessage(
      'Welcome to CommitWeave by GLINR STUDIOS! Use Command Palette to get started.',
      'Open Commands',
      'Learn More'
    ).then(selection => {
      if (selection === 'Open Commands') {
        vscode.commands.executeCommand('workbench.action.showCommands');
      } else if (selection === 'Learn More') {
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/GLINCKER/commitweave#readme'));
      }
    });
    context.globalState.update('commitweave.hasShownWelcome', true);
  }
}

/**
 * Deactivate the extension
 */
export function deactivate() {
  console.log('CommitWeave extension is now deactivated');
}