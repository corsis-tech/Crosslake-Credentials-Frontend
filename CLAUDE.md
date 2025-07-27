# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **frontend** portion of the Crosslake Practitioner Matching System, a full-stack application for finding and matching consultants. The frontend is built with React 19, TypeScript, and Material-UI.

**Important**: The backend codebase is located at `/Users/samgaddis/Dropbox/dev/Crosslake-Credentials-App-backend` and must be running on port 8001 for the frontend to function properly.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
tsc --noEmit

# Quick start script
./start-local.sh
```

## Architecture

### Frontend-Backend Communication
- The frontend communicates with the backend API at `http://localhost:8001` (configurable via `VITE_API_URL`)
- Uses streaming API for real-time search results via `streamingApi.ts`
- All API endpoints are prefixed with `/api/v1/`

### Key Services
- **streamingApi.ts**: Handles streaming responses from the backend using fetch with streaming support
- **pitchResumeService.ts**: Manages practitioner matching and resume generation

### Main Pages
- **InputScreen**: Search interface for finding practitioners
- **ResultsScreen**: Displays matching practitioners with AI-generated explanations

### Technology Stack
- React 19 with TypeScript
- Vite for development and building
- Material-UI (MUI) for component library
- Axios for non-streaming API calls
- React Router for navigation

## Backend Integration Points

The backend (located at `/Users/samgaddis/Dropbox/dev/Crosslake-Credentials-App-backend`) provides:

### API Endpoints
- `POST /api/v1/match` - Search for practitioners (supports streaming)
- `GET /api/v1/practitioners/{id}` - Get practitioner details
- `GET /api/v1/skills` - Get all available skills
- `GET /api/v1/health` - Health check

### Backend Technology
- FastAPI with Python
- OpenAI O3 model for match explanations
- Pinecone vector database for semantic search
- CSV data source (`people.csv`) as canonical data

## Environment Configuration

Copy `.env.example` to `.env.local` and configure:
- `VITE_API_URL`: Backend URL (default: http://localhost:8001)
- `VITE_ENABLE_STREAMING`: Enable/disable streaming (default: true)
- `VITE_API_TIMEOUT`: Request timeout in milliseconds

## Common Development Tasks

### Adding a New API Integration
1. Add the API call to the appropriate service file in `/src/services/`
2. Define TypeScript types in `/src/types/`
3. Use the service in your component

### Working with Streaming Responses
The streaming API is handled in `streamingApi.ts`. It processes server-sent events (SSE) format:
```typescript
// Events come as: data: {"type": "practitioner", "data": {...}}
```

### Debugging Frontend-Backend Issues
1. Check browser console for CORS errors
2. Verify backend is running: `curl http://localhost:8001/health`
3. Check network tab for API requests/responses
4. Ensure environment variables are set correctly

## Project Structure Notes

Both frontend and backend were recently split from a monorepo. The original repository was at `Crosslake-Credentials` (now deprecated).

The backend handles all AI operations (embeddings, vector search, explanations) while the frontend focuses on user interface and real-time result display.