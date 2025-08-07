# CommitWeave File Map 🗺️

This document provides a comprehensive overview of the CommitWeave repository structure, explaining the purpose and responsibility of each file and directory.

## 📁 Repository Structure

```
commitweave/
├── 📄 LICENSE                    # MIT license file
├── 📄 README.md                  # Main project documentation and usage guide
├── 📄 PUBLISHING.md             # Publishing and release documentation
├── 📄 RELEASE_CHECKLIST.md      # Checklist for releases
├── 📄 package.json              # NPM package configuration and dependencies
├── 📄 package-lock.json         # Locked dependency versions
├── 📄 glinr-commit.json         # Default commit configuration file
│
├── 🔧 TypeScript Configuration Files
│   ├── tsconfig.json            # Main TypeScript configuration
│   ├── tsconfig.build.json      # Build-specific TypeScript configuration
│   ├── tsconfig.cjs.json        # CommonJS TypeScript configuration
│   ├── tsconfig.esm.json        # ESM TypeScript configuration
│   └── tsconfig.types.json      # Type definition configuration
│
├── 📂 bin/                      # CLI Entry Points
│   ├── index.ts                 # Main CLI application entry point
│   └── index.cjs.ts            # CommonJS CLI entry point
│
├── 📂 src/                      # Source Code
│   ├── 📂 cli/                  # Command Line Interface Logic
│   │   ├── createCommitFlow.ts  # Interactive commit creation workflow
│   │   └── 📂 commands/         # Configuration Management Commands
│   │       ├── exportConfig.ts  # Export configuration to file/stdout
│   │       ├── importConfig.ts  # Import and merge configuration
│   │       ├── listConfig.ts    # Display current configuration
│   │       ├── resetConfig.ts   # Reset to default configuration
│   │       └── doctorConfig.ts  # Configuration health validation
│   │
│   ├── 📂 config/               # Configuration Management
│   │   └── defaultConfig.ts     # Default commit types and configuration
│   │
│   ├── 📂 core/                 # Core Business Logic
│   │   └── commitBuilder.ts     # Commit message building and validation
│   │
│   ├── 📂 types/                # TypeScript Type Definitions
│   │   ├── ai.ts               # AI-related type definitions and error classes
│   │   ├── commit.ts           # Commit message type definitions
│   │   ├── config.ts           # Configuration type definitions and schemas
│   │   ├── git.ts              # Git-related type definitions
│   │   └── index.ts            # Re-exports all types
│   │
│   ├── 📂 ui/                   # User Interface Components
│   │   └── banner.ts           # CLI banner and branding utilities
│   │
│   ├── 📂 utils/                # Utility Functions
│   │   ├── ai.ts               # AI integration utilities with enhanced error handling
│   │   ├── git.ts              # Git operations and utilities
│   │   ├── configStore.ts      # Configuration loading, saving, and management
│   │   ├── configDiff.ts       # Configuration diffing, secret stripping, validation
│   │   └── errorHandler.ts     # Centralized error handling and user messaging
│   │
│   └── index.ts                # Main library exports
│
├── 📂 scripts/                 # Development, Build, and Testing Scripts
│   ├── bench.ts                # Performance benchmarking
│   ├── check-commit.ts         # Commit message validation script
│   ├── prepare-dist.js         # Distribution preparation script
│   ├── release.sh              # Release automation script
│   ├── test-ai-fallback.ts     # AI fallback behavior testing
│   ├── test-ai-functionality.ts # AI provider testing
│   ├── test-cli-functions.ts   # CLI functionality tests
│   ├── test-cross-platform.ts  # Cross-platform CLI testing
│   ├── test-init.ts            # Initialization tests
│   ├── test-local.ts           # Local testing utilities
│   ├── test-vscode-integration.ts # VS Code extension integration testing
│   └── test-*.ts               # Various specialized testing utilities
│
├── 📂 tests/                   # Test Suite
│   ├── anthropic.spec.ts       # Anthropic/Claude provider tests
│   ├── config.spec.ts          # Configuration management tests
│   └── perf.spec.ts            # Performance utility tests
│
├── 📂 docs/                    # Documentation
│   ├── README.md               # Architecture documentation
│   ├── file-map.md            # This file - complete repository map
│   ├── platform-compatibility.md # Cross-platform testing results
│   └── 📂 testing-reports/     # Generated test reports and artifacts
│       └── platform-test-*.json # Cross-platform test result data
│
├── 📂 vscode-extension/        # VS Code Extension
│   ├── 📄 package.json          # Extension manifest and configuration
│   ├── 📄 README.md             # Extension documentation
│   ├── 📄 LICENSE               # Extension license
│   ├── 📄 tsconfig.json         # TypeScript configuration for extension
│   ├── 📂 src/                  # Extension source code
│   │   ├── extension.ts         # Main extension entry point
│   │   ├── 📂 commands/         # VS Code command implementations
│   │   │   ├── createCommit.ts  # "CommitWeave: Create Commit" command
│   │   │   ├── aiCommit.ts      # "CommitWeave: AI Commit" command
│   │   │   └── configure.ts     # "CommitWeave: Configure" command
│   │   └── 📂 webview/          # Settings webview panel
│   │       ├── panel.ts         # Webview provider and logic
│   │       └── ui.html          # Settings panel HTML/CSS/JS
│   └── 📂 test/                 # Extension tests
│       ├── extension.test.ts    # Main extension tests
│       ├── runTest.ts          # Test runner configuration
│       └── 📂 suite/           # Test suite setup
│           └── index.ts        # Mocha test configuration
│
├── 📂 dist/                    # Built Distribution Files (generated)
└── 📂 node_modules/            # NPM Dependencies (generated)
```

