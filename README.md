<div align="center">

# 🧶 CommitWeave

**Create beautiful, standardized git commits with ease**

[![npm version](https://badge.fury.io/js/@typeweaver%2Fcommitweave.svg)](https://www.npmjs.com/package/@typeweaver/commitweave)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=glincker.commitweave)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)

*Developed by **GLINR STUDIOS***

---

**[🚀 Quick Start](#-quick-start)** • 
**[📖 Documentation](https://github.com/GLINCKER/commitweave/wiki)** • 
**[🎥 Demo](#-demo)** • 
**[🧩 VS Code Extension](#-vs-code-extension)** • 
**[🤖 AI Features](#-ai-powered-commits)**

</div>

## ✨ What is CommitWeave?

CommitWeave is a modern CLI tool and VS Code extension that transforms your git commit workflow. Create beautiful, consistent, and meaningful commit messages following conventional commit standards—with emoji support, AI assistance, and powerful automation.

### 🎥 Demo

> *Add animated GIF showing CLI in action here*
> 
> **Coming Soon**: Watch CommitWeave create perfect commits interactively with emoji selection, conventional commit formatting, and AI-powered suggestions.

## 🚀 Quick Start

### Step 1: Install
```bash
# CLI Tool
npm install -g @typeweaver/commitweave@beta

# VS Code Extension
# Search "CommitWeave" in VS Code Extensions (Publisher: glincker)
```

### Step 2: Initialize
```bash
# Set up your project configuration
commitweave init
```

### Step 3: Create Beautiful Commits
```bash
# Interactive commit creation
commitweave

# Or with AI assistance
commitweave --ai
```

**That's it!** 🎉 Start creating professional commits instantly.

## 🧩 VS Code Extension

Our VS Code extension brings CommitWeave directly into your editor with a rich, native experience.

**Quick Access:**
- **Command Palette**: `Ctrl+Shift+P` → "CommitWeave"
- **Source Control Panel**: Click the "⚡ Quick Commit" button
- **Status Bar**: Monitor your repo status at a glance

**Features:**
- 🎯 **5 Powerful Commands**: Create, AI Commit, Quick Commit, Validate, Configure  
- ⚙️ **Enhanced Settings Panel**: Tabbed interface with visual configuration
- 📊 **Commit History**: View and validate recent commits
- 📝 **Smart Templates**: Pre-built commit templates with variables
- ✅ **Real-time Validation**: Live commit message validation with suggestions

## 🤖 AI-Powered Commits

Transform your workflow with intelligent commit generation:

- **🧠 Smart Analysis**: AI analyzes your staged changes
- **⚡ Multiple Providers**: OpenAI GPT & Anthropic Claude support  
- **🎨 Perfect Formatting**: Always follows conventional commit standards
- **🔒 Secure**: Safe API key handling and local storage

```bash
# Generate AI commits from your changes
commitweave --ai
```

## 📋 Features Overview

<table>
<tr>
<td valign="top" width="50%">

### Core Features
- 🎨 **Interactive CLI** with beautiful animations
- 📝 **Conventional Commits** standard compliance  
- 🎭 **Smart Emojis** for every commit type
- ⚙️ **Highly Configurable** project settings
- 🔧 **Git Integration** - stage and commit seamlessly
- 📦 **TypeScript First** with full IntelliSense
- 🛡️ **Cross-Platform** (Windows, macOS, Linux)

</td>
<td valign="top" width="50%">

### Advanced Features
- 🤖 **AI Commit Generation** (OpenAI & Claude)
- 🧩 **VS Code Extension** with native integration
- 📋 **Team Config Sharing** via export/import
- ✅ **Message Validation** with helpful suggestions
- 📊 **Commit Analytics** and history visualization
- 🔄 **Version Control** for configurations
- 🏥 **Health Monitoring** with doctor command

</td>
</tr>
</table>

## 📚 Commands Reference

### Essential Commands

| Command | Description | Example |
|---------|-------------|---------|
| `commitweave` | Interactive commit creation | Creates commits with guided prompts |
| `commitweave --ai` | AI-powered commit generation | Analyzes changes, suggests commits |
| `commitweave init` | Initialize project configuration | Sets up `glinr-commit.json` |
| `commitweave check` | Validate your last commit | Checks conventional commit compliance |

### Configuration Management

| Command | Description | Use Case |
|---------|-------------|----------|
| `commitweave export` | Export current config | Share team settings |
| `commitweave import <file>` | Import shared config | Adopt team standards |
| `commitweave list` | View current settings | Check your configuration |
| `commitweave doctor` | Diagnose config issues | Troubleshoot problems |
| `commitweave reset` | Reset to defaults | Start fresh |

### VS Code Commands

| Command | Description | Access |
|---------|-------------|--------|
| **CommitWeave: Create Commit** | Launch interactive CLI | Command Palette |
| **CommitWeave: AI Commit** | Generate AI commit messages | Command Palette |
| **CommitWeave: Quick Commit** | Fast conventional commits | Command Palette / SCM Panel |
| **CommitWeave: Validate Commit** | Check last commit | Command Palette |
| **CommitWeave: Configure** | Open settings panel | Command Palette |

## ⚙️ Configuration

### Default Commit Types

| Type | Emoji | Description |
|------|-------|-------------|
| `feat` | ✨ | New features |
| `fix` | 🐛 | Bug fixes |  
| `docs` | 📚 | Documentation |
| `style` | 💎 | Code formatting |
| `refactor` | 📦 | Code refactoring |
| `perf` | 🚀 | Performance improvements |
| `test` | 🚨 | Testing |
| `build` | 🛠 | Build system |
| `ci` | ⚙️ | CI/CD |
| `chore` | ♻️ | Maintenance |
| `revert` | 🗑 | Reverts |

### Sample Configuration
```json
{
  "version": "1.0",
  "emojiEnabled": true,
  "conventionalCommits": true,
  "maxSubjectLength": 50,
  "ai": {
    "provider": "openai",
    "model": "gpt-4"
  }
}
```

## 🛠️ Development

### Prerequisites
- Node.js ≥ 18.0.0
- npm or yarn
- Git

### Setup
```bash
git clone https://github.com/GLINCKER/commitweave.git
cd commitweave
npm install
npm run build
npm test
```

## 🧪 Testing & Quality Assurance

CommitWeave maintains exceptional quality through comprehensive testing across multiple dimensions:

### ✅ Test Coverage Summary
- **Platform Compatibility**: 6/6 tests passed (100% success rate)
- **AI Functionality**: 6/6 AI tests passed with fallback validation  
- **Performance**: 24ms startup time (12x better than 300ms target)
- **VS Code Integration**: All extension commands validated
- **Fallback Behavior**: 5/5 network failure scenarios handled gracefully

### 🖥️ Platform Compatibility
- **Operating Systems**: macOS, Linux, Windows
- **Shells**: zsh, bash, PowerShell, Command Prompt
- **Terminals**: Terminal.app, iTerm2, Windows Terminal, VS Code integrated terminal
- **Full emoji and ANSI color support** verified across platforms

### 🤖 AI Provider Testing
- **OpenAI GPT**: Full integration with API key validation
- **Anthropic Claude**: Complete Claude 3 model support
- **Mock AI Provider**: Always available as ultimate fallback
- **Network Failure Handling**: Graceful degradation with user warnings
- **Invalid API Key Detection**: Automatic fallback to Mock AI

### ⚡ Performance Benchmarks
```bash
# Run performance benchmarks
npm run bench

# Results: ~24ms cold-start (target: ≤300ms)
# 13x performance improvement achieved
```

### 🧪 Running Tests
```bash
# Cross-platform compatibility testing
npx tsx scripts/test-cross-platform.ts

# AI functionality and fallback testing  
npx tsx scripts/test-ai-functionality.ts
npx tsx scripts/test-ai-fallback.ts

# VS Code extension integration testing
npx tsx scripts/test-vscode-integration.ts

# Performance benchmarking
npm run bench
```

### 📊 Testing Reports
- **Platform Results**: [docs/platform-compatibility.md](docs/platform-compatibility.md)
- **Test Artifacts**: `docs/testing-reports/` directory
- **File Structure**: [docs/file-map.md](docs/file-map.md)

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for:

- 🔧 Local development setup
- 🧪 Testing instructions  
- 📝 How to add commit types
- 🤖 Adding AI providers
- 📋 Code style guidelines

## 📖 Documentation & Resources

- **[📚 Full Documentation](https://github.com/GLINCKER/commitweave/wiki)** - Complete guides and tutorials
- **[🐛 Report Issues](https://github.com/GLINCKER/commitweave/issues)** - Bug reports and feature requests  
- **[💬 Discussions](https://github.com/GLINCKER/commitweave/discussions)** - Community support and ideas
- **[🚀 Releases](https://github.com/GLINCKER/commitweave/releases)** - Latest versions and changelog
- **[📦 NPM Package](https://www.npmjs.com/package/@typeweaver/commitweave)** - Package details and stats

## 🔗 Beta Signup & Early Access

**[📝 Join the Beta Program](https://forms.gle/YOUR-BETA-SIGNUP-LINK)**

Get early access to new features:
- 🚀 Latest features before general release
- 💬 Direct feedback channel with our team
- 🎁 Exclusive beta-only features and themes
- 📧 Priority support and feature requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by [GLINR STUDIOS](https://github.com/GLINCKER)**

**[⭐ Star us on GitHub](https://github.com/GLINCKER/commitweave)** • **[🐦 Follow @TypeWeaver](https://twitter.com/typeweaver)** • **[💬 Join our Discord](https://discord.gg/typeweaver)**

</div>