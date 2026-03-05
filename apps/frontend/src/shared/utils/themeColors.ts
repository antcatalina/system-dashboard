export type ThemeColorPalette = {
  primary: string;
  secondary: string;
  tertiary: string;
  border: string;
  borderFaint: string;
  bg: string;
  power?: string;
  powerHot?: string;
  svgStroke?: string;
  svgFill?: string;
};

export const THEME_COLORS: Record<string, ThemeColorPalette> = {
  default: {
    primary: "#00e5ff",
    secondary: "#00ff9d",
    tertiary: "#7b61ff",
    border: "rgba(0,229,255,0.12)",
    borderFaint: "rgba(0,229,255,0.08)",
    bg: "rgba(0,229,255,0.04)",
  },
  light: {
    primary: "#5b21b6",
    secondary: "#7c3aed",
    tertiary: "#a78bfa",
    border: "rgba(91,33,182,0.18)",
    borderFaint: "rgba(91,33,182,0.1)",
    bg: "rgba(91,33,182,0.04)",
  },
  pink: {
    primary: "#ff006e",
    secondary: "#ff10a8",
    tertiary: "#ff80c8",
    border: "rgba(255,0,110,0.35)",
    borderFaint: "rgba(255,0,110,0.15)",
    bg: "rgba(255,0,110,0.06)",
  },
  red: {
    primary: "#ff3d3d",
    secondary: "#ff6b6b",
    tertiary: "#ff9999",
    border: "rgba(255,61,61,0.35)",
    borderFaint: "rgba(255,61,61,0.15)",
    bg: "rgba(255,61,61,0.06)",
  },
  yellow: {
    primary: "#ffff00",
    secondary: "#ffff4d",
    tertiary: "#ffd700",
    border: "rgba(255,255,0,0.35)",
    borderFaint: "rgba(255,255,0,0.15)",
    bg: "rgba(255,255,0,0.06)",
  },
  obsidian: {
    primary: "#c084fc",
    secondary: "#e9d5ff",
    tertiary: "#f5f0e8",
    border: "rgba(192,132,252,0.3)",
    borderFaint: "rgba(192,132,252,0.12)",
    bg: "rgba(192,132,252,0.05)",
  },
  midnight: {
    primary: "#4d9fff",
    secondary: "#a78bfa",
    tertiary: "#c0d8ff",
    border: "rgba(77,159,255,0.25)",
    borderFaint: "rgba(77,159,255,0.1)",
    bg: "rgba(77,159,255,0.04)",
  },
  forest: {
    primary: "#4ade80",
    secondary: "#86efac",
    tertiary: "#d4a574",
    border: "rgba(74,222,128,0.25)",
    borderFaint: "rgba(74,222,128,0.1)",
    bg: "rgba(74,222,128,0.04)",
  },
  aurora: {
    primary: "#00e5cc",
    secondary: "#bf5af2",
    tertiary: "#ff6a9b",
    border: "rgba(0,229,204,0.2)",
    borderFaint: "rgba(0,229,204,0.1)",
    bg: "rgba(0,229,204,0.04)",
  },
  ocean: {
    primary: "#0096ff",
    secondary: "#00e5ff",
    tertiary: "#00ffcc",
    border: "rgba(0,150,255,0.25)",
    borderFaint: "rgba(0,150,255,0.1)",
    bg: "rgba(0,150,255,0.04)",
  },
  matrix: {
    primary: "#00ff9d",
    secondary: "#00ffb3",
    tertiary: "#39ff14",
    border: "rgba(0,255,157,0.35)",
    borderFaint: "rgba(0,255,157,0.15)",
    bg: "rgba(0,255,157,0.06)",
  },
  neon: {
    primary: "#bf5af2",
    secondary: "#ffff00",
    tertiary: "#ff2d78",
    border: "rgba(191,90,242,0.3)",
    borderFaint: "rgba(191,90,242,0.12)",
    bg: "rgba(191,90,242,0.05)",
  },
    cyberpunk: {
    primary: "#f9e900",
    secondary: "#ff2d78",
    tertiary: "#00f0ff",
    border: "rgba(249,233,0,0.35)",
    borderFaint: "rgba(249,233,0,0.15)",
    bg: "rgba(249,233,0,0.05)",
  },
};

export function getThemeColors(theme: string): ThemeColorPalette {
  return THEME_COLORS[theme] ?? THEME_COLORS.default;
}
