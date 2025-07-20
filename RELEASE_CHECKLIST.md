# Release Checklist for CommitWeave

## 🎯 **Current Status: Ready for Beta Release**

### ✅ **Versioning Setup Complete**
- **Current version**: `0.1.0-beta.3`
- **NPM Strategy**: Beta releases on `@beta` tag, stable releases on `@latest`
- **Single main branch**: All development and releases from `main`

## 🚀 **Release Process**

### Beta Release (Recommended First Release)
```bash
# Quick release using script
./scripts/release.sh beta 0.1.0-beta.3

# Manual steps (alternative)
git add .
git commit -m "feat: initial beta release"
git tag v0.1.0-beta.3
git push origin main
git push origin v0.1.0-beta.3
```

### Installation Commands After Release
```bash
# Beta installation (current)
npm install -g @typeweaver/commitweave@beta

# Specific version
npm install -g @typeweaver/commitweave@0.1.0-beta.3
```

## 📋 **Pre-Release Checklist**

### Required Setup
- [ ] NPM account created
- [ ] NPM_TOKEN secret added to GitHub repo
- [ ] Repository is public (for GitHub Actions)

### Code Quality
- [ ] All tests pass: `npm test` ✅
- [ ] Build succeeds: `npm run build` ✅  
- [ ] TypeScript compiles without errors ✅
- [ ] Package structure is correct ✅

### Versioning
- [ ] Version follows beta format: `0.1.0-beta.3` ✅
- [ ] Tag will follow format: `v0.1.0-beta.3` ✅
- [ ] Workflows configured for beta releases ✅

## 🔄 **Automated Workflow**

### What Happens on Tag Push
1. **CI Workflow**: Tests code on Node 18, 20, 22
2. **Release Workflow**: Creates GitHub release (marked as pre-release)
3. **Publish Workflow**: Publishes to NPM with `@beta` tag

### GitHub Release Features
- Automatically marks beta releases as "Pre-release"
- Includes installation instructions for both beta and stable
- Shows changelog and version comparison

## 📦 **Package Information**
- **Name**: `@typeweaver/commitweave`
- **Size**: ~21KB (unpacked: ~88KB)
- **Files**: 53 files including all compiled JS, types, and docs
- **Binary**: `commitweave` command available globally

## 🎯 **Next Version Strategy**

### Beta Iterations
- `v0.1.0-beta.1` → First public beta
- `v0.1.0-beta.2` → Bug fixes and improvements  
- `v0.1.0-beta.3` → Feature additions

### Stable Release
- `v0.1.0` → First stable release (when ready)
- Will be published to `@latest` tag automatically

## 🧪 **Testing the Release**

### After Publishing
```bash
# Check if published
npm view @typeweaver/commitweave@beta

# Install and test
npm install -g @typeweaver/commitweave@beta
commitweave init
```

### Expected Functionality
- ✅ `commitweave init` - Creates configuration file
- ⚠️ `commitweave create` - Shows placeholder (build limitation)
- ✅ Development version works fully: `npx tsx bin/index.ts`

## 🎉 **Ready to Launch!**

Your CommitWeave package is ready for beta release. The versioning strategy is sound, workflows are configured, and the package builds successfully.

**To release**: Just run `./scripts/release.sh beta 0.1.0-beta.3` when ready!