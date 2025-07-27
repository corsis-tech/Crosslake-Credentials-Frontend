#!/bin/bash

# Script to update the global runCreds command
# Run this with: sudo ./update-runcreds.sh

echo "Updating global runCreds command..."

# Copy the updated script (using the fixed version)
sudo cp /Users/samgaddis/Dropbox/dev/Crosslake-Credentials-App-frontend/runCreds_fixed.sh /usr/local/bin/runCreds

# Make it executable
sudo chmod +x /usr/local/bin/runCreds

echo "✅ runCreds command has been updated!"
echo ""
echo "The following changes were made:"
echo "  - Backend port corrected from 8005 to 8001"
echo "  - Auto-kills existing processes before starting new ones"
echo "  - Kills processes on ports 8001, 5173, and 5174"
echo "  - Kills any existing Python/Node processes for the app"
echo "  - Fixed osascript commands to properly launch Terminal windows"
echo ""
echo "You can now run 'runCreds' from anywhere to start the app!"