# Security Policy

## 🛡️ CommitWeave Security

Security is a top priority for CommitWeave. We take all security concerns seriously and appreciate the community's help in identifying and resolving potential vulnerabilities.

## 🚨 Reporting Security Vulnerabilities

### 📧 How to Report
**DO NOT** create public GitHub issues for security vulnerabilities. Instead:

**Primary**: Email [security@glincker.com](mailto:security@glincker.com)  
**Backup**: Email [support@glincker.com](mailto:support@glincker.com) with "SECURITY" in the subject

### 📋 What to Include
Please provide as much information as possible:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Affected versions** of CommitWeave
- **Environment details** (OS, Node.js version, etc.)
- **Potential impact** assessment
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up

### 🔒 Confidentiality
We are committed to:
- **Acknowledging** your report within **24 hours**
- **Providing regular updates** on our progress
- **Keeping your report confidential** until a fix is released
- **Crediting you** appropriately (if you wish) in our security advisories

## 🎯 Supported Versions

Security updates are provided for the following versions:

| Version | Supported          | End of Life |
| ------- | ------------------ | ----------- |
| 0.1.x   | ✅ Full support    | TBD         |
| < 0.1   | ❌ No support      | Immediate   |

**VS Code Extension**:
| Version | Supported          | End of Life |
| ------- | ------------------ | ----------- |
| Latest  | ✅ Full support    | -           |
| Previous| ⚠️ Critical only   | 6 months    |

## 🔍 Security Considerations

### 🔑 API Keys & Secrets
CommitWeave handles sensitive information including:
- **AI provider API keys** (OpenAI, Anthropic)
- **Git repository access**
- **Configuration files**

**We Never**:
- Log or store API keys
- Transmit keys to unauthorized endpoints  
- Include keys in error messages or debug output
- Commit keys to repositories

**Users Should**:
- Store API keys in secure environment variables
- Use key rotation best practices
- Review configuration files before sharing
- Report any key exposure immediately

### 🌐 Network Security
CommitWeave makes network requests to:
- **AI provider APIs** (OpenAI, Anthropic)
- **Git remote repositories**
- **npm registry** (for updates)

**Security Measures**:
- All API calls use HTTPS
- Certificate pinning where applicable
- Request validation and sanitization
- Timeout and retry limits

### 💻 Local Security
**File System Access**:
- Read access to git repository and configuration
- Write access only to generated commit messages
- No modification of source code or sensitive files

**Process Security**:
- No arbitrary command execution
- Sandboxed execution environment
- Input validation and sanitization

### 🔌 VS Code Extension Security
**Extension Permissions**:
- File system access (repository directory)
- Terminal access (for CLI integration)
- Configuration storage
- Webview content security policy (CSP)

**Security Controls**:
- CSP headers prevent XSS in webviews
- No remote code execution
- Limited VS Code API surface
- Secure inter-process communication

## ⚡ Response Timeline

### Acknowledgment
- **< 24 hours**: Initial response confirming receipt
- **< 48 hours**: Initial assessment and severity classification

### Investigation  
- **Critical**: Fix within 1-3 days
- **High**: Fix within 1 week
- **Medium**: Fix within 2 weeks  
- **Low**: Fix in next regular release

### Disclosure
- **Coordinated disclosure** with reporter
- **Public advisory** after fix is released
- **CVE assignment** for qualifying vulnerabilities

## 🏆 Security Hall of Fame

We recognize security researchers who help improve CommitWeave:

<!-- Security researchers will be listed here -->
*No reports yet - be the first to help us improve security!*

## 🔄 Security Updates

### Update Notifications
- **Critical/High**: Immediate notification via GitHub Security Advisories
- **Medium/Low**: Included in regular release notes
- **All**: Email notifications to security@glincker.com subscribers

### Patching Strategy
- **Patch releases** (0.1.1, 0.1.2) for security fixes
- **Automated updates** encouraged for security patches
- **Backwards compatibility** maintained when possible

## 📚 Security Best Practices

### For Users
1. **Keep Updated**: Use the latest version of CommitWeave
2. **Secure API Keys**: Use environment variables, never commit keys
3. **Review Configurations**: Check settings before sharing
4. **Network Security**: Use secure networks for API calls
5. **Report Issues**: Notify us of any suspicious behavior

### For Contributors
1. **Secure Development**: Follow secure coding practices
2. **Dependency Management**: Regular security audits of dependencies
3. **Code Review**: Security-focused PR reviews
4. **Testing**: Include security test cases
5. **Documentation**: Clear security guidance in docs

## 🔧 Security Tools & Automation

### Automated Security Scanning
- **npm audit**: Dependency vulnerability scanning
- **GitHub Security Advisories**: Automated vulnerability detection
- **Code Analysis**: Static analysis for common vulnerabilities
- **Supply Chain**: Package integrity verification

### Manual Security Reviews
- **Code audits** for sensitive functionality
- **Penetration testing** for the VS Code extension
- **Configuration reviews** for secure defaults
- **Documentation reviews** for security guidance

## 📞 Contact Information

### Security Team
- **Email**: [security@glincker.com](mailto:security@glincker.com)
- **Response Time**: < 24 hours
- **GPG Key**: Available upon request

### General Support  
- **Email**: [support@glincker.com](mailto:support@glincker.com)
- **GitHub Issues**: For non-security bugs only
- **Documentation**: [GitHub Repository](https://github.com/GLINCKER/commitweave)

## 📝 Legal & Compliance

### Responsible Disclosure
We follow responsible disclosure practices:
- **90-day disclosure timeline** (negotiable for complex issues)
- **Coordination with reporters** throughout the process
- **Public recognition** for responsible reporters
- **No legal action** against good-faith security researchers

### Compliance
CommitWeave is designed to comply with:
- **OWASP Top 10** security guidelines
- **Common security standards** for developer tools
- **Privacy regulations** regarding data handling
- **Open source security** best practices

---

**🔒 Security is everyone's responsibility. Thank you for helping keep CommitWeave secure! 🧶✨**

**Maintained by GLINR STUDIOS**  
**Security Contact**: [security@glincker.com](mailto:security@glincker.com)