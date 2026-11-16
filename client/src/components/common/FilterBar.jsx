"use client";

import React from "react";
import SearchInput from "./SearchInput";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export default function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search by name, SKU, ID...",
  filters = [],
  onReset,
  children,
}) {
  return (
    <div className="p-3.5 sm:p-4 rounded-xl mb-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 flex-wrap">
        {onSearchChange && (
          <SearchInput
            value={search || ""}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        )}

        {filters.map((filter, index) => (
          <div key={index} className="min-w-[130px]">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition cursor-pointer"
              style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition hover:opacity-90"
            style={{
              backgroundColor: "var(--bg-surface2)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <RestartAltIcon sx={{ fontSize: 16 }} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          {children}
        </div>
      )}
    </div>
  );
}

