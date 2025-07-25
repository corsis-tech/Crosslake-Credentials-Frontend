# Crosslake Practitioner Search Frontend

React frontend application for searching Crosslake consultants/practitioners.

## Tech Stack

- React 19 with TypeScript
- Vite for bundling and development
- Material-UI (MUI) for UI components
- React Router for navigation
- Axios for API calls

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components (InputScreen, ResultsScreen)
├── styles/        # Global styles
├── types/         # TypeScript type definitions
└── utils/         # Utility functions (API client)
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend expects the backend API to be running at http://localhost:8000 (configurable via VITE_API_URL environment variable).

### API Endpoints Used

- `POST /api/query` - Submit practitioner search query
  - Request: `{ query: string }`
  - Response: `{ results: Practitioner[], query: string }`