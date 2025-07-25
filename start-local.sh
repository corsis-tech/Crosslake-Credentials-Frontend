#!/bin/bash

# Frontend local development startup script

echo "Starting Crosslake Frontend Service..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local from template..."
    cp .env.example .env.local
fi

# Start the frontend
echo "Starting Vite dev server on http://localhost:5173"
npm run dev