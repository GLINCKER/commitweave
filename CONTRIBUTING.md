# Contributing to CommitWeave 🧶

We love your input! We want to make contributing to CommitWeave as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Quick Start for Contributors

### Prerequisites

- **Node.js**: ≥ 18.0.0
- **npm**: Latest version recommended
- **Git**: For version control
- **VS Code**: Recommended for extension development

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR-USERNAME/commitweave.git
cd commitweave
```

### 2. Setup Development Environment

```bash
# Install dependencies
npm install

# Install dependencies for VS Code extension
cd vscode-extension && npm install && cd ..

# Build the project
npm run build

# Run tests to ensure everything works
npm test
```

### 3. Make Your Changes

```bash
# Create a feature branch
git checkout -b feature/your-amazing-feature

# Make your changes...

# Use CommitWeave to commit your changes 🎉
npx tsx bin/index.ts
# or if globally installed: commitweave
```

## 📋 Development Workflow

### Branch Naming Convention

- `feature/your-feature-name` - New features
- `bugfix/issue-description` - Bug fixes
- `docs/what-you-changed` - Documentation changes
- `refactor/component-name` - Code refactoring
- `test/what-youre-testing` - Test improvements

### Commit Message Format

We use **Conventional Commits** (and our own tool for this! 🎉):

```bash
# Use CommitWeave itself for commits
npm start
# or manually follow conventional format:
# type(scope): description
```

**Examples:**
```
feat(cli): add new AI provider support
fix(git): resolve staging issue on Windows
docs(readme): update installation instructions
test(core): add unit tests for CommitBuilder
refactor(utils): simplify configuration loading
```

### Making Changes

1. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards
3. **Write or update tests** for your changes
4. **Update documentation** if needed
5. **Test your changes**:
   ```bash
   npm test
   npm run typecheck
   npm run build
   ```

6. **Commit using CommitWeave**:
   ```bash
   npm start
   ```

## 📁 Project Structure

```
commitweave/
├── src/                          # Core CLI source code
│   ├── cli/                      # Interactive CLI workflows
│   │   ├── createCommitFlow.ts   # Main commit creation flow
│   │   ├── flags.ts              # Command-line flag parsing
│   │   └── commands/             # Configuration management
│   │       ├── exportConfig.ts   # Export configuration
│   │       ├── importConfig.ts   # Import configuration
│   │       ├── listConfig.ts     # List current config
│   │       ├── resetConfig.ts    # Reset to defaults
│   │       └── doctorConfig.ts   # Health diagnostics
│   ├── core/                     # Core business logic
│   │   └── commitBuilder.ts      # Fluent commit builder
│   ├── types/                    # TypeScript definitions
│   │   ├── config.ts             # Configuration interfaces
│   │   └── ai.ts                 # AI provider types & errors
│   ├── utils/                    # Utility functions
│   │   ├── ai.ts                 # AI integration
│   │   ├── git.ts                # Git operations
│   │   ├── configStore.ts        # Configuration management
│   │   ├── configDiff.ts         # Configuration diffing
│   │   └── errorHandler.ts       # Centralized error handling
│   ├── config/                   # Default configurations
│   │   └── defaultConfig.ts      # Default commit types & settings
│   └── ui/                       # User interface components
│       └── banner.ts             # ASCII art and branding
├── bin/                          # CLI entry points
│   └── index.ts                  # Main entry point (23ms cold-start)
├── vscode-extension/             # VS Code Extension
│   ├── src/
│   │   ├── extension.ts          # Extension activation/commands
│   │   ├── commands/             # Command implementations
│   │   │   ├── createCommit.ts   # CLI integration
│   │   │   ├── aiCommit.ts       # AI-powered commits
│   │   │   ├── quickCommit.ts    # Native quick commits
│   │   │   ├── validateCommit.ts # Commit validation
│   │   │   └── configure.ts      # Settings panel
│   │   ├── utils/                # Extension utilities
│   │   │   ├── gitUtils.ts       # Git operations
│   │   │   └── commitValidator.ts# Message validation
│   │   └── webview/              # Settings panel UI
│   │       ├── panel.ts          # Webview provider
│   │       └── ui.html           # HTML interface
│   └── package.json              # Extension manifest
├── scripts/                      # Development scripts
│   ├── bench.ts                  # Performance benchmarking
│   └── test-*.ts                 # Various testing utilities
├── tests/                        # Test suite
│   ├── anthropic.spec.ts         # AI provider tests
│   ├── config.spec.ts            # Configuration tests
│   └── perf.spec.ts              # Performance tests
├── docs/                         # Documentation
└── .github/                      # GitHub configuration
    └── workflows/                # CI/CD pipelines
