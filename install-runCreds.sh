#!/bin/bash

# Installer for runCreds command
# This script installs the launcher to /usr/local/bin so it can be run from anywhere

SCRIPT_NAME="runCreds"
INSTALL_DIR="/usr/local/bin"
SOURCE_SCRIPT="runCreds.sh"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📦 Installing runCreds command..."

# Check if runCreds.sh exists
if [ ! -f "$SCRIPT_DIR/$SOURCE_SCRIPT" ]; then
    echo "❌ Error: $SOURCE_SCRIPT not found in current directory"
    exit 1
fi

# Create /usr/local/bin if it doesn't exist
if [ ! -d "$INSTALL_DIR" ]; then
    echo "Creating $INSTALL_DIR directory..."
    sudo mkdir -p "$INSTALL_DIR"
fi

# Copy the script to /usr/local/bin
echo "Installing launcher to $INSTALL_DIR/$SCRIPT_NAME..."
sudo cp "$SCRIPT_DIR/$SOURCE_SCRIPT" "$INSTALL_DIR/$SCRIPT_NAME"

# Make it executable
sudo chmod +x "$INSTALL_DIR/$SCRIPT_NAME"

# Check if /usr/local/bin is in PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo
    echo "⚠️  Warning: $INSTALL_DIR is not in your PATH"
    echo "Add this line to your ~/.zshrc or ~/.bash_profile:"
    echo "export PATH=\"\$PATH:$INSTALL_DIR\""
    echo
fi

echo "✅ Installation complete!"
echo
echo "🚀 You can now run 'runCreds' from any directory to launch the Crosslake Credentials application"
echo
echo "Usage:"
echo "  runCreds    - Launch both frontend and backend"
echo
echo "To uninstall:"
echo "  sudo rm $INSTALL_DIR/$SCRIPT_NAME"