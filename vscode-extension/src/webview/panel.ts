import * as vscode from 'vscode';
import * as fs from 'fs';

/**
 * Settings panel webview provider
 */
export class SettingsPanel {
  /**
   * Track the currently active panels. Only allow a single panel to exist at a time.
   */
  public static currentPanel: SettingsPanel | undefined;

  public static readonly viewType = 'commitweaveSettings';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (SettingsPanel.currentPanel) {
      SettingsPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      SettingsPanel.viewType,
      'CommitWeave Settings',
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
      }
    );

    SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case 'saveSettings':
            this._saveSettings(message.settings);
            return;
          case 'loadSettings':
            this._loadSettings();
            return;
          case 'checkStatus':
            this._checkStatus();
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    SettingsPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    const webview = this._panel.webview;
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to the html file
    const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'ui.html');
    
    // Try to read the HTML file
    let htmlContent = '';
    try {
      htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');
    } catch (error) {
      // Fallback to inline HTML if file doesn't exist
      htmlContent = this._getFallbackHtml();
    }

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return htmlContent
      .replace(/{{nonce}}/g, nonce)
      .replace(/{{cspSource}}/g, webview.cspSource);
  }

  private _getFallbackHtml(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src {{cspSource}} 'unsafe-inline'; script-src 'nonce-{{nonce}}';">
        <title>CommitWeave Settings</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                font-size: var(--vscode-font-size);
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                padding: 20px;
                line-height: 1.6;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
            }
            
            h1 {
                color: var(--vscode-foreground);
                border-bottom: 1px solid var(--vscode-panel-border);
                padding-bottom: 10px;
                margin-bottom: 30px;
            }
            
            .setting-group {
                margin-bottom: 25px;
                padding: 15px;
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                border-radius: 6px;
                border: 1px solid var(--vscode-panel-border);
            }
            
            .setting-group h3 {
                margin-top: 0;
                margin-bottom: 15px;
                color: var(--vscode-foreground);
            }
            
            .setting-item {
                margin-bottom: 15px;
            }
            
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: var(--vscode-foreground);
            }
            
            input[type="checkbox"] {
                margin-right: 8px;
                transform: scale(1.2);
            }
            
            select {
                width: 100%;
                padding: 8px 12px;
                background-color: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 4px;
                color: var(--vscode-input-foreground);
                font-family: inherit;
                font-size: inherit;
            }
            
            select:focus {
                outline: 1px solid var(--vscode-focusBorder);
                border-color: var(--vscode-focusBorder);
            }
            
            .description {
                font-size: 0.9em;
                color: var(--vscode-descriptionForeground);
                margin-top: 5px;
            }
            
            .button-container {
                margin-top: 30px;
                text-align: center;
            }
            
            button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-family: inherit;
                font-size: inherit;
                margin: 0 10px;
            }
            
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            
            button:active {
                background-color: var(--vscode-button-activeBackground);
            }
            
            .secondary-button {
                background-color: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
            }
            
            .secondary-button:hover {
                background-color: var(--vscode-button-secondaryHoverBackground);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🧶 CommitWeave Settings</h1>
            
            <form id="settingsForm">
                <div class="setting-group">
                    <h3>Commit Message Options</h3>
                    
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="emojiEnabled" />
                            Enable emojis in commit messages
                        </label>
                        <div class="description">
                            Add relevant emojis to your commit messages (e.g., ✨ for features, 🐛 for bug fixes)
                        </div>
                    </div>
                </div>
                
                <div class="setting-group">
                    <h3>AI Configuration</h3>
                    
                    <div class="setting-item">
                        <label for="aiProvider">AI Provider</label>
                        <select id="aiProvider">
                            <option value="openai">OpenAI (GPT models)</option>
                            <option value="anthropic">Anthropic (Claude models)</option>
                            <option value="mock">Mock Provider (for testing)</option>
                        </select>
                        <div class="description">
                            Choose which AI service to use for generating commit messages
                        </div>
                    </div>
                </div>
                
                <div class="button-container">
                    <button type="submit">Save Settings</button>
                    <button type="button" class="secondary-button" onclick="loadCurrentSettings()">Reset</button>
                </div>
            </form>
        </div>
        
        <script nonce="{{nonce}}">
            const vscode = acquireVsCodeApi();
            
            // Load current settings when the page loads
            window.addEventListener('load', () => {
                loadCurrentSettings();
            });
            
            function loadCurrentSettings() {
                vscode.postMessage({
                    command: 'loadSettings'
                });
            }
            
            // Handle form submission
            document.getElementById('settingsForm').addEventListener('submit', (e) => {
                e.preventDefault();
                
                const settings = {
                    emojiEnabled: document.getElementById('emojiEnabled').checked,
                    aiProvider: document.getElementById('aiProvider').value
                };
                
                vscode.postMessage({
                    command: 'saveSettings',
                    settings: settings
                });
            });
            
            // Handle messages from the extension
            window.addEventListener('message', event => {
                const message = event.data;
                
                switch (message.command) {
                    case 'currentSettings':
                        // Update the form with current settings
                        document.getElementById('emojiEnabled').checked = message.settings.emojiEnabled;
                        document.getElementById('aiProvider').value = message.settings.aiProvider;
                        break;
                    case 'settingsSaved':
                        // Show success message or update UI
                        console.log('Settings saved successfully');
                        break;
                }
            });
        </script>
    </body>
    </html>`;
  }

  private async _saveSettings(settings: any) {
    try {
      const config = vscode.workspace.getConfiguration('commitweave');
      
      await config.update('emojiEnabled', settings.emojiEnabled, vscode.ConfigurationTarget.Global);
      await config.update('aiProvider', settings.aiProvider, vscode.ConfigurationTarget.Global);
      
      vscode.window.showInformationMessage('CommitWeave settings saved successfully!');
      
      this._panel.webview.postMessage({
        command: 'settingsSaved'
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to save settings: ${error}`);
    }
  }

  private _loadSettings() {
    const config = vscode.workspace.getConfiguration('commitweave');
    
    const settings = {
      emojiEnabled: config.get('emojiEnabled', true),
      aiProvider: config.get('aiProvider', 'openai')
    };
    
    this._panel.webview.postMessage({
      command: 'currentSettings',
      settings: settings
    });
  }

  private async _checkStatus() {
    const workspaceFolder = this._getWorkspaceFolder();
    
    const status = {
      git: { isRepo: false },
      staged: { count: 0 },
      cli: { available: false }
    };

    if (workspaceFolder) {
      // Check git repository
      try {
        await this._executeCommand('git', ['rev-parse', '--git-dir'], workspaceFolder);
        status.git.isRepo = true;
      } catch {
        status.git.isRepo = false;
      }

      // Check staged files
      if (status.git.isRepo) {
        try {
          const output = await this._executeCommandWithOutput('git', ['diff', '--cached', '--name-only'], workspaceFolder);
          status.staged.count = output.trim().split('\n').filter(line => line.trim().length > 0).length;
        } catch {
          status.staged.count = 0;
        }
      }
    }

    // Check CLI availability
    try {
      await this._executeCommand('commitweave', ['--version'], workspaceFolder || process.cwd());
      status.cli.available = true;
    } catch {
      // Try with npx
      try {
        await this._executeCommand('npx', ['@typeweaver/commitweave', '--version'], workspaceFolder || process.cwd());
        status.cli.available = true;
      } catch {
        status.cli.available = false;
      }
    }

    this._panel.webview.postMessage({
      command: 'statusUpdate',
      status: status
    });
  }

  private _getWorkspaceFolder(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return undefined;
    }
    return workspaceFolders[0].uri.fsPath;
  }

  private async _executeCommand(command: string, args: string[], cwd: string): Promise<void> {
    const { spawn } = await import('child_process');
    
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      child.on('close', (code) => {
        if (code === 0) {
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

  private async _executeCommandWithOutput(command: string, args: string[], cwd: string): Promise<string> {
    const { spawn } = await import('child_process');
    
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
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}