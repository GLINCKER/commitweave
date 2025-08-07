import * as vscode from 'vscode';

/**
 * Git status bar item
 */
let statusBarItem: vscode.StatusBarItem;


/**
 * File system watcher for git changes
 */
let fileWatcher: vscode.FileSystemWatcher | undefined;

/**
 * Activate the CommitWeave VS Code extension
 * Optimized for fast activation with lazy loading
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('CommitWeave extension is now active!');

  // Register commands with lazy loading - commands are only loaded when executed
  context.subscriptions.push(
    vscode.commands.registerCommand('commitweave.create', async () => {
      const { executeCreateCommit } = await import('./commands/createCommit');
      return executeCreateCommit();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('commitweave.aiCommit', async () => {
      const { executeAiCommit } = await import('./commands/aiCommit');
      return executeAiCommit();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('commitweave.configure', async () => {
      const { executeConfigure } = await import('./commands/configure');
      return executeConfigure();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('commitweave.quickCommit', async () => {
      const { executeQuickCommit } = await import('./commands/quickCommit');
      return executeQuickCommit();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('commitweave.validateCommit', async () => {
      const { executeValidateCommit } = await import('./commands/validateCommit');
      return executeValidateCommit();
    })
  );

  // Create status bar item immediately for visual feedback
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.text = '🧶 CommitWeave';
  statusBarItem.tooltip = 'CommitWeave: Click to create commit';
  statusBarItem.command = 'commitweave.create';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Defer expensive operations using setTimeout to avoid blocking activation
  setTimeout(() => {
    initializeAsync(context);
  }, 0);
}

/**
 * Asynchronous initialization after activation
 * This handles all expensive operations to keep activation fast
 */
async function initializeAsync(context: vscode.ExtensionContext) {
  try {
    // Load git utilities lazily
    const { getWorkspaceFolder } = await import('./utils/gitUtils');
    
    // Update git status initially
    await updateGitStatus();
    
    // Set up file system watching for git changes (debounced)
    const workspaceFolder = getWorkspaceFolder();
    if (workspaceFolder) {
      setupGitWatching(context);
    }

    // Watch for workspace changes
    vscode.workspace.onDidChangeWorkspaceFolders(async () => {
      await updateGitStatus();
      setupGitWatching(context);
    });

    // Show welcome message on first activation (non-blocking)
    const hasShownWelcome = context.globalState.get('commitweave.hasShownWelcome', false);
    if (!hasShownWelcome) {
      // Use setTimeout to avoid blocking
      setTimeout(() => {
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
      }, 1000); // Show after 1 second
      
      context.globalState.update('commitweave.hasShownWelcome', true);
    }
  } catch (error) {
    console.error('CommitWeave initialization error:', error);
    statusBarItem.text = '🧶 Init Error';
    statusBarItem.tooltip = `CommitWeave: Initialization error - ${error}`;
  }
}

/**
 * Set up git file watching with debouncing
 */
function setupGitWatching(context: vscode.ExtensionContext) {
  // Clean up existing watcher
  if (fileWatcher) {
    fileWatcher.dispose();
  }

  // Create debounced update function
  let updateTimeout: NodeJS.Timeout | undefined;
  const debouncedUpdate = () => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    updateTimeout = setTimeout(() => {
      updateGitStatus().catch(console.error);
    }, 500); // 500ms debounce
  };

  // Watch for file system changes (only git-relevant files)
  fileWatcher = vscode.workspace.createFileSystemWatcher('**/{.git/**,*.{js,ts,jsx,tsx,py,md,json,yml,yaml}}');
  fileWatcher.onDidCreate(debouncedUpdate);
  fileWatcher.onDidChange(debouncedUpdate);
  fileWatcher.onDidDelete(debouncedUpdate);
  
  context.subscriptions.push(fileWatcher);
}

/**
 * Update git status in status bar (optimized with caching)
 */
let lastStatusUpdate = 0;
let cachedGitStatus: any = null;

async function updateGitStatus() {
  // Simple caching to avoid excessive git calls
  const now = Date.now();
  if (cachedGitStatus && (now - lastStatusUpdate) < 2000) { // 2 second cache
    return;
  }

  try {
    // Lazy load git utilities
    const { getWorkspaceFolder, getGitStatus } = await import('./utils/gitUtils');
    const workspaceFolder = getWorkspaceFolder();
    
    if (!workspaceFolder) {
      statusBarItem.hide();
      return;
    }

    const gitStatus = await getGitStatus(workspaceFolder);
    cachedGitStatus = gitStatus;
    lastStatusUpdate = now;
    
    if (!gitStatus.isRepository) {
      statusBarItem.text = '$(git-branch) No Git Repo';
      statusBarItem.tooltip = 'This workspace is not a git repository. Click to initialize CommitWeave.';
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
      const { stagedFiles, modifiedFiles, untrackedFiles, branch } = gitStatus;
      const totalChanges = modifiedFiles + untrackedFiles;
      
      if (stagedFiles > 0) {
        statusBarItem.text = `🧶 ${stagedFiles} staged`;
        statusBarItem.tooltip = `CommitWeave: ${stagedFiles} staged files ready to commit\nBranch: ${branch || 'unknown'}\nModified: ${modifiedFiles}, Untracked: ${untrackedFiles}`;
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
      } else if (totalChanges > 0) {
        statusBarItem.text = `🧶 ${totalChanges} changes`;
        statusBarItem.tooltip = `CommitWeave: ${modifiedFiles} modified, ${untrackedFiles} untracked files\nBranch: ${branch || 'unknown'}\nStage files to enable commit`;
        statusBarItem.backgroundColor = undefined;
      } else {
        statusBarItem.text = `🧶 Clean`;
        statusBarItem.tooltip = `CommitWeave: Working directory clean\nBranch: ${branch || 'unknown'}`;
        statusBarItem.backgroundColor = undefined;
      }
    }
    
    statusBarItem.show();
  } catch (error) {
    statusBarItem.text = '🧶 Error';
    statusBarItem.tooltip = `CommitWeave: Error reading git status - ${error}`;
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    statusBarItem.show();
  }
}

/**
 * Deactivate the extension
 */
export function deactivate() {
  console.log('CommitWeave extension is now deactivated');
  
  // Clean up status bar item
  if (statusBarItem) {
    statusBarItem.dispose();
  }

  // Clean up file watcher
  if (fileWatcher) {
    fileWatcher.dispose();
  }
}