import { useMemo } from 'react';
import { createTheme, Theme } from '@mui/material/styles';
import { useAppConfigStore } from '../stores/useAppConfigStore';

// Create stable theme objects outside of components to prevent recreation
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

// Custom hook that provides stable theme objects
export const useTheme = (): Theme => {
  // Use a selector that only triggers on actual theme changes
  const themeMode = useAppConfigStore((state) => state.theme);

  // Memoize theme selection to prevent recreation
  const selectedTheme = useMemo(() => {
    console.log('🎨 useTheme: Selecting theme for mode:', themeMode);
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode]);

  return selectedTheme;
};

export default useTheme;
