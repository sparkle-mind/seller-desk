// ─── Theme palette definitions & colour maths ───────────────────────────────
// Shared by ThemeContext (CSS custom properties) and ThemeRegistry (MUI theme)
// so the whole app always uses the exact same tonal scale.

// Each palette carries its original values (used by dark mode, unchanged) plus
// a `light` variant tuned for the "Lapels" light theme: warm, muted, tailored
// tones that sit naturally on linen and ivory surfaces.
export const PALETTES = {
  default: {
    label: "Ocean",
    color: "#2563eb",
    primary: "#2563eb",
    primaryDark: "#1d4ed8",
    darkPrimary: "#60a5fa",
    light: { label: "Lapels", color: "#3d4535", primary: "#3d4535", primaryDark: "#2b3125" },
    lapelsDark: { label: "Camel", color: "#c49a5c", primary: "#c49a5c" },
  },
  slate: {
    label: "Slate",
    color: "#64748b",
    primary: "#475569",
    primaryDark: "#334155",
    darkPrimary: "#94a3b8",
    light: { label: "Stone", color: "#55606a", primary: "#4c5660", primaryDark: "#383f47" },
    lapelsDark: { label: "Stone", color: "#a9b2ba", primary: "#a9b2ba" },
  },
  graphite: {
    label: "Graphite",
    color: "#6b7280",
    primary: "#374151",
    primaryDark: "#1f2937",
    darkPrimary: "#cbd5e1",
    light: { label: "Charcoal", color: "#3a3631", primary: "#3a3631", primaryDark: "#25221e" },
    lapelsDark: { label: "Ivory", color: "#e3d9c6", primary: "#e3d9c6" },
  },
  forest: {
    label: "Forest",
    color: "#16a34a",
    primary: "#059669",
    primaryDark: "#047857",
    darkPrimary: "#34d399",
    light: { label: "Loden", color: "#4a6741", primary: "#3f5b3c", primaryDark: "#2f452d" },
    lapelsDark: { label: "Sage", color: "#9cb38a", primary: "#9cb38a" },
  },
  sand: {
    label: "Sand",
    color: "#d97706",
    primary: "#d97706",
    primaryDark: "#b45309",
    darkPrimary: "#fbbf24",
    light: { label: "Bronze", color: "#8b6a3e", primary: "#86663a", primaryDark: "#6b502c" },
    lapelsDark: { label: "Brass", color: "#d2a866", primary: "#d2a866" },
  },
  highContrast: {
    label: "Mono",
    color: "#0f172a",
    primary: "#0f172a",
    primaryDark: "#020617",
    darkPrimary: "#e2e8f0",
    light: { label: "Ink", color: "#1f1b16", primary: "#1f1b16", primaryDark: "#0f0d0a" },
    lapelsDark: { label: "Cream", color: "#f1e8d8", primary: "#f1e8d8" },
  },
};

/** Label + swatch colour for a palette as it appears in the given mode. */
export function paletteDisplay(paletteKey, mode = "light") {
  const palette = PALETTES[paletteKey] || PALETTES.default;
  if (mode === "dark" && palette.lapelsDark) {
    return { label: palette.lapelsDark.label, color: palette.lapelsDark.color };
  }
  if (mode !== "dark" && palette.light) {
    return { label: palette.light.label, color: palette.light.color };
  }
  return { label: palette.label, color: palette.color };
}

export const SURFACES = {
  // Light mode — "Lapels": linen page, ivory cards, espresso ink.
  light: {
    base: "#f3eee5",
    surface: "#fbf9f4",
    surface2: "#f6f1e8",
    surface3: "#ede6d9",
    border: "#e0d6c5",
    borderSubtle: "#ece5d8",
    borderStrong: "#cbbfa9",
    textPrimary: "#2a251f",
    textSecondary: "#5a5145",
    textTertiary: "#776c5c",
    scrollbar: "#d3c8b5",
  },
  // Dark mode: "Lapels" after hours. Near-black page, cream type,
  // camel accent and bronze hairlines.
  dark: {
    base: "#060504",
    surface: "#100e0b",
    surface2: "#17140f",
    surface3: "#201b15",
    border: "#2f271d",
    borderSubtle: "#1f1a14",
    borderStrong: "#4a3c2a",
    textPrimary: "#f1e8d8",
    textSecondary: "#c9bba3",
    textTertiary: "#978a74",
    scrollbar: "#3a3024",
  },
};

const clamp = (value) => Math.min(255, Math.max(0, Math.round(value)));

export function hexToRgb(hex) {
  let value = String(hex || "").trim().replace("#", "");
  if (value.length === 3) {
    value = value.split("").map((c) => c + c).join("");
  }
  if (value.length !== 6) return { r: 0, g: 0, b: 0 };
  const int = parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

const toHex = (n) => clamp(n).toString(16).padStart(2, "0");

export function rgbToHex({ r, g, b }) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Mix two hex colours. t = 0 → a, t = 1 → b */
export function mixHex(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  });
}

