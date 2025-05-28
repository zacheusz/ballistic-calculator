import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { AppProvider } from './context/AppContext';
import { useAppConfigStore } from './stores/useAppConfigStore';
import MuiThemeProvider from './context/MuiThemeProvider';
import { BallisticsStoreProvider } from './context/BallisticsStoreProvider';
import { SnackbarProvider } from 'notistack';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import CalculatorPage from './pages/CalculatorPage';
import ConfigPageMUI from './pages/ConfigPageMUI';
import ZustandTest from './zustandIntegrationTest';

// Toast container that uses the current theme
function ThemedToastContainer() {
  const { theme } = useAppConfigStore();
  return (
    <ToastContainer 
      position="bottom-right"
      theme={theme}
    />
  );
}

// Wrapper component that uses theme from Zustand store
function ThemedApp() {
  const { theme } = useAppConfigStore();
  
  // Synchronize theme with Bootstrap data-bs-theme attributes
  useEffect(() => {
    // Apply theme to both HTML and body elements for Bootstrap components
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.body.setAttribute('data-bs-theme', theme);
    console.log('Theme synchronized with Bootstrap:', theme);
  }, [theme]);
  
  // Force remount of the entire MUI theme tree when theme changes
  return (
    <MuiThemeProvider key={`mui-theme-${theme}`}>
      <LocalizationProvider dateAdapter={AdapterDayjs} key={`localization-${theme}`}>
        <SnackbarProvider 
          maxSnack={3} 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={3000}
        >
          <BallisticsStoreProvider>
            <AppProvider>
              <Router>
                <Navigation />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/calculator" element={<CalculatorPage />} />
                    <Route path="/config" element={<ConfigPageMUI />} />
                    <Route path="/zustand-test" element={<ZustandTest />} />
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

function App() {
  return <ThemedApp />;
}

export default App;
