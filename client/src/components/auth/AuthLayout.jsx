import React from "react";
import Link from "next/link";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ThemeToggle from "@/components/common/ThemeToggle";
import BrandMark from "@/components/public/BrandMark";
import "@/components/public/public.css";

const panelTiles = [
  { label: "Catalog", Icon: Inventory2OutlinedIcon },
  { label: "Fulfillment", Icon: LocalShippingOutlinedIcon },
  { label: "Insights", Icon: InsightsOutlinedIcon },
];

/** Shared page shell for the auth screens. Layout only, no form logic. */
export default function AuthLayout({
  eyebrow,
  title,
  description,
  switchText,
  switchLabel,
  switchHref,
  children,
}) {
  return (
    <div className="sd-pub lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      {/* Brand panel (desktop) */}
      <aside className="sd-pub-auth-panel hidden flex-col justify-between p-10 lg:flex xl:p-14">
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-24 -z-10 h-96 w-96 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -left-6 -z-10 h-60 w-60 rounded-full border border-white/10"
        />

        <BrandMark />

        <div className="my-12 max-w-md">
          <p className="sd-pub-eyebrow" style={{ color: "#e4d3b4" }}>
            Made for marketplace sellers
          </p>
          <h1
            className="sd-pub-h1 mt-6"
            style={{ fontSize: "clamp(2.4rem, 1.6rem + 2vw, 3.6rem)" }}
          >
            More clarity.
            <br />
            <em style={{ color: "#e2c494" }}>Less busywork.</em>
          </h1>
          <p className="sd-pub-band-muted mt-6 max-w-sm text-base leading-7">
            A calmer way to manage your day-to-day operations across every sales
            channel.
          </p>

          <div className="mt-10 grid max-w-sm grid-cols-3 gap-3">
            {panelTiles.map(({ label, Icon }) => (
              <div key={label} className="sd-pub-band-tile p-3.5">
                <Icon sx={{ fontSize: 21 }} style={{ color: "#e4d3b4" }} />
                <p className="sd-pub-band-muted mt-2 text-[11px] font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "rgba(247, 241, 230, 0.6)" }}>
          One workspace for the work behind every order.
        </p>
      </aside>

      {/* Form column */}
      <main className="relative flex min-h-[100dvh] flex-col px-5 py-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="sd-pub-btn sd-pub-btn-ghost -ml-3 !min-h-10 !px-3"
          >
            <ArrowBackIcon sx={{ fontSize: 17 }} />
            <span>Back to home</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="sd-rise-in w-full max-w-md">
            <BrandMark className="mb-10 lg:hidden" />

            <p className="sd-pub-eyebrow">{eyebrow}</p>
            <h2
              className="sd-pub-h2 mt-4"
              style={{ fontSize: "clamp(2rem, 1.6rem + 1.2vw, 2.6rem)" }}
            >
              {title}
            </h2>
            <p className="sd-pub-body mt-3">{description}</p>

            {children}

            <p
              className="mt-8 text-center text-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              {switchText}{" "}
              <Link href={switchHref} className="sd-pub-link">
                {switchLabel}
              </Link>
            </p>
          </div>
        </div>

        <p
          className="flex items-center justify-center gap-1.5 text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          <LockOutlinedIcon sx={{ fontSize: 14 }} />
          <span>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            {" · "}
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            {" · "}
            <Link href="/contact" className="hover:underline">
              Help
            </Link>
          </span>
        </p>
      </main>
    </div>
  );
}
