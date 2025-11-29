import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography, CircularProgress } from '@mui/material';
import './leafletIconFix';
// In your src/index.js or src/App.js
import 'leaflet/dist/leaflet.css';


// Try importing components one by one to find the problematic one
// Start with auth components (least likely to cause issues)
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Import contexts
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

// Lazy load other components to isolate the error
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const MainLayout = React.lazy(() => import('./components/MainLayout'));
const GeofencingPage = React.lazy(() => import('./components/pages/GeofencingPage'));
const DeviceManagementPage = React.lazy(() => import('./components/pages/DeviceManagementPage'));
const TowerLightPage = React.lazy(() => import('./components/pages/TowerLightPage'));
const BatteryPackPage = React.lazy(() => import('./components/pages/BatteryPackPage'));
const MEWPDashboardPage = React.lazy(() => import('./components/pages/MEWPDashboardPage'));
const NotFound = React.lazy(() => import('./components/pages/NotFound'));

// Simple fallback component for lazy loading
const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
    flexDirection="column"
    gap={2}
  >
    <CircularProgress size={60} />
    <Typography>Loading...</Typography>
  </Box>
);

// Temporary simple layout wrapper
const SimpleLayout = ({ children, darkMode, toggleDarkMode }) => {
  return (
    <Box sx={{ p: 3 }}>
      {children}
    </Box>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [open, setOpen] = useState(true);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#7C4DFF' : '#673AB7',
      },
      secondary: {
        main: darkMode ? '#FF4081' : '#F50057',
      },
      background: {
        default: darkMode ? '#1a1a2e' : '#f0f2f5',
        paper: darkMode ? '#2a2a3e' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#333333',
        secondary: darkMode ? '#b0b0b0' : '#666666',
      }
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
          },
        },
      },
    },
  });

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AlertProvider>
          <Router>
            <React.Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Main Application Routes */}
                <Route
                  path="/"
                  element={
                    <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose}>
                      <Dashboard />
                    </MainLayout>
                  }
                />
                <Route
                  path="/geofencing"
                  element={
                    <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose}>
                      <GeofencingPage />
                    </MainLayout>
                  }
                />
                <Route
                  path="/devices"
                  element={
                    <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose}>
                      <DeviceManagementPage />
                    </MainLayout>
                  }
                />
                <Route
                  path="/tower-lights"
                  element={
                    <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose}>
                      <TowerLightPage />
                    </MainLayout>
                  }
                />
                <Route
                  path="/tower-lights/:deviceId"
                  element={
                    <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose}>
                      <TowerLightPage />
                    </MainLayout>
                  }
                />
                <Route
                  path="/battery-packs"
                  element={
                    <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose}>
                      <BatteryPackPage />
                    </MainLayout>
                  }
                />
                <Route
                  path="/mewp"
                  element={
                    <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose}>
                      <MEWPDashboardPage />
                    </MainLayout>
                  }
                />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
          </Router>
        </AlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;