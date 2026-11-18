"use client";

import * as React from "react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeContextProvider, useAppTheme } from "./ThemeContext";

// ─── Build a dynamic MUI theme based on mode + palette ──────────────────────
function buildTheme(tokens) {
  const {
    mode,
    isDark,
    primary,
    primaryLight,
    primaryDark,
    contrastText,
    surfaces,
  } = tokens;

  const baseOptions = {
    palette: {
      mode,
      primary: {
        main: primary,
        light: primaryLight,
        dark: primaryDark,
        contrastText,
      },
      secondary: {
        main: isDark ? "#c7d2e3" : "#0f172a",
        light: isDark ? "#a7b5c9" : "#334155",
        dark: isDark ? "#e8eef8" : "#020617",
        contrastText: isDark ? "#0b1220" : "#ffffff",
      },
      success: { main: "#10b981", light: isDark ? "#0f3a2e" : "#d1fae5", dark: "#047857" },
      warning: { main: "#f59e0b", light: isDark ? "#3a2a0d" : "#fef3c7", dark: "#b45309" },
      error: { main: "#ef4444", light: isDark ? "#3a1616" : "#fee2e2", dark: "#b91c1c" },
      info: { main: "#0ea5e9", light: isDark ? "#0d2a3a" : "#e0f2fe", dark: "#0369a1" },
      background: {
        default: surfaces.base,
        paper: surfaces.surface,
      },
      text: {
        primary: surfaces.textPrimary,
        secondary: surfaces.textSecondary,
        disabled: surfaces.textTertiary,
      },
      divider: surfaces.border,
      action: {
        hover: surfaces.surface2,
        selected: surfaces.surface3,
        disabled: surfaces.textTertiary,
      },
    },
    typography: {
      fontFamily: ["Inter", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"].join(","),
      button: { textTransform: "none", fontWeight: 600 },
      h1: { fontWeight: 700, letterSpacing: "-0.02em" },
      h2: { fontWeight: 700, letterSpacing: "-0.02em" },
      h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: surfaces.base,
            color: surfaces.textPrimary,
          },
          "::selection": {
            backgroundColor: tokens.cssVars["--brand-soft-strong"],
            color: surfaces.textPrimary,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
          containedPrimary: {
            "&:hover": {
              boxShadow: "0 10px 22px -14px var(--brand-glow)",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            "&:hover": { backgroundColor: surfaces.surface2 },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            marginTop: 6,
            border: `1px solid ${surfaces.border}`,
            boxShadow: "var(--shadow-popover)",
            backgroundImage: "none",
          },
          list: { padding: 6 },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: `1px solid ${surfaces.border}`,
            boxShadow: "var(--shadow-popover)",
            backgroundImage: "none",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 9,
            fontSize: 13,
            paddingTop: 8,
            paddingBottom: 8,
            "&:hover": { backgroundColor: surfaces.surface2 },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
            border: `1px solid ${surfaces.border}`,
            backgroundImage: "none",
            boxShadow: "var(--shadow-popover)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: { fontWeight: 700, fontSize: "1rem" },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 8 },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 999,
            backgroundColor: primary,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            minHeight: 44,
            color: surfaces.textSecondary,
            "&.Mui-selected": { color: primary },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: surfaces.surface,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: surfaces.border,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: surfaces.textTertiary,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: primary,
              borderWidth: 1,
              boxShadow: `0 0 0 3px ${tokens.cssVars["--brand-ring"]}`,
            },
            "& .MuiSvgIcon-root": { color: surfaces.textSecondary },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: surfaces.textSecondary,
            "&.Mui-focused": { color: primary },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: surfaces.surface3,
            color: surfaces.textPrimary,
            border: `1px solid ${surfaces.border}`,
            borderRadius: 8,
            fontSize: 11,
            padding: "7px 10px",
            boxShadow: "var(--shadow-popover)",
          },
          arrow: { color: surfaces.surface3 },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: surfaces.border },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: { minWidth: 32, color: surfaces.textSecondary },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: { color: surfaces.textSecondary },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
    },
  };

  // Typography and the Lapels colour/shape layer apply to every mode; the
  // layer reads per-mode tokens (deep-merged by createTheme).
  return createTheme(
    baseOptions,
    buildSharedTypography(),
    buildLapelsOverrides(tokens),
    buildMotionOverrides(),
  );
}

