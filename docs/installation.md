---
title: "Installation Guide"
description: "Complete guide to installing CommitWeave on your system"
order: 2
---

# Installation Guide

This guide will walk you through installing CommitWeave on your system and getting it configured for your development workflow.

## Prerequisites

Before installing CommitWeave, ensure you have:

- **Node.js 18.0.0 or higher** - CommitWeave requires modern Node.js features
- **Git** - CommitWeave integrates with your Git workflow
- **NPM or Yarn** - For package management

You can verify your Node.js version:
```bash
node --version
```

## Installation Methods

### Method 1: Global NPM Installation (Recommended)

Install CommitWeave globally for use across all your projects:

```bash
npm install -g commitweave
```

Verify the installation:
```bash
commitweave --version
```

### Method 2: Local Project Installation

Install CommitWeave as a development dependency in your project:

```bash
# Using npm
npm install --save-dev commitweave

# Using yarn
yarn add -D commitweave

# Using pnpm
pnpm add -D commitweave
```

Add a script to your `package.json`:
```json
{
  "scripts": {
    "commit": "commitweave"
  }
}
```

Then run with:
```bash
npm run commit
```

### Method 3: Using npx (No Installation)

Run CommitWeave directly without installing:

```bash
npx commitweave
```

## Initial Setup

### 1. Initialize Configuration

After installation, set up CommitWeave for your project:

```bash
commitweave init
```

This creates a `glinr-commit.json` configuration file with sensible defaults:

```json
{
  "commitTypes": [
    {
      "type": "feat",
      "description": "A new feature",
      "emoji": "✨"
    },
    {
      "type": "fix", 
      "description": "A bug fix",
      "emoji": "🐛"
    }
    // ... more types
  ],
  "emojiEnabled": true,
  "conventionalCommits": true,
  "maxSubjectLength": 50,
  "ui": {
    "fancyUI": true,
    "asciiArt": true,
    "animations": true,
    "colors": true,
    "emoji": true
  }
}
```

### 2. Configure AI Providers (Optional)

To use AI-powered commit generation, you'll need to configure an AI provider.

#### OpenAI Setup

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Configure CommitWeave:

```bash
# Set your API key
export OPENAI_API_KEY="your-api-key-here"

# Or add to your shell profile (.bashrc, .zshrc, etc.)
echo 'export OPENAI_API_KEY="your-api-key-here"' >> ~/.zshrc
```

3. Update your configuration:

```json
{
  "ai": {
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "maxTokens": 150
  }
}
```

#### Anthropic Claude Setup

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Configure CommitWeave:

```bash
# Set your API key
export ANTHROPIC_API_KEY="your-api-key-here"
```

3. Update your configuration:

```json
{
  "ai": {
    "provider": "anthropic",
    "model": "claude-3-sonnet-20240229",
    "temperature": 0.7,
    "maxTokens": 150
  }
}
```

## Verification

Test your installation with these commands:

```bash
# Check version
commitweave --version

# Validate configuration
commitweave doctor

# Test basic functionality
commitweave --help

# Test AI functionality (if configured)
commitweave --ai
```

## Platform-Specific Notes

### Windows

CommitWeave works on Windows with Command Prompt, PowerShell, and Git Bash. For the best experience:

1. Use Windows Terminal for enhanced colors and emoji support
2. Ensure your terminal supports Unicode for proper emoji display
3. Consider using Git Bash for a Unix-like experience

### macOS

CommitWeave works out of the box on macOS. For enhanced terminal experience:

1. Use iTerm2 or the built-in Terminal app
2. Install a Nerd Font for better emoji and icon support
3. Enable "Use Unicode UTF-8" in Terminal preferences

### Linux

CommitWeave works on all major Linux distributions:

1. Ensure your terminal supports Unicode
2. Install font packages for emoji support:
   ```bash
   # Ubuntu/Debian
   sudo apt install fonts-noto-color-emoji
   
   # Arch Linux
   sudo pacman -S noto-fonts-emoji
   ```

## Configuration Management

### Global vs Project Configuration

CommitWeave supports both global and project-specific configurations:

- **Global**: `~/.config/commitweave/glinr-commit.json`
- **Project**: `./glinr-commit.json` (takes precedence)

### Environment Variables

CommitWeave respects these environment variables:

```bash
# API Keys
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""

# Configuration overrides
COMMITWEAVE_EMOJI_ENABLED="true"
COMMITWEAVE_AI_PROVIDER="openai"
COMMITWEAVE_MAX_SUBJECT_LENGTH="50"
```

## Troubleshooting

### Common Issues

#### "Command not found"
- Ensure Node.js and npm are installed
- Check if global npm bin directory is in your PATH
- Try reinstalling: `npm uninstall -g commitweave && npm install -g commitweave`

#### "Permission denied"
- Use `sudo` for global installation: `sudo npm install -g commitweave`
- Or configure npm to use a different directory for global packages

#### AI features not working
- Verify your API key is set correctly
- Check your internet connection
- Ensure you have API credits available
- Run `commitweave doctor` for diagnostics

#### Unicode/Emoji display issues
- Ensure your terminal supports Unicode
- Install appropriate font packages
- Check terminal encoding settings

### Getting Help

If you encounter issues:

1. Run `commitweave doctor` for health checks
2. Check the configuration with `commitweave list`
3. Review the logs for error messages
4. Visit our GitHub repository for support

## Next Steps

Now that CommitWeave is installed and configured:

1. [Learn basic usage patterns](./usage.md)
2. [Explore the API reference](./api/reference.md)
3. Customize your configuration for your team's needs
4. Set up AI providers for intelligent commit generation

---

*Ready to create beautiful commits? Let's get started!*