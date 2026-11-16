// ─── Theme palette definitions & colour maths ───────────────────────────────
// Shared by ThemeContext (CSS custom properties) and ThemeRegistry (MUI theme)
// so the whole app always uses the exact same tonal scale.

export const PALETTES = {
  default: {
    label: "Ocean",
    color: "#2563eb",
    primary: "#2563eb",
    primaryDark: "#1d4ed8",
    darkPrimary: "#60a5fa",
  },
  slate: {
    label: "Slate",
    color: "#64748b",
    primary: "#475569",
    primaryDark: "#334155",
    darkPrimary: "#94a3b8",
  },
  graphite: {
    label: "Graphite",
    color: "#6b7280",
    primary: "#374151",
    primaryDark: "#1f2937",
    darkPrimary: "#cbd5e1",
  },
  forest: {
    label: "Forest",
    color: "#16a34a",
    primary: "#059669",
    primaryDark: "#047857",
    darkPrimary: "#34d399",
  },
  sand: {
    label: "Sand",
    color: "#d97706",
    primary: "#d97706",
    primaryDark: "#b45309",
    darkPrimary: "#fbbf24",
  },
  highContrast: {
    label: "Mono",
    color: "#0f172a",
    primary: "#0f172a",
    primaryDark: "#020617",
    darkPrimary: "#e2e8f0",
  },
};

export const SURFACES = {
  light: {
    base: "#f4f7fb",
    surface: "#ffffff",
    surface2: "#f8fafc",
    surface3: "#f1f5f9",
    border: "#e2e8f0",
    borderSubtle: "#eef2f7",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textTertiary: "#94a3b8",
    scrollbar: "#cbd5e1",
  },
  dark: {
    // Lifted, slightly blue "midnight" tones — dark but never pitch black.
    base: "#1a2230",
    surface: "#222c3d",
    surface2: "#293547",
    surface3: "#313f54",
    border: "#3a4961",
    borderSubtle: "#2b374a",
    textPrimary: "#e8eef8",
    textSecondary: "#a7b5c9",
    textTertiary: "#7f90a8",
    scrollbar: "#3a4961",
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
    return {
      50: mixHex(primary, surfaces.base, 0.82),
      100: mixHex(primary, surfaces.base, 0.72),
      200: mixHex(primary, surfaces.base, 0.56),
      300: mixHex(primary, surfaces.base, 0.32),
      400: mixHex(primary, "#ffffff", 0.14),
      500: primary,
      600: primary,
      700: mixHex(primary, "#ffffff", 0.22),
      800: mixHex(primary, "#ffffff", 0.36),
      900: mixHex(primary, "#ffffff", 0.5),
    };
  }

  return {
    50: mixHex(primary, "#ffffff", 0.94),
    100: mixHex(primary, "#ffffff", 0.88),
    200: mixHex(primary, "#ffffff", 0.76),
    300: mixHex(primary, "#ffffff", 0.52),
    400: mixHex(primary, "#ffffff", 0.28),
    500: primary,
    600: primary,
    700: primaryDark,
    800: mixHex(primaryDark, "#000000", 0.16),
    900: mixHex(primaryDark, "#000000", 0.32),
  };
}

/**
 * Derive every CSS + MUI token for a palette/mode combination.
 * Returns `cssVars` ready to be written onto <html>.
 */
