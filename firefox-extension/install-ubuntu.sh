#!/bin/bash
# Installation helper script for Ubuntu LTS
# This script helps set up the development environment

set -e

echo "🐧 Minimalist Productivity - Ubuntu Installation Helper"
echo "======================================================="
echo ""

# Check if running on Ubuntu
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" != "ubuntu" ]]; then
        echo "⚠️  Warning: This script is designed for Ubuntu. Your OS: $ID"
    else
        echo "✅ Detected Ubuntu $VERSION"
    fi
fi

# Check for Node.js
echo ""
echo "Checking dependencies..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found"
    echo "   Install with: sudo apt install nodejs npm"
    echo "   Or use nvm: https://github.com/nvm-sh/nvm"
fi

# Check for web-ext
if command -v web-ext &> /dev/null; then
    WEBEXT_VERSION=$(web-ext --version)
    echo "✅ web-ext installed: $WEBEXT_VERSION"
else
    echo "⚠️  web-ext not found (optional for development)"
    echo "   Install with: sudo npm install -g web-ext"
fi

# Check Firefox version
if command -v firefox &> /dev/null; then
    FIREFOX_VERSION=$(firefox --version)
    echo "✅ Firefox installed: $FIREFOX_VERSION"
    
    # Check if it's the snap version
    if [[ $(which firefox) == *"snap"* ]]; then
        echo "   ℹ️  Using Snap version of Firefox"
        echo "   Note: Temporary add-ons won't persist between sessions"
    fi
else
    echo "❌ Firefox not found"
    echo "   Install with: sudo apt install firefox"
fi

echo ""
echo "======================================================="
echo ""
echo "Quick Start:"
echo ""
echo "1. Run the extension for testing:"
echo "   cd firefox-extension"
echo "   web-ext run"
echo ""
echo "2. Build for distribution:"
echo "   chmod +x build.sh"
echo "   ./build.sh"
echo ""
echo "3. Install in Firefox:"
echo "   - Open Firefox"
echo "   - Go to about:debugging#/runtime/this-firefox"
echo "   - Click 'Load Temporary Add-on...'"
echo "   - Select manifest.json"
echo ""
echo "For permanent installation, use the .xpi file from the build."
echo ""
