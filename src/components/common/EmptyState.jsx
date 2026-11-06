"use client";

import React from "react";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import Button from "@mui/material/Button";

export default function EmptyState({
  title = "No data found",
  description = "There are no records matching your criteria.",
  icon: Icon = InboxOutlinedIcon,
  actionLabel,
  onAction,
}) {
  return (
    <div
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed my-4"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand-text)" }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </div>
      <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
      <p className="text-sm mt-1 max-w-sm" style={{ color: "var(--text-secondary)" }}>{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="contained" size="small" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

