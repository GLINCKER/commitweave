#!/bin/bash

# Release script for CommitWeave
# Usage: ./scripts/release.sh [beta|stable] [version]

set -e

RELEASE_TYPE=${1:-beta}
VERSION=$2

if [ -z "$VERSION" ]; then
    echo "Usage: ./scripts/release.sh [beta|stable] [version]"
    echo "Examples:"
    echo "  ./scripts/release.sh beta 0.1.0-beta.2"
    echo "  ./scripts/release.sh stable 0.1.0"
    exit 1
fi

echo "🚀 Preparing $RELEASE_TYPE release: $VERSION"

# Update package.json version
echo "📝 Updating package.json version..."
npm version "$VERSION" --no-git-tag-version

# Run tests
echo "🧪 Running tests..."
npm test

# Build package
echo "🔨 Building package..."
npm run build

# Commit version change
echo "📦 Committing version change..."
git add package.json
if [ "$RELEASE_TYPE" = "beta" ]; then
    git commit -m "chore: bump version to $VERSION"
else
    git commit -m "chore: release v$VERSION"
fi

# Create and push tag
echo "🏷️  Creating and pushing tag..."
git tag "v$VERSION"
git push origin main
git push origin "v$VERSION"

echo "✅ Release $VERSION completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check GitHub Actions for automated publishing"
echo "2. Verify release at: https://github.com/GLINCKER/commitweave/releases"
if [ "$RELEASE_TYPE" = "beta" ]; then
    echo "3. Test installation: npm install -g @typeweaver/commitweave@beta"
else
    echo "3. Test installation: npm install -g @typeweaver/commitweave"
fi