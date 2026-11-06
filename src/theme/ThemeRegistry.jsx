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

  return createTheme({
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
  });
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
