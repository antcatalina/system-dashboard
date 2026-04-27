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

// primary/secondary/tertiary are always CSS variable references —
// the CSS themes file owns their resolved values.
const CSS_VAR_BASE = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  tertiary: "var(--color-tertiary)",
} as const;

// Border/bg opacity presets — (border, borderFaint, bg)
function borders(b: number, f: number, bg: number) {
  const p = "var(--color-primary-rgb)";
  return {
    border: `rgba(${p}, ${b})`,
    borderFaint: `rgba(${p}, ${f})`,
    bg: `rgba(${p}, ${bg})`,
  };
}

// Status color presets
const STATUS_COLORS = {
  statusGood: "rgb(var(--color-green-rgb))",
  statusWarn: "rgb(var(--color-amber-rgb))",
  statusHot: "rgb(var(--color-red-rgb))",
} as const;

export const THEME_COLORS: Record<string, ThemeColorPalette> = {
  // Unique status colors
  default: {
    ...CSS_VAR_BASE,
    ...borders(0.12, 0.08, 0.04),
    statusGood: "#00ff9d",
    statusWarn: "#ffb300",
    statusHot: "#ff3d57",
  },
  light: {
    ...CSS_VAR_BASE,
    ...borders(0.18, 0.1, 0.04),
    statusGood: "#16a34a",
    statusWarn: "#b45309",
    statusHot: "#b91c1c",
  },
  pink: {
    ...CSS_VAR_BASE,
    ...borders(0.35, 0.15, 0.06),
    statusGood: "#00e5b0",
    statusWarn: "#ffe066",
    statusHot: "#ff4444",
  },

  // Standard green/amber/red
  red: { ...CSS_VAR_BASE, ...borders(0.35, 0.15, 0.06), ...STATUS_COLORS },
  yellow: { ...CSS_VAR_BASE, ...borders(0.35, 0.15, 0.06), ...STATUS_COLORS },
  obsidian: { ...CSS_VAR_BASE, ...borders(0.3, 0.12, 0.05), ...STATUS_COLORS },
  solarized: { ...CSS_VAR_BASE, ...borders(0.3, 0.12, 0.05), ...STATUS_COLORS },
  dracula: { ...CSS_VAR_BASE, ...borders(0.3, 0.12, 0.05), ...STATUS_COLORS },
  gruvbox: { ...CSS_VAR_BASE, ...borders(0.3, 0.12, 0.05), ...STATUS_COLORS },
  midnight: { ...CSS_VAR_BASE, ...borders(0.25, 0.1, 0.04), ...STATUS_COLORS },
  tokyonight: { ...CSS_VAR_BASE, ...borders(0.25, 0.1, 0.04), ...STATUS_COLORS },
  ubuntu: { ...CSS_VAR_BASE, ...borders(0.35, 0.15, 0.06), ...STATUS_COLORS },
  void: { ...CSS_VAR_BASE, ...borders(0.35, 0.15, 0.05), ...STATUS_COLORS },
  winxp: { ...CSS_VAR_BASE, ...borders(0.4, 0.18, 0.07), ...STATUS_COLORS },
  cyber: { ...CSS_VAR_BASE, ...borders(0.4, 0.18, 0.07), ...STATUS_COLORS },
  aurora: { ...CSS_VAR_BASE, ...borders(0.4, 0.18, 0.07), ...STATUS_COLORS },
  inferno: { ...CSS_VAR_BASE, ...borders(0.4, 0.18, 0.07), ...STATUS_COLORS },
  toxic: { ...CSS_VAR_BASE, ...borders(0.4, 0.18, 0.07), ...STATUS_COLORS },
  cobalt: { ...CSS_VAR_BASE, ...borders(0.4, 0.18, 0.07), ...STATUS_COLORS },
  hc: { ...CSS_VAR_BASE, ...borders(0.8, 0.4, 0.08), ...STATUS_COLORS },
  matrix: { ...CSS_VAR_BASE, ...borders(0.35, 0.15, 0.06), ...STATUS_COLORS },
  ocean: { ...CSS_VAR_BASE, ...borders(0.25, 0.1, 0.04), ...STATUS_COLORS },
};

export function getThemeColors(theme: string): ThemeColorPalette {
  return THEME_COLORS[theme] ?? THEME_COLORS.default;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Status color utilities
   These return resolved values from statusGood/Warn/Hot because they are used
   in contexts that need a concrete color: SVG stroke, canvas fill, box-shadow.
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
  if (fps === null || fps >= 120) return statusGood;
  if (fps >= 60) return statusWarn;
  return statusHot;
}
