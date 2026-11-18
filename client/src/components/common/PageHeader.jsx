"use client";

import React from "react";
import Link from "next/link";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  badge,
}) {
  return (
    <div className="mb-6 space-y-3">
      {breadcrumbs.length > 0 && (
        <nav
          className="flex items-center gap-1 text-sm overflow-x-auto whitespace-nowrap"
          style={{ color: "var(--text-tertiary)" }}
        >
          <Link
            href="/"
            className="hover:text-brand-500 transition"
            style={{ color: "var(--text-tertiary)" }}
          >
            Home
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRightIcon
                sx={{ fontSize: 16 }}
                style={{ color: "var(--breadcrumb-sep)" }}
              />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-brand-500 transition"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className="font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1
              className="sd-page-title text-xl sm:text-2xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-brand/10 text-brand-500 border border-brand-500/20">
                {badge}
              </span>
            )}
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium"
              style={{
                backgroundColor: "var(--bg-surface2)",
                color: "var(--text-tertiary)",
                border: "1px solid var(--border)",
              }}
            >
              Demo Data
            </span>
          </div>
          {subtitle && (
            <p
              className="text-sm mt-0.5 max-w-2xl"
              style={{ color: "var(--text-secondary)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
