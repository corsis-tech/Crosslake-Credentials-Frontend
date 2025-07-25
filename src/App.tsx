import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import InputScreen from './pages/InputScreen';
import StreamingResults from './components/StreamingResults';
import PractitionerList from './components/PractitionerList';
import PractitionerDetail from './pages/PractitionerDetail';
import PractitionerAllData from './components/PractitionerAllData';

// Create a theme based on FocusLock design system
const theme = createTheme({
  palette: {
    primary: {
      main: '#1A73E8',
    },
    secondary: {
      main: '#FF6D00',
    },
    success: {
      main: '#00C853',
    },
    error: {
      main: '#D32F2F',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: 32,
      lineHeight: '40px',
      fontWeight: 600,
    },
    h2: {
      fontSize: 24,
      lineHeight: '32px',
      fontWeight: 600,
    },
    h3: {
      fontSize: 20,
      lineHeight: '28px',
      fontWeight: 600,
    },
    body1: {
      fontSize: 16,
      lineHeight: '24px',
    },
    body2: {
      fontSize: 14,
      lineHeight: '20px',
    },
    caption: {
      fontSize: 12,
      lineHeight: '16px',
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
        <Routes>
          <Route path="/" element={<InputScreen />} />
          <Route path="/streaming-results" element={<StreamingResults />} />
          <Route path="/practitioners" element={<PractitionerList />} />
          <Route path="/practitioner/:practitionerId" element={<PractitionerDetail />} />
          <Route path="/practitioner/:practitionerId/all-data" element={<PractitionerAllData />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App