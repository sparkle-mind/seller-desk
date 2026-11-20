"use client";

import React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "./IconButton";

// Same tone recipe as StatCard so modal icons match the KPI tiles.
const TONES = {
  brand:   { bg: "bg-blue-500/10",    icon: "text-blue-500",    ring: "ring-blue-500/20" },
  emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-500", ring: "ring-emerald-500/20" },
  amber:   { bg: "bg-amber-500/10",   icon: "text-amber-500",   ring: "ring-amber-500/20" },
  rose:    { bg: "bg-rose-500/10",    icon: "text-rose-500",    ring: "ring-rose-500/20" },
  purple:  { bg: "bg-purple-500/10",  icon: "text-purple-500",  ring: "ring-purple-500/20" },
  slate:   { bg: "bg-slate-500/10",   icon: "text-slate-500",   ring: "ring-slate-500/20" },
};

/**
 * Standard modal header used by every dialog in the app:
 * tone icon tile, title, optional subtitle / extras, and a close button.
 * Layout, padding and the divider come from the MuiDialogTitle theme layer.
 */
export default function DialogHeader({
  title,
  subtitle,
  icon: Icon,
  tone = "brand",
  onClose,
  closeDisabled = false,
  children,
}) {
  const scheme = TONES[tone] || TONES.brand;

  return (
    <DialogTitle component="div" className="sd-dialog-header">
      {Icon && (
        <div
          className={`sd-pop-in shrink-0 w-10 h-10 rounded-xl ring-1 flex items-center justify-center ${scheme.bg} ${scheme.ring}`}
        >
          <Icon sx={{ fontSize: 21 }} className={scheme.icon} />
        </div>
      )}

      <div className="min-w-0 flex-1 self-center">
        <div className="flex items-center gap-2 flex-wrap">
          <h2
            className="font-display text-base sm:text-[17px] font-bold leading-snug tracking-tight break-words"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h2>
          {children}
        </div>
        {subtitle && (
          <p
            className="mt-0.5 text-xs leading-relaxed"
            style={{ color: "var(--text-tertiary)" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {onClose && (
        <IconButton
          label="Close dialog"
          onClick={onClose}
          disabled={closeDisabled}
          className="shrink-0 -mr-1.5 -mt-0.5"
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      )}
    </DialogTitle>
  );
}
