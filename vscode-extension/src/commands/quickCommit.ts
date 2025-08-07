import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { validateCommitMessage, formatValidationResults } from '../utils/commitValidator';

/**
 * Conventional commit types with descriptions and emojis
 */
const COMMIT_TYPES = [
  { label: '✨ feat', detail: 'A new feature', type: 'feat', emoji: '✨' },
  { label: '🐛 fix', detail: 'A bug fix', type: 'fix', emoji: '🐛' },
  { label: '📚 docs', detail: 'Documentation only changes', type: 'docs', emoji: '📚' },
  { label: '🎨 style', detail: 'Changes that do not affect the meaning of the code', type: 'style', emoji: '🎨' },
  { label: '♻️ refactor', detail: 'A code change that neither fixes a bug nor adds a feature', type: 'refactor', emoji: '♻️' },
  { label: '⚡ perf', detail: 'A code change that improves performance', type: 'perf', emoji: '⚡' },
  { label: '✅ test', detail: 'Adding missing tests or correcting existing tests', type: 'test', emoji: '✅' },
  { label: '📦 build', detail: 'Changes that affect the build system or external dependencies', type: 'build', emoji: '📦' },
  { label: '👷 ci', detail: 'Changes to our CI configuration files and scripts', type: 'ci', emoji: '👷' },
  { label: '🔧 chore', detail: 'Other changes that don\'t modify src or test files', type: 'chore', emoji: '🔧' },
  { label: '⏪ revert', detail: 'Reverts a previous commit', type: 'revert', emoji: '⏪' }
];

/**
 * Common commit message templates
 */
const COMMIT_TEMPLATES = [
  { label: 'Add new feature', message: 'add {description}' },
  { label: 'Fix bug', message: 'fix {issue} in {component}' },
  { label: 'Update dependency', message: 'update {package} to {version}' },
  { label: 'Remove unused code', message: 'remove unused {what}' },
  { label: 'Improve performance', message: 'improve {component} performance' },
  { label: 'Add tests', message: 'add tests for {component}' },
  { label: 'Update documentation', message: 'update {what} documentation' }
];

/**
 * Register the Quick Commit command
 */
export function registerQuickCommitCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('commitweave.quickCommit', async () => {
    try {
      await executeQuickCommit();
    } catch (error) {
      vscode.window.showErrorMessage(`CommitWeave Quick Commit: ${error}`);
    }
  });

  context.subscriptions.push(disposable);
}

/**
 * Execute the quick commit workflow
 */
export async function executeQuickCommit() {
  const workspaceFolder = getWorkspaceFolder();
  if (!workspaceFolder) {
    throw new Error('No workspace folder found. Please open a project folder.');
  }

  // Check git repository
  if (!(await isGitRepository(workspaceFolder))) {
    vscode.window.showErrorMessage('This is not a git repository.');
    return;
  }

  // Check for staged changes
  const stagedFiles = await getStagedFiles(workspaceFolder);
  if (stagedFiles.length === 0) {
    const selection = await vscode.window.showWarningMessage(
      'No staged changes found. Stage some changes first.',
      'Open Source Control',
      'Cancel'
    );
    
    if (selection === 'Open Source Control') {
      vscode.commands.executeCommand('workbench.view.scm');
    }
    return;
  }

  // Show commit type selection
  const selectedType = await vscode.window.showQuickPick(COMMIT_TYPES, {
    placeHolder: 'Select commit type',
    matchOnDetail: true
  });

  if (!selectedType) return;

  // Get scope (optional)
  const scope = await vscode.window.showInputBox({
    placeHolder: 'scope (optional)',
    prompt: 'Enter the scope of this change (e.g., auth, ui, api)'
  });

  // Ask if user wants to use a template
  const useTemplate = await vscode.window.showQuickPick(
    [
      { label: '✏️ Custom message', detail: 'Write your own commit message' },
      { label: '📝 Use template', detail: 'Choose from common commit templates' }
    ],
    { placeHolder: 'How would you like to create the commit message?' }
  );

  if (!useTemplate) return;

  let subject: string;

  if (useTemplate.label.includes('template')) {
    // Show template selection
    const template = await vscode.window.showQuickPick(COMMIT_TEMPLATES, {
      placeHolder: 'Select a commit message template',
      matchOnDetail: true
    });

    if (!template) return;

    // Get template variables
    const variables = template.message.match(/{([^}]+)}/g);
    let finalMessage = template.message;

    if (variables) {
      for (const variable of variables) {
        const varName = variable.slice(1, -1); // Remove { }
        const value = await vscode.window.showInputBox({
          placeHolder: varName,
          prompt: `Enter value for ${varName}`
        });
        
        if (!value) return;
        finalMessage = finalMessage.replace(variable, value);
      }
    }

    subject = finalMessage;
  } else {
    // Custom message
    const customSubject = await vscode.window.showInputBox({
      placeHolder: 'commit subject',
      prompt: 'Enter a short description of the change',
      validateInput: (value) => {
        if (!value.trim()) return 'Subject is required';
        if (value.length > 50) return 'Subject should be 50 characters or less';
        if (value.endsWith('.')) return 'Subject should not end with a period';
        return null;
      }
    });

    if (!customSubject) return;
    subject = customSubject;
  }

  // Get commit body (optional)
  const body = await vscode.window.showInputBox({
    placeHolder: 'commit body (optional)',
    prompt: 'Enter a detailed description (optional)'
  });

  // Build commit message with emoji support
  const config = vscode.workspace.getConfiguration('commitweave');
  const emojiEnabled = config.get('emojiEnabled', true);
  
  const scopePart = scope ? `(${scope})` : '';
  const emojiPrefix = emojiEnabled ? `${selectedType.emoji} ` : '';
  const commitMessage = `${emojiPrefix}${selectedType.type}${scopePart}: ${subject}${body ? '\n\n' + body : ''}`;

  // Validate the commit message
  const validation = validateCommitMessage(commitMessage);
  
  let confirmMessage = `Ready to commit with message:\n\n${commitMessage}\n\nStaged files: ${stagedFiles.join(', ')}`;
  
  if (!validation.isValid || validation.warnings.length > 0) {
    confirmMessage += '\n\n' + formatValidationResults(validation);
  }

  // Show preview and confirm
  const confirmed = await vscode.window.showInformationMessage(
    confirmMessage,
    { modal: true },
    'Commit',
    'Cancel'
  );

  if (confirmed === 'Commit') {
    try {
      await executeGitCommit(commitMessage, workspaceFolder);
      vscode.window.showInformationMessage(`✅ Committed: ${selectedType.type}${scopePart}: ${subject}`);
      
      // Refresh source control
      vscode.commands.executeCommand('git.refresh');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to commit: ${error}`);
    }
  }
}

/**
 * Get staged files
 */
async function getStagedFiles(cwd: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['diff', '--cached', '--name-only'], { cwd });
    let output = '';
    
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        const files = output.trim().split('\n').filter(f => f.length > 0);
        resolve(files);
      } else {
        reject(new Error(`Git command failed with exit code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

/**
 * Execute git commit
 */
async function executeGitCommit(message: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['commit', '-m', message], { cwd });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Git commit failed with exit code ${code}`));
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