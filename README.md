# Commitweave 🧶

[![npm version](https://badge.fury.io/js/@typeweaver%2Fcommitweave.svg)](https://www.npmjs.com/package/@typeweaver/commitweave)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://img.shields.io/badge/Node.js-%E2%89%A518.0.0-green.svg)](https://nodejs.org/)

A modern, battle-tested CLI tool for creating smart, structured, and beautiful git commit messages with emoji support, conventional commit rules, AI-powered summaries, and comprehensive TypeScript integration.

## ✨ Features

- 🎨 **Beautiful Interactive CLI** - Intuitive prompts with colorful output using chalk and enquirer
- 📝 **Conventional Commits** - Full support for conventional commit standards
- 🎭 **Smart Emoji Integration** - Contextual emojis for different commit types
- 🤖 **AI-Powered Summaries** - Optional AI-generated commit messages (OpenAI, Anthropic, Mock)
- ⚙️ **Highly Configurable** - Customize commit types, emojis, and validation rules
- 🪝 **Git Hooks Ready** - Built-in pre-commit and post-commit hook support
- 🔧 **Full TypeScript Support** - Complete type definitions and IntelliSense
- 📦 **Dual Module Support** - Works with both CommonJS and ESM projects
- 🛡️ **Cross-Platform** - Windows, macOS, and Linux support
- 🎯 **Zero Dependencies in Production** - Lightweight and fast

## 🚀 Installation

### Global Installation (Recommended)
```bash
npm install -g @typeweaver/commitweave
```

### Project Installation
```bash
# Using npm
npm install --save-dev @typeweaver/commitweave

# Using yarn
yarn add --dev @typeweaver/commitweave

# Using pnpm
pnpm add --save-dev @typeweaver/commitweave
```

## 🎯 Quick Start

```bash
# Navigate to your git repository
cd your-project

# Initialize configuration (optional)
commitweave init

# Create a commit interactively
commitweave
```

## 📖 Usage

### CLI Usage

```bash
# Interactive commit creation
commitweave

# Initialize configuration file
commitweave init

# Show help information
commitweave --help
```

### Programmatic Usage

#### CommonJS
```javascript
const { CommitBuilder, defaultConfig, GitUtils } = require('@typeweaver/commitweave');

const builder = new CommitBuilder(defaultConfig);
const message = builder
  .setType('feat')
  .setSubject('add user authentication')
  .setBody('Implement JWT-based authentication system')
  .build();

console.log(message);
// Output: feat: ✨ add user authentication
```

#### ES Modules
```javascript
import { 
  CommitBuilder, 
  defaultConfig, 
  GitUtils,
  createCommitMessage
} from '@typeweaver/commitweave';

// Using the builder pattern
const builder = new CommitBuilder(defaultConfig);
const message = builder
  .setType('fix')
  .setScope('auth')
  .setSubject('resolve token expiration issue')
  .setBreakingChange(false)
  .build();

// Using the helper function
const quickMessage = createCommitMessage(
  'docs', 
  'update API documentation',
  { config: defaultConfig }
);
```

#### TypeScript
```typescript
import type { 
  Config, 
  CommitType, 
  CommitMessage,
  AIProvider,
  AISummaryOptions
} from '@typeweaver/commitweave';

import { 
  CommitBuilder,
  GitUtils,
  createAIProvider
} from '@typeweaver/commitweave';

const config: Config = {
  commitTypes: [
    {
      type: 'feat',
      emoji: '✨',
      description: 'A new feature',
      aliases: ['feature']
    }
  ],
  emojiEnabled: true,
  conventionalCommits: true,
  aiSummary: false,
  maxSubjectLength: 50,
  maxBodyLength: 72
};

const gitUtils = new GitUtils();
const aiProvider = createAIProvider({ provider: 'mock' });
```

## ⚙️ Configuration

Commitweave uses `glinr-commit.json` for configuration. Create one with:

```bash
commitweave init
```

### Configuration Schema

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
    },
    {
      "type": "docs",
      "emoji": "📚",
      "description": "Documentation changes",
      "aliases": ["documentation"]
    },
    {
      "type": "style",
      "emoji": "💎",
      "description": "Code style changes",
      "aliases": ["formatting"]
    },
    {
      "type": "refactor",
      "emoji": "📦",
      "description": "Code refactoring",
      "aliases": ["refactoring"]
    },
    {
      "type": "perf",
      "emoji": "🚀",
      "description": "Performance improvements",
      "aliases": ["performance", "optimization"]
    },
    {
      "type": "test",
      "emoji": "🚨",
      "description": "Adding or updating tests",
      "aliases": ["testing"]
    },
    {
      "type": "build",
      "emoji": "🛠",
      "description": "Build system changes",
      "aliases": ["ci", "deps"]
    },
    {
      "type": "ci",
      "emoji": "⚙️",
      "description": "CI configuration changes",
      "aliases": ["continuous-integration"]
    },
    {
      "type": "chore",
      "emoji": "♻️",
      "description": "Other maintenance changes",
      "aliases": ["maintenance"]
    },
    {
      "type": "revert",
      "emoji": "🗑",
      "description": "Revert previous changes",
      "aliases": ["rollback"]
    }
  ],
  "emojiEnabled": true,
  "conventionalCommits": true,
  "aiSummary": false,
  "maxSubjectLength": 50,
  "maxBodyLength": 72,
  "ai": {
    "provider": "mock",
    "apiKey": "",
    "model": "gpt-3.5-turbo",
    "maxTokens": 150,
    "temperature": 0.7
  },
  "hooks": {
    "preCommit": [],
    "postCommit": []
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `commitTypes` | `CommitType[]` | [Default types] | Available commit types with emojis and aliases |
| `emojiEnabled` | `boolean` | `true` | Include emojis in commit messages |
| `conventionalCommits` | `boolean` | `true` | Follow conventional commit format |
| `aiSummary` | `boolean` | `false` | Enable AI-powered commit generation |
| `maxSubjectLength` | `number` | `50` | Maximum commit subject length |
| `maxBodyLength` | `number` | `72` | Maximum line length for commit body |
| `ai.provider` | `string` | `"mock"` | AI provider: `openai`, `anthropic`, or `mock` |
| `ai.apiKey` | `string` | `""` | API key for the AI provider |
| `ai.model` | `string` | Provider default | Model to use for AI generation |
| `hooks.preCommit` | `string[]` | `[]` | Commands to run before commit |
| `hooks.postCommit` | `string[]` | `[]` | Commands to run after commit |

## 🤖 AI Integration

Commitweave supports multiple AI providers for intelligent commit message generation:

### OpenAI Integration
```json
{
  "ai": {
    "provider": "openai",
    "apiKey": "your-openai-api-key",
    "model": "gpt-3.5-turbo",
    "maxTokens": 150,
    "temperature": 0.7
  }
}
```

### Anthropic Integration
```json
{
  "ai": {
    "provider": "anthropic", 
    "apiKey": "your-anthropic-api-key",
    "model": "claude-3-haiku-20240307",
    "maxTokens": 150,
    "temperature": 0.7
  }
}
```

### Mock Provider (Default)
Perfect for testing and development without API costs:
```json
{
  "ai": {
    "provider": "mock"
  }
}
```

## 🛠️ API Reference

### CommitBuilder

The main class for building commit messages:

```typescript
class CommitBuilder {
  constructor(config: Config)
  
  setType(type: string): this
  setScope(scope: string): this  
  setSubject(subject: string): this
  setBody(body: string): this
  setFooter(footer: string): this
  setBreakingChange(isBreaking: boolean): this
  setEmoji(emoji: string): this
  
  build(): string
  validate(): { valid: boolean; errors: string[] }
  reset(): this
}
```

### GitUtils

Git operations wrapper with enhanced functionality:

```typescript
class GitUtils {
  constructor(workingDir?: string)
  
  async isGitRepository(): Promise<boolean>
  async getStatus(): Promise<StatusResult>
  async getStagedChanges(): Promise<StagedChanges>
  async getDiff(staged?: boolean): Promise<string>
  async stageAll(): Promise<void>
  async stageFiles(files: string[]): Promise<void>
  async commit(message: string, options?: { dryRun?: boolean }): Promise<string>
  async getCurrentBranch(): Promise<string>
  async getLastCommitMessage(): Promise<string>
  async hasUncommittedChanges(): Promise<boolean>
}
```

### AI Providers

```typescript
interface AIProvider {
  generateCommitMessage(diff: string, options?: AISummaryOptions): Promise<CommitSuggestion>
  isConfigured(): boolean
}

// Available providers
const openaiProvider = new OpenAIProvider(apiKey, model);
const anthropicProvider = new AnthropicProvider(apiKey, model);  
const mockProvider = new MockAIProvider();
```

## 🏗️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/GLINCKER/commitweave.git
cd commitweave

# Install dependencies
npm install

# Build the project (dual CJS/ESM output)
npm run build

# Run in development mode
npm run dev

# Test the CLI locally
npm start
```

### Build System

Commitweave uses a sophisticated dual-build system:

- **CommonJS Build** (`dist/index.js`) - For Node.js and older tools
- **ESM Build** (`dist/index.mjs`) - For modern ES modules
- **TypeScript Declarations** (`dist/index.d.ts`) - For full type support
- **CLI Binary** (`dist/bin.js`) - Executable CLI tool

### Project Structure

```
commitweave/
├── bin/
│   ├── index.ts          # ESM CLI entrypoint
│   └── index.cjs.ts      # CommonJS CLI entrypoint
├── src/
│   ├── types/            # TypeScript type definitions
│   │   ├── config.ts     # Configuration types
│   │   ├── commit.ts     # Commit message types
│   │   ├── git.ts        # Git operation types
│   │   ├── ai.ts         # AI provider types
│   │   └── index.ts      # Unified type exports
│   ├── config/
│   │   └── defaultConfig.ts   # Default configuration
│   ├── core/
│   │   └── commitBuilder.ts   # Commit message builder
│   ├── utils/
│   │   ├── git.ts             # Git operations
│   │   └── ai.ts              # AI integrations
│   └── index.ts               # Main library exports
├── scripts/
│   └── prepare-dist.js        # Build preparation script
├── dist/                      # Build output
│   ├── index.js              # CommonJS entry
│   ├── index.mjs             # ESM entry
│   ├── index.d.ts            # Type definitions
│   ├── bin.js                # CLI executable
│   └── lib/                  # Internal modules
├── tsconfig*.json            # TypeScript configurations
├── glinr-commit.json         # Default config template
└── README.md
```

## 🧪 Testing

```bash
# Run tests (when available)
npm test

# Test package imports
node -e "console.log(Object.keys(require('./dist/index.js')))"

# Test CLI functionality
./dist/bin.js --help
```

## 📦 Package Distribution

The package is optimized for npm distribution with:

- ✅ **Dual Module Support** - Both CJS and ESM
- ✅ **Complete TypeScript Definitions** - Full IntelliSense support
- ✅ **Tree-shakable Exports** - Import only what you need
- ✅ **Zero Runtime Dependencies** - Production builds are dependency-free
- ✅ **Cross-platform Binary** - Works on Windows, macOS, and Linux

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper TypeScript types
4. **Test your changes**: `npm run build && npm test`
5. **Commit using commitweave**: `commitweave`
6. **Push to your branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Add type definitions for all new APIs
- Update documentation for new features
- Test both CommonJS and ESM imports
- Ensure cross-platform compatibility

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🗺️ Roadmap

### v1.0 - Core Features
- [x] Interactive CLI with beautiful prompts
- [x] Conventional commit support
- [x] Emoji integration
- [x] Full TypeScript support
- [x] Dual module system (CJS/ESM)
- [x] AI provider infrastructure

### v1.1 - Enhanced AI
- [ ] Full OpenAI integration
- [ ] Full Anthropic integration  
- [ ] Smart diff analysis
- [ ] Context-aware suggestions

### v1.2 - Advanced Features
- [ ] Git hooks implementation
- [ ] Configuration validation
- [ ] Template system for custom formats
- [ ] Plugin architecture

### v1.3 - Developer Experience
- [ ] Interactive configuration wizard
- [ ] VS Code extension
- [ ] GitHub Actions integration
- [ ] Commit message templates

## 🙏 Acknowledgments

- **Conventional Commits** - For the commit message standard
- **Inquirer.js/Enquirer** - For beautiful CLI prompts
- **Chalk** - For colorful terminal output
- **Simple Git** - For Git operations
- **Zod** - For runtime type validation

---

<div align="center">

**Made with ❤️ by [TypeWeaver](https://typeweaver.com/)**

[npm](https://www.npmjs.com/package/@typeweaver/commitweave) • [GitHub](https://github.com/GLINCKER/commitweave) • [Issues](https://github.com/GLINCKER/commitweave/issues)

</div>