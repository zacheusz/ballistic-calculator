import { createContext, useState, useEffect, useContext } from 'react';

// Create a dedicated context for theme management
const ThemeContext = createContext();

/**
 * Theme provider component that manages application-wide theme state
 * Following best practices for theme management in React applications
 */
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('snipe_ballistics_theme') || 'light';
  });

  // Apply theme whenever it changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('snipe_ballistics_theme', theme);
    
    // Apply to HTML and body elements for Bootstrap theming
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.body.setAttribute('data-bs-theme', theme);
    
    // Set color-scheme for browser UI elements (scrollbars, etc.)
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // Theme toggle function
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Set specific theme
  const setSpecificTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setSpecificTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
