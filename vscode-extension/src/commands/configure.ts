import * as vscode from 'vscode';
import { SettingsPanel } from '../webview/panel';

/**
 * Register the Configure command
 */
export function registerConfigureCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('commitweave.configure', async () => {
    try {
      SettingsPanel.createOrShow(context.extensionUri);
    } catch (error) {
      vscode.window.showErrorMessage(`CommitWeave Configure: ${error}`);
    }
  });

  context.subscriptions.push(disposable);
}

/**
 * Execute the configure command
 */
export async function executeConfigure() {
  // Get the extension context - this is a simplified version for lazy loading
  const extensions = vscode.extensions.all.find(ext => ext.id.includes('commitweave'));
  if (extensions && extensions.extensionUri) {
    SettingsPanel.createOrShow(extensions.extensionUri);
  } else {
    throw new Error('Extension URI not found');
  }
}