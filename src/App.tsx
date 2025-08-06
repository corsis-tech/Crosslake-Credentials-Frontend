import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginScreen from './pages/LoginScreen';
import InputScreen from './pages/InputScreen';
import StreamingResults from './components/StreamingResults';
import PractitionerList from './components/PractitionerList';
import PractitionerDetail from './pages/PractitionerDetail';
import PractitionerAllData from './components/PractitionerAllData';

// Create a theme based on Crosslake design system
const theme = createTheme({
  palette: {
    primary: {
      main: '#0066CC',  // Crosslake blue
      light: '#2196F3',
      dark: '#004499',
    },
    secondary: {
      main: '#333333',
    },
    success: {
      main: '#00C853',
    },
    error: {
      main: '#D32F2F',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    background: {
      default: '#F5F5F7',
      paper: '#F5F5F7',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: 48,
      lineHeight: 1.2,
      fontWeight: 300,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: 36,
      lineHeight: 1.2,
      fontWeight: 300,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: 28,
      lineHeight: 1.3,
      fontWeight: 400,
    },
    h4: {
      fontSize: 24,
      lineHeight: 1.4,
      fontWeight: 400,
    },
    body1: {
      fontSize: 16,
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: 14,
      lineHeight: 1.5,
      fontWeight: 400,
    },
    caption: {
      fontSize: 12,
      lineHeight: 1.4,
      fontWeight: 400,
    },
  },
  spacing: 4,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginScreen />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InputScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/streaming-results"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StreamingResults />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/practitioners"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PractitionerList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/practitioner/:practitionerId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PractitionerDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/practitioner/:practitionerId/all-data"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PractitionerAllData />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App