export function deriveThemeTokens(paletteKey = "default", mode = "light") {
  const isDark = mode === "dark";
  const palette = PALETTES[paletteKey] || PALETTES.default;
  const surfaces = SURFACES[isDark ? "dark" : "light"];

  const primary = isDark ? palette.darkPrimary || mixHex(palette.primary, "#ffffff", 0.45) : palette.primary;
  const primaryDark = isDark ? mixHex(primary, "#000000", 0.18) : palette.primaryDark;
  const primaryLight = mixHex(primary, "#ffffff", isDark ? 0.18 : 0.28);
  const scale = buildScale(primary, primaryDark, surfaces, isDark);
  const contrastText = readableText(primary);
  const brandText = isDark ? scale[400] : primaryDark;

  // Sidebar keeps its signature deep tone, tinted by the active palette.
  const sidebarAnchor = isDark ? "#121a28" : "#080d17";
  const sidebarAltAnchor = isDark ? "#0e1521" : "#050a12";
  const sidebarBg = mixHex(palette.primary, sidebarAnchor, isDark ? 0.9 : 0.91);
  const sidebarBgAlt = mixHex(palette.primary, sidebarAltAnchor, 0.88);
  const sidebarHover = mixHex(sidebarBg, "#ffffff", 0.06);
  const sidebarActiveText = mixHex(primary, "#ffffff", 0.55);

  const shadowCard = isDark
    ? "0 1px 2px rgba(0, 0, 0, 0.28), 0 14px 32px -20px rgba(0, 0, 0, 0.65)"
    : "0 1px 2px rgba(15, 23, 42, 0.04), 0 14px 32px -22px rgba(15, 23, 42, 0.22)";
  const shadowPopover = isDark
    ? "0 28px 70px -22px rgba(0, 0, 0, 0.8)"
    : "0 28px 70px -28px rgba(15, 23, 42, 0.32)";

  const cssVars = {
    /* Surfaces */
    "--bg-base": surfaces.base,
    "--bg-surface": surfaces.surface,
    "--bg-surface2": surfaces.surface2,
    "--bg-surface3": surfaces.surface3,
    "--border": surfaces.border,
    "--border-subtle": surfaces.borderSubtle,
    "--text-primary": surfaces.textPrimary,
    "--text-secondary": surfaces.textSecondary,
    "--text-tertiary": surfaces.textTertiary,
    "--scrollbar-thumb": surfaces.scrollbar,

    /* Brand ─ used by Tailwind's blue scale + hand-written components */
    "--brand": primary,
    "--brand-rgb": rgbChannels(primary),
    "--brand-contrast": contrastText,
    "--brand-text": brandText,
    "--brand-soft": rgba(primary, isDark ? 0.16 : 0.1),
    "--brand-soft-strong": rgba(primary, isDark ? 0.26 : 0.15),
    "--brand-border": rgba(primary, isDark ? 0.42 : 0.26),
    "--brand-ring": rgba(primary, isDark ? 0.28 : 0.18),
    "--brand-glow": rgba(primary, isDark ? 0.32 : 0.22),
    "--app-glow-1": rgba(primary, isDark ? 0.16 : 0.09),
    "--app-glow-2": rgba(primary, isDark ? 0.09 : 0.05),
    "--network-dot": rgba(primary, isDark ? 0.28 : 0.16),

    /* Sidebar */
    "--sidebar-bg": sidebarBg,
    "--sidebar-bg-alt": sidebarBgAlt,
    "--sidebar-hover": sidebarHover,
    "--sidebar-text": "#c8d3e3",
    "--sidebar-subtext": isDark ? "#8595ad" : "#7f91aa",
    "--sidebar-active-bg": rgba(primary, isDark ? 0.18 : 0.2),
    "--sidebar-active-text": sidebarActiveText,
    "--sidebar-active-border": rgba(primary, isDark ? 0.42 : 0.34),
    "--sidebar-accent": primary,
    "--sidebar-accent-2": mixHex(primary, "#ffffff", 0.28),
    "--sidebar-border": "rgba(255, 255, 255, 0.07)",
    "--sidebar-glow": rgba(primary, isDark ? 0.4 : 0.32),

    /* Elevation */
    "--shadow-card": shadowCard,
    "--shadow-popover": shadowPopover,
  };

  Object.entries(scale).forEach(([shade, colour]) => {
    cssVars[`--brand-${shade}-rgb`] = rgbChannels(colour);
    cssVars[`--brand-${shade}`] = colour;
  });

  return {
    paletteKey,
    mode: isDark ? "dark" : "light",
    isDark,
    palette,
    surfaces,
    primary,
    primaryLight,
    primaryDark,
    contrastText,
    brandText,
    scale,
    cssVars,
  };
}