export function rgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function rgbChannels(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const channel = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function readableText(hex) {
  // Choose the higher-contrast ink for a coloured surface.
  const lum = relativeLuminance(hex);
  const whiteContrast = 1.05 / (lum + 0.05);
  const darkContrast = (lum + 0.05) / 0.05;
  return whiteContrast >= darkContrast ? "#ffffff" : "#0b1220";
}


function buildScale(primary, primaryDark, surfaces, isDark) {
  if (isDark) {
    // Dark (Lapels after hours): tints sink into near-black, highlights
    // lift toward cream rather than stark white.
    const cream = surfaces.textPrimary;
    return {
      50: mixHex(primary, surfaces.base, 0.88),
      100: mixHex(primary, surfaces.base, 0.8),
      200: mixHex(primary, surfaces.base, 0.64),
      300: mixHex(primary, surfaces.base, 0.4),
      400: mixHex(primary, cream, 0.16),
      500: primary,
      600: primary,
      700: mixHex(primary, cream, 0.24),
      800: mixHex(primary, cream, 0.4),
      900: mixHex(primary, cream, 0.56),
    };
  }

  // Light (Lapels): tints are mixed toward warm ivory, never stark white.
  const paper = surfaces.surface;
  return {
    50: mixHex(primary, paper, 0.93),
    100: mixHex(primary, paper, 0.86),
    200: mixHex(primary, paper, 0.72),
    300: mixHex(primary, paper, 0.5),
    400: mixHex(primary, paper, 0.28),
    500: primary,
    600: primary,
    700: primaryDark,
    800: mixHex(primaryDark, "#000000", 0.16),
    900: mixHex(primaryDark, "#000000", 0.32),
  };
}

function surfaceVars(surfaces) {
  return {
    "--bg-base": surfaces.base,
    "--bg-surface": surfaces.surface,
    "--bg-surface2": surfaces.surface2,
    "--bg-surface3": surfaces.surface3,
    "--border": surfaces.border,
    "--border-subtle": surfaces.borderSubtle,
    "--border-strong": surfaces.borderStrong || surfaces.border,
    "--text-primary": surfaces.textPrimary,
    "--text-secondary": surfaces.textSecondary,
    "--text-tertiary": surfaces.textTertiary,
    "--scrollbar-thumb": surfaces.scrollbar,
  };
}

function appendScale(cssVars, scale) {
  Object.entries(scale).forEach(([shade, colour]) => {
    cssVars[`--brand-${shade}-rgb`] = rgbChannels(colour);
    cssVars[`--brand-${shade}`] = colour;
  });
  return cssVars;
}

// ─── Dark mode tokens: "Lapels" after hours ────────────────────────────────
// Near-black page, cream type, a camel accent, bronze hairlines and quiet,
// deep elevation. Mirrors the reference theme's dark presentation.
const LAPELS_CAMEL = "#c49a5c";
const LAPELS_CREAM = "#f1e8d8";
const LAPELS_NIGHT = "#120f0b";

function deriveDarkTokens(paletteKey, palette) {
  const surfaces = SURFACES.dark;
  const variant = palette.lapelsDark || { primary: palette.darkPrimary || palette.primary };
  const primary = variant.primary;
  const primaryDark = mixHex(primary, "#000000", 0.22);
  const primaryLight = mixHex(primary, LAPELS_CREAM, 0.2);
  const scale = buildScale(primary, primaryDark, surfaces, true);
  // Night ink on light accents (the reference's camel "Live demo" pill).
  const contrastText = readableText(primary) === "#ffffff" ? LAPELS_CREAM : LAPELS_NIGHT;
  const brandText = mixHex(primary, LAPELS_CREAM, 0.18);

  const sidebarBg = "#0a0907";

  const cssVars = {
    ...surfaceVars(surfaces),

    /* Brand */
    "--brand": primary,
    "--brand-rgb": rgbChannels(primary),
    "--brand-contrast": contrastText,
    "--brand-text": brandText,
    "--brand-soft": rgba(primary, 0.12),
    "--brand-soft-strong": rgba(primary, 0.2),
    "--brand-border": rgba(primary, 0.38),
    "--brand-ring": rgba(primary, 0.24),
    "--brand-glow": rgba(primary, 0.22),
    "--app-glow-1": rgba(LAPELS_CAMEL, 0.07),
    "--app-glow-2": rgba(LAPELS_CAMEL, 0.035),
    "--network-dot": rgba(LAPELS_CAMEL, 0.1),

    /* Sidebar: near-black, separated by a bronze hairline */
    "--sidebar-bg": sidebarBg,
    "--sidebar-bg-alt": sidebarBg,
    "--sidebar-hover": rgba(LAPELS_CREAM, 0.05),
    "--sidebar-text": surfaces.textSecondary,
    "--sidebar-subtext": surfaces.textTertiary,
    "--sidebar-active-bg": rgba(primary, 0.12),
    "--sidebar-active-text": brandText,
    "--sidebar-active-border": rgba(primary, 0.32),
    "--sidebar-accent": primary,
    "--sidebar-accent-2": mixHex(primary, LAPELS_CREAM, 0.2),
    "--sidebar-border": rgba(LAPELS_CAMEL, 0.2),
    "--sidebar-glow": rgba(primary, 0.25),

    /* Elevation: deep and soft */
    "--shadow-card": "0 1px 2px rgba(0, 0, 0, 0.5), 0 14px 32px -24px rgba(0, 0, 0, 0.9)",
    "--shadow-popover": "0 2px 8px rgba(0, 0, 0, 0.5), 0 28px 70px -24px rgba(0, 0, 0, 0.95)",
  };

  return {
    paletteKey,
    mode: "dark",
    isDark: true,
    palette,
    surfaces,
    primary,
    primaryLight,
    primaryDark,
    contrastText,
    brandText,
    accent: LAPELS_CAMEL,
    scale,
    cssVars: appendScale(cssVars, scale),
  };
}

// ─── Light mode tokens: "Lapels" menswear design language ──────────────────
// Linen backgrounds, ivory cards, espresso ink, a tailored olive primary and
// a bronze accent. Flat, quiet elevation; hairline warm borders.
export const LAPELS_ACCENT = "#8b6a3e";
const LAPELS_INK = "#2a251f";

function deriveLightTokens(paletteKey, palette) {
  const surfaces = SURFACES.light;
  const variant = palette.light || palette;
  const primary = variant.primary;
  const primaryDark = variant.primaryDark;
  const primaryLight = mixHex(primary, surfaces.surface, 0.28);
  const scale = buildScale(primary, primaryDark, surfaces, false);
  // Ivory ink on deep tones, like the reference's "View live demo" pill.
  const contrastText = readableText(primary) === "#ffffff" ? surfaces.surface : LAPELS_INK;
  const brandText = primaryDark;

  const sidebarBg = "#f7f3ec";

  const cssVars = {
    ...surfaceVars(surfaces),

    /* Brand */
    "--brand": primary,
    "--brand-rgb": rgbChannels(primary),
    "--brand-contrast": contrastText,
    "--brand-text": brandText,
    "--brand-soft": rgba(primary, 0.08),
    "--brand-soft-strong": rgba(primary, 0.14),
    "--brand-border": rgba(primary, 0.28),
    "--brand-ring": rgba(primary, 0.16),
    "--brand-glow": rgba(LAPELS_INK, 0.18),
    "--app-glow-1": rgba(LAPELS_ACCENT, 0.06),
    "--app-glow-2": rgba(primary, 0.035),
    "--network-dot": rgba(LAPELS_ACCENT, 0.13),

    /* Sidebar: same linen family as the page, separated by a hairline */
    "--sidebar-bg": sidebarBg,
    "--sidebar-bg-alt": sidebarBg,
    "--sidebar-hover": rgba(LAPELS_INK, 0.045),
    "--sidebar-text": surfaces.textSecondary,
    "--sidebar-subtext": surfaces.textTertiary,
    "--sidebar-active-bg": rgba(primary, 0.09),
    "--sidebar-active-text": primaryDark,
    "--sidebar-active-border": rgba(primary, 0.2),
    "--sidebar-accent": primary,
    "--sidebar-accent-2": mixHex(primary, surfaces.surface, 0.18),
    "--sidebar-border": surfaces.border,
    "--sidebar-glow": rgba(LAPELS_INK, 0.22),

    /* Elevation: quiet, almost flat */
    "--shadow-card": "0 1px 2px rgba(42, 37, 31, 0.04), 0 12px 30px -24px rgba(42, 37, 31, 0.22)",
    "--shadow-popover": "0 2px 6px rgba(42, 37, 31, 0.05), 0 26px 60px -28px rgba(42, 37, 31, 0.32)",
  };

  return {
    paletteKey,
    mode: "light",
    isDark: false,
    palette,
    surfaces,
    primary,
    primaryLight,
    primaryDark,
    contrastText,
    brandText,
    accent: LAPELS_ACCENT,
    scale,
    cssVars: appendScale(cssVars, scale),
  };
}

/**
 * Derive every CSS + MUI token for a palette/mode combination.
 * Returns `cssVars` ready to be written onto <html>. Both modes emit the
 * same set of keys so switching never leaves a stale inline value behind.
 */
export function deriveThemeTokens(paletteKey = "default", mode = "light") {
  const palette = PALETTES[paletteKey] || PALETTES.default;
  return mode === "dark"
    ? deriveDarkTokens(paletteKey, palette)
    : deriveLightTokens(paletteKey, palette);
}
