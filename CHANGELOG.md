# Changelog

All notable changes to CommitWeave will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.3] - 2025-08-07

### 🧪 **TESTING & QUALITY ASSURANCE** - Comprehensive Test Suite Implementation

### Added
- **Comprehensive Testing Suite**: Complete test coverage across multiple dimensions
  - `scripts/test-cross-platform.ts` - Cross-platform CLI compatibility testing
  - `scripts/test-ai-functionality.ts` - AI provider and functionality testing  
  - `scripts/test-ai-fallback.ts` - Network failure and AI fallback behavior testing
  - `scripts/test-vscode-integration.ts` - VS Code extension integration validation
  - Additional specialized testing utilities (test-*.ts)

### Test Results
- **Platform Compatibility**: 6/6 tests passed (100% success rate)
- **AI Functionality**: 6/6 AI tests passed with fallback validation
- **Performance**: 24ms startup time (12x better than 300ms target)  
- **VS Code Integration**: All extension commands validated
- **Fallback Behavior**: 5/5 network failure scenarios handled gracefully

### Documentation
- **CLAUDE.md**: Added comprehensive testing section with results and context
- **README.md**: Added Testing & Quality Assurance section with detailed coverage
- **docs/file-map.md**: Updated with testing scripts and structure
- **docs/platform-compatibility.md**: Cross-platform test results
- **docs/testing-reports/**: Organized test artifacts directory

### Infrastructure
- **.gitignore**: Added test artifact exclusions, removed CLAUDE.md exclusion
- **Root cleanup**: Moved test reports to docs/, removed temporary test files
- **Testing Coverage**: Cross-platform, AI resilience, performance, VS Code integration

## [1.0.0] - 2025-08-07

### 🎉 **STABLE RELEASE** - Complete Open Source Project Structure

### Added
- **VS Code Extension**: Initial extension with three core commands & settings panel
  - "CommitWeave: Create Commit" - Launch interactive CLI in integrated terminal
  - "CommitWeave: AI Commit" - Generate AI-powered commit messages
  - "CommitWeave: Configure" - Open webview settings panel for emoji/AI provider configuration
  - Webview settings panel with repository status monitoring
  - Auto-detection of missing global CLI with fallback to npx usage
  - Dark-mode friendly styling with VS Code color scheme integration
  - CI job for extension packaging and testing

### Performance
- **Cold-start optimization**: Achieved ~23ms average cold-start time (target was ≤300ms)
  - Implemented lazy loading for all heavy dependencies
  - Added performance tracking with environment variable gating
  - Optimized build system with proper module resolution
  - Added comprehensive benchmarking with repeatable tests

### Fixed
- Build system now uses optimized ESM entry point instead of CommonJS fallback
- Module path resolution in built CLI binary now correctly points to lib directory
- Performance flags (--debug-perf, --plain) now properly control UI and reporting

## [0.1.0-beta.4] - Previous Release
### Added
- Core commit creation functionality
- AI-powered commit message generation
- Configuration management system
- Interactive CLI with beautiful UI
- Support for multiple AI providers (OpenAI, Anthropic)
- Emoji integration in commit messages
- Conventional commits support