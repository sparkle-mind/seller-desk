"use client";

import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import FilterBar from "@/components/common/FilterBar";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import NotificationItem from "@/features/notifications/NotificationItem";
import {
  CATEGORY_OPTIONS,
  getCategoryMeta,
  groupByDay,
  sortNewestFirst,
} from "@/features/notifications/notificationMeta";
import {
  markNotificationRead,
  toggleNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearReadNotifications,
} from "@/store/slices/notificationsSlice";

// MUI
import Button from "@/components/common/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import TodayIcon from "@mui/icons-material/Today";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";

const VIEWS = ["all", "unread", "action"];

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.items);

  const [view, setView] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [toast, setToast] = useState("");

  const counts = useMemo(() => {
    const unread = notifications.filter((n) => !n.read);
    return {
      total: notifications.length,
      unread: unread.length,
      action: unread.filter((n) => n.priority === "high").length,
      today: notifications.filter((n) => dayjs(n.createdAt).isSame(dayjs(), "day")).length,
      read: notifications.length - unread.length,
    };
  }, [notifications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const mode = VIEWS[view];
    return sortNewestFirst(notifications).filter((n) => {
      if (mode === "unread" && n.read) return false;
      if (mode === "action" && (n.read || n.priority !== "high")) return false;
      if (categoryFilter !== "all" && n.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        getCategoryMeta(n.category).label.toLowerCase().includes(q)
      );
    });
  }, [notifications, view, search, categoryFilter]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);
  const hasFilters = search !== "" || categoryFilter !== "all";

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
    setToast("All notifications marked as read");
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
    setToast("Notification deleted");
  };

  const emptyCopy = (() => {
    if (counts.total === 0) {
      return {
        title: "You're all caught up",
        description: "New orders, stock alerts and payouts will appear here as they happen.",
      };
    }
    if (hasFilters) {
      return {
        title: "No matching notifications",
        description: "Try a different search term or category.",
      };
    }
    if (VIEWS[view] === "unread") {
      return { title: "No unread notifications", description: "You've read everything. Nice work." };
    }
    return {
      title: "Nothing needs your attention",
      description: "High-priority alerts like stock-outs and disputed deductions will show up here.",
    };
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Order activity, stock alerts, settlements and returns across Meesho and Flipkart, in one feed."
        breadcrumbs={[{ label: "Notifications" }]}
        actions={
          <>
            <Button
              variant="outline"
              tone="neutral"
              startIcon={<DeleteSweepOutlinedIcon />}
              onClick={() => setClearDialogOpen(true)}
              disabled={counts.read === 0}
            >
              Clear Read
            </Button>
            <Button
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllRead}
              disabled={counts.unread === 0}
            >
              Mark All as Read
            </Button>
          </>
        }
      />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Unread"
          value={counts.unread}
          subtitle="Waiting for you"
          icon={NotificationsActiveOutlinedIcon}
          color="blue"
        />
        <StatCard
          title="Action Needed"
          value={counts.action}
          subtitle="High-priority alerts"
          icon={PriorityHighIcon}
          color="rose"
          tooltip="Unread alerts that may affect listings, payouts or claims"
        />
        <StatCard
          title="Today"
          value={counts.today}
          subtitle={dayjs().format("ddd, DD MMM")}
          icon={TodayIcon}
          color="amber"
        />
        <StatCard
          title="Total"
          value={counts.total}
          subtitle={`${counts.read} read`}
          icon={NotificationsNoneIcon}
          color="slate"
        />
      </div>

      <div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search notifications..."
          filters={[
            {
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [{ value: "all", label: "All Categories" }, ...CATEGORY_OPTIONS],
            },
          ]}
          onReset={hasFilters ? resetFilters : undefined}
        />

        {/* Feed */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="px-4 pt-2" style={{ borderBottom: "1px solid var(--border)" }}>
            <Tabs
              value={view}
              onChange={(_, val) => setView(val)}
              variant="scrollable"
              scrollButtons={false}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                },
              }}
            >
              <Tab label={`All (${counts.total})`} />
              <Tab label={`Unread (${counts.unread})`} />
              <Tab label={`Action Needed (${counts.action})`} />
            </Tabs>
          </div>

          {groups.length === 0 ? (
            <div className="p-3 sm:p-4">
              <EmptyState
                icon={NotificationsOffOutlinedIcon}
                title={emptyCopy.title}
                description={emptyCopy.description}
                actionLabel={hasFilters ? "Reset Filters" : undefined}
                onAction={hasFilters ? resetFilters : undefined}
              />
            </div>
          ) : (
            <div className="p-2 sm:p-3 space-y-4">
              {groups.map((group) => (
                <section key={group.key} aria-label={group.label}>
                  <div
                    className="px-3 sm:px-4 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {group.label}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((n) => (
                      <div key={n.id} className="sd-row">
                        <NotificationItem
                          notification={n}
                          onOpen={(item) => dispatch(markNotificationRead(item.id))}
                          onToggleRead={(id) => dispatch(toggleNotificationRead(id))}
                          onDelete={handleDelete}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={clearDialogOpen}
        title="Clear read notifications?"
        message={`This removes ${counts.read} read notification${counts.read === 1 ? "" : "s"} from your feed. Unread notifications are kept.`}
        confirmLabel="Clear Read"
        confirmColor="warning"
        onConfirm={() => {
          dispatch(clearReadNotifications());
          setToast("Read notifications cleared");
        }}
        onClose={() => setClearDialogOpen(false)}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2500}
        onClose={() => setToast("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast("")} sx={{ width: "100%" }}>
          {toast}
        </Alert>
      </Snackbar>
    </div>
  );
}
