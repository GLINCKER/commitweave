<!-- Branding will be added here by setup:branding script when assets/logo.png is available -->

# CommitWeave 🧶

<div align="center">
  
[![npm version](https://badge.fury.io/js/@typeweaver%2Fcommitweave.svg)](https://www.npmjs.com/package/@typeweaver/commitweave)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518.0.0-green.svg)](https://nodejs.org/)

**Developed by GLINR STUDIOS**

</div>

> A modern CLI tool for creating smart, structured, and beautiful git commit messages with emoji support, conventional commit standards, and interactive Git integration.

## ✨ Features

### Core Features
- 🎨 **Interactive CLI Experience** - Beautiful prompts with colorful output and animations
- 📝 **Conventional Commits** - Full support for conventional commit standards  
- 🎭 **Smart Emoji Integration** - Contextual emojis for different commit types
- ⚙️ **Highly Configurable** - Customize commit types, emojis, and validation rules
- 🔧 **Git Integration** - Stage files and commit in one seamless workflow
- 📦 **TypeScript First** - Complete type definitions and IntelliSense support
- 🛡️ **Cross-Platform** - Works on Windows, macOS, and Linux
- 🚀 **Zero Dependencies Bloat** - Minimal, focused dependencies

### AI & Automation
- 🤖 **AI-Powered Commits** - Generate commit messages using OpenAI or Anthropic Claude
- 🧠 **Smart Analysis** - AI analyzes your staged changes and suggests appropriate messages
- ⚡ **Multiple AI Providers** - Support for OpenAI GPT and Anthropic Claude models
- 🔒 **Secure Configuration** - Safe handling of API keys and sensitive data

### VS Code Integration
- 🧩 **Native Extension** - Seamless VS Code integration with Command Palette support
- ⚙️ **Settings Panel** - Visual configuration with repository status monitoring
- 🎯 **Three Core Commands** - Create commits, AI commits, and configure settings
- 🔗 **CLI Integration** - Launches full CLI experience within VS Code integrated terminal
- 🎨 **Theme Integration** - Adapts to VS Code's light/dark theme automatically

### Configuration Management
- 📋 **Export/Import Configs** - Share configurations across projects and teams
- 🔄 **Configuration Versioning** - Version-controlled configuration with validation
- 🏥 **Config Health Check** - Built-in doctor command for configuration validation
- 📊 **Configuration Diff** - Preview changes before importing configurations
- 🔐 **Secret Stripping** - Safely export configurations without sensitive data

## 🚀 Quick Start

### Installation

#### Beta Release (Recommended)
```bash
npm install -g @typeweaver/commitweave@beta
```

#### Specific Version
```bash
npm install -g @typeweaver/commitweave@0.1.0-beta.3
```

#### VS Code Extension
1. **From Marketplace**: Search for "CommitWeave" in VS Code Extensions
2. **From VSIX**: Download from [releases](https://github.com/GLINCKER/commitweave/releases) and install via `Extensions: Install from VSIX...`
3. **Publisher**: `glincker` (developed by GLINR STUDIOS)

### Basic Usage

1. **Initialize configuration** (first time):
   ```bash
   commitweave init
   ```

2. **Create commits interactively**:
   ```bash
   commitweave
   ```

That's it! CommitWeave will guide you through creating perfect commits.

### VS Code Usage

1. **Open Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. **Choose from**:
   - `CommitWeave: Create Commit` - Interactive commit creation
   - `CommitWeave: AI Commit` - AI-powered commit generation
   - `CommitWeave: Configure` - Open settings panel
3. **Configure settings** via the visual settings panel with repository status monitoring

## 📖 Commands

### Core Commands

#### `commitweave`
Start the interactive commit creation process.

**Features:**
- Select commit type with emoji and description
- Add optional scope for better organization
- Write clear, concise commit subjects
- Add detailed body descriptions
- Mark breaking changes appropriately
- Preview your commit message before confirmation
- Automatically stage all files and commit

#### `commitweave --ai`
Generate AI-powered commit messages from your staged changes.

**Features:**
- Analyzes git diff automatically
- Uses OpenAI GPT or Anthropic Claude
- Generates contextual commit messages
- Allows editing before committing
- Supports regeneration for better results

#### `commitweave init`
Initialize or update your project's commit configuration.

**What it does:**
- Creates `glinr-commit.json` in your project root
- Sets up default commit types with emojis
- Configures conventional commit standards
- Warns before overwriting existing configuration

#### `commitweave check`
Validate your latest commit message against project standards.

**Features:**
- Validates conventional commit format
- Checks message length limits
- Verifies commit type validity
- Provides helpful error messages

### Configuration Management Commands

#### `commitweave export [options]`
Export your current configuration for sharing.

**Options:**
- `--output <file>` - Export to specific file
- `--pretty` - Format with indentation
- Without options: outputs to stdout

**Features:**
- Strips sensitive data (API keys)
- Adds version information
- Validates configuration before export

#### `commitweave import <source> [options]`
Import configuration from file or URL.

**Options:**
- `--force` - Skip confirmation prompts
- `--preview` - Show diff without applying

**Features:**
- Shows configuration diff preview
- Validates imported configuration
- Merges with existing settings
- Backup option for safety

#### `commitweave list`
Display your current configuration in a readable format.

**Features:**
- Shows all commit types and settings
- Displays AI provider configuration (without secrets)
- Highlights important settings
- Easy-to-read formatting

#### `commitweave reset [options]`
Reset configuration to defaults.

**Options:**
- `--force` - Skip confirmation

**Features:**
- Backs up existing configuration
- Restores factory defaults
- Confirmation prompts for safety

#### `commitweave doctor`
Validate and diagnose configuration issues.

**Features:**
- Validates JSON syntax and schema
- Checks for missing required fields
- Validates AI provider settings
- Reports configuration health status
- Suggests fixes for common issues

### Development Commands

For development and testing:
```bash
# Development mode (full functionality)
npx tsx bin/index.ts

# Run tests
npm test

# Build the package
npm run build
```

## ⚙️ Configuration

CommitWeave uses a `glinr-commit.json` file for configuration:

### Basic Configuration
```json
{
  "version": "1.0",
  "commitTypes": [
    {
      "type": "feat",
      "emoji": "✨",
      "description": "A new feature",
      "aliases": ["feature", "new"]
    },
    {
      "type": "fix", 
      "emoji": "🐛",
      "description": "A bug fix",
      "aliases": ["bugfix", "hotfix"]
    }
  ],
  "emojiEnabled": true,
  "conventionalCommits": true,
  "maxSubjectLength": 50,
  "maxBodyLength": 72
}
```

### AI Configuration
```json
{
  "version": "1.0",
  "ai": {
    "provider": "openai",
    "apiKey": "your-api-key-here",
    "model": "gpt-4",
    "maxTokens": 150
  },
  "claude": {
    "enabled": true,
    "apiKey": "your-claude-api-key",
    "model": "claude-3-haiku-20240307",
    "maxTokens": 4000
  }
}
```

### Configuration Management
```bash
# Export current configuration
commitweave export --output team-config.json --pretty

# Import shared configuration
commitweave import team-config.json

# View current settings
commitweave list

# Check configuration health
commitweave doctor

# Reset to defaults
commitweave reset
```

### Default Commit Types

| Type | Emoji | Description | Aliases |
|------|-------|-------------|---------|
| `feat` | ✨ | A new feature | feature, new |
| `fix` | 🐛 | A bug fix | bugfix, hotfix |
| `docs` | 📚 | Documentation changes | documentation |
| `style` | 💎 | Code style changes | formatting |
| `refactor` | 📦 | Code refactoring | refactoring |
| `perf` | 🚀 | Performance improvements | performance, optimization |
| `test` | 🚨 | Testing | testing |
| `build` | 🛠 | Build system changes | ci, deps |
| `ci` | ⚙️ | CI configuration | continuous-integration |
| `chore` | ♻️ | Maintenance tasks | maintenance |
| `revert` | 🗑 | Revert previous commit | rollback |

## 📝 Commit Message Format

CommitWeave follows the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <emoji> <description>

[optional body]

[optional footer(s)]
```

### Examples

**Simple commit:**
```
feat: ✨ add user authentication
```

**With scope:**
```
feat(auth): ✨ add JWT token validation
```

**With body and breaking change:**
```
feat(api)!: ✨ implement new user API

This introduces a new user management API that replaces
the legacy user system.

BREAKING CHANGE: Legacy user endpoints have been removed
```

## 🛠️ Development

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/GLINCKER/commitweave.git
cd commitweave

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Development mode
npm run dev
```

### Project Structure
```
commitweave/
├── src/
│   ├── cli/              # CLI interface logic
│   │   ├── createCommitFlow.ts    # Interactive commit creation
│   │   └── commands/              # Configuration management commands
│   │       ├── exportConfig.ts    # Export configuration
│   │       ├── importConfig.ts    # Import and merge configuration
│   │       ├── listConfig.ts      # Display current configuration
│   │       ├── resetConfig.ts     # Reset to defaults
│   │       └── doctorConfig.ts    # Configuration health check
│   ├── core/             # Core commit building logic
│   ├── types/            # TypeScript type definitions
│   │   └── ai.ts         # AI provider types and error classes
│   ├── utils/            # Utility functions
│   │   ├── ai.ts         # AI integration with error handling
│   │   ├── configStore.ts         # Configuration management
│   │   ├── configDiff.ts          # Configuration diffing and validation
│   │   └── errorHandler.ts        # Centralized error handling
│   └── config/           # Configuration management
├── bin/                  # CLI entry points
├── scripts/              # Build and utility scripts
├── tests/                # Test suite
│   ├── anthropic.spec.ts          # Claude provider tests
│   └── config.spec.ts             # Configuration management tests
└── .github/workflows/    # CI/CD workflows
```

### Architecture Overview

#### Design Patterns
1. **Builder Pattern**: CommitBuilder for constructing commit messages
2. **Factory Pattern**: AI provider abstraction and configuration loading
3. **Command Pattern**: CLI command routing and execution
4. **Strategy Pattern**: Pluggable AI providers (OpenAI, Anthropic, Mock)

#### Error Handling
- **Typed Errors**: Custom error classes for different failure modes
- **Centralized Handling**: User-friendly error messages with actionable suggestions
- **Provider-Specific**: Specialized error handling for AI providers (rate limits, validation, etc.)

#### Configuration System
- **Versioned Configs**: Configuration versioning for compatibility
- **Safe Export/Import**: Secret stripping and validation
- **Health Monitoring**: Built-in configuration validation and diagnostics

## 🧪 Testing

```bash
# Run all tests
npm test

# Test commit builder
npx tsx scripts/test-local.ts

# Test CLI functions
npx tsx scripts/test-cli-functions.ts
```

## 📦 Publishing

CommitWeave uses automated publishing via GitHub Actions:

```bash
# Create a new beta release
git tag v0.1.0-beta.3
git push origin v0.1.0-beta.3
```

This triggers:
- GitHub release creation
- NPM package publishing
- Beta tag distribution

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Run `npm test` to ensure everything works
6. Commit using CommitWeave: `commitweave`
7. Push and create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Conventional Commits](https://www.conventionalcommits.org/) for the commit format specification
- [Enquirer](https://github.com/enquirejs/enquirer) for beautiful CLI prompts
- [Chalk](https://github.com/chalk/chalk) for terminal string styling
- [Simple Git](https://github.com/steveukx/git-js) for Git integration

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/@typeweaver/commitweave)
- [GitHub Repository](https://github.com/GLINCKER/commitweave)
- [Issue Tracker](https://github.com/GLINCKER/commitweave/issues)
- [TypeWeaver Organization](https://github.com/GLINCKER)

---

**Made with ❤️ by the TypeWeaver team**