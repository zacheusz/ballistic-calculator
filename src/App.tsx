import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { AppProvider } from './context/AppContext.tsx';
import { useAppConfigStore } from './stores/useAppConfigStore';
import MuiThemeProvider from './context/MuiThemeProvider';
import { BallisticsStoreProvider } from './context/BallisticsStoreProvider';
import { SnackbarProvider } from 'notistack';
import NavigationMUI from './components/NavigationMUI';
import HomePageMUI from './pages/HomePageMUI';
import CalculatorPage from './pages/CalculatorPage';
import ConfigPageMUI from './pages/ConfigPageMUI';

// Toast container that uses the current theme
const ThemedToastContainer: React.FC = () => {
  const { theme } = useAppConfigStore();
  return (
    <ToastContainer 
      position="bottom-right"
      theme={theme}
    />
  );
}

// Wrapper component that uses theme from Zustand store
const ThemedApp: React.FC = () => {
  const { theme } = useAppConfigStore();
  
  // Log theme changes for debugging
  useEffect(() => {
    console.log('Theme changed to:', theme);
  }, [theme]);
  
  // Force remount of the entire MUI theme tree when theme changes
  return (
    <MuiThemeProvider key={`mui-theme-${theme}`}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SnackbarProvider 
          maxSnack={3} 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={3000}
        >
          <BallisticsStoreProvider>
            <AppProvider>
              <Router>
                <NavigationMUI />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePageMUI />} />
                    <Route path="/calculator" element={<CalculatorPage />} />
                    <Route path="/config" element={<ConfigPageMUI />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <ThemedToastContainer />
              </Router>
            </AppProvider>
          </BallisticsStoreProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </MuiThemeProvider>
  );
}

const App: React.FC = () => {
  return <ThemedApp />;
}

export default App;