// ─── Motion: all modes ──────────────────────────────────────────────────────
// Short, transform/opacity-only transitions layered over every MUI component.
// Keyframes (sd-dialog-in, sd-rise-sm) live in globals.css; reduced-motion
// users get them disabled there.
function buildMotionOverrides() {
  const easeOut = "cubic-bezier(0.22, 1, 0.36, 1)";
  const press = {
    transition: `background-color 150ms ease, border-color 150ms ease, color 150ms ease, box-shadow 200ms ${easeOut}, transform 150ms ease`,
    "&:active": { transform: "scale(0.97)" },
  };

  return {
    transitions: {
      easing: { easeOut },
    },
    components: {
      MuiButton: { styleOverrides: { root: press } },
      MuiIconButton: {
        styleOverrides: {
          root: { ...press, "&:active": { transform: "scale(0.92)" } },
        },
      },
      MuiDialog: {
        defaultProps: { transitionDuration: { enter: 240, exit: 160 } },
        styleOverrides: {
          paper: { animation: `sd-dialog-in 280ms ${easeOut} both` },
        },
      },
      MuiMenu: {
        defaultProps: { transitionDuration: { enter: 200, exit: 120 } },
      },
      MuiPopover: {
        defaultProps: { transitionDuration: { enter: 200, exit: 120 } },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { transition: "background-color 120ms ease" },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-notchedOutline": {
              transition: "border-color 160ms ease, box-shadow 200ms ease",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { transition: "background-color 150ms ease, transform 150ms ease" },
          clickable: { "&:active": { transform: "scale(0.95)", boxShadow: "none" } },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { transition: "color 180ms ease" },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { animation: `sd-rise-sm 260ms ${easeOut} both` },
        },
      },
    },
  };
}

// ─── Typography: all modes ──────────────────────────────────────────────────
// Instrument Sans body + Alegreya serif display, with the same sizes, weights
// and tracking in light and dark. Contains no colours.
function buildSharedTypography() {
  const display = "var(--font-display)";
  const body = "var(--font-sans)";

  return {
    typography: {
      fontFamily: body,
      h1: { fontFamily: display, fontWeight: 500, letterSpacing: "-0.012em" },
      h2: { fontFamily: display, fontWeight: 500, letterSpacing: "-0.01em" },
      h3: { fontFamily: display, fontWeight: 600, letterSpacing: "-0.005em" },
      h4: { fontFamily: display, fontWeight: 600 },
      h5: { fontFamily: display, fontWeight: 600 },
      h6: { fontFamily: display, fontWeight: 600 },
      overline: { letterSpacing: "0.16em", fontWeight: 600 },
      button: { fontFamily: body, fontWeight: 600, letterSpacing: "0.01em" },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { fontFamily: body },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontFamily: display,
            fontWeight: 600,
            fontSize: "1.3rem",
            letterSpacing: "-0.005em",
            paddingTop: 22,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            letterSpacing: "0.01em",
            "&.Mui-selected": { fontWeight: 600 },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { fontSize: 11.5, letterSpacing: "0.01em" },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontSize: 11,
          },
        },
      },
    },
  };
}