```

## 🧪 Testing Instructions

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration

# Test the CLI locally
npx tsx bin/index.ts

# Test specific functionality
npx tsx scripts/test-local.ts
npx tsx scripts/test-cli-functions.ts

# Performance benchmarking
npm run bench
```

### Test Coverage

We aim for high test coverage. When adding new features:

1. **Write unit tests** for core logic
2. **Add integration tests** for CLI workflows  
3. **Test error scenarios** and edge cases
4. **Update existing tests** if behavior changes

### Testing VS Code Extension

```bash
# Build extension
cd vscode-extension && npm run build

# Package extension for testing
npm run package

# Manual testing in VS Code:
# 1. Press F5 to launch Extension Development Host
# 2. Test commands via Command Palette
# 3. Check status bar integration
# 4. Test settings webview functionality
```

## 🎯 How to Add Commit Types

Adding new commit types is straightforward and helps customize CommitWeave for different workflows.

### 1. Update Default Configuration

Edit `src/config/defaultConfig.ts`:

```typescript
// src/config/defaultConfig.ts
export const defaultCommitTypes: CommitType[] = [
  // ... existing types
  {
    type: 'security',           // The commit type
    emoji: '🔒',               // Associated emoji
    description: 'Security improvements', // Description for users
    aliases: ['sec', 'secure'] // Optional aliases
  }
];
```

### 2. Add Validation (if needed)

If your commit type needs special validation, update `src/utils/validation.ts`:

```typescript
// Add specific validation rules if needed
export function validateCommitType(type: string): boolean {
  const validTypes = ['feat', 'fix', 'docs', 'security', /* ... */];
  return validTypes.includes(type);
}
```

### 3. Update Type Definitions

Ensure TypeScript knows about your new type in `src/types/config.ts`:

```typescript
export interface CommitType {
  type: string;
  emoji: string;
  description: string;
  aliases?: string[];
}
```

### 4. Add Tests

Create tests in `tests/config.spec.ts`:

```typescript
describe('custom commit types', () => {
  it('should validate security commit type', () => {
    const result = validateCommitMessage('security: 🔒 improve password hashing');
    expect(result.isValid).toBe(true);
  });

  it('should support security type aliases', () => {
    const result = validateCommitMessage('sec: 🔒 fix XSS vulnerability');
    expect(result.isValid).toBe(true);
  });
});
```

### 5. Update Documentation

Add your new commit type to:
- `README.md` commit types table
- Any relevant documentation

## 🤖 How to Add AI Providers

CommitWeave supports multiple AI providers. Here's how to add a new one:

### 1. Define Provider Interface

Add your provider to `src/types/ai.ts`:

```typescript
// src/types/ai.ts
export interface YourAIProvider extends AIProvider {
  name: 'your-provider';
  apiKey: string;
  model?: string;
  maxTokens?: number;
  // Add provider-specific config options
}

// Add custom error classes
export class YourProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'YourProviderError';
  }
}

export class YourProviderRateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'YourProviderRateLimitError';
  }
}
```

### 2. Implement Provider Class

Create the provider implementation in `src/utils/ai.ts`:

```typescript
// src/utils/ai.ts
class YourAIProvider implements AIProvider {
  constructor(private config: YourProviderConfig) {}

  async generateCommitMessage(diff: string): Promise<string> {
    try {
      // Make API request to your AI provider
      const response = await fetch('https://api.yourprovider.com/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: this.buildPrompt(diff),
          model: this.config.model || 'your-default-model',
          max_tokens: this.config.maxTokens || 150
        })
      });

      if (!response.ok) {
        throw this.handleError(response);
      }

      const data = await response.json();
      return this.parseResponse(data);
      
    } catch (error) {
      throw this.mapError(error);
    }
  }

  private buildPrompt(diff: string): string {
    return `Generate a conventional commit message for these changes:\n\n${diff}`;
  }

  private parseResponse(data: any): string {
    // Parse your provider's response format
    return data.message || data.text || data.completion;
  }

  private handleError(response: Response): Error {
    if (response.status === 429) {
      return new YourProviderRateLimitError();
    }
    if (response.status === 401) {
      return new YourProviderError('Invalid API key');
    }
    return new YourProviderError(`API error: ${response.status}`);
  }

  private mapError(error: any): Error {
    if (error instanceof YourProviderError) {
      return error;
    }
    return new YourProviderError(`Unexpected error: ${error.message}`);
  }
}
```

