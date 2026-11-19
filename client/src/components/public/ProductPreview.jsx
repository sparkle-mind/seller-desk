import React from "react";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// Illustrative, static mockup of the dashboard for the home hero.
// All figures are sample values for presentation only.
const kpis = [
  { label: "Gross sales", value: "₹1,24,860", delta: "+12.4%" },
  { label: "Orders", value: "342", delta: "+8.1%" },
  { label: "Est. profit", value: "₹38,260", delta: "+15.2%" },
];

const bars = [34, 48, 41, 58, 52, 66, 61, 74, 69, 82, 78, 92];

const orders = [
  { id: "MS-24019", product: "Cotton Kurta Set", channel: "meesho", status: "Shipped", amount: "₹799" },
  { id: "FK-88213", product: "Printed Bedsheet", channel: "flipkart", status: "Delivered", amount: "₹1,249" },
  { id: "MS-24022", product: "Silk Dupatta", channel: "meesho", status: "Pending", amount: "₹549" },
];

const statusChip = {
  Shipped: "sd-pub-chip-neutral",
  Delivered: "sd-pub-chip-success",
  Pending: "sd-pub-chip-warning",
};

export default function ProductPreview() {
  return (
    <div className="relative">
      <div
        className="sd-pub-preview"
        role="img"
        aria-label="Preview of the SellerDesk dashboard showing sales, orders, profit, a monthly trend chart and recent Meesho and Flipkart orders"
      >
        <div className="sd-pub-preview-bar" aria-hidden="true">
          <span className="flex gap-1.5">
            <span className="sd-pub-preview-dot" />
            <span className="sd-pub-preview-dot" />
            <span className="sd-pub-preview-dot" />
          </span>
          <span className="sd-pub-preview-url">app.sellerdesk / dashboard</span>
          <span className="w-10" />
        </div>

        <div className="space-y-3 p-3 sm:space-y-4 sm:p-5" aria-hidden="true">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="sd-pub-tile p-2.5 sm:p-3.5">
                <p className="truncate text-[10px] font-medium sm:text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  {kpi.label}
                </p>
                <p className="font-display mt-1 truncate text-base font-semibold sm:text-xl" style={{ color: "var(--text-primary)" }}>
                  {kpi.value}
                </p>
                <p className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: "rgb(var(--emerald-600-rgb))" }}>
                  <TrendingUpIcon sx={{ fontSize: 12 }} />
                  {kpi.delta}
                </p>
              </div>
            ))}
          </div>

          <div className="sd-pub-tile p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold sm:text-xs" style={{ color: "var(--text-primary)" }}>
                Sales trend
              </p>
              <span className="flex gap-1.5">
                <span className="sd-pub-chip sd-pub-chip-meesho">Meesho</span>
                <span className="sd-pub-chip sd-pub-chip-flipkart">Flipkart</span>
              </span>
            </div>
            <div className="mt-3 flex h-20 items-end gap-1 sm:h-28 sm:gap-1.5">
              {bars.map((height, index) => (
                <span
                  key={index}
                  className={`sd-pub-bar${index < 4 ? " is-muted" : ""}`}
                  style={{ height: `${height}%`, animationDelay: `${300 + index * 45}ms` }}
                />
              ))}
            </div>
          </div>

          <div className="sd-pub-tile divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold sm:text-xs" style={{ color: "var(--text-primary)" }}>
                    {order.product}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    {order.id}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <span className={`sd-pub-chip hidden sm:inline-flex sd-pub-chip-${order.channel}`}>
                    {order.channel === "meesho" ? "Meesho" : "Flipkart"}
                  </span>
                  <span className={`sd-pub-chip ${statusChip[order.status]}`}>{order.status}</span>
                  <span className="w-12 text-right text-[11px] font-bold sm:text-xs" style={{ color: "var(--text-primary)" }}>
                    {order.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating callouts, desktop only */}
      <div className="sd-pub-float -left-10 top-24 hidden w-56 p-3.5 xl:block" aria-hidden="true">
        <div className="flex items-start gap-2.5">
          <span
            className="sd-pub-icon sd-pub-icon-sm"
            style={{
              backgroundColor: "rgb(var(--amber-500-rgb) / 0.12)",
              borderColor: "rgb(var(--amber-500-rgb) / 0.3)",
              color: "rgb(var(--amber-700-rgb))",
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 17 }} />
          </span>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              Low stock
            </p>
            <p className="mt-0.5 text-[11px] leading-4" style={{ color: "var(--text-tertiary)" }}>
              Silk Dupatta, 4 left. Reorder level is 15.
            </p>
          </div>
        </div>
      </div>

      <div
        className="sd-pub-float -right-8 bottom-16 hidden w-52 p-3.5 xl:block"
        style={{ animationDelay: "-2.2s" }}
        aria-hidden="true"
      >
        <div className="flex items-start gap-2.5">
          <span
            className="sd-pub-icon sd-pub-icon-sm"
            style={{
              backgroundColor: "rgb(var(--emerald-500-rgb) / 0.12)",
              borderColor: "rgb(var(--emerald-500-rgb) / 0.3)",
              color: "rgb(var(--emerald-700-rgb))",
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 17 }} />
          </span>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              Settlement received
            </p>
            <p className="mt-0.5 text-[11px] leading-4" style={{ color: "var(--text-tertiary)" }}>
              Flipkart payout reconciled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