## 🔍 Detailed File Descriptions

### 🎯 Core Application Files

#### `bin/index.ts`
- **Purpose**: Main CLI entry point and application orchestrator
- **Responsibilities**: 
  - Command-line argument parsing
  - Interactive menu system
  - Command routing (init, create, ai, check, help)
  - User interface and branding
  - Error handling and process management
- **Key Features**: Beautiful CLI interface with loading animations and branded output

#### `src/core/commitBuilder.ts`
- **Purpose**: Core commit message construction and validation
- **Responsibilities**:
  - Fluent API for building commit messages
  - Conventional commit format support
  - Message validation and error handling
  - Emoji integration
  - Breaking change handling
- **Key Classes**: `CommitBuilder` class with method chaining

#### `src/cli/createCommitFlow.ts`
- **Purpose**: Interactive commit creation workflow
- **Responsibilities**:
  - User input collection via prompts
  - Configuration loading and validation
  - Commit message preview and confirmation
  - Integration with CommitBuilder
- **Features**: Multi-step interactive prompts with validation

### ⚙️ Configuration and Types

#### `src/config/defaultConfig.ts`
- **Purpose**: Default configuration and commit types
- **Contents**:
  - 11 predefined commit types with emojis
  - Default configuration schema
  - Commit type alias mapping
- **Commit Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

#### `src/types/`
- **config.ts**: Configuration schemas using Zod validation
- **commit.ts**: Commit message structure definitions
- **git.ts**: Git repository and operations types
- **ai.ts**: AI provider and configuration types
- **index.ts**: Centralized type exports

### 🛠️ Utilities and Helpers

#### `src/utils/git.ts`
- **Purpose**: Git repository operations and utilities
- **Key Classes**: `GitUtils` class
- **Features**:
  - Repository validation
  - File staging and committing
  - Status checking and diff generation
  - Branch management
  - Change summary formatting

#### `src/utils/ai.ts`
- **Purpose**: AI integration for commit message generation
- **Supported Providers**: OpenAI, Anthropic, Mock
- **Features**: Automated commit message generation from diffs

#### `src/ui/banner.ts`
- **Purpose**: CLI branding and visual elements
- **Features**: 
  - Animated loading screens
  - Branded banners and colors
  - Feature highlights

### 🧩 VS Code Extension

#### `vscode-extension/`
- **Purpose**: VS Code extension for seamless IDE integration
- **Publisher**: `typeweaver` (maintained by GLINR STUDIOS)
- **Commands**:
  - `CommitWeave: Create Commit` - Launch interactive CLI in integrated terminal
  - `CommitWeave: AI Commit` - Generate AI-powered commit messages
  - `CommitWeave: Configure` - Open settings webview panel

#### `vscode-extension/src/extension.ts`
- **Purpose**: Main extension entry point and activation logic
- **Responsibilities**:
  - Extension activation/deactivation lifecycle
  - Command registration and routing
  - Welcome message and first-time setup
  - Integration with VS Code APIs

#### `vscode-extension/src/commands/`
- **createCommit.ts**: Executes CommitWeave CLI for interactive commit creation
- **aiCommit.ts**: Runs AI-powered commit generation with staged change validation
- **configure.ts**: Opens settings webview panel for extension configuration

#### `vscode-extension/src/webview/`
- **panel.ts**: Webview provider with repository status monitoring and settings management
- **ui.html**: Complete settings UI with dark-mode support and GLINR STUDIOS branding
- **Features**: 
  - Repository status monitoring (git repo, staged files, CLI availability)
  - Emoji toggle and AI provider selection
  - VS Code theme integration
  - Real-time status checking

