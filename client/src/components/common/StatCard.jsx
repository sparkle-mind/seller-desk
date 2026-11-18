"use client";

import React from "react";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const colorMap = {
  blue:    { bg: "bg-blue-500/10",    icon: "text-blue-500",    ring: "ring-blue-500/20" },
  emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-500", ring: "ring-emerald-500/20" },
  amber:   { bg: "bg-amber-500/10",   icon: "text-amber-500",   ring: "ring-amber-500/20" },
  rose:    { bg: "bg-rose-500/10",    icon: "text-rose-500",    ring: "ring-rose-500/20" },
  purple:  { bg: "bg-purple-500/10",  icon: "text-purple-500",  ring: "ring-purple-500/20" },
  slate:   { bg: "bg-slate-500/10",   icon: "text-slate-500",   ring: "ring-slate-500/20" },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = "blue", tooltip, trend }) {
  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      className="rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-border)] flex flex-col justify-between"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            {title}
            {tooltip && (
              <Tooltip title={tooltip} arrow>
                <InfoOutlinedIcon sx={{ fontSize: 13 }} style={{ color: "var(--text-tertiary)" }} />
              </Tooltip>
            )}
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold tracking-tight truncate" style={{ color: "var(--text-primary)" }}>
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl shrink-0 ${scheme.bg} ring-1 ${scheme.ring}`}>
            <Icon sx={{ fontSize: 22 }} className={scheme.icon} />
          </div>
        )}
      </div>

      {(subtitle !== undefined || trend !== undefined) && (
        <div className="mt-3 pt-3 flex items-center justify-between text-xs" style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-tertiary)" }}>
          <span className="truncate">{subtitle}</span>
          {trend !== undefined && (
            <span className={`font-semibold ml-2 shrink-0 ${trend > 0 ? "text-emerald-500" : trend < 0 ? "text-rose-500" : ""}`}>
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
