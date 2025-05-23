import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

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

function App() {
  return (
    <ThemeProvider>
      <MuiThemeProvider>
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
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;
