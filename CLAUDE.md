# CommitWeave - Claude Development Context Cache

This file provides comprehensive context for Claude AI sessions working on the CommitWeave project.

## 🎯 Project Overview

**CommitWeave** is a modern CLI tool for creating smart, structured, and beautiful git commit messages with emoji support, conventional commit rules, AI-powered summaries, and built-in hooks.

### Key Details
- **Version**: 1.0.3
- **Package**: @typeweaver/commitweave
- **Language**: TypeScript (100%)
- **Runtime**: Node.js >= 18.0.0
- **License**: MIT
- **Publisher**: GLINR STUDIOS (@typeweaver)
- **Branch**: develop (active development)
- **Main Branch**: main (stable releases)

## 🏗️ Architecture Summary

CommitWeave follows a clean, modular architecture with the following layers:

1. **CLI Layer** (`bin/index.ts`, `bin/index.cjs.ts`) - Command parsing, menu system, branding
2. **UI Layer** (`src/ui/banner.ts`) - Visual elements, animations, colors  
3. **Core Logic** (`src/core/`, `src/cli/`) - Commit building, flow management
4. **AI Integration** (`src/utils/ai.ts`) - OpenAI, Anthropic, Mock providers with typed errors
5. **Git Operations** (`src/utils/git.ts`) - Repository operations, staging, committing
6. **Configuration** (`src/config/`, `src/types/`) - Config management, type safety
7. **Configuration Management** (`src/cli/commands/`) - Export/import/list/reset/doctor commands
8. **Error Handling** (`src/utils/errorHandler.ts`) - Centralized user-friendly error handling
9. **Configuration Storage** (`src/utils/configStore.ts`, `src/utils/configDiff.ts`) - Config persistence and diffing

## 📁 Directory Structure

```
commitweave/
├── bin/                    # CLI entry points
│   └── index.ts           # Optimized CLI entry point (23ms cold-start)
├── src/
│   ├── cli/               # Interactive workflows
│   │   ├── createCommitFlow.ts      # Interactive commit creation
│   │   ├── flags.ts                 # Performance flag parsing
│   │   └── commands/                # Configuration management commands
│   │       ├── exportConfig.ts      # Export configuration
│   │       ├── importConfig.ts      # Import and merge configuration
│   │       ├── listConfig.ts        # Display configuration
│   │       ├── resetConfig.ts       # Reset to defaults
│   │       └── doctorConfig.ts      # Configuration health check
│   ├── config/            # Default configurations
│   ├── core/              # Core business logic
│   ├── types/             # TypeScript definitions
│   │   └── ai.ts          # AI provider types and custom error classes
│   ├── ui/                # User interface components
│   ├── utils/             # Utilities (git, ai)
│   │   ├── ai.ts          # AI integration with enhanced error handling
│   │   ├── configStore.ts  # Configuration loading and saving
│   │   ├── configDiff.ts   # Configuration diffing and secret stripping
│   │   ├── errorHandler.ts # Centralized error handling
│   │   ├── lazyImport.ts   # Lazy loading utilities
│   │   └── perf.ts         # Performance tracking
│   └── index.ts           # Library exports
├── vscode-extension/       # VS Code Extension (Enhanced)
│   ├── package.json       # Extension manifest (publisher: glincker)
│   ├── src/
│   │   ├── extension.ts   # Extension activation/deactivation with all commands
│   │   ├── commands/      # VS Code command implementations
│   │   │   ├── createCommit.ts  # CLI integration for commits
│   │   │   ├── aiCommit.ts      # CLI integration for AI commits
│   │   │   ├── quickCommit.ts   # Native VS Code quick commit workflow
│   │   │   ├── validateCommit.ts # Commit message validation
│   │   │   └── configure.ts     # Settings webview launcher
│   │   ├── utils/         # Utilities and validation
│   │   │   └── commitValidator.ts # Conventional commit validation
│   │   └── webview/       # Enhanced settings panel
│   │       ├── panel.ts   # Tabbed webview with git integration
│   │       └── ui.html    # Enhanced UI with tabs and animations
│   └── test/              # Extension integration tests
├── scripts/               # Development and testing scripts
│   ├── bench.ts           # Performance benchmarking
│   ├── test-cross-platform.ts    # Cross-platform CLI testing
│   ├── test-ai-functionality.ts  # AI provider testing
│   ├── test-ai-fallback.ts       # AI fallback behavior testing
│   └── test-vscode-integration.ts # VS Code extension testing
├── docs/                  # Documentation
├── tests/                 # Test suite
│   ├── anthropic.spec.ts  # Claude provider tests
│   ├── config.spec.ts     # Configuration management tests
│   └── perf.spec.ts       # Performance utility tests
└── dist/                  # Built output
```

