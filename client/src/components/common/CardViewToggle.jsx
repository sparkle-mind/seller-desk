"use client";

import React from "react";
import TableRowsIcon from "@mui/icons-material/TableRows";
import ViewModuleIcon from "@mui/icons-material/ViewModule";

export default function CardViewToggle({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Record display"
      className="inline-flex items-center gap-1 rounded-lg p-1 shrink-0"
      style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border)" }}
    >
      {[
        { mode: "table", label: "Table view", Icon: TableRowsIcon },
        { mode: "cards", label: "Card view", Icon: ViewModuleIcon },
      ].map(({ mode, label, Icon }) => (
        <button
          key={mode}
          type="button"
          aria-label={label}
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className="inline-flex min-w-9 items-center justify-center rounded-md p-1.5 transition"
          style={{
            color: value === mode ? "var(--brand-text)" : "var(--text-tertiary)",
            backgroundColor: value === mode ? "var(--bg-surface)" : "transparent",
            boxShadow: value === mode ? "var(--shadow-card)" : "none",
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </button>
      ))}
    </div>
  );
}
