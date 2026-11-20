"use client";

import React from "react";
import IconButton from "@/components/common/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { marginTone } from "@/lib/pricingCalculator";

const TONE_TEXT = {
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  rose: "text-rose-600",
};
const TONE_BG = {
  emerald: "bg-emerald-500/10 ring-emerald-500/20",
  amber: "bg-amber-500/10 ring-amber-500/20",
  rose: "bg-rose-500/10 ring-rose-500/20",
};

export default function SavedCalculationCard({ calc, active, onEdit, onDuplicate, onDelete }) {
  const r = calc.result;
  const tone = marginTone(r.profitMargin);

  return (
    <article
      className="sd-stagger-item sd-hover-card rounded-2xl p-4 flex flex-col gap-4"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: active ? "1px solid var(--brand-text)" : "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold leading-snug truncate" style={{ color: "var(--text-primary)" }}>
            {calc.productName}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            <span
              className="px-2 py-0.5 rounded-md font-semibold"
              style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border)" }}
            >
              {calc.platform}
            </span>
            <span>{formatDate(calc.updatedAt)}</span>
          </div>
        </div>
        <span
          className={`shrink-0 px-2 py-1 rounded-lg text-xs font-bold ring-1 ${TONE_BG[tone]} ${TONE_TEXT[tone]}`}
        >
          {r.profitMargin.toFixed(1)}%
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <Row label="Selling price" value={formatCurrency(calc.inputs.sellingPrice)} />
        <Row label="Total cost" value={formatCurrency(r.totalCost)} />
        <Row
          label={r.isProfit ? "Net profit" : "Net loss"}
          value={formatCurrency(r.netProfit)}
          className={r.isProfit ? "text-emerald-600" : "text-rose-600"}
        />
        <Row
          label="Suggested price"
          value={r.finalSellingPrice === null ? "N/A" : formatCurrency(r.finalSellingPrice)}
        />
      </dl>

      {calc.notes && (
        <p className="text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>
          {calc.notes}
        </p>
      )}

      <div
        className="mt-auto pt-3 flex items-center justify-end gap-1"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <IconButton label="Edit calculation" tone="primary" onClick={() => onEdit(calc)}>
          <EditIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton label="Duplicate calculation" tone="success" onClick={() => onDuplicate(calc)}>
          <ContentCopyIcon sx={{ fontSize: 17 }} />
        </IconButton>
        <IconButton label="Delete calculation" tone="danger" onClick={() => onDelete(calc)}>
          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </div>
    </article>
  );
}

function Row({ label, value, className = "" }) {
  return (
    <div className="min-w-0">
      <dt style={{ color: "var(--text-tertiary)" }}>{label}</dt>
      <dd
        className={`font-semibold truncate ${className}`}
        style={className ? undefined : { color: "var(--text-primary)" }}
      >
        {value}
      </dd>
    </div>
  );
}
