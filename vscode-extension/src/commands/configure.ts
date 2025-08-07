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