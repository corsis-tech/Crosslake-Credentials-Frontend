# Crosslake Practitioner Matching System - Frontend

React-based frontend for the Crosslake Practitioner Matching System. Provides an intuitive interface for searching and finding the best consultants for project needs.

## 🚀 Quick Start

### Prerequisites
- Node.js 16 or higher
- npm or yarn

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Solaris-Partners/Crosslake-Credentials-App-frontend.git
   cd Crosslake-Credentials-App-frontend
   ```

2. **Set up environment**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # The default settings should work for local development
   ```

3. **Start the service**
   ```bash
   ./start-local.sh
   ```

   Or manually:
   ```bash
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend must be running on http://localhost:8001

## 📁 Project Structure

```
Crosslake-Credentials-App-frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components (InputScreen, ResultsScreen)
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API service layers
│   ├── styles/        # Global styles
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## 🛠 Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Material-UI (MUI)** for component library
- **React Router** for navigation
- **Axios** for API communication

## 🔧 Configuration

Key environment variables (see `.env.example`):

- `VITE_API_URL`: Backend API URL (default: http://localhost:8001)
- `VITE_ENABLE_STREAMING`: Enable streaming responses (default: true)
- `VITE_API_TIMEOUT`: API request timeout in ms (default: 30000)

## 🎨 Features

- **Smart Search**: Natural language search for practitioners
- **Real-time Streaming**: Results stream in as they're processed
- **Match Explanations**: AI-powered explanations for each match
- **Practitioner Details**: Comprehensive view of skills and experience
- **Responsive Design**: Works on desktop and mobile devices

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🧪 Testing

Run tests:
```bash
npm run test
```

## 🚨 Troubleshooting

### Common Issues

1. **Backend connection failed**
   - Ensure backend is running on port 8001
   - Check `VITE_API_URL` in `.env.local`
   - Verify no CORS errors in browser console

2. **Port already in use**
   ```bash
   # Find process on port 5173
   lsof -i :5173
   kill -9 <PID>
   ```

3. **Module not found errors**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

4. **Environment variables not loading**
   - Ensure variables start with `VITE_`
   - Restart dev server after changes

## 📝 Development Notes

- All API calls go through the service layer in `/src/services/`
- TypeScript types are defined in `/src/types/`
- Components follow Material-UI theming
- Streaming is handled via custom hooks

## 🔗 Related Repositories

- Backend: [Crosslake-Credentials-App-backend](https://github.com/Solaris-Partners/Crosslake-Credentials-App-backend)
- Original monorepo: [Crosslake-Credentials](https://github.com/Solaris-Partners/Crosslake-Credentials) (deprecated)

## 🎯 API Endpoints Used

- `POST /api/v1/match` - Search for practitioners
- `GET /api/v1/practitioners/{id}` - Get practitioner details  
- `GET /api/v1/skills` - Get all available skills
- `GET /api/v1/health` - Check backend health# Frontend CI/CD Test - Sun Jul 27 15:01:29 CDT 2025
