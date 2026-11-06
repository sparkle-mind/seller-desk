"use client";

import React, { useState } from "react";
import Link from "next/link";
import StorefrontIcon from "@mui/icons-material/Storefront";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";

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

const inputStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

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
    <main className="flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-8">
      <div
        className="grid w-full max-w-5xl overflow-hidden rounded-[28px] lg:min-h-[640px] lg:grid-cols-[0.95fr_1.05fr]"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-popover)",
        }}
      >
        <aside
          className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-12"
          style={{
            background:
              "radial-gradient(circle at 75% 15%, rgba(96,165,250,.32), transparent 34%), linear-gradient(145deg, #101d35 0%, #0a1222 100%)",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-8 h-56 w-56 rounded-full border border-white/10"
          />
          <Link href="/" className="relative inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/30">
              <StorefrontIcon sx={{ fontSize: 24 }} />
            </span>
            <span className="text-lg font-bold tracking-tight">SellerDesk</span>
          </Link>

          <div className="relative my-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Made for marketplace sellers
            </div>
            <h1 className="max-w-md text-4xl font-bold leading-[1.12] tracking-tight xl:text-5xl">
              More clarity.
              <br />
              <span className="text-blue-300">Less busywork.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
              A calmer way to manage your day-to-day operations across every sales channel.
            </p>

            <div className="mt-10 grid max-w-sm grid-cols-3 gap-3">
              {[
                { label: "Catalog", Icon: Inventory2OutlinedIcon },
                { label: "Fulfillment", Icon: LocalShippingOutlinedIcon },
                { label: "Insights", Icon: InsightsOutlinedIcon },
              ].map(({ label, Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
                >
                  <Icon sx={{ fontSize: 21 }} className="text-blue-200" />
                  <p className="mt-2 text-[11px] font-medium text-slate-300">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-slate-400">
            One workspace for the work behind every order.
          </p>
        </aside>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-9 inline-flex items-center gap-2.5 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <StorefrontIcon sx={{ fontSize: 20 }} />
              </span>
              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                SellerDesk
              </span>
            </Link>

            <div
              className="mb-3 text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: "var(--brand-text)" }}
            >
              {content.eyebrow}
            </div>
            <h2
              className="text-3xl font-bold tracking-tight sm:text-[2.1rem]"
              style={{ color: "var(--text-primary)" }}
            >
              {content.title}
            </h2>
            <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              {content.description}
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {isSignup && (
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Your name
                  </span>
                  <input
                    autoComplete="name"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="e.g. Aanya Sharma"
                    required
                    style={inputStyle}
                    type="text"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Work email
                </span>
                <input
                  autoComplete="email"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="you@yourbusiness.com"
                  required
                  style={inputStyle}
                  type="email"
                />
              </label>

              {!isForgot && (
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Password
                  </span>
                  <span className="relative block">
                    <input
                      autoComplete={isSignup ? "new-password" : "current-password"}
                      className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      minLength={isSignup ? 8 : undefined}
                      placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
                      required
                      style={inputStyle}
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center"
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
                  <label className="inline-flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                    <input type="checkbox" className="h-4 w-4 accent-blue-600" />
                    Remember me
                  </label>
                  <Link href="/forgot-password" className="font-semibold hover:underline" style={{ color: "var(--brand-text)" }}>
                    Forgot password?
                  </Link>
                </div>
              )}

              {isSignup && (
                <p className="text-xs leading-5" style={{ color: "var(--text-tertiary)" }}>
                  By creating an account, you agree to our{" "}
                  <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>Terms</span>
                  {" "}and{" "}
                  <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>Privacy Policy</span>.
                </p>
              )}

              <button
                type="submit"
                className="flex min-h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                style={{ background: "linear-gradient(100deg, #2563eb, #3b82f6)" }}
              >
                {content.button}
              </button>

              {notice && (
                <p
                  role="status"
                  className="rounded-xl border px-4 py-3 text-xs leading-5"
                  style={{
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--bg-surface2)",
                    borderColor: "var(--border)",
                  }}
                >
                  {notice}
                </p>
              )}
            </form>

            <p className="mt-7 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
              {content.switchText}{" "}
              <Link href={content.switchHref} className="font-bold hover:underline" style={{ color: "var(--brand-text)" }}>
                {content.switchLabel}
              </Link>
            </p>
            <Link
              href="/"
              className="mt-8 block text-center text-xs font-medium hover:underline"
              style={{ color: "var(--text-tertiary)" }}
            >
              Back to dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
