#!/bin/bash
# Deploy landing page to GitHub Pages (gh-pages branch)
# Usage: ./scripts/deploy-pages.sh <version>
#
# This script:
# 1. Copies landing/ to a temp directory
# 2. Replaces __VERSION__ placeholder with actual version
# 3. Pushes to gh-pages branch

set -e

VERSION="${1:-}"
if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 0.8.0"
    exit 1
fi

echo "Deploying version $VERSION to GitHub Pages..."

# Create temp directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Copy landing files
cp -r landing/* "$TEMP_DIR/"

# Replace version placeholder
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/__VERSION__/$VERSION/g" "$TEMP_DIR/index.html"
else
    # Linux
    sed -i "s/__VERSION__/$VERSION/g" "$TEMP_DIR/index.html"
fi

echo "Version placeholder replaced in index.html"

# Setup git for gh-pages
cd "$TEMP_DIR"
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy v$VERSION"

# Push to gh-pages branch (force push since it's a new orphan commit each time)
git push -f "git@github.com:frankyxhl/CleanClip.git" gh-pages

echo "✅ Deployed v$VERSION to https://frankyxhl.github.io/CleanClip/"
