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
};

// primary/secondary/tertiary are always CSS variable references —
// the CSS themes file owns their resolved values.
const CSS_VAR_BASE = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  tertiary: "var(--color-tertiary)",
} as const;

// Border/bg opacity presets — (border, borderFaint, bg)
function borders(
  b: number,
  f: number,
  bg: number,
): Pick<ThemeColorPalette, "border" | "borderFaint" | "bg"> {
  const p = "var(--color-primary-rgb)";
  return {
    border: `rgba(${p}, ${b})`,
    borderFaint: `rgba(${p}, ${f})`,
    bg: `rgba(${p}, ${bg})`,
  };
}

export const THEME_COLORS: Record<string, ThemeColorPalette> = {
  default: { ...CSS_VAR_BASE, ...borders(0.12, 0.08, 0.04) },
  pink: { ...CSS_VAR_BASE, ...borders(0.35, 0.15, 0.06) },
  red: { ...CSS_VAR_BASE, ...borders(0.35, 0.15, 0.06) },
  yellow: { ...CSS_VAR_BASE, ...borders(0.35, 0.15, 0.06) },
  obsidian: { ...CSS_VAR_BASE, ...borders(0.3, 0.12, 0.05) },
  solarized: { ...CSS_VAR_BASE, ...borders(0.3, 0.12, 0.05) },
  skyrim: { ...CSS_VAR_BASE, ...borders(0.3, 0.12, 0.05) },
  gruvbox: { ...CSS_VAR_BASE, ...borders(0.3, 0.12, 0.05) },
  midnight: { ...CSS_VAR_BASE, ...borders(0.25, 0.1, 0.04) },
  tokyonight: { ...CSS_VAR_BASE, ...borders(0.25, 0.1, 0.04) },
  ubuntu: { ...CSS_VAR_BASE, ...borders(0.35, 0.15, 0.06) },
  void: { ...CSS_VAR_BASE, ...borders(0.35, 0.15, 0.05) },
  winxp: { ...CSS_VAR_BASE, ...borders(0.4, 0.18, 0.07) },
  cyber: { ...CSS_VAR_BASE, ...borders(0.4, 0.18, 0.07) },
  aurora: { ...CSS_VAR_BASE, ...borders(0.4, 0.18, 0.07) },
  inferno: { ...CSS_VAR_BASE, ...borders(0.4, 0.18, 0.07) },
  toxic: { ...CSS_VAR_BASE, ...borders(0.4, 0.18, 0.07) },
  cobalt: { ...CSS_VAR_BASE, ...borders(0.4, 0.18, 0.07) },
  hc: { ...CSS_VAR_BASE, ...borders(0.8, 0.4, 0.08) },
  matrix: { ...CSS_VAR_BASE, ...borders(0.35, 0.15, 0.06) },
  ocean: { ...CSS_VAR_BASE, ...borders(0.25, 0.1, 0.04) },
};

export function getThemeColors(theme: string): ThemeColorPalette {
  return THEME_COLORS[theme] ?? THEME_COLORS.default;
}
