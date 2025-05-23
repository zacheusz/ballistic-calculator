import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { AppProvider } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import MuiThemeProvider from './context/MuiThemeProvider';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import CalculatorPage from './pages/CalculatorPage';
import ConfigPage from './pages/ConfigPage';

// Toast container that uses the current theme
function ThemedToastContainer() {
  const { theme } = useTheme();
  return (
    <ToastContainer 
      position="bottom-right"
      theme={theme}
    />
  );
}

// Wrapper component that uses theme context after it's available
function ThemedApp() {
  const { theme } = useTheme();
  
  // Force remount of the entire MUI theme tree when theme changes
  return (
    <MuiThemeProvider key={`mui-theme-${theme}`}>
      <LocalizationProvider dateAdapter={AdapterDayjs} key={`localization-${theme}`}>
        <AppProvider>
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
        </AppProvider>
      </LocalizationProvider>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;
