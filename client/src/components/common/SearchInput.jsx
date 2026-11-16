"use client";

import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div className={`relative flex items-center w-full max-w-xs ${className}`}>
      <SearchIcon className="absolute left-3 w-4 h-4 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition placeholder:text-[color:var(--text-tertiary)]"
        style={{
          backgroundColor: "var(--bg-surface2)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 focus:outline-none"
          style={{ color: "var(--text-tertiary)" }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </button>
      )}
    </div>
  );
}