## ✨ Implemented Features

### Core Features ✅
- **Interactive CLI**: Beautiful prompts with animations and branding
- **Conventional Commits**: Full support with 11 predefined types
- **Smart Emojis**: Type-specific emoji integration with toggle
- **AI Integration**: OpenAI GPT, Anthropic Claude, Mock provider support
- **Git Operations**: Automatic staging, committing, status checking
- **Configuration**: JSON-based config with Zod validation
- **Validation**: Commit message format and length validation
- **TypeScript**: 100% type coverage with comprehensive interfaces

### Performance Optimizations (Latest) ✅
- **Ultra-fast Cold-start**: 23ms average startup time (13x better than 300ms target)
- **Lazy Loading**: Heavy dependencies loaded only when needed
- **Performance Tracking**: Gated behind `COMMITWEAVE_DEBUG_PERF` environment variable
- **Optimized Build System**: Proper module resolution and path mapping
- **Benchmarking**: `npm run bench` for repeatable performance validation

### VS Code Extension (Enhanced) ✅
- **Native Integration**: Seamless VS Code extension with Command Palette and Source Control support
- **Five Core Commands**: Create, AI, Quick Commit, Validate, and Configure
- **Enhanced Settings Panel**: Tabbed interface with Settings, Commit History, and Templates
- **Quick Commit Workflow**: Fast conventional commits with native VS Code UI
- **Real-time Validation**: Commit message validation with fix suggestions
- **Commit History Visualization**: View recent commits with validation status
- **Template System**: Pre-built commit templates with variable substitution
- **Source Control Integration**: Quick commit button directly in SCM panel
- **Professional theming**: Full VS Code theme integration with smooth animations
- **Git Integration**: Native git operations with spawn-based command execution
- **Repository Status**: Real-time monitoring of git repo, staged files, and CLI availability

### Configuration Management ✅
- **Export/Import**: Share configurations across projects and teams
- **Version Control**: Version-controlled configurations with backward compatibility
- **Secret Stripping**: Safe configuration export without sensitive data
- **Configuration Diffing**: Preview changes before importing configurations
- **Health Check**: Built-in diagnostics for configuration issues

### AI Providers ✅
- **OpenAI**: GPT models with configurable temperature and tokens
- **Anthropic**: Claude models with proper API integration and typed error handling
  - Rate limit error handling (ClaudeRateLimitError)
  - Validation error handling (ClaudeValidationError)
  - API error mapping and user-friendly messages
  - Support for Claude 3 models (Haiku, Sonnet, Opus)
- **Mock Provider**: Fallback for testing and demo purposes
- **Error Fallback**: Graceful degradation with informative error messages

### Commit Types ✅
```
feat ✨    fix 🐛     docs 📚    style 💎    refactor 📦
perf 🚀    test 🚨    build 🛠   ci ⚙️       chore ♻️    revert 🗑
```

## 🛠️ Technical Stack

### Dependencies
- **chalk**: Terminal styling and colors
- **enquirer**: Interactive CLI prompts
- **simple-git**: Git operations wrapper
- **zod**: Runtime schema validation
- **cosmiconfig**: Configuration loading

### Development
- **tsx**: TypeScript execution and dev mode
- **typescript**: Type checking and compilation
- Multiple tsconfig files for different build targets (CJS, ESM, types)

## 🎯 Key Files for Development

### Primary Entry Points
- `bin/index.ts` - Main CLI application with all commands
- `src/index.ts` - Library exports for programmatic use

### Core Components
- `src/core/commitBuilder.ts` - CommitBuilder class with fluent API
- `src/cli/createCommitFlow.ts` - Interactive commit creation workflow
- `src/utils/git.ts` - GitUtils class for repository operations
- `src/utils/ai.ts` - AI providers and integration logic

### Configuration & Types
- `src/config/defaultConfig.ts` - Default commit types and settings
- `src/types/config.ts` - Configuration interfaces and schemas
- `glinr-commit.json` - Project configuration file

### Validation & Testing
- `scripts/check-commit.ts` - Commit message validation script
- `scripts/test-*.ts` - Various testing utilities

