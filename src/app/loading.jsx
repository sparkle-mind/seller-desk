import React from "react";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";

const orbitItems = [
  { Icon: Inventory2OutlinedIcon, className: "sd-loader-orbit-one", label: "Products" },
  { Icon: LocalShippingOutlinedIcon, className: "sd-loader-orbit-two", label: "Shipping" },
  { Icon: InsightsOutlinedIcon, className: "sd-loader-orbit-three", label: "Analytics" },
];

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading SellerDesk"
      className="flex min-h-[65vh] items-center justify-center py-10"
    >
      <div className="flex w-full max-w-md flex-col items-center px-6 text-center">
        <div className="sd-loader-orbit relative mb-10 flex h-48 w-48 items-center justify-center">
          <div className="sd-loader-ring sd-loader-ring-outer" />
          <div className="sd-loader-ring sd-loader-ring-inner" />
          <div className="sd-loader-dots" />
          {orbitItems.map(({ Icon, className, label }) => (
            <span
              key={label}
              className={`sd-loader-orbit-icon ${className}`}
              aria-hidden="true"
            >
              <Icon sx={{ fontSize: 20 }} />
            </span>
          ))}
          <span className="sd-loader-core">
            <StorefrontIcon sx={{ fontSize: 32 }} />
          </span>
        </div>

        <p
          className="text-xs font-bold uppercase tracking-[0.24em]"
          style={{ color: "var(--brand-text)" }}
        >
          SellerDesk
        </p>
        <h1
          className="mt-2 text-xl font-bold tracking-tight sm:text-2xl"
          style={{ color: "var(--text-primary)" }}
        >
          Getting your shop in sync
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Bringing your business dashboard together.
        </p>

        <div
          className="mt-7 h-1 w-40 overflow-hidden rounded-full"
          style={{ backgroundColor: "var(--bg-surface3)" }}
          aria-hidden="true"
        >
          <span className="sd-loader-progress block h-full w-1/3 rounded-full" />
        </div>
        <span className="sr-only">Loading page content…</span>
      </div>
    </div>
  );
}
