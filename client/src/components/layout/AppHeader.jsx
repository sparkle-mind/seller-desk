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
import LogoutIcon from "@mui/icons-material/Logout";
import Popover from "@mui/material/Popover";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "next/link";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import ThemeToggle from "@/components/common/ThemeToggle";
import Button from "@/components/common/Button";
import IconButton from "@/components/common/IconButton";
import SignOutDialog from "@/components/common/SignOutDialog";
import NotificationItem from "@/features/notifications/NotificationItem";
import { sortNewestFirst } from "@/features/notifications/notificationMeta";
import {
  markNotificationRead,
  markAllNotificationsRead,
  selectUnreadCount,
} from "@/store/slices/notificationsSlice";

const HEADER_NOTIFICATION_LIMIT = 5;

export default function AppHeader({ onMenuToggle }) {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const notifications = useSelector((state) => state.notifications.items);
  const unreadCount = useSelector(selectUnreadCount);
  const latest = sortNewestFirst(notifications).slice(0, HEADER_NOTIFICATION_LIMIT);
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
        <Link href="/dashboard" className="lg:hidden flex items-center gap-2.5 min-w-0">
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
        <IconButton
          label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
          size="md"
          onClick={(e) => setNotifAnchorEl(e.currentTarget)}
          aria-haspopup="true"
          aria-expanded={Boolean(notifAnchorEl)}
        >
          <Badge
            badgeContent={unreadCount}
            invisible={unreadCount === 0}
            color="primary"
            variant="dot"
            className="sd-notif-badge"
          >
            <NotificationsNoneIcon sx={{ fontSize: 22 }} />
          </Badge>
        </IconButton>

        <Popover
          open={Boolean(notifAnchorEl)}
          anchorEl={notifAnchorEl}
          onClose={() => setNotifAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              width: 360,
              maxWidth: "calc(100vw - 24px)",
              mt: 1,
              borderRadius: "18px",
              overflow: "hidden",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-popover)",
            },
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div>
              <div className="text-[13px] font-bold font-display" style={{ color: "var(--text-primary)" }}>
                Notifications
              </div>
              <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                onClick={() => dispatch(markAllNotificationsRead())}
                className="!text-[11px]"
                sx={{ color: "var(--brand-text)" }}
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto p-1.5 space-y-0.5">
            {latest.length === 0 ? (
              <div className="flex flex-col items-center text-center px-6 py-8">
                <div
                  className="sd-pop-in w-10 h-10 rounded-full flex items-center justify-center mb-2"
                  style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand-text)" }}
                >
                  <NotificationsOffOutlinedIcon sx={{ fontSize: 22 }} />
                </div>
                <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  No notifications yet
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  Order, stock and payout alerts will appear here.
                </div>
              </div>
            ) : (
              latest.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  compact
                  onOpen={(item) => {
                    dispatch(markNotificationRead(item.id));
                    setNotifAnchorEl(null);
                  }}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <Link
            href="/notifications"
            onClick={() => setNotifAnchorEl(null)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition hover:bg-surface2"
            style={{ borderTop: "1px solid var(--border)", color: "var(--brand-text)" }}
          >
            View all notifications
            <ArrowForwardIcon sx={{ fontSize: 15 }} />
          </Link>
        </Popover>

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
          <MenuItem component={Link} href="/notifications" onClick={() => setAnchorEl(null)}>
            <ListItemIcon><NotificationsNoneIcon fontSize="small" /></ListItemIcon>
            <span className="text-xs flex-1" style={{ color: "var(--text-primary)" }}>Notifications</span>
            {unreadCount > 0 && (
              <span
                className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: "var(--brand-soft-strong)", color: "var(--brand-text)" }}
              >
                {unreadCount}
              </span>
            )}
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); localStorage.clear(); window.location.reload(); }}>
            <ListItemIcon><RestartAltIcon fontSize="small" className="text-amber-500" /></ListItemIcon>
            <span className="text-xs font-medium text-amber-600">Reset Demo Storage</span>
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); setSignOutOpen(true); }}>
            <ListItemIcon><LogoutIcon fontSize="small" className="text-rose-500" /></ListItemIcon>
            <span className="text-xs font-medium text-rose-600">Sign Out</span>
          </MenuItem>
        </Menu>

        <SignOutDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />
      </div>
    </header>
  );
}
