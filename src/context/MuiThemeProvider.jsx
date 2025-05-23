import React, { useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useTheme } from './ThemeContext';

/**
 * MUI Theme Provider that syncs with our application theme
 * This ensures MUI components like the TimePicker properly reflect dark/light mode
 */
const MuiThemeProvider = ({ children }) => {
  const { theme } = useTheme();
  
  // Create a MUI theme that matches our application theme
  const muiTheme = useMemo(() => 
    createTheme({
      palette: {
        mode: theme,
        ...(theme === 'dark' ? {
          // Dark mode specific overrides
          text: {
            primary: '#fff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
        } : {
          // Light mode specific overrides (if needed)
        }),
      },
      components: {
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme === 'dark' ? '#90caf9' : '#1976d2',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
              },
              color: theme === 'dark' ? '#fff' : 'inherit',
            },
            input: {
              color: theme === 'dark' ? '#fff' : 'inherit',
            },
          },
        },
        MuiPickersDay: {
          styleOverrides: {
            root: {
              color: theme === 'dark' ? '#fff' : 'inherit',
            },
          },
        },
      },
    }), [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      {children}
    </ThemeProvider>
  );
};

export default MuiThemeProvider;
