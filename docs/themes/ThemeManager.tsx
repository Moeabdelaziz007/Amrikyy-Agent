import React, { createContext, useContext, useState, useEffect } from 'react';

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  fontFamily: string;
  animations: boolean;
  glassmorphism: boolean;
}

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultThemes: Theme[] = [
  {
    id: 'dark-quantum',
    name: 'Dark Quantum',
    colors: {
      primary: '#00C4FF',
      secondary: '#8A2BE2',
      background: '#1A1A2E',
      surface: 'rgba(255, 255, 255, 0.05)',
      text: '#E0E0E0',
      accent: '#FFD700',
    },
    fontFamily: 'Inter, sans-serif',
    animations: true,
    glassmorphism: true,
  },
  {
    id: 'light-nova',
    name: 'Light Nova',
    colors: {
      primary: '#FFD700',
      secondary: '#FF6347',
      background: '#F0F2F5',
      surface: 'rgba(255, 255, 255, 0.8)',
      text: '#333333',
      accent: '#00C4FF',
    },
    fontFamily: 'Roboto, sans-serif',
    animations: true,
    glassmorphism: false,
  }
];

export const DocumentationThemeManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[0]);

  useEffect(() => {
    // Apply theme to documentation
    applyThemeToDocumentation(currentTheme);
    localStorage.setItem('docs-theme', currentTheme.id);
  }, [currentTheme]);

  const applyThemeToDocumentation = (theme: Theme) => {
    const root = document.documentElement;
    
    // Apply CSS variables for documentation
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--docs-color-${key}`, value);
    });
    
    // Apply documentation-specific styles
    root.style.setProperty('--docs-font-family', theme.fontFamily);
    root.style.setProperty('--docs-animations', theme.animations ? '1' : '0');
  };

  const setTheme = (themeId: string) => {
    const theme = defaultThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  const toggleDarkMode = () => {
    const darkTheme = defaultThemes.find(t => t.id === 'dark-quantum');
    const lightTheme = defaultThemes.find(t => t.id === 'light-nova');
    
    if (currentTheme.id === 'dark-quantum' && lightTheme) {
      setCurrentTheme(lightTheme);
    } else if (darkTheme) {
      setCurrentTheme(darkTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themes: defaultThemes, setTheme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a DocumentationThemeManager');
  }
  return context;
};