## 🔧 Configuration Schema

```typescript
interface Config {
  version?: string;                    // Configuration version for compatibility
  commitTypes: CommitType[];
  emojiEnabled: boolean;
  conventionalCommits: boolean;
  aiSummary: boolean;
  ai?: AIConfig;
  claude?: {
    enabled: boolean;
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  maxSubjectLength: number;
  maxBodyLength: number;
  hooks?: {
    preCommit?: string[];
    postCommit?: string[];
  };
}

// Enhanced AI error handling
class ClaudeRateLimitError extends Error {
  constructor(message: string = 'Rate limited') {
    super(message);
    this.name = 'ClaudeRateLimitError';
  }
}

class ClaudeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClaudeValidationError';
  }
}
```

## 🚀 Available Commands

### CLI Commands
```bash
# Core Commands
commitweave              # Interactive commit creation
commitweave --ai         # AI-powered commit generation
commitweave --plain      # Disable fancy UI (for performance)
commitweave --debug-perf # Enable performance reporting
commitweave init         # Initialize configuration
commitweave check        # Validate latest commit message
commitweave --help       # Show help

# Configuration Management Commands
commitweave export [options]        # Export current configuration
commitweave import <source> [opts]  # Import configuration from file/URL
commitweave list                     # Display current configuration
commitweave reset [options]          # Reset configuration to defaults
commitweave doctor                   # Validate and diagnose configuration

# Performance Commands
npm run bench            # Run cold-start performance benchmark
```

### VS Code Commands
```
CommitWeave: Create Commit    # Launch interactive CLI in integrated terminal
CommitWeave: AI Commit        # Generate AI-powered commit messages
CommitWeave: Quick Commit     # Fast conventional commits with native VS Code UI
CommitWeave: Validate Commit  # Validate last commit message against standards
CommitWeave: Configure        # Open enhanced tabbed settings panel
```

## 🎨 Branding & UI

### Colors
- Primary: #8b008b (Dark magenta)
- Accent: #e94057 (Red-pink)
- Success: #00ff87 (Bright green)
- Warning: #ffb347 (Orange)
- Error: #ff6b6b (Red)
- Muted: #6c757d (Gray)

### Features
- ASCII art banners with multiple sizes
- Loading animations with spinners
- Branded color scheme throughout
- Random taglines for variety
- Error handling with helpful messages

## 📝 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- Zod for runtime validation
- Error boundaries and graceful fallbacks
- Fluent APIs where appropriate (CommitBuilder)
- Comprehensive type definitions

### Git Workflow
- Uses conventional commits (self-hosting)
- Automated releases via GitHub Actions
- Beta versioning strategy
- Main branch for stable releases

### Testing Approach
- Manual CLI testing with scripts
- Configuration validation testing
- AI provider mocking for reliability
- Git operation testing with dry-run modes

## 🧪 Testing & Quality Assurance

### Comprehensive Test Coverage ✅
CommitWeave has been thoroughly tested across multiple dimensions:

#### Platform Compatibility Testing
- **Cross-platform CLI testing**: Verified on macOS (arm64) with zsh shell
- **Shell compatibility**: Tested with zsh, bash support confirmed
- **Terminal support**: Full emoji and ANSI color support verified
- **Performance**: 24ms average startup time (12x better than 300ms target)
- **Test results**: 6/6 tests passed with 100% success rate

#### AI Functionality & Fallback Testing
- **Provider testing**: OpenAI, Anthropic Claude, and Mock AI providers
- **Fallback behavior**: 5/5 fallback scenarios working perfectly
- **Network failure simulation**: Graceful degradation to Mock AI
- **Invalid API key handling**: Automatic fallback with user warnings  
- **VS Code extension integration**: All CLI commands tested and verified
- **Mock AI availability**: Always available as ultimate fallback

#### Performance Validation
- **Cold-start performance**: 24.2ms average (target: ≤300ms)
- **Benchmark suite**: Automated performance testing with `npm run bench`
- **Memory efficiency**: Lazy loading of heavy dependencies
- **Startup optimization**: 13x performance improvement achieved

### Testing Scripts Available
- `scripts/test-cross-platform.ts` - Platform compatibility testing
- `scripts/test-ai-functionality.ts` - AI provider and functionality testing
- `scripts/test-ai-fallback.ts` - Network failure and fallback testing
- `scripts/test-vscode-integration.ts` - VS Code extension integration testing
- `scripts/bench.ts` - Performance benchmarking

