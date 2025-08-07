# Getting Help with CommitWeave

## 🆘 Need Help?

We're here to help you get the most out of CommitWeave! This guide will direct you to the right resources for your specific needs.

## 🚀 Quick Start Issues

### Installation Problems
**First time installing CommitWeave?**

1. **Check Prerequisites**:
   ```bash
   node --version  # Should be >= 18.0.0
   npm --version   # Should be >= 8.0.0
   git --version   # Any recent version
   ```

2. **Common Installation Fixes**:
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Install with verbose logging
   npm install -g @typeweaver/commitweave --verbose
   
   # Alternative: Use npx
   npx @typeweaver/commitweave --version
   ```

3. **Permission Issues** (macOS/Linux):
   ```bash
   # Fix npm global permissions
   sudo chown -R $(whoami) ~/.npm-global
   npm config set prefix '~/.npm-global'
   ```

### VS Code Extension Issues
**Extension not working properly?**

1. **Verify Extension Installation**:
   - Open VS Code Extensions (Ctrl+Shift+X)
   - Search "CommitWeave" and ensure it's installed
   - Check for any error notifications

2. **CLI Detection Issues**:
   ```bash
   # Test CLI availability
   commitweave --version
   # Or try with npx
   npx @typeweaver/commitweave --version
   ```

3. **Restart Required**:
   - Restart VS Code after installing the CLI
   - Reload window: Ctrl+Shift+P → "Developer: Reload Window"

## 📚 Documentation & Guides

### 📖 Official Documentation
- **Main README**: [https://github.com/GLINCKER/commitweave](https://github.com/GLINCKER/commitweave)
- **Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **VS Code Extension**: [vscode-extension/README.md](vscode-extension/README.md)
- **Security Policy**: [SECURITY.md](SECURITY.md)

### 🎥 Tutorials & Examples
- **Getting Started**: Step-by-step setup guide in main README
- **Configuration Examples**: Various config scenarios
- **AI Integration**: Setting up OpenAI/Anthropic providers
- **Team Workflows**: Best practices for teams

## 🐛 Reporting Issues

### Before You Report
**Please try these steps first:**

1. **Update to Latest Version**:
   ```bash
   npm update -g @typeweaver/commitweave
   # Check VS Code extension for updates too
   ```

2. **Check Existing Issues**: 
   - Search [GitHub Issues](https://github.com/GLINCKER/commitweave/issues)
   - Look for similar problems and solutions

3. **Clear Configuration**:
   ```bash
   # Test with default settings
   commitweave --help
   ```

### 🎯 Where to Report

| Issue Type | Where to Go | Response Time |
|------------|-------------|---------------|
| **🐛 Bugs** | [GitHub Issues](https://github.com/GLINCKER/commitweave/issues/new?template=bug_report.md) | 2-3 days |
| **💡 Feature Requests** | [GitHub Issues](https://github.com/GLINCKER/commitweave/issues/new?template=feature_request.md) | 1 week |
| **❓ Questions** | [GitHub Discussions](https://github.com/GLINCKER/commitweave/discussions) | 1-2 days |
| **🔒 Security Issues** | [security@glincker.com](mailto:security@glincker.com) | 24 hours |

### 📋 What to Include
**Help us help you by providing:**

- **CommitWeave version**: `commitweave --version`
- **Node.js version**: `node --version`
- **Operating System**: Windows 11, macOS 13, Ubuntu 22.04, etc.
- **Error messages**: Full stack traces if available
- **Steps to reproduce**: What you did before the issue occurred
- **Expected vs Actual behavior**: What should happen vs what happened

## 💬 Community Support

### GitHub Discussions
**Best for**: Questions, feature discussions, sharing tips
- **Q&A**: Get help from the community
- **Ideas**: Discuss potential features
- **Show & Tell**: Share your CommitWeave setups

**Visit**: [https://github.com/GLINCKER/commitweave/discussions](https://github.com/GLINCKER/commitweave/discussions)

### Community Guidelines
- **Be respectful** and helpful to other users
- **Search first** before posting duplicate questions
- **Provide context** when asking for help
- **Share solutions** when you figure things out

## 📧 Direct Support

### Email Support
**For private or urgent matters:**
- **General Support**: [support@glincker.com](mailto:support@glincker.com)
- **Security Issues**: [security@glincker.com](mailto:security@glincker.com)
- **Business Inquiries**: [contact@glincker.com](mailto:contact@glincker.com)

### Response Times
- **Security Issues**: < 24 hours
- **General Support**: 1-3 business days
- **GitHub Issues/Discussions**: 1-7 days (varies by complexity)

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### "Command not found: commitweave"
```bash
# Solution 1: Check PATH
echo $PATH | grep npm

# Solution 2: Use npx
npx @typeweaver/commitweave

# Solution 3: Reinstall globally  
npm install -g @typeweaver/commitweave
```

#### "No git repository found"
```bash
# Make sure you're in a git repository
git status

# Initialize if needed
git init
```

#### "No staged changes"
```bash
# Stage your changes first
git add .
# Or stage specific files
git add filename.js
```

#### VS Code Extension "CLI not available"
1. Install CLI globally: `npm install -g @typeweaver/commitweave`
2. Restart VS Code
3. Check VS Code's integrated terminal can run: `commitweave --version`

#### AI Provider Issues
```bash
# Check your API key is set
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY

# Test with mock provider
commitweave --ai-provider mock
```

### Performance Issues
**CommitWeave is slow?**
1. **Check startup time**: `time commitweave --version`
2. **Clear npm cache**: `npm cache clean --force`
3. **Update Node.js** to latest LTS version
4. **Check network connectivity** for AI features

## 🎓 Learning Resources

### For Beginners
- **Git Basics**: Learn git fundamentals first
- **Conventional Commits**: Understanding the commit format standard
- **Command Line**: Basic terminal/command prompt usage

### For Advanced Users
- **Configuration**: Custom commit rules and emoji settings
- **AI Integration**: Setting up and optimizing AI providers
- **Team Setup**: Configuring CommitWeave for team workflows
- **CI/CD Integration**: Using CommitWeave in automated workflows

## 🏢 Enterprise Support

### Team Setup
Need help setting up CommitWeave for your team?
- **Configuration advice** for team standards
- **Best practices** for large codebases
- **Integration guidance** with existing workflows

### Custom Development
For custom integrations or features:
- Contact [business@glincker.com](mailto:business@glincker.com)
- Describe your specific needs
- We'll discuss options and pricing

## 🔄 Support Process

### What to Expect
1. **Acknowledgment**: We'll confirm we received your request
2. **Investigation**: We'll reproduce and analyze the issue
3. **Updates**: Regular communication on progress
4. **Resolution**: Fix, workaround, or explanation
5. **Follow-up**: Ensure the solution works for you

### Priority Levels
- **🚨 Critical**: Security issues, data loss
- **🔴 High**: Major features broken, blocking work
- **🟡 Medium**: Minor issues, workarounds available
- **🟢 Low**: Enhancement requests, minor bugs

## 🙏 Contributing to Support

### Help Others
- **Answer questions** in GitHub Discussions
- **Improve documentation** with your learnings
- **Share solutions** you discover
- **Report issues** you encounter

### Improve This Guide
Found something missing from this support guide?
- **Open an issue** with suggestions
- **Submit a PR** with improvements
- **Email us** with feedback

---

**🧶✨ We're here to help you succeed with CommitWeave!**

**Maintained by GLINR STUDIOS**  
**Primary Support**: [support@glincker.com](mailto:support@glincker.com)  
**Community**: [GitHub Discussions](https://github.com/GLINCKER/commitweave/discussions)