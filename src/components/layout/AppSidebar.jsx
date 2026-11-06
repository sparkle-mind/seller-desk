"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useDispatch } from "react-redux";
import { resetProducts } from "@/store/slices/productsSlice";
import { resetInventory } from "@/store/slices/inventorySlice";
import { resetOrders } from "@/store/slices/ordersSlice";
import { resetShippingReturns } from "@/store/slices/shippingReturnsSlice";
import { resetSuppliersPurchases } from "@/store/slices/suppliersPurchasesSlice";
import { resetFinance } from "@/store/slices/financeSlice";
import { resetSettings } from "@/store/slices/settingsSlice";

export const navigationItems = [
  { name: "Dashboard", href: "/", icon: DashboardIcon },
  { name: "Products", href: "/products", icon: Inventory2Icon },
  { name: "Inventory", href: "/inventory", icon: WarehouseIcon },
  { name: "Orders", href: "/orders", icon: ShoppingCartIcon },
  {
    name: "Shipping & Returns",
    href: "/shipping-returns",
    icon: LocalShippingIcon,
  },
  {
    name: "Suppliers & Purchases",
    href: "/suppliers-purchases",
    icon: BusinessIcon,
  },
  {
    name: "Finance & Expenses",
    href: "/finance",
    icon: AccountBalanceWalletIcon,
  },
  { name: "Reports & Analytics", href: "/reports", icon: BarChartIcon },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export default function AppSidebar({ onClose }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleResetAllData = () => {
    dispatch(resetProducts());
    dispatch(resetInventory());
    dispatch(resetOrders());
    dispatch(resetShippingReturns());
    dispatch(resetSuppliersPurchases());
    dispatch(resetFinance());
    dispatch(resetSettings());
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <div className="flex flex-col h-full select-none sd-sidebar">
      {/* Brand */}
      <div
        className="p-5 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-3 group"
          onClick={onClose}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, var(--sidebar-accent), var(--sidebar-accent-2))",
              color: "var(--brand-contrast)",
              boxShadow: "0 12px 26px -12px var(--sidebar-glow)",
            }}
          >
            <StorefrontIcon sx={{ fontSize: 21 }} />
          </div>
          <div>
            <div className="font-bold text-white tracking-tight text-[15px] leading-tight">
              SellerDesk
            </div>
            <div
              className="text-[10px] font-medium tracking-wider uppercase"
              style={{ color: "var(--sidebar-subtext)" }}
            >
              Meesho &amp; Flipkart Ops
            </div>
          </div>
        </Link>
      </div>

      {/* Channel pills */}
      <div
        className="px-5 py-3"
        style={{
          borderBottom: "1px solid var(--sidebar-border)",
          backgroundColor: "rgba(0,0,0,0.12)",
        }}
      >
        <div
          className="text-[10px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--sidebar-subtext)" }}
        >
          Connected Channels
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
            style={{
              backgroundColor: "rgba(236, 72, 153, 0.12)",
              color: "#f9a8d4",
              borderColor: "rgba(236, 72, 153, 0.28)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            Meesho
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
            style={{
              backgroundColor: "rgba(40, 116, 240, 0.12)",
              color: "#8ab4ff",
              borderColor: "rgba(40, 116, 240, 0.3)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#2874f0" }}
            />
            Flipkart
          </span>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <div
          className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--sidebar-subtext)" }}
        >
          Management Modules
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`sd-nav-link
                text-center flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive ? "is-active" : ""
                }`}
            >
              <Icon sx={{ fontSize: 19 }} />
              <span className="truncate">{item.name}</span>
              {isActive && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: "var(--sidebar-active-text)",
                    boxShadow: "0 0 0 3px var(--sidebar-active-bg)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="p-4 space-y-3"
        style={{
          borderTop: "1px solid var(--sidebar-border)",
          backgroundColor: "rgba(0,0,0,0.16)",
        }}
      >
        <button
          type="button"
          onClick={() => setResetDialogOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition hover:brightness-110"
          style={{
            color: "var(--sidebar-text)",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <RestartAltIcon sx={{ fontSize: 15 }} className="text-amber-400" />
          <span>Reset Demo Data</span>
        </button>

        <div className="flex items-center gap-3 pt-1">
          <div className="relative shrink-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background:
                  "linear-gradient(135deg, var(--sidebar-accent), var(--sidebar-accent-2))",
                color: "var(--brand-contrast)",
              }}
            >
              VM
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{
                backgroundColor: "#10b981",
                borderColor: "var(--sidebar-bg)",
              }}
            />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">
              Vikram Malhotra
            </div>
            <div
              className="text-[11px] truncate"
              style={{ color: "var(--sidebar-subtext)" }}
            >
              DesiCart Retail LLP
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={resetDialogOpen}
        title="Reset All Mock Data?"
        message="This will reset all products, inventory, orders, shipments, returns, expenses, and settings back to default demo records."
        confirmLabel="Reset Data"
        confirmColor="warning"
        onConfirm={handleResetAllData}
        onClose={() => setResetDialogOpen(false)}
      />
    </div>
  );
}