### 3. Register Provider

Add your provider to the factory function:

```typescript
// src/utils/ai.ts
export function createAIProvider(config: AIConfig): AIProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'your-provider':
      return new YourAIProvider(config);
    case 'mock':
      return new MockAIProvider();
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}
```

### 4. Update Configuration Schema

Add your provider to the configuration types in `src/types/config.ts`:

```typescript
// src/types/config.ts
export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'your-provider' | 'mock';
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  // Add provider-specific fields
  yourProviderSpecificField?: string;
}
```

### 5. Update Error Handling

Add error handling to `src/utils/errorHandler.ts`:

```typescript
// src/utils/errorHandler.ts
export function handleAIError(error: Error): never {
  if (error instanceof YourProviderRateLimitError) {
    console.error(chalk.red('Rate limit exceeded. Please try again later.'));
    console.log(chalk.gray('Tip: Consider upgrading your API plan or using a different provider.'));
  } else if (error instanceof YourProviderError) {
    console.error(chalk.red(`Your Provider Error: ${error.message}`));
    console.log(chalk.gray('Tip: Check your API key configuration in glinr-commit.json'));
  }
  // ... handle other errors
  
  process.exit(1);
}
```

### 6. Add Configuration to VS Code Extension

Update the VS Code extension to support your provider in `vscode-extension/src/webview/ui.html`:

```html
<!-- Add option to AI provider dropdown -->
<select id="aiProvider">
  <option value="openai">OpenAI (GPT models)</option>
  <option value="anthropic">Anthropic (Claude models)</option>
  <option value="your-provider">Your Provider</option>
  <option value="mock">Mock Provider (for testing)</option>
</select>
```

### 7. Write Comprehensive Tests

Create tests in `tests/your-provider.spec.ts`:

```typescript
// tests/your-provider.spec.ts
import { YourAIProvider, YourProviderError, YourProviderRateLimitError } from '../src/utils/ai';

describe('YourAIProvider', () => {
  let provider: YourAIProvider;
  
  beforeEach(() => {
    provider = new YourAIProvider({
      provider: 'your-provider',
      apiKey: 'test-key',
      model: 'test-model'
    });
  });

  describe('generateCommitMessage', () => {
    it('should generate commit message from diff', async () => {
      // Mock successful API response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'feat: add new feature' })
      });

      const result = await provider.generateCommitMessage('+ new feature code');
      expect(result).toBe('feat: add new feature');
    });

    it('should handle rate limit errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 429
      });

      await expect(provider.generateCommitMessage('diff'))
        .rejects
        .toThrow(YourProviderRateLimitError);
    });

    it('should handle authentication errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401
      });

      await expect(provider.generateCommitMessage('diff'))
        .rejects
        .toThrow('Invalid API key');
    });
  });
});
```

### 8. Update Documentation

Document your new provider:

1. **README.md**: Add to the AI providers section
2. **Configuration docs**: Add provider-specific config examples
3. **Error handling**: Document common error scenarios

### Example Provider Configuration

Users can then configure your provider in `glinr-commit.json`:

```json
{
  "version": "1.0",
  "ai": {
    "provider": "your-provider",
    "apiKey": "your-api-key-here",
    "model": "your-preferred-model",
    "maxTokens": 150,
    "yourProviderSpecificField": "custom-value"
  }
}
```

## 📝 Code Style Guidelines

### TypeScript Standards

- **Strict TypeScript** - All code must be properly typed
- **No `any` types** - Use proper type definitions
- **ESLint compliance** - Follow our linting rules
- **Prettier formatting** - Code will be auto-formatted

### Code Structure