// ─── "Lapels" colours & shapes (light + dark) ──────────────────────────────
// Tailored pill buttons, hairline warm borders, flat surfaces and muted
// earthy status colours. All colours come from the per-mode tokens.
function buildLapelsOverrides(tokens) {
  const { isDark, primary, primaryDark, contrastText, surfaces, accent } = tokens;
  const ring = tokens.cssVars["--brand-ring"];
  // Hover/selected washes: espresso on linen, cream on black.
  const ink = (a) => (isDark ? `rgba(241, 232, 216, ${a})` : `rgba(42, 37, 31, ${a})`);
  const statusInk = isDark ? "#120f0b" : surfaces.surface;
  const status = isDark
    ? {
        success: { main: "#8fae7a", light: "#18200f", dark: "#c4d3b5" },
        warning: { main: "#d4a55a", light: "#231a0c", dark: "#e7cf97" },
        error: { main: "#cf7a62", light: "#26120d", dark: "#e5b9aa" },
        info: { main: "#8fa6bf", light: "#121820", dark: "#c3cad8" },
      }
    : {
        success: { main: "#5f8249", light: "#eef2e8", dark: "#3c552e" },
        warning: { main: "#b2822e", light: "#f9f2e3", dark: "#79531e" },
        error: { main: "#a85741", light: "#f8ece7", dark: "#74382a" },
        info: { main: "#5b6f86", light: "#edf0f3", dark: "#3e4d5f" },
      };

  return {
    palette: {
      secondary: {
        main: surfaces.textPrimary,
        light: surfaces.textSecondary,
        dark: isDark ? "#ffffff" : "#1a1612",
        contrastText: surfaces.base,
      },
      success: { ...status.success, contrastText: statusInk },
      warning: { ...status.warning, contrastText: statusInk },
      error: { ...status.error, contrastText: statusInk },
      info: { ...status.info, contrastText: statusInk },
      action: {
        hover: ink(0.04),
        selected: ink(0.07),
      },
    },
    shape: { borderRadius: 6 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 18,
            transition: "background-color .2s ease, border-color .2s ease, color .2s ease",
          },
          sizeSmall: { paddingInline: 14 },
          sizeLarge: { paddingInline: 24 },
          contained: {
            "&:hover": { boxShadow: "none" },
          },
          containedPrimary: {
            color: contrastText,
            "&:hover": { backgroundColor: primaryDark, boxShadow: "none" },
          },
          outlined: {
            borderColor: surfaces.borderStrong,
            "&:hover": {
              borderColor: surfaces.textSecondary,
              backgroundColor: ink(0.035),
            },
          },
          outlinedInherit: {
            borderColor: surfaces.borderStrong,
            color: surfaces.textPrimary,
          },
          outlinedPrimary: {
            borderColor: tokens.cssVars["--brand-border"],
            color: primaryDark,
            "&:hover": {
              borderColor: primary,
              backgroundColor: tokens.cssVars["--brand-soft"],
            },
          },
          text: {
            "&:hover": { backgroundColor: ink(0.04) },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            "&:hover": { backgroundColor: ink(0.05) },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: { borderRadius: 10, marginTop: 6 },
          list: { padding: 6 },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: { borderRadius: 12 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            "&:hover": { backgroundColor: surfaces.surface2 },
            "&.Mui-selected": {
              backgroundColor: tokens.cssVars["--brand-soft"],
              "&:hover": { backgroundColor: tokens.cssVars["--brand-soft-strong"] },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 14 },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: { borderTop: `1px solid ${surfaces.borderSubtle}` },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 600 },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${surfaces.border}` },
          indicator: {
            height: 2,
            borderRadius: 0,
            backgroundColor: surfaces.textPrimary,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            "&.Mui-selected": { color: surfaces.textPrimary },
            "&:hover": { color: surfaces.textPrimary },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: surfaces.border },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: surfaces.borderStrong },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: primary,
              boxShadow: `0 0 0 3px ${ring}`,
            },
            "&.Mui-disabled": { backgroundColor: surfaces.surface2 },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { "&.Mui-focused": { color: primaryDark } },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: { color: surfaces.borderStrong },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          track: { backgroundColor: surfaces.borderStrong },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: surfaces.textPrimary,
            color: surfaces.surface,
            border: "none",
            borderRadius: 4,
          },
          arrow: { color: surfaces.textPrimary },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 999, backgroundColor: surfaces.surface3 },
        },
      },
      MuiBadge: {
        styleOverrides: {
          dot: { backgroundColor: accent },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 8, border: `1px solid ${surfaces.border}` },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: surfaces.borderSubtle },
          head: { color: surfaces.textTertiary },
        },
      },
    },
  };
}

// ─── Inner provider that reads from ThemeContext ──────────────────────────────
function DynamicThemeProvider({ children }) {
  const { tokens } = useAppTheme();
  const theme = React.useMemo(() => buildTheme(tokens), [tokens]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

// ─── Emotion SSR cache ────────────────────────────────────────────────────────
function EmotionCacheProvider({ children }) {
  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache({ key: "mui", prepend: true });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prev = inserted;
      inserted = [];
      return prev;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;
    let styles = "";
    for (const name of names) styles += cache.inserted[name];
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

// ─── Public export ────────────────────────────────────────────────────────────
export default function ThemeRegistry({ children }) {
  return (
    <EmotionCacheProvider>
      <ThemeContextProvider>
        <DynamicThemeProvider>{children}</DynamicThemeProvider>
      </ThemeContextProvider>
    </EmotionCacheProvider>
  );
}
