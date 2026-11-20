"use client";

import React, { forwardRef } from "react";
import MuiButton from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * The one button used across the app. Change a look here and every screen
 * follows.
 *
 *   variant  solid | outline | soft | ghost          (default: solid)
 *   tone     primary | neutral | info | success | warning | danger
 *                                                     (default: primary)
 *   size     small | medium | large                   (default: small)
 *   loading  shows a spinner and disables the button
 *
 * Everything else (onClick, type, href, component, startIcon, endIcon,
 * fullWidth, disabled, autoFocus, className, sx ...) is passed to MUI Button.
 *
 *   <Button startIcon={<AddIcon />} onClick={add}>Add Product</Button>
 *   <Button variant="outline" tone="neutral">Export CSV</Button>
 *   <Button variant="soft" tone="success">Restock</Button>
 */

// MUI palette colour for each tone
const MUI_COLOR = {
  primary: "primary",
  neutral: "inherit",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "error",
};

// Outline tones that read better with the theme's own button tokens
// (globals.css --btn-*-border / --btn-*-text) than with MUI palette colours.
const TOKEN_OUTLINE = ["neutral", "info", "success", "warning"];

// Tinted "soft" buttons; Tailwind colours are CSS-variable driven so these
// follow light/dark mode and the active palette.
const SOFT_CLASSES = {
  primary: "!bg-blue-50 !text-blue-700 hover:!bg-blue-100",
  neutral: "!bg-slate-100 !text-slate-700 hover:!bg-slate-200",
  info: "!bg-blue-50 !text-blue-700 hover:!bg-blue-100",
  success: "!bg-emerald-50 !text-emerald-700 hover:!bg-emerald-100",
  warning: "!bg-amber-50 !text-amber-700 hover:!bg-amber-100",
  danger: "!bg-rose-50 !text-rose-700 hover:!bg-rose-100",
};

const MUI_VARIANT = {
  solid: "contained",
  outline: "outlined",
  soft: "text",
  ghost: "text",
};

function outlineTokenSx(tone) {
  const border = `var(--btn-${tone}-border)`;
  return {
    borderColor: border,
    color: `var(--btn-${tone}-text)`,
    "&:hover": { borderColor: border, backgroundColor: "var(--bg-surface2)" },
  };
}

const Button = forwardRef(function Button(
  {
    variant = "solid",
    tone = "primary",
    size = "small",
    loading = false,
    disabled = false,
    startIcon,
    className = "",
    sx,
    children,
    ...rest
  },
  ref
) {
  const toneSx =
    variant === "outline" && TOKEN_OUTLINE.includes(tone) ? outlineTokenSx(tone) : null;
  const mergedSx = [toneSx, ...(Array.isArray(sx) ? sx : [sx])].filter(Boolean);
  const softClass = variant === "soft" ? SOFT_CLASSES[tone] || SOFT_CLASSES.primary : "";

  return (
    <MuiButton
      ref={ref}
      variant={MUI_VARIANT[variant] || "contained"}
      color={MUI_COLOR[tone] || "primary"}
      size={size}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      startIcon={loading ? <CircularProgress size={14} color="inherit" /> : startIcon}
      className={`${softClass} ${className}`.trim() || undefined}
      sx={mergedSx}
      {...rest}
    >
      {children}
    </MuiButton>
  );
});

export default Button;
