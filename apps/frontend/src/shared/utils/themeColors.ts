export type ThemeColorPalette = {
  // These three always equal var(--color-primary/secondary/tertiary) —
  // returned as CSS variable references so inline styles and CSS classes
  // are always in sync with the active theme.
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

  // Explicit status colors — always visually distinct regardless of theme hue.
  // These ARE hardcoded hex because they need to override the theme hue for
  // semantic meaning (good/warn/hot). Used by getTemperatureColor etc. when
  // you need a resolved color (e.g. for SVG stroke, canvas, or box-shadow).
  statusGood: string;
  statusWarn: string;
  statusHot: string;
};

// A single shared palette object whose primary/secondary/tertiary fields
// always point to the active CSS variables. There is no need for per-theme
// entries for these three fields — the CSS themes file owns those values.
const CSS_VAR_BASE = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  tertiary: "var(--color-tertiary)",
} as const;

export const THEME_COLORS: Record<string, ThemeColorPalette> = {
  default: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.12)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.08)",
    bg: "rgba(var(--color-primary-rgb), 0.04)",
    statusGood: "#00ff9d",
    statusWarn: "#ffb300",
    statusHot: "#ff3d57",
  },
  light: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.18)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.10)",
    bg: "rgba(var(--color-primary-rgb), 0.04)",
    statusGood: "#16a34a",
    statusWarn: "#b45309",
    statusHot: "#b91c1c",
  },
  pink: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.35)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.15)",
    bg: "rgba(var(--color-primary-rgb), 0.06)",
    statusGood: "#00e5b0",
    statusWarn: "#ffe066",
    statusHot: "#ff4444",
  },
  red: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.35)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.15)",
    bg: "rgba(var(--color-primary-rgb), 0.06)",
    statusGood: "#4dffb0",
    statusWarn: "#ffd166",
    statusHot: "#ff6b35",
  },
  yellow: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.35)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.15)",
    bg: "rgba(var(--color-primary-rgb), 0.06)",
    statusGood: "#39ff88",
    statusWarn: "#ff9900",
    statusHot: "#ff3d3d",
  },
  matrix: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.35)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.15)",
    bg: "rgba(var(--color-primary-rgb), 0.06)",
    statusGood: "#00e5ff",
    statusWarn: "#ffdd00",
    statusHot: "#ff4444",
  },
  obsidian: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.30)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.12)",
    bg: "rgba(var(--color-primary-rgb), 0.05)",
    statusGood: "#86efac",
    statusWarn: "#fcd34d",
    statusHot: "#f87171",
  },
  midnight: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.25)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.10)",
    bg: "rgba(var(--color-primary-rgb), 0.04)",
    statusGood: "#34d399",
    statusWarn: "#fbbf24",
    statusHot: "#f87171",
  },
  forest: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.25)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.10)",
    bg: "rgba(var(--color-primary-rgb), 0.04)",
    statusGood: "#60d9a0",
    statusWarn: "#f59e0b",
    statusHot: "#ef4444",
  },
  aurora: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.20)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.10)",
    bg: "rgba(var(--color-primary-rgb), 0.04)",
    statusGood: "#00e5cc",
    statusWarn: "#f0c040",
    statusHot: "#ff6a9b",
  },
  ocean: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.25)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.10)",
    bg: "rgba(var(--color-primary-rgb), 0.04)",
    statusGood: "#00ffcc",
    statusWarn: "#f0c040",
    statusHot: "#ff5a5a",
  },
  neon: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.30)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.12)",
    bg: "rgba(var(--color-primary-rgb), 0.05)",
    statusGood: "#00ffcc",
    statusWarn: "#ffdd00",
    statusHot: "#ff2d78",
  },
  cyberpunk: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.35)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.15)",
    bg: "rgba(var(--color-primary-rgb), 0.05)",
    statusGood: "#00f0ff",
    statusWarn: "#f9e900",
    statusHot: "#ff2d78",
  },
  winxp: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.40)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.18)",
    bg: "rgba(var(--color-primary-rgb), 0.07)",
    statusGood: "#5abf2a",
    statusWarn: "#e8a000",
    statusHot: "#d93030",
  },
  aqua: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.30)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.12)",
    bg: "rgba(var(--color-primary-rgb), 0.05)",
    statusGood: "#29c940",
    statusWarn: "#febc2e",
    statusHot: "#fe5f57",
  },
  ubuntu: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.35)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.15)",
    bg: "rgba(var(--color-primary-rgb), 0.06)",
    statusGood: "#0e8420",
    statusWarn: "#f5a623",
    statusHot: "#e95420",
  },
  solarized: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.30)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.12)",
    bg: "rgba(var(--color-primary-rgb), 0.05)",
    statusGood: "#859900",
    statusWarn: "#b58900",
    statusHot: "#dc322f",
  },
  dracula: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.30)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.12)",
    bg: "rgba(var(--color-primary-rgb), 0.05)",
    statusGood: "#50fa7b",
    statusWarn: "#f1fa8c",
    statusHot: "#ff5555",
  },
  nord: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.25)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.10)",
    bg: "rgba(var(--color-primary-rgb), 0.04)",
    statusGood: "#a3be8c",
    statusWarn: "#ebcb8b",
    statusHot: "#bf616a",
  },
  gruvbox: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.30)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.12)",
    bg: "rgba(var(--color-primary-rgb), 0.05)",
    statusGood: "#b8bb26",
    statusWarn: "#fabd2f",
    statusHot: "#fb4934",
  },
  tokyonight: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.25)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.10)",
    bg: "rgba(var(--color-primary-rgb), 0.04)",
    statusGood: "#9ece6a",
    statusWarn: "#e0af68",
    statusHot: "#f7768e",
  },
  catppuccin: {
    ...CSS_VAR_BASE,
    border: "rgba(var(--color-primary-rgb), 0.25)",
    borderFaint: "rgba(var(--color-primary-rgb), 0.10)",
    bg: "rgba(var(--color-primary-rgb), 0.04)",
    statusGood: "#a6e3a1",
    statusWarn: "#f9e2af",
    statusHot: "#f38ba8",
  },
};

