"use client";

import React, { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import SettingsIcon from "@mui/icons-material/Settings";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Link from "next/link";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { resetProducts } from "@/store/slices/productsSlice";
import { resetOrders } from "@/store/slices/ordersSlice";
import { resetInventory } from "@/store/slices/inventorySlice";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function AppHeader({ onMenuToggle }) {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const todayStr = dayjs().format("ddd, DD MMM YYYY");

  return (
    <header
      className="sticky top-0 z-30 h-14 sm:h-16 flex items-center px-3 sm:px-6 justify-between backdrop-blur-md transition-colors duration-200"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-surface) 92%, transparent)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 sd-icon-btn"
          aria-label="Menu"
        >
          <MenuIcon />
        </button> */}
        <Link href="/" className="lg:hidden flex items-center gap-2.5 min-w-0">
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--brand-500), var(--brand-700))",
              color: "var(--brand-contrast)",
            }}
          >
            <StorefrontIcon sx={{ fontSize: 18 }} />
          </span>
          <span className="sd-wordmark text-sm font-bold tracking-tight truncate" style={{ color: "var(--text-primary)" }}>
            SellerDesk
          </span>
        </Link>
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
          <span className="sd-live-dot w-2 h-2 rounded-full bg-emerald-500" />
          <span style={{ color: "var(--text-secondary)" }}>System Online</span>
          <span style={{ color: "var(--border)" }}>•</span>
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Sync pill */}
        <div
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border)" }}
        >
          <span style={{ color: "var(--text-tertiary)" }}>Sync:</span>
          <span className="font-semibold" style={{ color: "var(--chart-meesho)" }}>Meesho</span>
          <span style={{ color: "var(--border)" }}>&</span>
          <span className="font-semibold" style={{ color: "var(--flipkart-text)" }}>Flipkart</span>
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          type="button"
          onClick={(e) => setNotifAnchorEl(e.currentTarget)}
          className="p-2 sd-icon-btn"
        >
          <Badge badgeContent={3} color="primary" variant="dot" className="sd-notif-badge">
            <NotificationsNoneIcon sx={{ fontSize: 22 }} />
          </Badge>
        </button>

        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={() => setNotifAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{ sx: { width: 320, p: 1 } }}
        >
          <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border)" }}>
            Recent Alerts
          </div>
          {[
            { title: "New Flipkart Order OD40923488210", sub: "1x Fast Charging Power Bank received", color: "var(--text-primary)" },
            { title: "Low Stock: Kolhapuri Sandals", sub: "SKU-FTW-011 is out of stock", color: "rgb(var(--amber-600-rgb))" },
            { title: "Meesho Settlement Payout", sub: "₹70,848 credited for cycle Feb 15-21", color: "rgb(var(--emerald-500-rgb))" },
          ].map((n, i) => (
            <MenuItem key={i} onClick={() => setNotifAnchorEl(null)}>
              <div>
                <div className="text-xs font-semibold" style={{ color: n.color }}>{n.title}</div>
                <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{n.sub}</div>
              </div>
            </MenuItem>
          ))}
        </Menu>

        {/* User avatar */}
        <button
          type="button"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl transition hover:bg-surface2"
          style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
        >
          <div
            className="w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--brand-500), var(--brand-700))",
              color: "var(--brand-contrast)",
            }}
          >
            V
          </div>
          <span className="hidden sm:inline text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
            Vikram M.
          </span>
        </button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{ sx: { width: 220 } }}
        >
          <div className="px-4 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Vikram Malhotra</div>
            <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>DesiCart Retail LLP</div>
          </div>
          <MenuItem component={Link} href="/settings" onClick={() => setAnchorEl(null)}>
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
            <span className="text-xs" style={{ color: "var(--text-primary)" }}>Business Settings</span>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); localStorage.clear(); window.location.reload(); }}>
            <ListItemIcon><RestartAltIcon fontSize="small" className="text-amber-500" /></ListItemIcon>
            <span className="text-xs font-medium text-amber-600">Reset Demo Storage</span>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}
