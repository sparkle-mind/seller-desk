"use client";

import React, { useEffect, useState } from "react";
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
import CalculateIcon from "@mui/icons-material/Calculate";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ApiIcon from "@mui/icons-material/Api";
import SettingsIcon from "@mui/icons-material/Settings";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StorefrontIcon from "@mui/icons-material/Storefront";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutIcon from "@mui/icons-material/Logout";
import CategoryIcon from "@mui/icons-material/CategoryOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Tooltip from "@mui/material/Tooltip";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import SignOutDialog from "@/components/common/SignOutDialog";
import { useDispatch, useSelector } from "react-redux";
import { selectUnreadCount } from "@/store/slices/notificationsSlice";
import { resetProducts } from "@/store/slices/productsSlice";
import { resetInventory } from "@/store/slices/inventorySlice";
import { resetOrders } from "@/store/slices/ordersSlice";
import { resetShippingReturns } from "@/store/slices/shippingReturnsSlice";
import { resetSuppliersPurchases } from "@/store/slices/suppliersPurchasesSlice";
import { resetFinance } from "@/store/slices/financeSlice";
import { resetNotifications } from "@/store/slices/notificationsSlice";
import { resetSettings } from "@/store/slices/settingsSlice";
import { resetCalculator } from "@/store/slices/calculatorSlice";

// Sidebar structure: a top-level entry is either a plain link (has `href`)
// or an accordion group (has `children`).
export const navigationGroups = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  {
    id: "catalog",
    name: "Catalog & Stock",
    icon: CategoryIcon,
    children: [
      { name: "Products", href: "/products", icon: Inventory2Icon },
      { name: "Inventory", href: "/inventory", icon: WarehouseIcon },
      { name: "Suppliers & Purchases", href: "/suppliers-purchases", icon: BusinessIcon },
    ],
  },
  {
    id: "sales",
    name: "Sales & Fulfilment",
    icon: StorefrontOutlinedIcon,
    children: [
      { name: "Orders", href: "/orders", icon: ShoppingCartIcon },
      { name: "Shipping & Returns", href: "/shipping-returns", icon: LocalShippingIcon },
    ],
  },
  {
    id: "money",
    name: "Finance & Insights",
    icon: PaymentsOutlinedIcon,
    children: [
      { name: "Finance & Expenses", href: "/finance", icon: AccountBalanceWalletIcon },
      { name: "Pricing Calculator", href: "/calculator", icon: CalculateIcon },
      { name: "Reports & Analytics", href: "/reports", icon: BarChartIcon },
    ],
  },
  {
    id: "workspace",
    name: "Workspace",
    icon: TuneIcon,
    children: [
      { name: "Notifications", href: "/notifications", icon: NotificationsNoneIcon },
      { name: "Settings", href: "/settings", icon: SettingsIcon },
      { name: "How It Works", href: "/visual-flow", icon: AccountTreeIcon },
      { name: "API Integration", href: "/api-integration", icon: ApiIcon },
    ],
  },
];

// Flat list (used by the mobile bottom nav)
export const navigationItems = navigationGroups.flatMap((g) => g.children || [g]);

const isPathActive = (pathname, href) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

const groupForPath = (pathname) =>
  navigationGroups.find((g) => g.children?.some((c) => isPathActive(pathname, c.href)))?.id ?? null;

