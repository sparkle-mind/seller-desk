"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { PALETTES, deriveThemeTokens } from "./paletteUtils";

// Re-exported so existing imports (`{ PALETTES } from ThemeContext`) keep working.
export { PALETTES };

export const BACKGROUNDS = {
  off: { label: "Off", value: "off", hint: "Clean, flat surface" },
  network: { label: "Network", value: "network", hint: "Subtle dotted texture" },
};

const STORAGE_KEY = "seller_desk_theme";

const DEFAULT_THEME = {
  mode: "system", // "light" | "dark" | "system"
  palette: "default", // key in PALETTES
  background: "network", // "off" | "network"
};

const getSystemMode = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const loadTheme = () => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveTheme = (data) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

const ThemeCtx = createContext({
  mode: DEFAULT_THEME.mode,
  resolvedMode: "light",
  palette: DEFAULT_THEME.palette,
  background: DEFAULT_THEME.background,
  tokens: deriveThemeTokens(DEFAULT_THEME.palette, "light"),
  setMode: () => {},
  setPalette: () => {},
  setBackground: () => {},
});

export function ThemeContextProvider({ children }) {
  const [mode, setModeState] = useState(DEFAULT_THEME.mode);
  const [palette, setPaletteState] = useState(DEFAULT_THEME.palette);
  const [background, setBackgroundState] = useState(DEFAULT_THEME.background);

  // Compute the actual resolved mode (for "system" → check OS)
  const [resolvedMode, setResolvedMode] = useState("light");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadTheme();
    if (saved) {
      if (saved.mode) setModeState(saved.mode);
      if (saved.palette && PALETTES[saved.palette]) setPaletteState(saved.palette);
      if (saved.background !== undefined) setBackgroundState(saved.background);
    }
  }, []);

  // Keep resolvedMode in sync with mode + system preference
  useEffect(() => {
    const update = () => {
      setResolvedMode(mode === "system" ? getSystemMode() : mode);
    };
    update();

    if (mode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
  }, [mode]);

  // The single source of truth for every colour token in the app.
  const tokens = useMemo(
    () => deriveThemeTokens(palette, resolvedMode),
    [palette, resolvedMode]
  );

  // Write the palette + surface tokens onto <html> and flip the dark class.
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(tokens.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.classList.toggle("dark", tokens.isDark);
    root.style.colorScheme = tokens.isDark ? "dark" : "light";
    root.dataset.palette = palette;
    root.dataset.theme = tokens.isDark ? "dark" : "light";
  }, [tokens, palette]);

  const setMode = useCallback(
    (m) => {
      setModeState(m);
      saveTheme({ mode: m, palette, background });
    },
    [palette, background]
  );

  const setPalette = useCallback(
    (p) => {
      setPaletteState(p);
      saveTheme({ mode, palette: p, background });
    },
    [mode, background]
  );

  const setBackground = useCallback(
    (b) => {
      setBackgroundState(b);
      saveTheme({ mode, palette, background: b });
    },
    [mode, palette]
  );

  return (
    <ThemeCtx.Provider
      value={{
        mode,
        resolvedMode,
        palette,
        background,
        tokens,
        setMode,
        setPalette,
        setBackground,
      }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeCtx);
