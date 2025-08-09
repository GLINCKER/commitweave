---
title: "Usage Guide"
description: "Learn how to use CommitWeave effectively in your development workflow"
order: 3
---

# Usage Guide

This guide covers all the ways you can use CommitWeave to improve your Git commit workflow, from basic usage to advanced AI-powered features.

## Basic Usage

### Interactive Commit Creation

The most common way to use CommitWeave is through the interactive interface:

```bash
commitweave
```

This launches the interactive menu where you can:

1. **Select commit type** - Choose from predefined conventional commit types
2. **Add scope** - Specify the area of your codebase affected (optional)
3. **Write subject** - Craft a concise, descriptive commit subject
4. **Add body** - Include detailed explanation (optional)
5. **Mark breaking changes** - Flag commits that introduce breaking changes
6. **Preview and confirm** - Review your commit message before creating

### Example Interactive Flow

```
🧶 CommitWeave - Beautiful Git Commits

┌─────────────────────────────────────────┐
│            What's Changed?              │
├─────────────────────────────────────────┤
│  📝 Create Commit                       │
│  🤖 AI Mode                             │
│  ⚙️  Initialize Config                  │
│  📋 Validate Latest Commit             │
│  🔍 List Configuration                  │
└─────────────────────────────────────────┘

? Select commit type: 
  ✨ feat      - A new feature
  🐛 fix       - A bug fix  
  📚 docs      - Documentation changes
  💎 style     - Code style changes
❯ 📦 refactor  - Code refactoring
  🚀 perf      - Performance improvements
  🚨 test      - Adding or correcting tests

? Enter scope (optional): auth
? Enter subject: improve JWT token validation logic
? Enter body (optional): 
Refactor JWT validation to use more secure algorithms
and add proper error handling for expired tokens.

? Is this a breaking change? No

📋 Commit Preview:
refactor(auth): 📦 improve JWT token validation logic

Refactor JWT validation to use more secure algorithms
and add proper error handling for expired tokens.

? Proceed with commit? Yes
✅ Commit created successfully!
```

## AI-Powered Commits

CommitWeave's AI features analyze your staged changes and generate contextual commit messages.

### Quick AI Commit

```bash
# Generate commit message using AI
commitweave --ai

# Shorthand (no flag needed)
commitweave ai
```

### AI Workflow

1. **Stage your changes**: `git add .`
2. **Run CommitWeave AI**: `commitweave --ai`
3. **Review AI suggestion**: CommitWeave analyzes your diff
4. **Choose action**:
   - ✅ Accept AI message
   - ✏️ Edit AI message
   - 🔄 Generate new AI message
   - ❌ Cancel and start over

### Example AI Generation

```bash
$ git add src/auth/jwt.ts
$ commitweave --ai

🤖 Analyzing your changes...

📊 Changes detected:
- Modified: src/auth/jwt.ts (+15 -8 lines)

🧠 AI Generated Commit:

feat(auth): ✨ enhance JWT token validation with algorithm verification

Add support for RS256 algorithm validation and improve error handling
for malformed tokens. Includes additional security checks for token
expiration and issuer validation.

? What would you like to do?
❯ Use this message
  Edit this message  
  Generate new message
  Cancel
```

## Command Reference

### Core Commands

```bash
# Interactive commit creation
commitweave

# AI-powered commit generation
commitweave --ai
commitweave ai

# Initialize configuration
commitweave init

# Validate latest commit
commitweave check
commitweave validate
commitweave v

# List current configuration  
commitweave list
commitweave ls
commitweave show

# System health check
commitweave doctor
commitweave health
```

### Configuration Commands

```bash
# Reset configuration to defaults
commitweave reset
commitweave clear

# Export current configuration
commitweave export > my-config.json

# Import configuration
commitweave import my-config.json
```

## Advanced Usage Patterns

### Custom Commit Types

You can define custom commit types in your configuration:

```json
{
  "commitTypes": [
    {
      "type": "feat",
      "description": "A new feature",
      "emoji": "✨"
    },
    {
      "type": "hotfix",
      "description": "Critical production fix",
      "emoji": "🚑"
    },
    {
      "type": "experiment",
      "description": "Experimental feature",
      "emoji": "🧪"
    }
  ]
}
```

### Team Configuration

Share configuration across your team by committing `glinr-commit.json`:

```bash
# Create team configuration
commitweave init

# Customize for your team needs
vim glinr-commit.json

# Commit the configuration
git add glinr-commit.json
git commit -m "feat: add CommitWeave configuration"
```

Team members can then use the shared configuration automatically.

### Git Hooks Integration

Integrate CommitWeave with Git hooks for automated validation:

#### commit-msg Hook

Create `.git/hooks/commit-msg`:

```bash
#!/bin/sh
# Validate commit message format
npx commitweave check --staged
```

#### pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Ensure staged changes exist before allowing commit
if git diff --staged --quiet; then
  echo "No staged changes to commit"
  exit 1
fi
```

### Scripting and Automation

CommitWeave can be integrated into scripts and CI/CD workflows:

```bash
#!/bin/bash
# Automated commit script

# Stage all changes
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
  echo "No changes to commit"
  exit 0
fi

# Generate commit with AI
commitweave --ai --auto-accept

# Push to remote
git push origin main
```

### Working with Different Environments

#### Development Environment

```bash
# Enable full UI experience
export COMMITWEAVE_FANCY_UI=true

# Use AI features
commitweave --ai
```

#### CI/CD Environment

```bash
# Disable interactive features for CI
export COMMITWEAVE_FANCY_UI=false
export COMMITWEAVE_ASCII_ART=false

# Validate commits in CI
commitweave check
```

## Configuration Customization

### UI Customization

Control the CommitWeave interface appearance:

```json
{
  "ui": {
    "fancyUI": true,        // Enable fancy interface
    "asciiArt": true,       // Show ASCII art banners
    "animations": true,     // Enable loading animations  
    "colors": true,         // Use terminal colors
    "emoji": true           // Display emojis in output
  }
}
```

### Message Formatting

Customize commit message formatting:

```json
{
  "emojiEnabled": true,
  "conventionalCommits": true,
  "maxSubjectLength": 50,
  "maxBodyLength": 72,
  "subjectCase": "lowercase",
  "bodyWrap": true
}
```

### AI Configuration

Fine-tune AI behavior:

```json
{
  "ai": {
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "maxTokens": 150,
    "systemPrompt": "Generate concise, conventional commit messages"
  }
}
```

## Best Practices

### 1. Commit Frequently, Commit Smart

```bash
# Make small, focused commits
git add src/components/Button.tsx
commitweave

# Use descriptive scopes
# Good: feat(button): add hover animation
# Bad: feat: changes
```

### 2. Leverage AI for Complex Changes

```bash
# For complex refactoring, let AI help
git add -A
commitweave --ai
```

### 3. Use Breaking Change Markers

```bash
# Mark breaking changes clearly
feat(api): redesign user authentication

BREAKING CHANGE: Legacy auth endpoints removed
```

### 4. Maintain Consistent Formatting

```bash
# Keep subjects under 50 characters
# Use imperative mood: "add", "fix", "update"
# Start with lowercase after type and scope
```

## Troubleshooting

### Common Issues and Solutions

#### Commit fails with validation errors
```bash
# Check current commit format
commitweave check

# Validate configuration
commitweave doctor
```

#### AI features not working
```bash
# Verify API key is set
echo $OPENAI_API_KEY

# Test AI connectivity
commitweave doctor --ai
```

#### Terminal display issues
```bash
# Disable fancy UI
export COMMITWEAVE_FANCY_UI=false

# Disable colors
export COMMITWEAVE_COLORS=false
```

### Performance Tips

- Use `commitweave ai` for faster AI access (no interactive menu)
- Set shorter `maxTokens` for faster AI responses
- Disable animations in slow terminals: `"animations": false`

## Workflow Examples

### Solo Developer Workflow

```bash
# Make changes
vim src/app.ts

# Stage and commit interactively
git add .
commitweave

# Quick validation
commitweave v
```

### Team Development Workflow

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/user-dashboard

# Make changes and commit with AI
git add .
commitweave --ai

# Push with descriptive commits
git push origin feature/user-dashboard
```

### Release Preparation

```bash
# Validate all recent commits
commitweave check --range HEAD~10..HEAD

# Generate changelog (if using conventional commits)
npx conventional-changelog -p angular -i CHANGELOG.md -s

# Create release commit
commitweave
# Type: feat
# Subject: prepare version 2.1.0 release
```

---

*Master these patterns to maximize your CommitWeave productivity!*