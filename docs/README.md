# CommitWeave Documentation Hub 🧶

Welcome to the CommitWeave documentation center! This directory contains comprehensive documentation about the CommitWeave project structure, features, and architecture.

## 📋 Documentation Index

- **[File Map](./file-map.md)** - Complete repository structure and file purposes
- **[CLAUDE.md](../CLAUDE.md)** - Development context cache for Claude AI sessions

## 🏗️ Project Architecture Overview

CommitWeave is a modern CLI tool designed to create beautiful, structured, and conventional Git commit messages with AI-powered assistance.

```ascii
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🧶 COMMITWEAVE ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐     │
│  │   📱 CLI Layer   │    │  🎨 UI Layer    │    │   ⚙️  Config Layer     │     │
│  │                 │    │                 │    │                         │     │
│  │ • bin/index.ts  │    │ • ui/banner.ts  │    │ • config/default.ts     │     │
│  │ • Command Parse │    │ • Animations    │    │ • glinr-commit.json     │     │
│  │ • Menu System   │    │ • Brand Colors  │    │ • Zod Validation        │     │
│  │ • Error Handle  │    │ • Loading UX    │    │ • Type Safety           │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────┘     │
│           │                       │                           │                 │
│           └───────────────────────┼───────────────────────────┘                 │
│                                   │                                             │
│  ┌─────────────────────────────────┼─────────────────────────────────────┐     │
│  │                    📋 CORE BUSINESS LOGIC                              │     │
│  │                                 │                                     │     │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │     │
│  │  │ 🔨 CommitBuilder│    │ 🎭 Flow Manager │    │ ✅ Validator    │  │     │
│  │  │                 │    │                 │    │                 │  │     │
│  │  │ • Message Build │    │ • User Prompts  │    │ • Format Check  │  │     │
│  │  │ • Format Rules  │    │ • Input Collect │    │ • Length Rules  │  │     │
│  │  │ • Emoji Inject  │    │ • Preview Show  │    │ • Type Validate │  │     │
│  │  │ • Breaking Flag │    │ • Confirmation  │    │ • Convention    │  │     │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘  │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                   │                                             │
│  ┌─────────────────────────────────┼─────────────────────────────────────┐     │
│  │                        🤖 AI INTEGRATION LAYER                        │     │
│  │                                 │                                     │     │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │     │
│  │  │ 🧠 AI Providers │    │ 📝 Mock AI      │    │ 🔧 AI Utils     │  │     │
│  │  │                 │    │                 │    │                 │  │     │
│  │  │ • OpenAI GPT    │    │ • Fallback Safe │    │ • Config Parse  │  │     │
│  │  │ • Anthropic     │    │ • Demo Mode     │    │ • Error Handle  │  │     │
│  │  │ • Claude API    │    │ • Testing       │    │ • Format Conv   │  │     │
│  │  │ • Temperature   │    │ • No API Keys   │    │ • Subject Trim  │  │     │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘  │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                   │                                             │
│  ┌─────────────────────────────────┼─────────────────────────────────────┐     │
│  │                         🔧 GIT OPERATIONS LAYER                       │     │
│  │                                 │                                     │     │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │     │
│  │  │ 📂 Repository   │    │ 📊 Status Check │    │ 🚀 Operations   │  │     │
│  │  │                 │    │                 │    │                 │  │     │
│  │  │ • Repo Detect   │    │ • File Changes  │    │ • Stage Files   │  │     │
│  │  │ • Branch Info   │    │ • Diff Generate │    │ • Create Commit │  │     │
│  │  │ • History Read  │    │ • Change Count  │    │ • Push Ready    │  │     │
│  │  │ • Valid Check   │    │ • Summary Text  │    │ • Error Handle  │  │     │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘  │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                   │                                             │
│  ┌─────────────────────────────────┼─────────────────────────────────────┐     │
│  │                         📝 TYPE SYSTEM & SCHEMAS                      │     │
│  │                                 │                                     │     │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │     │
│  │  │ 🏷️  TypeScript   │    │ 🛡️  Zod Schema  │    │ 📋 Interfaces   │  │     │
│  │  │                 │    │                 │    │                 │  │     │
│  │  │ • Full Coverage │    │ • Runtime Valid │    │ • Clean APIs    │  │     │
│  │  │ • IntelliSense  │    │ • Config Safety │    │ • Type Exports  │  │     │
│  │  │ • Compile Check │    │ • Error Messages│    │ • Documentation │  │     │
│  │  │ • IDE Support   │    │ • Data Transform│    │ • Extensible    │  │     │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘  │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Core Features Implementation Status

### ✅ Completed Features

#### 1. Interactive CLI Experience
```ascii
┌─────────────────────────────────────┐
│  🎨 Beautiful CLI Interface         │
├─────────────────────────────────────┤
│ ✓ ASCII Art Banners                 │
│ ✓ Animated Loading Screens          │
│ ✓ Branded Color Schemes             │
│ ✓ Interactive Menus                 │
│ ✓ Progress Indicators               │
│ ✓ Error Handling UX                 │
└─────────────────────────────────────┘
```

#### 2. Conventional Commits Support
```ascii
┌─────────────────────────────────────┐
│  📝 Commit Standards                │
├─────────────────────────────────────┤
│ ✓ 11 Predefined Types               │
│ ✓ Scope Support                     │
│ ✓ Breaking Change Markers           │
│ ✓ Subject Length Validation         │
│ ✓ Body Formatting                   │
│ ✓ Footer Support                    │
└─────────────────────────────────────┘
```

#### 3. Smart Emoji Integration
```ascii
┌─────────────────────────────────────┐
│  🎭 Contextual Emojis               │
├─────────────────────────────────────┤
│ ✓ Type-Specific Emojis              │
│ ✓ Configurable On/Off               │
│ ✓ Unicode Support                   │
│ ✓ Visual Commit History             │
│ ✓ Alias System                      │
└─────────────────────────────────────┘
```

#### 4. AI-Powered Assistance
```ascii
┌─────────────────────────────────────┐
│  🤖 Intelligent Commit Generation   │
├─────────────────────────────────────┤
│ ✓ OpenAI GPT Integration            │
│ ✓ Anthropic Claude Support          │
│ ✓ Mock Provider (Fallback)          │
│ ✓ Diff Analysis                     │
│ ✓ Conventional Format Output        │
│ ✓ Error Recovery                    │
└─────────────────────────────────────┘
```

#### 5. Git Integration
```ascii
┌─────────────────────────────────────┐
│  🔧 Seamless Git Operations         │
├─────────────────────────────────────┤
│ ✓ Repository Detection              │
│ ✓ File Staging                      │
│ ✓ Commit Creation                   │
│ ✓ Status Monitoring                 │
│ ✓ Diff Generation                   │
│ ✓ Branch Information                │
└─────────────────────────────────────┘
```

#### 6. Configuration System
```ascii
┌─────────────────────────────────────┐
│  ⚙️  Flexible Configuration         │
├─────────────────────────────────────┤
│ ✓ JSON Configuration Files          │
│ ✓ Zod Schema Validation             │
│ ✓ Default Configurations            │
│ ✓ Custom Commit Types               │
│ ✓ AI Provider Settings              │
│ ✓ Emoji Toggle                      │
└─────────────────────────────────────┘
```

#### 7. Validation & Quality Control
```ascii
┌─────────────────────────────────────┐
│  ✅ Quality Assurance               │
├─────────────────────────────────────┤
│ ✓ Commit Message Validation         │
│ ✓ Length Constraints                │
│ ✓ Format Checking                   │
│ ✓ Type Verification                 │
│ ✓ Special Commit Detection          │
│ ✓ Helpful Error Messages            │
└─────────────────────────────────────┘
```

## 🚀 Command Flow Diagrams

### Interactive Commit Creation Flow
```ascii
                    📱 commitweave
                         │
                    ┌────▼────┐
                    │ Banner  │
                    │ Loading │
                    └────┬────┘
                         │
                  ┌──────▼──────┐
                  │ Action Menu │
                  └──────┬──────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
       ┌────▼────┐  ┌───▼───┐   ┌───▼────┐
       │ Create  │  │  AI   │   │  Init  │
       │ Commit  │  │ Mode  │   │ Config │
       └────┬────┘  └───┬───┘   └───┬────┘
            │           │           │
    ┌───────▼───────┐   │    ┌──────▼──────┐
    │ Type Selection│   │    │ Create JSON │
    │ Scope Input   │   │    │ File Setup  │
    │ Subject Entry │   │    └─────────────┘
    │ Body (optional│   │
    │ Breaking Flag │   │
    └───────┬───────┘   │
            │           │
    ┌───────▼───────┐   │
    │ Preview Show  │   │
    │ Confirmation  │   │
    └───────┬───────┘   │
            │           │
    ┌───────▼───────┐   │    ┌─────────────┐
    │ Stage Files   │◄──┴────┤ AI Analysis │
    │ Git Commit    │        │ Diff Parse  │
    │ Success! ✨   │        │ Message Gen │
    └───────────────┘        └─────────────┘
```

### AI-Powered Commit Flow
```ascii
                  🤖 commitweave --ai
                          │
                     ┌────▼────┐
                     │ AI Init │
                     │ Config  │
                     └────┬────┘
                          │
                   ┌──────▼──────┐
                   │ Repository  │
                   │ Validation  │
                   └──────┬──────┘
                          │
                   ┌──────▼──────┐
                   │ Staged Diff │
                   │ Analysis    │
                   └──────┬──────┘
                          │
              ┌───────────▼───────────┐
              │    AI Provider        │
              │  ┌─────────────────┐  │
              │  │ OpenAI │ Claude │  │
              │  └─────────────────┘  │
              │    │         │       │
              │    ▼         ▼       │
              │  ┌─────────────────┐  │
              │  │ JSON Response   │  │
              │  │ Parse & Format  │  │
              │  └─────────────────┘  │
              └───────────┬───────────┘
                          │
                   ┌──────▼──────┐
                   │ AI Message  │
                   │ Preview     │
                   └──────┬──────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
     ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
     │ Use AI  │    │  Edit   │    │ Regen   │
     │ Message │    │ Message │    │ New AI  │
     └────┬────┘    └────┬────┘    └────┬────┘
          │              │              │
          └──────────────┼──────────────┘
                         │
                  ┌──────▼──────┐
                  │ Final Commit│
                  │ Success! ✨ │
                  └─────────────┘
```

## 📊 Technology Stack

### Core Dependencies
```ascii
┌─────────────────────────────────────────────────────────────┐
│                    🛠️  TECHNOLOGY STACK                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Runtime & Language:                                        │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   Node.js       │  │   TypeScript    │                   │
│  │   >= 18.0.0     │  │   100% Coverage │                   │
│  └─────────────────┘  └─────────────────┘                   │
│                                                             │
│  CLI & UX Libraries:                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │     Enquirer    │  │     Chalk       │  │  Loading     │ │
│  │  Interactive    │  │   Terminal      │  │  Animations  │ │
│  │   Prompts       │  │   Styling       │  │   & UX       │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
│  Git & Configuration:                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Simple-Git    │  │   Cosmiconfig   │  │     Zod      │ │
│  │  Git Operations │  │  Config Loading │  │  Schema      │ │
│  │   Wrapper       │  │    & Search     │  │ Validation   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
│  AI Integration:                                            │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   Native Fetch  │  │  Provider APIs  │                   │
│  │  HTTP Requests  │  │ OpenAI, Claude  │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Default Commit Types

CommitWeave comes with 11 predefined commit types following conventional commit standards:

```ascii
┌────────────────────────────────────────────────────────────────┐
│                     📋 COMMIT TYPES REFERENCE                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ✨ feat      │ A new feature                                  │
│  🐛 fix       │ A bug fix                                      │
│  📚 docs      │ Documentation changes                          │
│  💎 style     │ Code style changes (formatting)               │
│  📦 refactor  │ Code refactoring                               │
│  🚀 perf      │ Performance improvements                       │
│  🚨 test      │ Adding or correcting tests                     │
│  🛠 build     │ Build system or external dependencies         │
│  ⚙️ ci        │ CI configuration changes                       │
│  ♻️ chore     │ Maintenance tasks                              │
│  🗑 revert    │ Revert previous commit                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## 🔧 Configuration Options

### glinr-commit.json Schema
```typescript
interface Config {
  commitTypes: CommitType[];
  emojiEnabled: boolean;        // Default: true
  conventionalCommits: boolean; // Default: true
  aiSummary: boolean;          // Default: false
  ai?: AIConfig;
  maxSubjectLength: number;    // Default: 50
  maxBodyLength: number;       // Default: 72
  hooks?: {
    preCommit?: string[];
    postCommit?: string[];
  }
}
```

### AI Configuration
```typescript
interface AIConfig {
  provider: 'openai' | 'anthropic' | 'mock';
  apiKey?: string;
  model?: string;
  temperature?: number;        // 0.0 - 2.0, Default: 0.7
  maxTokens?: number;         // Default: 150
}
```

## 📈 Development Status

### Version: 0.1.0-beta.4

#### Current Status: ✅ Production Ready Beta
- Core functionality complete and tested
- AI integration working with major providers
- Full TypeScript coverage
- Comprehensive error handling
- Beautiful CLI experience
- Extensive documentation

#### Next Phase Goals:
- Plugin system for custom commit types
- Git hooks integration
- Team configuration templates
- Analytics and usage metrics
- Extended AI provider support

## 🎬 Usage Examples

### Basic Usage
```bash
# Interactive mode
commitweave

# AI-powered commit
commitweave --ai

# Initialize configuration
commitweave init

# Validate latest commit
commitweave check
```

### Example Commit Messages
```
feat(auth): ✨ add JWT token validation

Implement JWT-based authentication system with
proper token validation and refresh logic.

BREAKING CHANGE: Legacy auth endpoints removed
```

## 🏆 Design Principles

1. **🎨 Beauty First** - Every interaction should be visually appealing
2. **⚡ Speed Matters** - Fast, responsive, and efficient operations
3. **🛡️ Type Safety** - Full TypeScript coverage for reliability
4. **🔧 Configurable** - Highly customizable to fit team preferences
5. **🤖 AI-Enhanced** - Smart assistance without complexity
6. **📝 Standards-Based** - Full conventional commit compliance

---

*Built with ❤️ by the GLINR STUDIOS team • Published by @typeweaver*