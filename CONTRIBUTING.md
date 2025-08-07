# Contributing to CommitWeave 🧶

First off, thank you for considering contributing to CommitWeave! It's people like you that make CommitWeave such a great tool for developers worldwide.

## 🎯 How Can You Contribute?

There are many ways to contribute to CommitWeave:

- 🐛 **Report bugs** - Help us identify and fix issues
- 💡 **Suggest features** - Share ideas for new functionality
- 📝 **Improve documentation** - Help others understand and use CommitWeave
- 🔧 **Submit code changes** - Fix bugs or implement new features
- 🧪 **Write tests** - Improve our test coverage
- 🎨 **Design improvements** - Enhance the user experience
- 🌍 **Translate** - Help make CommitWeave accessible worldwide

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **Git** for version control
- **TypeScript** knowledge (helpful but not required)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/commitweave.git
   cd commitweave
   ```

3. **Install dependencies**:
   ```bash
   npm install
   cd vscode-extension && npm install && cd ..
   ```

4. **Build the project**:
   ```bash
   npm run build
   ```

5. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

6. **Test the CLI** locally:
   ```bash
   npm start
   # or
   node dist/bin.js
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

## 🧪 Testing Guidelines

### Running Tests
```bash
# Run all tests
npm test

# Run specific test categories
npm run test:local
npm run test:cli
npm run test:perf

# Run VS Code extension tests
cd vscode-extension && npm test
```

### Writing Tests

- **Unit tests** for utilities and core logic
- **Integration tests** for CLI workflows
- **Performance tests** for critical paths
- **Extension tests** for VS Code integration

Test files should be placed in:
- `tests/` for main CLI tests
- `vscode-extension/test/` for extension tests

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