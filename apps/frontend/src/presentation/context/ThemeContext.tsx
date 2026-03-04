import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'default' | 'light' | 'neon';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('app-theme') as Theme | null;
    return stored || 'default';
  });

  React.useLayoutEffect(() => {
    const initialTheme = (localStorage.getItem('app-theme') as Theme) || 'default';
    document.body.classList.add(`theme-${initialTheme}`);
  }, []);

  useEffect(() => {
    document.body.classList.remove('theme-default', 'theme-light', 'theme-neon');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);

  const cycleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'default') return 'light';
      if (prev === 'light') return 'neon';
      return 'default';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme: cycleTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}