export function getThemeColors(theme: string): ThemeColorPalette {
  return THEME_COLORS[theme] ?? THEME_COLORS.default;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Status color utilities
   These return hardcoded hex (from statusGood/Warn/Hot) because they are used
   in contexts that need a resolved value: SVG stroke, canvas fill, box-shadow.
   For plain text/border coloring in JSX, prefer var(--color-green) etc. directly.
   ───────────────────────────────────────────────────────────────────────── */

export function getTemperatureColor(
  celsius: number,
  theme = "default",
): string {
  const { statusGood, statusWarn, statusHot } = getThemeColors(theme);
  if (celsius < 60) return statusGood;
  if (celsius < 75) return statusWarn;
  return statusHot;
}

export function getLoadColor(percent: number, theme = "default"): string {
  const { statusGood, statusWarn, statusHot } = getThemeColors(theme);
  if (percent < 50) return statusGood;
  if (percent < 80) return statusWarn;
  return statusHot;
}

export function getLatencyColor(ms: number, theme = "default"): string {
  if (ms === 0) return "rgba(255,255,255,0.2)";
  const { statusGood, statusWarn, statusHot } = getThemeColors(theme);
  if (ms < 20) return statusGood;
  if (ms < 60) return statusWarn;
  return statusHot;
}

export function getMemoryColor(percentUsed: number, theme = "default"): string {
  const { statusGood, statusWarn, statusHot } = getThemeColors(theme);
  if (percentUsed > 85) return statusHot;
  if (percentUsed > 65) return statusWarn;
  return statusGood;
}

export function getFpsColor(fps: number | null, theme = "default"): string {
  const { statusGood, statusWarn, statusHot } = getThemeColors(theme);
  if (fps === null) return statusGood;
  if (fps >= 120) return statusGood;
  if (fps >= 60) return statusWarn;
  return statusHot;
}
