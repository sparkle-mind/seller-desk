import React from "react";
import { formatCurrency } from "@/lib/formatters";
import { profitExample } from "@/data/marketing";

// Worked example of per-order profit after every fee (sample figures).
export default function ProfitBreakdown() {
  const sellingPrice = profitExample.rows[0].value;
  const net = profitExample.rows.reduce((sum, row) => sum + row.value, 0);
  const margin = ((net / sellingPrice) * 100).toFixed(1);

  return (
    <div className="sd-pub-card p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Order profit
          </p>
          <p className="font-display mt-1 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {profitExample.product}
          </p>
        </div>
        <span className="sd-pub-chip sd-pub-chip-meesho">Meesho</span>
      </div>

      <dl className="mt-6 space-y-3">
        {profitExample.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
            <dt style={{ color: "var(--text-secondary)" }}>{row.label}</dt>
            <dd
              className="font-semibold tabular-nums"
              style={{ color: row.value < 0 ? "rgb(var(--rose-600-rgb))" : "var(--text-primary)" }}
            >
              {row.value < 0 ? `− ${formatCurrency(Math.abs(row.value))}` : formatCurrency(row.value)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="sd-pub-hairline my-5" />

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Net profit
          </p>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            {margin}% margin on this order
          </p>
        </div>
        <p className="font-display text-3xl font-semibold tabular-nums" style={{ color: "rgb(var(--emerald-600-rgb))" }}>
          {formatCurrency(net)}
        </p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--bg-surface3)" }} aria-hidden="true">
        <span
          className="block h-full rounded-full"
          style={{ width: `${margin}%`, background: "linear-gradient(90deg, rgb(var(--emerald-500-rgb)), rgb(var(--emerald-400-rgb)))" }}
        />
      </div>
    </div>
  );
}
