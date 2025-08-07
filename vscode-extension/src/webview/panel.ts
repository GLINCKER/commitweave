import * as vscode from 'vscode';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { validateCommitMessage } from '../utils/commitValidator';

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
      async (message) => {
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
          case 'getCommitHistory':
            await this._getCommitHistory();
            return;
          case 'validateCommit':
            vscode.commands.executeCommand('commitweave.validateCommit');
            return;
          case 'useTemplate':
            await this._useTemplate(message.type, message.template);
            return;
          case 'openQuickCommit':
            vscode.commands.executeCommand('commitweave.quickCommit');
            return;
          case 'openFullCLI':
            vscode.commands.executeCommand('commitweave.create');
            return;
          case 'exportConfig':
            await this._exportConfig();
            return;
          case 'importConfig':
            await this._importConfig();
            return;
          case 'resetToDefaults':
            await this._resetToDefaults();
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
      const workspaceFolder = this._getWorkspaceFolder();
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found to save CommitWeave configuration');
        return;
      }

      // Update VS Code configuration
      const config = vscode.workspace.getConfiguration('commitweave');
      await config.update('emojiEnabled', settings.emojiEnabled, vscode.ConfigurationTarget.Global);
      await config.update('aiProvider', settings.aiProvider, vscode.ConfigurationTarget.Global);

      // Also try to update CommitWeave config file if it exists
      try {
        const configPath = require('path').join(workspaceFolder, 'glinr-commit.json');
        const fs = require('fs').promises;
        
        let commitWeaveConfig: any = {};
        try {
          const configContent = await fs.readFile(configPath, 'utf8');
          commitWeaveConfig = JSON.parse(configContent);
        } catch (error) {
          // Config file doesn't exist, create new one
          commitWeaveConfig = {
            version: "1.0",
            commitTypes: [
              { type: "feat", emoji: "✨", description: "A new feature" },
              { type: "fix", emoji: "🐛", description: "A bug fix" },
              { type: "docs", emoji: "📚", description: "Documentation only changes" },
              { type: "style", emoji: "💎", description: "Changes that do not affect the meaning of the code" },
              { type: "refactor", emoji: "📦", description: "A code change that neither fixes a bug nor adds a feature" },
              { type: "perf", emoji: "🚀", description: "A code change that improves performance" },
              { type: "test", emoji: "🚨", description: "Adding missing tests or correcting existing tests" },
              { type: "build", emoji: "🛠", description: "Changes that affect the build system or external dependencies" },
              { type: "ci", emoji: "⚙️", description: "Changes to our CI configuration files and scripts" },
              { type: "chore", emoji: "♻️", description: "Other changes that don't modify src or test files" },
              { type: "revert", emoji: "🗑", description: "Reverts a previous commit" }
            ],
            conventionalCommits: true,
            maxSubjectLength: 50,
            maxBodyLength: 72
          };
        }

        // Update settings
        commitWeaveConfig.emojiEnabled = settings.emojiEnabled;
        commitWeaveConfig.conventionalCommits = settings.conventionalCommits;
        commitWeaveConfig.maxSubjectLength = settings.maxSubjectLength;
        
        // Handle AI provider configuration
        if (settings.aiProvider && settings.aiProvider !== 'mock') {
          if (!commitWeaveConfig.ai) {
            commitWeaveConfig.ai = {};
          }
          commitWeaveConfig.ai.provider = settings.aiProvider;
          
          // If API key is provided, save it (but warn about security)
          if (settings.apiKey && settings.apiKey.trim()) {
            commitWeaveConfig.ai.apiKey = settings.apiKey.trim();
            vscode.window.showWarningMessage('API key saved to local config. Keep your glinr-commit.json file secure and avoid committing it to version control.');
          }
        }

        await fs.writeFile(configPath, JSON.stringify(commitWeaveConfig, null, 2));
        vscode.window.showInformationMessage('CommitWeave settings saved to local config file!');
      } catch (error) {
        // Fallback: just show that VS Code settings were saved
        vscode.window.showInformationMessage('CommitWeave VS Code settings saved! (Note: Local config file not updated)');
      }
      
      this._panel.webview.postMessage({
        command: 'settingsSaved'
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to save settings: ${error}`);
    }
  }

  private async _loadSettings() {
    try {
      const workspaceFolder = this._getWorkspaceFolder();
      let settings = {
        emojiEnabled: true,
        aiProvider: 'openai',
        apiKey: '',
        conventionalCommits: true,
        maxSubjectLength: 50
      };

      // First load from VS Code configuration
      const config = vscode.workspace.getConfiguration('commitweave');
      settings.emojiEnabled = config.get('emojiEnabled', true);
      settings.aiProvider = config.get('aiProvider', 'openai');

      // Try to load from CommitWeave config file if it exists
      if (workspaceFolder) {
        try {
          const configPath = require('path').join(workspaceFolder, 'glinr-commit.json');
          const fs = require('fs').promises;
          const configContent = await fs.readFile(configPath, 'utf8');
          const commitWeaveConfig = JSON.parse(configContent);
          
          // Override with CommitWeave config values
          if (typeof commitWeaveConfig.emojiEnabled === 'boolean') {
            settings.emojiEnabled = commitWeaveConfig.emojiEnabled;
          }
          if (typeof commitWeaveConfig.conventionalCommits === 'boolean') {
            settings.conventionalCommits = commitWeaveConfig.conventionalCommits;
          }
          if (typeof commitWeaveConfig.maxSubjectLength === 'number') {
            settings.maxSubjectLength = commitWeaveConfig.maxSubjectLength;
          }
          if (commitWeaveConfig.ai && commitWeaveConfig.ai.provider) {
            settings.aiProvider = commitWeaveConfig.ai.provider;
          }
          // Don't load API key for security reasons
        } catch (error) {
          // Config file doesn't exist or is invalid, use VS Code settings
        }
      }
      
      this._panel.webview.postMessage({
        command: 'currentSettings',
        settings: settings
      });
    } catch (error) {
      // Fallback to default settings
      this._panel.webview.postMessage({
        command: 'currentSettings',
        settings: {
          emojiEnabled: true,
          aiProvider: 'openai',
          apiKey: '',
          conventionalCommits: true,
          maxSubjectLength: 50
        }
      });
    }
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

  /**
   * Get commit history and send to webview
   */
  private async _getCommitHistory(): Promise<void> {
    try {
      const workspaceFolder = this._getWorkspaceFolder();
      if (!workspaceFolder) return;

      const commits = await this._fetchCommitHistory(workspaceFolder);
      
      // Validate each commit message
      const validatedCommits = commits.map(commit => ({
        ...commit,
        isValid: validateCommitMessage(commit.message).isValid
      }));

      this._panel.webview.postMessage({
        command: 'updateCommitHistory',
        commits: validatedCommits
      });
    } catch (error) {
      console.error('Failed to get commit history:', error);
      this._panel.webview.postMessage({
        command: 'updateCommitHistory',
        commits: []
      });
    }
  }

  /**
   * Fetch commit history from git
   */
  private async _fetchCommitHistory(cwd: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const child = spawn('git', [
        'log', 
        '--oneline', 
        '--format=%H|%s|%an|%ad', 
        '--date=relative',
        '-10' // Last 10 commits
      ], { cwd });
      
      let output = '';
      
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          const commits = output.trim().split('\n')
            .filter(line => line.length > 0)
            .map(line => {
              const [hash, message, author, date] = line.split('|');
              return {
                hash: hash.substring(0, 8),
                message: message || 'No message',
                author: author || 'Unknown',
                date: date || 'Unknown'
              };
            });
          resolve(commits);
        } else {
          reject(new Error(`Git command failed with exit code ${code}`));
        }
      });
      
      child.on('error', reject);
    });
  }

  /**
   * Use a template for quick commit
   */
  private async _useTemplate(_type: string, _template: string): Promise<void> {
    // For now, just trigger the quick commit command
    // The template logic is already in the quick commit command
    vscode.commands.executeCommand('commitweave.quickCommit');
  }

  /**
   * Export CommitWeave configuration
   */
  private async _exportConfig(): Promise<void> {
    try {
      const workspaceFolder = this._getWorkspaceFolder();
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      // Try to use the CLI export command first
      try {
        const { spawn } = await import('child_process');
        const outputChannel = vscode.window.createOutputChannel('CommitWeave Export');
        
        outputChannel.show();
        outputChannel.appendLine('Exporting CommitWeave configuration...');
        
        const child = spawn('commitweave', ['export'], {
          cwd: workspaceFolder
        });

        let output = '';
        child.stdout?.on('data', (data) => {
          output += data.toString();
          outputChannel.append(data.toString());
        });

        child.stderr?.on('data', (data) => {
          outputChannel.append(data.toString());
        });

        child.on('close', async (code) => {
          if (code === 0) {
            outputChannel.appendLine('✅ Configuration exported successfully!');
            
            // Parse the JSON from output and offer to save to file
            const lines = output.split('\n');
            const jsonStart = lines.findIndex(line => line.trim().startsWith('{'));
            if (jsonStart !== -1) {
              const jsonOutput = lines.slice(jsonStart).join('\n').trim();
              
              const saveUri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.joinPath(vscode.Uri.file(workspaceFolder), 'commitweave-config.json'),
                filters: {
                  'JSON files': ['json']
                }
              });

              if (saveUri) {
                await vscode.workspace.fs.writeFile(saveUri, Buffer.from(jsonOutput, 'utf8'));
                vscode.window.showInformationMessage(`Configuration exported to ${saveUri.fsPath}`);
              }
            }
          } else {
            outputChannel.appendLine(`❌ Export failed with code ${code}`);
          }
        });
      } catch (error) {
        // Fallback: read config file directly
        const configPath = require('path').join(workspaceFolder, 'glinr-commit.json');
        const fs = require('fs').promises;
        
        try {
          const configContent = await fs.readFile(configPath, 'utf8');
          
          const saveUri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.joinPath(vscode.Uri.file(workspaceFolder), 'commitweave-config-backup.json'),
            filters: {
              'JSON files': ['json']
            }
          });

          if (saveUri) {
            await vscode.workspace.fs.writeFile(saveUri, Buffer.from(configContent, 'utf8'));
            vscode.window.showInformationMessage(`Configuration exported to ${saveUri.fsPath}`);
          }
        } catch (readError) {
          vscode.window.showErrorMessage('No CommitWeave configuration found to export');
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to export configuration: ${error}`);
    }
  }

  /**
   * Import CommitWeave configuration
   */
  private async _importConfig(): Promise<void> {
    try {
      const workspaceFolder = this._getWorkspaceFolder();
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      // Show file picker
      const fileUris = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: {
          'JSON files': ['json'],
          'All files': ['*']
        },
        openLabel: 'Import Configuration'
      });

      if (!fileUris || fileUris.length === 0) {
        return;
      }

      const configUri = fileUris[0];
      
      try {
        // Read the selected config file
        const configData = await vscode.workspace.fs.readFile(configUri);
        const configContent = Buffer.from(configData).toString('utf8');
        const importedConfig = JSON.parse(configContent);

        // Validate basic structure
        if (!importedConfig.version || !importedConfig.commitTypes) {
          vscode.window.showErrorMessage('Invalid CommitWeave configuration file');
          return;
        }

        // Try to use CLI import command first
        try {
          const { spawn } = await import('child_process');
          const outputChannel = vscode.window.createOutputChannel('CommitWeave Import');
          
          outputChannel.show();
          outputChannel.appendLine(`Importing CommitWeave configuration from ${configUri.fsPath}...`);
          
          const child = spawn('commitweave', ['import', configUri.fsPath, '--yes'], {
            cwd: workspaceFolder
          });

          child.stdout?.on('data', (data) => {
            outputChannel.append(data.toString());
          });

          child.stderr?.on('data', (data) => {
            outputChannel.append(data.toString());
          });

          child.on('close', (code) => {
            if (code === 0) {
              outputChannel.appendLine('✅ Configuration imported successfully!');
              vscode.window.showInformationMessage('CommitWeave configuration imported successfully!');
              this._loadSettings(); // Refresh the UI
            } else {
              outputChannel.appendLine(`❌ Import failed with code ${code}`);
              this._fallbackImport(importedConfig, workspaceFolder);
            }
          });
        } catch (error) {
          // Fallback: direct file copy
          this._fallbackImport(importedConfig, workspaceFolder);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to read configuration file: ${error}`);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to import configuration: ${error}`);
    }
  }

  /**
   * Fallback import method that writes config directly
   */
  private async _fallbackImport(importedConfig: any, workspaceFolder: string): Promise<void> {
    try {
      const configPath = require('path').join(workspaceFolder, 'glinr-commit.json');
      const fs = require('fs').promises;
      
      await fs.writeFile(configPath, JSON.stringify(importedConfig, null, 2));
      vscode.window.showInformationMessage('CommitWeave configuration imported successfully!');
      this._loadSettings(); // Refresh the UI
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to write configuration file: ${error}`);
    }
  }

  /**
   * Reset configuration to defaults
   */
  private async _resetToDefaults(): Promise<void> {
    try {
      const workspaceFolder = this._getWorkspaceFolder();
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      // Try to use CLI reset command first
      try {
        const { spawn } = await import('child_process');
        const outputChannel = vscode.window.createOutputChannel('CommitWeave Reset');
        
        outputChannel.show();
        outputChannel.appendLine('Resetting CommitWeave configuration to defaults...');
        
        const child = spawn('commitweave', ['reset', '--force'], {
          cwd: workspaceFolder
        });

        child.stdout?.on('data', (data) => {
          outputChannel.append(data.toString());
        });

        child.stderr?.on('data', (data) => {
          outputChannel.append(data.toString());
        });

        child.on('close', (code) => {
          if (code === 0) {
            outputChannel.appendLine('✅ Configuration reset successfully!');
            vscode.window.showInformationMessage('CommitWeave configuration reset to defaults!');
            this._loadSettings(); // Refresh the UI
          } else {
            outputChannel.appendLine(`❌ Reset failed with code ${code}`);
            this._fallbackReset(workspaceFolder);
          }
        });
      } catch (error) {
        // Fallback: write default config directly
        this._fallbackReset(workspaceFolder);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to reset configuration: ${error}`);
    }
  }

  /**
   * Fallback reset method that writes default config directly
   */
  private async _fallbackReset(workspaceFolder: string): Promise<void> {
    try {
      const defaultConfig = {
        version: "1.0",
        commitTypes: [
          { type: "feat", emoji: "✨", description: "A new feature" },
          { type: "fix", emoji: "🐛", description: "A bug fix" },
          { type: "docs", emoji: "📚", description: "Documentation only changes" },
          { type: "style", emoji: "💎", description: "Changes that do not affect the meaning of the code" },
          { type: "refactor", emoji: "📦", description: "A code change that neither fixes a bug nor adds a feature" },
          { type: "perf", emoji: "🚀", description: "A code change that improves performance" },
          { type: "test", emoji: "🚨", description: "Adding missing tests or correcting existing tests" },
          { type: "build", emoji: "🛠", description: "Changes that affect the build system or external dependencies" },
          { type: "ci", emoji: "⚙️", description: "Changes to our CI configuration files and scripts" },
          { type: "chore", emoji: "♻️", description: "Other changes that don't modify src or test files" },
          { type: "revert", emoji: "🗑", description: "Reverts a previous commit" }
        ],
        emojiEnabled: true,
        conventionalCommits: true,
        maxSubjectLength: 50,
        maxBodyLength: 72
      };

      const configPath = require('path').join(workspaceFolder, 'glinr-commit.json');
      const fs = require('fs').promises;
      
      await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
      vscode.window.showInformationMessage('CommitWeave configuration reset to defaults!');
      this._loadSettings(); // Refresh the UI
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to write default configuration: ${error}`);
    }
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