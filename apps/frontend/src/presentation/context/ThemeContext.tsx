import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme =
  | "default"
  | "light"
  | "pink"
  | "red"
  | "yellow"
  | "matrix"
  | "obsidian"
  | "midnight"
  | "ocean"
  | "winxp"
  | "ubuntu"
  | "solarized"
  | "deardiary"
  | "gruvbox"
  | "tokyonight"
  | "void"
  | "hc"
  | "cyber"
  | "aurora"
  | "inferno"
  | "toxic"
  | "cobalt"
  | "premier-league";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  cycleTheme: () => void;
}

const VALID_THEMES: Array<Theme> = [
  "default",
  "light",
  "pink",
  "red",
  "yellow",
  "matrix",
  "obsidian",
  "midnight",
  "ocean",
  "winxp",
  "ubuntu",
  "solarized",
  "deardiary",
  "gruvbox",
  "tokyonight",
  "void",
  "hc",
  "cyber",
  "aurora",
  "inferno",
  "toxic",
  "cobalt",
  "premier-league",
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("app-theme") as Theme | null;
    return stored && VALID_THEMES.includes(stored) ? stored : "default";
  });

  React.useLayoutEffect(() => {
    const initialTheme =
      (localStorage.getItem("app-theme") as Theme) || "default";
    document.body.classList.add(`theme-${initialTheme}`);
  }, []);

  useEffect(() => {
    document.body.classList.remove(...VALID_THEMES.map((t) => `theme-${t}`));
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);

  const cycleTheme = () => {
    setThemeState((prev) => {
      const idx = VALID_THEMES.indexOf(prev);
      return VALID_THEMES[(idx + 1) % VALID_THEMES.length];
    });
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme: cycleTheme, cycleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
