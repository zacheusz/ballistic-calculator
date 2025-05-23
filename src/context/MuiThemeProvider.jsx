import React, { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from './ThemeContext';

/**
 * MUI Theme Provider that syncs with our application theme
 * Using standard MUI theming approach
 */
const MuiThemeProvider = ({ children }) => {
  const { theme } = useTheme();
  
  // Create a theme with MUI's standard approach
  const muiTheme = useMemo(() => {
    return createTheme({
      // Set the base palette mode to match our theme
      palette: {
        mode: theme,
      },
    });
  }, [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default MuiThemeProvider;