- **Single Responsibility** - Functions and classes should have one clear purpose
- **Descriptive Naming** - Use clear, self-documenting names
- **Error Handling** - Provide helpful error messages
- **Documentation** - Document complex logic with comments

### Performance Considerations

CommitWeave prioritizes **fast startup times**:
- Use **lazy loading** for heavy dependencies
- Minimize **startup overhead**
- Profile **cold-start performance** with `npm run bench`

## 🎨 VS Code Extension Development

### Extension-Specific Setup

```bash
cd vscode-extension
npm install
npm run build

# Test extension
code . # Opens VS Code
# Press F5 to launch Extension Development Host
```

### Extension Guidelines

- **Follow VS Code standards** - Use official guidelines
- **Test in both themes** - Dark and light mode compatibility
- **Webview security** - Follow CSP and security best practices
- **Publisher compliance** - Ensure marketplace standards

## 🐛 Reporting Bugs

### Before Reporting

1. **Search existing issues** - Someone might have already reported it
2. **Try the latest version** - The bug might already be fixed
3. **Check documentation** - Make sure it's actually a bug

### Bug Report Template

**Use our issue template** or include:

- **OS and version** (Windows 11, macOS 13, Ubuntu 22.04)
- **Node.js version** (`node --version`)
- **CommitWeave version** (`commitweave --version`)
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Error messages** (full stack traces if available)
- **Configuration files** (sanitized, no API keys)

## 💡 Suggesting Features

### Feature Request Guidelines

- **Search existing requests** - Avoid duplicates
- **Explain the problem** your feature would solve
- **Describe your proposed solution**
- **Consider alternative approaches**
- **Think about implementation complexity**

### Feature Request Template

- **Problem Description** - What issue does this solve?
- **Proposed Solution** - How should it work?
- **Alternatives** - Other ways to solve this?
- **Use Cases** - Who benefits from this feature?
- **Implementation Notes** - Technical considerations

## 📖 Documentation Contributions

### Areas That Need Documentation

- **Installation guides** for different platforms
- **Configuration examples** for various workflows
- **Integration tutorials** with popular tools
- **Troubleshooting guides** for common issues
- **API documentation** for programmatic usage

### Documentation Standards

- **Clear examples** - Show, don't just tell
- **Step-by-step instructions** - Easy to follow
- **Screenshots/GIFs** where helpful
- **Multiple platforms** - Consider Windows, macOS, Linux
- **Beginner-friendly** - Assume minimal prior knowledge

## 🔍 Code Review Process

### What to Expect

1. **Automated checks** must pass (tests, linting, build)
2. **Manual review** by maintainers
3. **Feedback and iterations** - We'll work together to improve your PR
4. **Approval and merge** once everything looks good

### Review Criteria

- **Functionality** - Does it work as expected?
- **Code Quality** - Is it clean, readable, and maintainable?
- **Performance** - Does it maintain our performance standards?
- **Tests** - Are there adequate tests for the changes?
- **Documentation** - Are docs updated if needed?
- **Breaking Changes** - Are they necessary and well-documented?

## 🏆 Recognition

### Contributors

All contributors are recognized in our:
- **README.md** contributors section
- **CHANGELOG.md** for significant contributions  
- **GitHub contributors** page
- **Social media** shout-outs for major features

### Maintainers

Active contributors may be invited to become maintainers with:
- **Commit access** to the repository
- **Issue triage** responsibilities  
- **PR review** privileges
- **Release management** participation

## 📞 Getting Help

### Communication Channels

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Email** - support@glincker.com for private matters

### Response Times

- **Issues** - We aim to respond within 48 hours
- **Pull Requests** - Initial review within 1 week
- **Security Issues** - Within 24 hours (see SECURITY.md)

## 📜 Legal

### License Agreement

By contributing to CommitWeave, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

### Developer Certificate of Origin

We require all contributors to sign off on their commits, certifying that they have the right to submit their contribution under our open source license.

Add `-s` to your git commits:
```bash
git commit -s -m "your commit message"
```

## 🎉 Thank You!

Your contributions make CommitWeave better for everyone. Whether you're fixing a typo, reporting a bug, or adding a major feature, every contribution matters.

**Happy coding! 🧶✨**

---

**Maintained by GLINR STUDIOS**  
**Questions?** Open an issue or email support@glincker.com