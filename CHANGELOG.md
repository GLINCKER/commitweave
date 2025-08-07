# Changelog

All notable changes to CommitWeave will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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