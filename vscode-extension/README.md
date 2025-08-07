<!-- Extension branding will be added here by setup:branding script -->

# CommitWeave VS Code Extension

<div align="center">

Smart, structured, and beautiful git commits with AI assistance - directly from VS Code!

**Developed & Published by GLINR STUDIOS • @glincker**

</div>

## Features

### 🚀 Core Commands

- **CommitWeave: Create Commit** - Launch the interactive commit builder in the integrated terminal
- **CommitWeave: AI Commit** - Generate AI-powered commit messages based on your staged changes  
- **CommitWeave: Configure** - Open the settings panel to customize your preferences

### ⚙️ Settings Panel

The configuration webview provides:

- **Repository Status**: Real-time monitoring of git repository, staged files, and CLI availability
- **Emoji Settings**: Enable/disable emoji integration in commit messages
- **AI Provider**: Choose between OpenAI, Anthropic, or mock providers
- **Dark Mode**: Automatically adapts to VS Code's theme

### 🤖 AI Integration

Supports multiple AI providers:
- OpenAI GPT models for intelligent commit message generation
- Anthropic Claude models for detailed commit analysis
- Mock provider for testing and development

## Quick Start

1. **Install the Extension**: Search for "CommitWeave" in the VS Code marketplace
2. **Install CLI**: Run `npm install -g @typeweaver/commitweave` 
3. **Stage Changes**: Use `git add .` or stage files in VS Code's Source Control panel
4. **Create Commit**: Open Command Palette (`Ctrl+Shift+P`) → "CommitWeave: Create Commit"

## Requirements

- VS Code 1.80.0 or higher
- Git repository
- CommitWeave CLI (installed globally or available via npx)

## Extension Settings

This extension contributes the following settings:

- `commitweave.emojiEnabled`: Enable emoji in commit messages (default: `true`)
- `commitweave.aiProvider`: AI provider selection (`openai` | `anthropic` | `mock`, default: `openai`)

## Commands

- `commitweave.create`: Launch interactive commit creation
- `commitweave.ai`: Generate AI-powered commit message
- `commitweave.configure`: Open settings panel

## Installation Methods

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "CommitWeave"
4. Click Install

### From VSIX File
1. Download the `.vsix` file from releases
2. In VS Code: View → Command Palette → "Extensions: Install from VSIX..."
3. Select the downloaded file

## CLI Installation

The extension requires the CommitWeave CLI:

```bash
# Global installation (recommended)
npm install -g @typeweaver/commitweave

# Or use npx (the extension will detect this automatically)
npx @typeweaver/commitweave --version
```

## Troubleshooting

### CLI Not Found
If you see "CLI not found" errors:
1. Install globally: `npm install -g @typeweaver/commitweave`
2. Or ensure npx is available: `npm install -g npx`
3. Check PATH includes npm global bin directory

### No Git Repository
Make sure you're working in a git repository:
```bash
git init  # Initialize if needed
```

### No Staged Changes  
Stage your changes before creating commits:
```bash
git add .  # Stage all changes
# Or use VS Code's Source Control panel
```

## Development

To set up the extension for development:

```bash
# Clone the repository
git clone https://github.com/GLINCKER/commitweave.git
cd commitweave/vscode-extension

# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Package
npm run package
```

## Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/GLINCKER/commitweave/blob/main/CONTRIBUTING.md) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/GLINCKER/commitweave/issues)
- **Documentation**: [CommitWeave Docs](https://github.com/GLINCKER/commitweave#readme)
- **Community**: [GLINR STUDIOS](https://glinr.com)
- **Email**: [support@glincker.com](mailto:support@glincker.com)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**🏢 Developed & Maintained by GLINR STUDIOS**  
**📦 Published by @glincker**  
**🧶✨ Part of the CommitWeave ecosystem**