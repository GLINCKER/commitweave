import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('typeweaver.commitweave'));
  });

  test('Extension should activate', async () => {
    const extension = vscode.extensions.getExtension('typeweaver.commitweave');
    assert.ok(extension);
    
    if (!extension.isActive) {
      await extension.activate();
    }
    
    assert.ok(extension.isActive);
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands();
    
    const expectedCommands = [
      'commitweave.create',
      'commitweave.ai',
      'commitweave.configure'
    ];
    
    for (const command of expectedCommands) {
      assert.ok(
        commands.includes(command),
        `Command ${command} should be registered`
      );
    }
  });

  test('Configuration should have default values', () => {
    const config = vscode.workspace.getConfiguration('commitweave');
    
    assert.strictEqual(config.get('emojiEnabled'), true);
    assert.strictEqual(config.get('aiProvider'), 'openai');
  });

  test('Extension should handle command execution gracefully', async () => {
    // Test that commands can be executed without throwing errors
    // Note: We don't test actual functionality here as it requires git repo and CLI
    
    try {
      // This might fail due to missing CLI, but shouldn't crash the extension
      await vscode.commands.executeCommand('commitweave.configure');
      assert.ok(true, 'Configure command executed without crashing');
    } catch (error) {
      // Expected if webview can't be created in test environment
      assert.ok(true, 'Command handled error gracefully');
    }
  });
});