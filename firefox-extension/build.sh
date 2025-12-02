#!/bin/bash
# Build script for Minimalist Productivity Firefox Extension
# Compatible with Ubuntu LTS

set -e

echo "🔧 Building Minimalist Productivity Firefox Extension..."

# Create build directory
BUILD_DIR="build"
mkdir -p "$BUILD_DIR"

# Clean previous builds
rm -f "$BUILD_DIR"/*.xpi "$BUILD_DIR"/*.zip

# Get version from manifest
VERSION=$(grep -oP '"version":\s*"\K[^"]+' manifest.json)

# Create extension package
echo "📦 Creating extension package..."
zip -r "$BUILD_DIR/minimalist-productivity-v${VERSION}.xpi" \
    manifest.json \
    newtab.html \
    css/ \
    js/ \
    icons/ \
    backgrounds/ \
    -x "*.DS_Store" \
    -x "*__MACOSX*"

echo "✅ Build complete!"
echo "📁 Output: $BUILD_DIR/minimalist-productivity-v${VERSION}.xpi"
echo ""
echo "To install:"
echo "1. Open Firefox"
echo "2. Go to about:addons"
echo "3. Click the gear icon ⚙️"
echo "4. Select 'Install Add-on From File...'"
echo "5. Choose the .xpi file"
