# Publishing Guide for CommitWeave

## Versioning Strategy

### Beta Phase (Current)
- **Current version**: `0.1.0-beta.1`
- **NPM tag**: `beta`
- **Installation**: `npm install -g @typeweaver/commitweave@beta`

### Version Format
- **Beta releases**: `0.1.0-beta.1`, `0.1.0-beta.2`, etc.
- **Stable releases**: `0.1.0`, `0.2.0`, `1.0.0`, etc.
- **Alpha releases**: `0.1.0-alpha.1` (if needed)

## Setup for NPM Publishing

### 1. NPM Token Setup
1. Create an NPM account at [npmjs.com](https://npmjs.com)
2. Generate an automation token:
   ```bash
   npm login
   npm token create --type=automation
   ```
3. Add the token to GitHub Secrets:
   - Go to your repo: Settings → Secrets and variables → Actions
   - Add a new secret named `NPM_TOKEN` with your token value

### 2. Publishing Process

#### Beta Releases (Recommended for now)
1. Update version in `package.json`:
   ```bash
   npm version 0.1.0-beta.2 --no-git-tag-version
   ```
2. Create and push beta tag:
   ```bash
   git add package.json
   git commit -m "chore: bump version to 0.1.0-beta.2"
   git tag v0.1.0-beta.2
   git push origin main
   git push origin v0.1.0-beta.2
   ```

#### Stable Releases (Future)
1. Update to stable version:
   ```bash
   npm version 0.1.0 --no-git-tag-version
   ```
2. Create and push stable tag:
   ```bash
   git add package.json
   git commit -m "chore: release v0.1.0"
   git tag v0.1.0
   git push origin main
   git push origin v0.1.0
   ```

#### Manual Release
1. Go to Actions → Release
2. Click "Run workflow"
3. Enter version and select prerelease option

### 3. Tagging Strategy (Single Main Branch)
```bash
# Beta releases
v0.1.0-beta.1, v0.1.0-beta.2, v0.1.0-beta.3

# Stable releases  
v0.1.0, v0.2.0, v1.0.0

# Current stable tag (latest stable)
latest → points to most recent stable
```

### 4. Installation Commands
```bash
# Beta (current)
npm install -g @typeweaver/commitweave@beta

# Stable (future)
npm install -g @typeweaver/commitweave

# Specific version
npm install -g @typeweaver/commitweave@0.1.0-beta.1
```

### 5. Pre-publish Checklist
- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Package structure is correct: `ls -la dist/`
- [ ] Version updated in `package.json`
- [ ] NPM_TOKEN secret is configured in GitHub
- [ ] Appropriate tag format (beta vs stable)

### 6. Post-publish Verification
```bash
# Check beta release
npm view @typeweaver/commitweave@beta

# Check all versions
npm view @typeweaver/commitweave versions --json

# Test installation
npm install -g @typeweaver/commitweave@beta
commitweave init
```

## Development vs Production

- **Development**: Use `npx tsx bin/index.ts` for full functionality
- **Production**: The built CLI has limited functionality (init works, create shows placeholder)
- This is due to complex ESM/CommonJS module resolution in the build

## Package Structure
```
dist/
├── bin.js          # CLI executable
├── index.js        # Main CommonJS entry
├── index.mjs       # ESM entry
├── index.d.ts      # TypeScript definitions
└── lib/            # Internal modules
```

The package is ready for publishing! 🚀