#### Extension Configuration
- **package.json**: Extension manifest with commands, settings schema, and branding
- **Settings**:
  - `commitweave.emojiEnabled`: Toggle emoji in commit messages
  - `commitweave.aiProvider`: Select AI provider (OpenAI/Anthropic/Mock)
- **Testing**: Integration tests with @vscode/test-electron

### 🧪 Testing and Scripts

#### `scripts/` - Comprehensive Testing Suite
- **bench.ts**: Performance benchmarking with 300ms cold-start target
- **check-commit.ts**: Validates commit messages against conventional standards
- **test-cross-platform.ts**: Cross-platform CLI compatibility testing
- **test-ai-functionality.ts**: AI provider and functionality testing
- **test-ai-fallback.ts**: Network failure and AI fallback behavior testing
- **test-vscode-integration.ts**: VS Code extension integration validation
- **test-*.ts**: Various specialized testing utilities
- **prepare-dist.js**: Prepares distribution files for publishing
- **release.sh**: Automates the release process

#### Testing Coverage
- **Platform Compatibility**: macOS, Linux, Windows shell testing
- **AI Provider Testing**: OpenAI, Claude, Mock AI with fallback scenarios
- **Performance Validation**: 24ms average startup (12x better than target)
- **VS Code Integration**: All extension commands and CLI integration
- **Network Failure Simulation**: Graceful degradation testing

#### Test Results and Reports
- **docs/platform-compatibility.md**: Cross-platform test results documentation
- **docs/testing-reports/**: Generated test artifacts and JSON reports
- All tests achieve 100% pass rate with comprehensive error handling

### 📦 Distribution and Build

#### TypeScript Configuration
- **tsconfig.json**: Main TypeScript configuration
- **tsconfig.build.json**: Production build settings
- **tsconfig.cjs.json**: CommonJS module configuration
- **tsconfig.esm.json**: ESM module configuration
- **tsconfig.types.json**: Type definition generation

#### Package Configuration
- **package.json**: NPM package metadata, scripts, and dependencies
- **Dependencies**: chalk, enquirer, simple-git, zod, cosmiconfig
- **Dev Dependencies**: TypeScript, tsx, @types/node

## 🏗️ Architecture Overview

### Design Patterns
1. **Builder Pattern**: `CommitBuilder` for constructing commit messages
2. **Factory Pattern**: Git utilities and configuration loading
3. **Command Pattern**: CLI command routing and execution
4. **Strategy Pattern**: AI provider abstraction

### Key Dependencies
- **chalk**: Terminal string styling and colors
- **enquirer**: Interactive CLI prompts
- **simple-git**: Git operations wrapper
- **zod**: Runtime type validation and schemas
- **cosmiconfig**: Configuration file loading

### Module Structure
- **Barrel Exports**: Centralized exports from `src/index.ts`
- **Type Safety**: Comprehensive TypeScript coverage
- **Configuration-Driven**: Highly customizable via `glinr-commit.json`
- **Plugin Architecture**: Extensible commit types and AI providers

## 🎯 Entry Points and Usage

### CLI Entry Points
1. **`commitweave`**: Interactive commit creation
2. **`commitweave --ai`**: AI-powered commit generation
3. **`commitweave init`**: Configuration setup
4. **`commitweave check`**: Commit validation
5. **`commitweave --help`**: Help documentation

### Library Usage
The package can also be used programmatically by importing from the main module:
- `CommitBuilder` for building commit messages
- `GitUtils` for git operations
- Configuration utilities and types

## 🚀 CI/CD and GitHub Actions

#### `.github/workflows/`
- **ci.yml**: Main CI pipeline with Node.js matrix testing and VS Code extension packaging
- **vscode-publish.yml**: Automated VS Code extension publishing to marketplace
- **Features**:
  - Multi-version Node.js testing (18, 20, 22)
  - Automated extension build and VSIX packaging
  - Extension testing with xvfb (headless VS Code)
  - Auto-publishing on `vscode-v*.*.*` tags
  - GitHub release creation with VSIX artifacts

#### Performance Optimizations
- **Cold-start**: ~23ms average (13x better than 300ms target)
- **Lazy loading**: Heavy dependencies loaded only when needed
- **Build system**: Optimized module resolution and path mapping
- **Benchmarking**: `npm run bench` for repeatable performance testing

## 📊 Statistics
- **Total Files**: ~40+ source files
- **Languages**: TypeScript (100%)
- **Packages**: 
  - Main CLI package (~25 files)
  - VS Code extension (~15 files)
- **Test Coverage**: CLI functions, extension integration, and core logic
- **Package Size**: Minimal dependencies, focused scope
- **Node.js**: Requires Node.js >= 18.0.0
- **VS Code**: Requires VS Code >= 1.80.0