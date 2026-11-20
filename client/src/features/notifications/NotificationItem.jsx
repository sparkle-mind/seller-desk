"use client";

import React from "react";
import Link from "next/link";
import Tooltip from "@mui/material/Tooltip";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import IconButton from "@/components/common/IconButton";
import { getCategoryMeta, formatRelativeTime } from "./notificationMeta";

/**
 * One notification row. `compact` is the header dropdown variant (no row
 * actions, tighter spacing); the full variant is used on /notifications.
 */
export default function NotificationItem({
  notification,
  compact = false,
  onOpen,
  onToggleRead,
  onDelete,
}) {
  const { label, icon: Icon, tone } = getCategoryMeta(notification.category);
  const unread = !notification.read;
  const isHigh = notification.priority === "high";

  return (
    <div
      className={`group relative flex items-start gap-3 rounded-xl transition-colors duration-150 ${
        compact ? "px-2.5 py-2.5" : "px-3 sm:px-4 py-3.5"
      }`}
      style={{ backgroundColor: unread ? "var(--brand-soft)" : "transparent" }}
    >
      <Link
        href={notification.href || "/notifications"}
        onClick={() => onOpen?.(notification)}
        className="flex flex-1 min-w-0 items-start gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
      >
        <div
          className={`shrink-0 rounded-xl ring-1 flex items-center justify-center ${tone.bg} ${tone.ring} ${
            compact ? "w-8 h-8" : "w-10 h-10"
          }`}
        >
          <Icon sx={{ fontSize: compact ? 17 : 20 }} className={tone.icon} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span
              className={`${compact ? "text-xs" : "text-sm"} leading-snug ${
                unread ? "font-semibold" : "font-medium"
              }`}
              style={{ color: "var(--text-primary)" }}
            >
              {notification.title}
            </span>
            {unread && (
              <span
                className="sd-pop-in mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: "var(--accent)" }}
                aria-label="Unread"
              />
            )}
          </div>
          <p
            className={`${compact ? "text-[11px] line-clamp-1" : "text-xs sm:text-[13px] line-clamp-2"} mt-0.5`}
            style={{ color: "var(--text-secondary)" }}
          >
            {notification.message}
          </p>
          <div
            className="mt-1.5 flex items-center gap-1.5 flex-wrap text-[11px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            <span className="font-medium">{label}</span>
            <span style={{ color: "var(--border-strong)" }}>•</span>
            <span>{formatRelativeTime(notification.createdAt)}</span>
            {isHigh && (
              <span className="inline-flex items-center gap-1 px-2 py-px rounded-full border text-[10px] font-semibold bg-rose-50 text-rose-700 border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Action needed
              </span>
            )}
          </div>
        </div>
      </Link>

      {!compact && (
        <div className="flex items-center gap-0.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
          <Tooltip title={unread ? "Mark as read" : "Mark as unread"} arrow>
            <IconButton
              label={unread ? "Mark as read" : "Mark as unread"}
              title=""
              onClick={() => onToggleRead?.(notification.id)}
            >
              {unread ? (
                <MarkEmailReadOutlinedIcon sx={{ fontSize: 18 }} />
              ) : (
                <MarkEmailUnreadOutlinedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <IconButton
              label="Delete notification"
              title=""
              tone="danger"
              onClick={() => onDelete?.(notification.id)}
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
