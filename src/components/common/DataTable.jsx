"use client";

import React, { useState, useMemo } from "react";
import TablePagination from "@mui/material/TablePagination";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EmptyState from "./EmptyState";

export default function DataTable({
  columns = [],
  data = [],
  keyField = "id",
  initialSortKey = "",
  initialSortDir = "asc",
  rowsPerPageOptions = [10, 25, 50],
  defaultRowsPerPage = 10,
  emptyMessage = "No records found",
  onRowClick,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortDir, setSortDir] = useState(initialSortDir);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      let av = a[sortKey] ?? "";
      let bv = b[sortKey] ?? "";
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      av = av.toString().toLowerCase();
      bv = bv.toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  if (!data || data.length === 0) {
    return <EmptyState title="No records found" description={emptyMessage} />;
  }

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--bg-surface2)", borderBottom: "1px solid var(--border)" }}>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width, color: "var(--text-tertiary)" }}
                    className={`px-4 py-3 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider ${
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                    } ${col.sortable ? "cursor-pointer select-none hover:opacity-80 transition" : ""}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className={`inline-flex items-center gap-1 ${col.align === "right" ? "justify-end" : ""}`}>
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span style={{ color: isSorted ? "var(--brand-500)" : "var(--border)" }}>
                          {isSorted ? (
                            sortDir === "asc"
                              ? <ArrowUpwardIcon sx={{ fontSize: 13 }} />
                              : <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                          ) : (
                            <ArrowUpwardIcon sx={{ fontSize: 13, opacity: 0.35 }} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={row[keyField] || idx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-100 ${onRowClick ? "cursor-pointer" : ""}`}
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
                onMouseEnter={(e) => { if (onRowClick) e.currentTarget.style.backgroundColor = "var(--bg-surface2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    onClick={col.key === "actions" ? (e) => e.stopPropagation() : undefined}
                    className={`px-4 py-3.5 whitespace-nowrap text-sm ${
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                    }`}
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="px-2 py-1 flex justify-end"
        style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-surface2)" }}
      >
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={rowsPerPageOptions}
          sx={{
            color: "var(--text-tertiary)",
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
              fontSize: "0.75rem",
              color: "var(--text-tertiary)",
            },
            ".MuiTablePagination-select, .MuiIconButton-root": {
              color: "var(--text-secondary)",
            },
          }}
        />
      </div>
    </div>
  );
}
