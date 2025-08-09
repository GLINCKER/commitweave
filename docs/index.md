---
title: "CommitWeave Documentation"
description: "AI-powered Git commit message generation tool for beautiful, conventional commits"
order: 1
---

# CommitWeave

CommitWeave is an intelligent CLI tool that helps you create beautiful, structured, and conventional Git commit messages with AI-powered assistance. Transform your Git workflow with smart commit message generation that follows industry standards and best practices.

## What is CommitWeave?

CommitWeave combines the power of AI with conventional commit standards to create an exceptional Git workflow experience. Whether you're working solo or with a team, CommitWeave ensures your commit history is clean, meaningful, and professional.

### Key Features

- **🤖 AI-Powered Generation**: Leverages OpenAI GPT and Anthropic Claude to analyze your changes and generate contextual commit messages
- **📝 Conventional Commits**: Full support for conventional commit format with predefined types and scopes
- **🎨 Beautiful CLI Interface**: Interactive prompts with animations, colors, and branded styling
- **✨ Smart Emoji Integration**: Contextual emojis that make your commit history visually appealing
- **⚙️ Highly Configurable**: Customize everything from commit types to AI models
- **🔧 Git Integration**: Seamless integration with your existing Git workflow
- **✅ Validation**: Built-in commit message validation and formatting

## Quick Start

Get up and running with CommitWeave in minutes:

```bash
# Install globally
npm install -g commitweave

# Initialize configuration
commitweave init

# Create your first AI-powered commit
commitweave --ai
```

## Why CommitWeave?

### Before CommitWeave
```
git commit -m "fix stuff"
git commit -m "update"
git commit -m "changes"
```

### After CommitWeave
```
feat(auth): ✨ implement JWT token validation system

Add comprehensive JWT authentication with automatic token
refresh and secure session management.

BREAKING CHANGE: Legacy auth endpoints deprecated
```

## Core Principles

1. **🎨 Beauty First** - Every interaction should be visually appealing
2. **⚡ Speed Matters** - Fast, responsive, and efficient operations  
3. **🛡️ Type Safety** - Full TypeScript coverage for reliability
4. **🔧 Configurable** - Highly customizable to fit team preferences
5. **🤖 AI-Enhanced** - Smart assistance without complexity
6. **📝 Standards-Based** - Full conventional commit compliance

## Supported Commit Types

CommitWeave includes 11 predefined conventional commit types:

| Type | Emoji | Description |
|------|--------|-------------|
| `feat` | ✨ | A new feature |
| `fix` | 🐛 | A bug fix |
| `docs` | 📚 | Documentation changes |
| `style` | 💎 | Code style changes (formatting) |
| `refactor` | 📦 | Code refactoring |
| `perf` | 🚀 | Performance improvements |
| `test` | 🚨 | Adding or correcting tests |
| `build` | 🛠 | Build system or external dependencies |
| `ci` | ⚙️ | CI configuration changes |
| `chore` | ♻️ | Maintenance tasks |
| `revert` | 🗑 | Revert previous commit |

## Getting Started

Ready to transform your Git workflow? Check out our comprehensive guides:

- [Installation Guide](./installation.md) - Get CommitWeave installed on your system
- [Usage Examples](./usage.md) - Learn how to use CommitWeave effectively
- [API Reference](./api/reference.md) - Detailed API documentation

## Community and Support

CommitWeave is built by the GLINR team and published by @typeweaver. Join our community for support, feature requests, and contributions.

---

*Transform your Git workflow with intelligent, beautiful commit messages.*