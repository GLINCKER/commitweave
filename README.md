# CommitWeave 🧶

[![npm version](https://badge.fury.io/js/@typeweaver%2Fcommitweave.svg)](https://www.npmjs.com/package/@typeweaver/commitweave)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518.0.0-green.svg)](https://nodejs.org/)

> A modern CLI tool for creating smart, structured, and beautiful git commit messages with emoji support, conventional commit standards, and interactive Git integration.

## ✨ Features

- 🎨 **Interactive CLI Experience** - Beautiful prompts with colorful output
- 📝 **Conventional Commits** - Full support for conventional commit standards  
- 🎭 **Smart Emoji Integration** - Contextual emojis for different commit types
- ⚙️ **Highly Configurable** - Customize commit types, emojis, and validation rules
- 🔧 **Git Integration** - Stage files and commit in one seamless workflow
- 📦 **TypeScript First** - Complete type definitions and IntelliSense support
- 🛡️ **Cross-Platform** - Works on Windows, macOS, and Linux
- 🚀 **Zero Dependencies Bloat** - Minimal, focused dependencies

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

## 📖 Commands

### `commitweave`
Start the interactive commit creation process.

**Features:**
- Select commit type with emoji and description
- Add optional scope for better organization
- Write clear, concise commit subjects
- Add detailed body descriptions
- Mark breaking changes appropriately
- Preview your commit message before confirmation
- Automatically stage all files and commit

### `commitweave init`
Initialize or update your project's commit configuration.

**What it does:**
- Creates `glinr-commit.json` in your project root
- Sets up default commit types with emojis
- Configures conventional commit standards
- Warns before overwriting existing configuration

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

```json
{
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
│   ├── core/             # Core commit building logic
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── config/           # Configuration management
├── bin/                  # CLI entry points
├── scripts/              # Build and utility scripts
└── .github/workflows/    # CI/CD workflows
```

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