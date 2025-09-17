import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = () => {
      try {
        // Check localStorage first
        const saved = localStorage.getItem('theme');
        let shouldBeDark = false;
        
        if (saved === 'dark') {
          shouldBeDark = true;
        } else if (saved === 'light') {
          shouldBeDark = false;
        } else {
          // Fall back to system preference
          shouldBeDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches || false;
        }
        
        setIsDarkMode(shouldBeDark);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing theme:', error);
        setIsDarkMode(false);
        setIsInitialized(true);
      }
    };
    
    initializeTheme();
  }, []);

  // Apply theme when isDarkMode changes
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      const htmlElement = document.documentElement;
      
      if (isDarkMode) {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }

      // Save to localStorage
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [isDarkMode, isInitialized]);


  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const setTheme = (theme) => {
    setIsDarkMode(theme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleTheme,
      setTheme,
      theme: isDarkMode ? 'dark' : 'light',
      isInitialized
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export both the hook and provider
export { useTheme, ThemeProvider };