export default function AppSidebar({ onClose }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const unreadCount = useSelector(selectUnreadCount);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  // One group open at a time; follows the current route
  const [openGroup, setOpenGroup] = useState(() => groupForPath(pathname));

  useEffect(() => {
    const active = groupForPath(pathname);
    if (active) setOpenGroup(active);
  }, [pathname]);

  const toggleGroup = (id) => setOpenGroup((cur) => (cur === id ? null : id));

  const unreadBadge = (
    <span
      className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0"
      style={{
        backgroundColor: "var(--sidebar-active-bg)",
        color: "var(--sidebar-active-text)",
        boxShadow: "inset 0 0 0 1px var(--sidebar-active-border)",
      }}
      aria-label={`${unreadCount} unread`}
    >
      {unreadCount}
    </span>
  );

  const renderLink = (item, nested = false, hidden = false) => {
    const Icon = item.icon;
    const isActive = isPathActive(pathname, item.href);
    const showBadge = item.href === "/notifications" && unreadCount > 0;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        aria-current={isActive ? "page" : undefined}
        tabIndex={hidden ? -1 : undefined}
        className={`sd-nav-link flex items-center gap-3 rounded-xl font-medium transition-all duration-150 ${
          nested ? "px-3 py-2 text-[13px]" : "px-3 py-2.5 text-sm"
        } ${isActive ? "is-active" : ""}`}
      >
        <Icon sx={{ fontSize: nested ? 17 : 19 }} />
        <span className="truncate">{item.name}</span>
        {showBadge && unreadBadge}
        {isActive && (
          <span
            className={`sd-pop-in ${showBadge ? "ml-2" : "ml-auto"} w-1.5 h-1.5 rounded-full shrink-0`}
            style={{
              backgroundColor: "var(--sidebar-active-indicator)",
              boxShadow: "0 0 0 3px var(--sidebar-active-bg)",
            }}
          />
        )}
      </Link>
    );
  };

  const handleResetAllData = () => {
    dispatch(resetProducts());
    dispatch(resetInventory());
    dispatch(resetOrders());
    dispatch(resetShippingReturns());
    dispatch(resetSuppliersPurchases());
    dispatch(resetFinance());
    dispatch(resetSettings());
    dispatch(resetNotifications());
    dispatch(resetCalculator());
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
          href="/dashboard"
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
            <div
              className="sd-wordmark font-bold tracking-tight text-[15px] leading-tight"
              style={{ color: "var(--sidebar-title)" }}
            >
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
          backgroundColor: "var(--sidebar-panel)",
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
              backgroundColor: "var(--chip-meesho-bg)",
              color: "var(--chip-meesho-text)",
              borderColor: "var(--chip-meesho-border)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            Meesho
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
            style={{
              backgroundColor: "var(--chip-flipkart-bg)",
              color: "var(--chip-flipkart-text)",
              borderColor: "var(--chip-flipkart-border)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--chip-flipkart-dot)" }}
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
        {navigationGroups.map((group) => {
          if (!group.children) return renderLink(group);

          const Icon = group.icon;
          const isOpen = openGroup === group.id;
          const hasActive = group.children.some((c) => isPathActive(pathname, c.href));
          const hasUnread =
            unreadCount > 0 && group.children.some((c) => c.href === "/notifications");
          const panelId = `sd-nav-group-${group.id}`;

          return (
            <div key={group.id} className="pt-0.5">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={`sd-nav-link sd-nav-group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  hasActive ? "has-active" : ""
                }`}
              >
                <Icon sx={{ fontSize: 19 }} />
                <span className="truncate">{group.name}</span>
                {/* Unread count stays visible while its group is collapsed */}
                {hasUnread && !isOpen ? (
                  <span
                    className="ml-auto w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: "var(--sidebar-active-indicator)" }}
                    aria-label={`${unreadCount} unread notifications`}
                  />
                ) : null}
                <ExpandMoreIcon
                  className={`sd-nav-chevron ${hasUnread && !isOpen ? "ml-1" : "ml-auto"} ${isOpen ? "is-open" : ""}`}
                  sx={{ fontSize: 18 }}
                />
              </button>

              <div id={panelId} className={`sd-nav-panel ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
                <div className="sd-nav-panel-inner">
                  <div className="sd-nav-children ml-5 pl-2.5 mt-0.5 mb-1 space-y-0.5">
                    {group.children.map((child) => renderLink(child, true, !isOpen))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="p-4 space-y-3"
        style={{
          borderTop: "1px solid var(--sidebar-border)",
          backgroundColor: "var(--sidebar-footer)",
        }}
      >
        <button
          type="button"
          onClick={() => setResetDialogOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition hover:brightness-110"
          style={{
            color: "var(--sidebar-text)",
            backgroundColor: "var(--sidebar-btn-bg)",
            border: "1px solid var(--sidebar-btn-border)",
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
                backgroundColor: "rgb(var(--emerald-500-rgb))",
                borderColor: "var(--sidebar-bg)",
              }}
            />
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <div
              className="text-xs font-semibold truncate"
              style={{ color: "var(--sidebar-title)" }}
            >
              Vikram Malhotra
            </div>
            <div
              className="text-[11px] truncate"
              style={{ color: "var(--sidebar-subtext)" }}
            >
              DesiCart Retail LLP
            </div>
          </div>
          <Tooltip title="Sign out" arrow placement="top">
            <button
              type="button"
              onClick={() => setSignOutOpen(true)}
              className="sd-nav-link shrink-0 p-2 rounded-xl transition-all duration-150 hover:!text-rose-500"
              aria-label="Sign out"
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
            </button>
          </Tooltip>
        </div>
      </div>

      <SignOutDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />

      <ConfirmDialog
        open={resetDialogOpen}
        title="Reset All Mock Data?"
        message="This will reset all products, inventory, orders, shipments, returns, expenses, saved calculations, and settings back to default demo records."
        confirmLabel="Reset Data"
        confirmColor="warning"
        onConfirm={handleResetAllData}
        onClose={() => setResetDialogOpen(false)}
      />
    </div>
  );
}
