export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  logo?: string;
  businessName?: string;
}

export const defaultTheme: ThemeConfig = {
  primary: "#a7c7e7",
  secondary: "#b8e0d2",
  accent: "#ffc9b9",
  businessName: "draftiq",
};

// convert hex to rgb for rgba usage
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0, 0, 0";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

// darken a hex color by a percentage
function darken(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * percent));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// apply theme to css custom properties
export function applyTheme(theme: ThemeConfig): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--color-primary", theme.primary);
  root.style.setProperty("--color-primary-dark", darken(theme.primary, 0.08));
  root.style.setProperty("--color-primary-rgb", hexToRgb(theme.primary));
  root.style.setProperty("--color-secondary", theme.secondary);
  root.style.setProperty("--color-secondary-dark", darken(theme.secondary, 0.08));
  root.style.setProperty("--color-accent", theme.accent);
  root.style.setProperty("--color-accent-dark", darken(theme.accent, 0.08));
}

// generate a complementary palette from a single primary color
export function generatePalette(primary: string): ThemeConfig {
  const num = parseInt(primary.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  // secondary: shift hue towards green/teal
  const sr = Math.round(r * 0.7);
  const sg = Math.min(255, Math.round(g * 1.2));
  const sb = Math.round(b * 0.85);

  // accent: shift hue towards warm coral
  const ar = Math.min(255, Math.round(r * 1.3));
  const ag = Math.round(g * 0.8);
  const ab = Math.round(b * 0.75);

  return {
    primary,
    secondary: `#${((sr << 16) | (sg << 8) | sb).toString(16).padStart(6, "0")}`,
    accent: `#${((ar << 16) | (ag << 8) | ab).toString(16).padStart(6, "0")}`,
  };
}
