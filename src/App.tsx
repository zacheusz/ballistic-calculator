import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import ThemeContextProvider from './context/ThemeContext';
import { BallisticsStoreProvider } from './context/BallisticsStoreProvider';
import { SnackbarProvider } from 'notistack';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import CalculatorPage from './pages/CalculatorPage';
import ConfigPage from './pages/ConfigPage';
import { useApiSync } from './hooks/useApiSync';
import { useAppConfigStore } from './stores/useAppConfigStore';

// Toast container that uses the current theme
const ThemedToastContainer: React.FC = () => {
  const theme = useAppConfigStore(state => state.theme);
  return (
    <ToastContainer
      theme={theme}
      position="bottom-center"
    />
  );
}

// Main app component with theme context
const AppContent: React.FC = () => {
  // Use the API sync hook to keep API service in sync with Zustand store
  useApiSync();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <SnackbarProvider 
        maxSnack={3} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={3000}
      >
        <BallisticsStoreProvider>
          <Router>
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/calculator" element={<CalculatorPage />} />
                <Route path="/config" element={<ConfigPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <ThemedToastContainer />
          </Router>
        </BallisticsStoreProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  );
};

export default App;