### Test Reports Location
- **Testing reports**: `docs/testing-reports/` directory
- **Platform compatibility**: `docs/platform-compatibility.md`
- **Performance benchmarks**: Generated via `npm run bench`

## 🐛 Known Issues & Limitations

### Current Limitations
- No plugin system for custom commit types yet
- Git hooks not yet implemented  
- Limited to single repository operations

### Recent Improvements ✅
- ✅ Team configuration sharing (export/import)
- ✅ Configuration versioning and validation
- ✅ Enhanced error handling with typed errors
- ✅ Configuration health diagnostics
- ✅ Safe secret handling in configurations

### AI Provider Notes
- OpenAI requires API key configuration
- Anthropic integration uses latest API format
- Mock provider always available as fallback
- Error handling gracefully falls back to mock

## 🎯 Development Context Notes

### For Bug Fixes
- Always test with both emoji enabled/disabled
- Verify conventional commit format compliance
- Test AI provider fallback behavior
- Check configuration loading edge cases

### For New Features
- Maintain TypeScript coverage
- Update Zod schemas for new config options
- Consider AI integration implications
- Update help text and documentation
- Add appropriate error classes for new failure modes
- Update configuration management commands if config changes
- Add tests for new functionality in tests/ directory
- Update centralized error handler if needed

### For Refactoring
- Preserve existing CLI behavior
- Maintain backward compatibility
- Update type definitions accordingly
- Test cross-platform compatibility

## 🔍 Common Development Tasks

### Adding New Commit Types
1. Update `defaultCommitTypes` in `src/config/defaultConfig.ts`
2. Update documentation and help text
3. Test validation and emoji integration
4. Update configuration export/import tests
5. Verify configuration diffing works correctly
6. **Run test suite**: `npx tsx scripts/test-ai-functionality.ts`

### Modifying AI Integration
1. Update providers in `src/utils/ai.ts`
2. Update interfaces and error classes in `src/types/ai.ts`
3. Test fallback behavior and error handling
4. Update configuration schema if needed
5. Add appropriate error handling in `src/utils/errorHandler.ts`
6. Test with both OpenAI and Claude providers
7. Update configuration management for new AI settings
8. **Test fallback behavior**: `npx tsx scripts/test-ai-fallback.ts`

### CLI UX Improvements
1. Modify `bin/index.ts` and `bin/index.cjs.ts` for command changes
2. Update `src/ui/banner.ts` for visual elements
3. Test across different terminal environments
4. Ensure accessibility and readability
5. Update command routing for new configuration commands
6. Test both ESM and CommonJS entry points
7. Verify error messages are user-friendly and actionable
8. **Run cross-platform tests**: `npx tsx scripts/test-cross-platform.ts`
9. **Benchmark performance**: `npm run bench`

## 📚 Documentation Location

- **Main README**: Project root (`README.md`)
- **File Map**: `docs/file-map.md`
- **Architecture**: `docs/README.md`
- **Publishing**: `PUBLISHING.md`
- **Release Checklist**: `RELEASE_CHECKLIST.md`

## 🚢 Release Process

1. Update version in `package.json`
2. Run tests: `npm test`
3. Build: `npm run build`
4. Create git tag: `git tag v0.1.0-beta.X`
5. Push tag: `git push origin v0.1.0-beta.X`
6. GitHub Actions handles NPM publishing

## 💡 Future Roadmap Ideas

- Plugin system for custom commit types
- Git hooks integration (pre-commit, post-commit)
- ✅ Team configuration templates (implemented via export/import)
- ✅ VS Code extension (implemented with full integration)
- Analytics and usage metrics
- Web-based configuration builder
- Multi-repository support
- Integration with issue trackers
- Enhanced AI provider support (Google PaLM, local models)
- Configuration templates for popular frameworks
- Automated configuration backup and sync
- Integration with project management tools
- JetBrains IDEs extension
- Sublime Text extension
- Browser extension for web-based git platforms

---

**Last Updated**: Generated on 2025-08-07  
**Context Version**: 4.0  
**For**: Claude AI development sessions  
**Recent Changes**: Enhanced VS Code extension with 5 commands, tabbed settings panel, Quick Commit workflow, commit history visualization, template system, real-time validation, Source Control integration, professional theming, and comprehensive git operations