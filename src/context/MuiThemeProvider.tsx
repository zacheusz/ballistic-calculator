import React, { useMemo, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppConfigStore } from '../stores/useAppConfigStore';

interface MuiThemeProviderProps {
  children: ReactNode;
}

// Create stable theme objects outside component to prevent recreation
const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

/**
 * MUI Theme Provider that syncs with our application theme
 * Using stable theme objects to prevent unnecessary re-renders
 */
const MuiThemeProvider: React.FC<MuiThemeProviderProps> = ({ children }) => {
  const { theme } = useAppConfigStore();
  
  // Use stable theme objects instead of creating new ones
  const muiTheme = useMemo(() => {
    return theme === 'dark' ? darkTheme : lightTheme;
  }, [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default MuiThemeProvider;
