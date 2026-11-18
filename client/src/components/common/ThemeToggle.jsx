"use client";

import React, { useState } from "react";
import { useAppTheme, PALETTES, BACKGROUNDS } from "@/theme/ThemeContext";
import { paletteDisplay } from "@/theme/paletteUtils";
import Popover from "@mui/material/Popover";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import CheckIcon from "@mui/icons-material/Check";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";

const MODES = [
  { key: "light", label: "Light", icon: LightModeOutlinedIcon },
  { key: "dark", label: "Dark", icon: DarkModeOutlinedIcon },
  { key: "system", label: "System", icon: SettingsBrightnessIcon },
];

export default function ThemeToggle() {
  const { mode, resolvedMode, palette, background, setMode, setPalette, setBackground } =
    useAppTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  return (
    <>
      <button
        type="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="p-2 sd-icon-btn"
        aria-label="Theme settings"
      >
        {/* Keyed so the icon spins in whenever the resolved mode flips */}
        <span key={resolvedMode} className="sd-spin-in">
          {resolvedMode === "dark" ? (
            <DarkModeOutlinedIcon sx={{ fontSize: 21 }} />
          ) : (
            <LightModeOutlinedIcon sx={{ fontSize: 21 }} />
          )}
        </span>
      </button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 300,
            mt: 1,
            borderRadius: "18px",
            overflow: "hidden",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-popover)",
          },
        }}
      >
        <div className="p-3.5">
          {/* Header */}
          <div className="flex items-center justify-between px-1 pb-3">
            <div>
              <div className="text-[13px] font-bold font-display" style={{ color: "var(--text-primary)" }}>
                Appearance
              </div>
              <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                Theme, palette &amp; texture
              </div>
            </div>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{
                backgroundColor: "var(--brand-soft)",
                color: "var(--brand-text)",
                borderColor: "var(--brand-border)",
              }}
            >
              <PaletteOutlinedIcon sx={{ fontSize: 17 }} />
            </div>
          </div>

          {/* Mode */}
          <div
            className="grid grid-cols-3 gap-1 p-1 rounded-xl mb-3"
            style={{
              backgroundColor: "var(--bg-surface2)",
              border: "1px solid var(--border)",
            }}
          >
            {MODES.map((m) => {
              const Icon = m.icon;
              const active = mode === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMode(m.key)}
                  className="flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-semibold transition"
                  style={
                    active
                      ? {
                          backgroundColor: "var(--bg-surface)",
                          color: "var(--brand-text)",
                          border: "1px solid var(--brand-border)",
                          boxShadow: "var(--shadow-card)",
                        }
                      : {
                          color: "var(--text-secondary)",
                          border: "1px solid transparent",
                        }
                  }
                >
                  <Icon sx={{ fontSize: 17 }} />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Palette */}
          <div className="flex items-center justify-between px-1 pb-2">
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--text-tertiary)" }}
            >
              Palette
            </span>
            <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
              {paletteDisplay(palette, resolvedMode).label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {Object.keys(PALETTES).map((key) => {
              const active = palette === key;
              const pal = paletteDisplay(key, resolvedMode);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPalette(key)}
                  className="flex flex-col items-center gap-1.5 py-2 rounded-xl border transition hover:opacity-90"
                  style={
                    active
                      ? {
                          backgroundColor: "var(--brand-soft)",
                          borderColor: "var(--brand-border)",
                        }
                      : {
                          borderColor: "var(--border)",
                          backgroundColor: "transparent",
                        }
                  }
                >
                  <span
                    className="relative w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: pal.color,
                      boxShadow: active ? "0 0 0 2px var(--bg-surface), 0 0 0 4px var(--brand-500)" : "none",
                    }}
                  >
                    {active && <CheckIcon sx={{ fontSize: 13, color: "rgb(var(--white-rgb))" }} />}
                  </span>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: active ? "var(--brand-text)" : "var(--text-secondary)" }}
                  >
                    {pal.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Background */}
          <div
            className="text-[10px] font-bold uppercase tracking-widest px-1 pb-2"
            style={{ color: "var(--text-tertiary)" }}
          >
            Background
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(BACKGROUNDS).map(([key, bg]) => {
              const active = background === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBackground(key)}
                  className="rounded-xl border p-1.5 text-left transition hover:opacity-90"
                  style={
                    active
                      ? {
                          borderColor: "var(--brand-border)",
                          backgroundColor: "var(--brand-soft)",
                        }
                      : { borderColor: "var(--border)", backgroundColor: "transparent" }
                  }
                >
                  <span
                    className="block h-9 rounded-lg mb-1.5"
                    style={{
                      backgroundColor: "var(--bg-base)",
                      border: "1px solid var(--border)",
                      backgroundImage:
                        key === "network"
                          ? "radial-gradient(circle, var(--network-dot) 1px, transparent 1px)"
                          : "none",
                      backgroundSize: key === "network" ? "10px 10px" : "auto",
                    }}
                  />
                  <span className="flex items-center justify-between px-0.5">
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: active ? "var(--brand-text)" : "var(--text-secondary)" }}
                    >
                      {bg.label}
                    </span>
                    {active && (
                      <CheckIcon sx={{ fontSize: 13, color: "var(--brand-text)" }} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Popover>
    </>
  );
}
