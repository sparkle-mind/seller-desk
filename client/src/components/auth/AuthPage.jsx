"use client";

import React, { useState } from "react";
import Link from "next/link";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ThemeToggle from "@/components/common/ThemeToggle";
import BrandMark from "@/components/public/BrandMark";
import "@/components/public/public.css";

const pageContent = {
  login: {
    eyebrow: "Welcome back",
    title: "Good to see you again.",
    description: "Sign in to pick up where you left off and keep every channel running smoothly.",
    button: "Sign in",
    switchText: "New to SellerDesk?",
    switchLabel: "Create an account",
    switchHref: "/signup",
  },
  signup: {
    eyebrow: "Get started",
    title: "Your business, in sync.",
    description: "One clear view of your products, orders, stock, and marketplace performance.",
    button: "Create account",
    switchText: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/login",
  },
  forgot: {
    eyebrow: "Account recovery",
    title: "Let’s get you back in.",
    description: "Enter the email address associated with your account to continue.",
    button: "Send reset link",
    switchText: "Remembered your password?",
    switchLabel: "Back to sign in",
    switchHref: "/login",
  },
};

const panelTiles = [
  { label: "Catalog", Icon: Inventory2OutlinedIcon },
  { label: "Fulfillment", Icon: LocalShippingOutlinedIcon },
  { label: "Insights", Icon: InsightsOutlinedIcon },
];

export default function AuthPage({ mode }) {
  const content = pageContent[mode];
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setNotice(
      "This is a UI-only demo. Authentication is not connected, and no account data was sent or saved.",
    );
  };

  return (
    <div className="sd-pub lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      {/* Brand panel (desktop) */}
      <aside className="sd-pub-auth-panel hidden flex-col justify-between p-10 lg:flex xl:p-14">
        <div aria-hidden="true" className="absolute -bottom-32 -left-24 -z-10 h-96 w-96 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-16 -left-6 -z-10 h-60 w-60 rounded-full border border-white/10" />

        <BrandMark />

        <div className="my-12 max-w-md">
          <p className="sd-pub-eyebrow" style={{ color: "#e4d3b4" }}>
            Made for marketplace sellers
          </p>
          <h1 className="sd-pub-h1 mt-6" style={{ fontSize: "clamp(2.4rem, 1.6rem + 2vw, 3.6rem)" }}>
            More clarity.
            <br />
            <em style={{ color: "#e2c494" }}>Less busywork.</em>
          </h1>
          <p className="sd-pub-band-muted mt-6 max-w-sm text-base leading-7">
            A calmer way to manage your day-to-day operations across every sales channel.
          </p>

          <div className="mt-10 grid max-w-sm grid-cols-3 gap-3">
            {panelTiles.map(({ label, Icon }) => (
              <div key={label} className="sd-pub-band-tile p-3.5">
                <Icon sx={{ fontSize: 21 }} style={{ color: "#e4d3b4" }} />
                <p className="sd-pub-band-muted mt-2 text-[11px] font-medium">{label}</p>
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
          <Link href="/" className="sd-pub-btn sd-pub-btn-ghost -ml-3 !min-h-10 !px-3">
            <ArrowBackIcon sx={{ fontSize: 17 }} />
            <span>Back to home</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="sd-rise-in w-full max-w-md">
            <BrandMark className="mb-10 lg:hidden" />

            <p className="sd-pub-eyebrow">{content.eyebrow}</p>
            <h2 className="sd-pub-h2 mt-4" style={{ fontSize: "clamp(2rem, 1.6rem + 1.2vw, 2.6rem)" }}>
              {content.title}
            </h2>
            <p className="sd-pub-body mt-3">{content.description}</p>

            <form className="mt-9 space-y-5" onSubmit={handleSubmit}>
              {isSignup && (
                <label className="block">
                  <span className="sd-pub-label">Your name</span>
                  <input
                    autoComplete="name"
                    className="sd-pub-input"
                    placeholder="e.g. Aanya Sharma"
                    required
                    type="text"
                  />
                </label>
              )}

              <label className="block">
                <span className="sd-pub-label">Work email</span>
                <input
                  autoComplete="email"
                  className="sd-pub-input"
                  placeholder="you@yourbusiness.com"
                  required
                  type="email"
                />
              </label>

              {!isForgot && (
                <label className="block">
                  <span className="sd-pub-label">Password</span>
                  <span className="relative block">
                    <input
                      autoComplete={isSignup ? "new-password" : "current-password"}
                      className="sd-pub-input pr-12"
                      minLength={isSignup ? 8 : undefined}
                      placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
                      required
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-xl transition hover:opacity-80"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 19 }} />
                      ) : (
                        <VisibilityOutlinedIcon sx={{ fontSize: 19 }} />
                      )}
                    </button>
                  </span>
                </label>
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between gap-3 text-xs">
                  <label className="inline-flex cursor-pointer items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                    <input type="checkbox" className="h-4 w-4" style={{ accentColor: "var(--brand)" }} />
                    Remember me
                  </label>
                  <Link href="/forgot-password" className="sd-pub-link">
                    Forgot password?
                  </Link>
                </div>
              )}

              {isSignup && (
                <p className="text-xs leading-5" style={{ color: "var(--text-tertiary)" }}>
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="sd-pub-link">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="sd-pub-link">
                    Privacy Policy
                  </Link>
                  .
                </p>
              )}

              <button type="submit" className="sd-pub-btn sd-pub-btn-primary sd-pub-btn-lg sd-pub-btn-block">
                {content.button}
              </button>

              {notice && (
                <p role="status" className="sd-pub-notice">
                  <InfoOutlinedIcon sx={{ fontSize: 18 }} style={{ color: "var(--brand-text)", flexShrink: 0 }} />
                  <span>{notice}</span>
                </p>
              )}
            </form>

            <p className="mt-8 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
              {content.switchText}{" "}
              <Link href={content.switchHref} className="sd-pub-link">
                {content.switchLabel}
              </Link>
            </p>
          </div>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
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
