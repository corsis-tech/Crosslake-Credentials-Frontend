#!/bin/bash

# Crosslake Credentials Application Launcher
# Run from anywhere with 'runCreds' command

# Define the directories (absolute paths)
BACKEND_DIR="/Users/samgaddis/Dropbox/dev/Crosslake-Credentials-App-backend"
FRONTEND_DIR="/Users/samgaddis/Dropbox/dev/Crosslake-Credentials-App-frontend"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Launching Crosslake Credentials Application${NC}"
echo

# Check if directories exist
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found at: $BACKEND_DIR${NC}"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Frontend directory not found at: $FRONTEND_DIR${NC}"
    exit 1
fi

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}🔄 Killing existing process on port $port...${NC}"
        echo $pids | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

# Function to kill backend Python processes
kill_backend_processes() {
    # Kill any Python process running main.py in the backend directory
    local pids=$(ps aux | grep -E "python.*$BACKEND_DIR/main.py" | grep -v grep | awk '{print $2}')
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}🔄 Killing existing backend Python processes...${NC}"
        echo $pids | xargs kill -9 2>/dev/null
        sleep 1
    fi
    
    # Also kill any Python process on port 8001
    kill_port 8001
}

# Function to kill frontend Node processes
kill_frontend_processes() {
    # Kill any Vite dev server in the frontend directory
    local pids=$(ps aux | grep -E "node.*$FRONTEND_DIR.*vite" | grep -v grep | awk '{print $2}')
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}🔄 Killing existing frontend Node processes...${NC}"
        echo $pids | xargs kill -9 2>/dev/null
        sleep 1
    fi
    
    # Also kill anything on port 5173 and 5174
    kill_port 5173
    kill_port 5174
}

echo -e "${BLUE}🧹 Cleaning up existing processes...${NC}"

# Kill existing processes
kill_backend_processes
kill_frontend_processes

echo -e "${GREEN}✓ All existing processes cleaned up${NC}"
echo

# Launch Backend
echo -e "${BLUE}Starting Backend on port 8001...${NC}"
osascript <<'EOF'
tell application "Terminal"
    do script "cd '/Users/samgaddis/Dropbox/dev/Crosslake-Credentials-App-backend' && echo '🔧 Starting Crosslake Backend...' && echo && if [ -f .env ]; then source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python main.py; else echo '❌ No .env file found! Please create one from .env.example'; fi"
end tell
EOF

# Give backend a moment to start
sleep 3

# Launch Frontend
echo -e "${BLUE}Starting Frontend on port 5173...${NC}"
osascript <<'EOF'
tell application "Terminal"
    do script "cd '/Users/samgaddis/Dropbox/dev/Crosslake-Credentials-App-frontend' && echo '🎨 Starting Crosslake Frontend...' && echo && if [ -f .env.local ]; then npm install && npm run dev; else echo '❌ No .env.local file found! Please create one from .env.example'; fi"
end tell
EOF

# Wait a moment for services to start
echo
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 5

# Display access information
echo
echo -e "${GREEN}✨ Crosslake Credentials Application is starting!${NC}"
echo
echo -e "${BLUE}📍 Access the application at:${NC}"
echo -e "   ${GREEN}Frontend: http://localhost:5173${NC}"
echo -e "   ${GREEN}Backend API: http://localhost:8001${NC}"
echo -e "   ${GREEN}API Docs: http://localhost:8001/docs${NC}"
echo
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "   - Both services are running in separate Terminal windows"
echo -e "   - Check the Terminal windows for any startup errors"
echo -e "   - Press Ctrl+C in each Terminal to stop the services"
echo -e "   - The frontend will auto-reload on code changes"
echo -e "   - Run 'runCreds' again to restart everything fresh"
echo
echo -e "${BLUE}🎯 Opening frontend in your browser...${NC}"

# Wait a bit more for frontend to fully start
sleep 3

# Open the frontend in the default browser
open "http://localhost:5173"

echo
echo -e "${GREEN}✅ Launch complete!${NC}"