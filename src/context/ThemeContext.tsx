import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Theme } from '@mui/material/styles';
import useTheme from '../hooks/useTheme';

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
};

interface ThemeContextProviderProps {
  children: React.ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ children }) => {
  const theme = useTheme();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand persist middleware to complete rehydration
  useEffect(() => {
    // Use a small delay to ensure persist middleware has completed
    const timer = setTimeout(() => {
      setIsHydrated(true);
      console.log('🎨 ThemeContextProvider: Hydration complete, theme stabilized');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Provide a stable theme context value
  const contextValue: ThemeContextType = {
    theme,
  };

  // Don't render children until hydration is complete to prevent unmount/remount
  if (!isHydrated) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
