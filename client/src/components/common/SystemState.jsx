"use client";

import React from "react";
import Link from "next/link";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function SystemState({
  code,
  title,
  description,
  icon: Icon,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel = "Back to dashboard",
  secondaryHref = "/",
}) {
  return (
    <div className="flex min-h-[65vh] items-center justify-center py-10 sm:py-16">
      <section
        className="sd-rise-in relative w-full max-w-xl overflow-hidden rounded-3xl p-7 text-center sm:p-11"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-popover)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full blur-3xl"
          style={{ backgroundColor: "var(--brand-soft)" }}
        />
        <div className="relative">
          <Link
            href="/"
            className="mb-9 inline-flex items-center gap-2 text-sm font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, var(--brand-500), var(--brand-700))",
                color: "var(--brand-contrast)",
              }}
            >
              <StorefrontIcon sx={{ fontSize: 20 }} />
            </span>
            SellerDesk
          </Link>

          <div
            className="sd-float mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "var(--brand-soft)",
              color: "var(--brand-text)",
              boxShadow: "0 0 0 8px var(--bg-surface2)",
            }}
          >
            <Icon sx={{ fontSize: 32 }} />
          </div>

          <p
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--brand-text)" }}
          >
            {code}
          </p>
          <h1
            className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h1>
          <p
            className="mx-auto mt-3 max-w-md text-sm leading-6"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {onAction ? (
              <button
                type="button"
                onClick={onAction}
                className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  backgroundColor: "var(--brand-500)",
                  color: "var(--brand-contrast)",
                }}
              >
                {actionLabel}
              </button>
            ) : actionHref ? (
              <Link
                href={actionHref}
                className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition hover:brightness-110"
                style={{
                  backgroundColor: "var(--brand-500)",
                  color: "var(--brand-contrast)",
                }}
              >
                {actionLabel}
              </Link>
            ) : null}
            <Link
              href={secondaryHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition hover:opacity-80"
              style={{
                backgroundColor: "var(--bg-surface2)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 17 }} />
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
