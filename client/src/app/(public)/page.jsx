import React from "react";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SectionHeading from "@/components/public/SectionHeading";
import ProductPreview from "@/components/public/ProductPreview";
import ProfitBreakdown from "@/components/public/ProfitBreakdown";
import CheckList from "@/components/public/CheckList";
import CtaBanner from "@/components/public/CtaBanner";
import { heroHighlights, modules, painPoints, proofStats, workflowSteps } from "@/data/marketing";

export const metadata = {
  title: { absolute: "SellerDesk | The calm back office for Meesho & Flipkart sellers" },
  description:
    "Run every marketplace from one calm desk. Orders, inventory, shipping, suppliers and real profit for Meesho and Flipkart sellers.",
};

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="sd-pub-grid-bg" aria-hidden="true" />
        <div className="sd-pub-container relative grid items-center gap-14 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.02fr_1fr] lg:gap-12 lg:pb-24 lg:pt-20">
          <div className="text-center lg:text-left">
            <Link href="/features" className="sd-pub-pill transition hover:-translate-y-0.5">
              <span className="sd-pub-pill-tag">New</span>
              Built for Meesho &amp; Flipkart sellers
              <ArrowForwardIcon sx={{ fontSize: 14 }} />
            </Link>

            <h1 className="sd-pub-display mx-auto mt-7 max-w-2xl lg:mx-0">
              Run every marketplace from <em>one calm desk.</em>
            </h1>

            <p className="sd-pub-lead mx-auto mt-6 max-w-xl lg:mx-0">
              SellerDesk brings your catalog, stock, orders, shipping, suppliers and real profit
              into one quiet, organised workspace, so you spend less time switching tabs and more
              time growing.
            </p>

            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
              <Link href="/signup" className="sd-pub-btn sd-pub-btn-primary sd-pub-btn-lg">
                Get started free
                <ArrowForwardIcon className="sd-pub-arrow" sx={{ fontSize: 18 }} />
              </Link>
              <Link href="/features" className="sd-pub-btn sd-pub-btn-secondary sd-pub-btn-lg">
                Explore features
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
              {heroHighlights.map((item) => (
                <li key={item} className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span className="sd-pub-check" aria-hidden="true">
                    <CheckIcon sx={{ fontSize: 13 }} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mx-auto w-full max-w-xl lg:max-w-none">
            <ProductPreview />
          </div>
        </div>
      </section>

      {/* ── Proof stats ──────────────────────────────────────────── */}
      <section aria-label="SellerDesk at a glance" className="sd-pub-section-alt">
        <div className="sd-pub-container grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0" style={{ borderColor: "var(--border)" }}>
          {proofStats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-5 py-7 sm:flex-col sm:items-start sm:gap-2 sm:px-8 sm:py-10 sm:first:pl-0"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="sd-pub-price" style={{ color: "var(--brand-text)" }}>
                {stat.value}
              </p>
              <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem → solution ───────────────────────────────────── */}
      <section className="sd-pub-section">
        <div className="sd-pub-container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <SectionHeading
            align="left"
            eyebrow="Why SellerDesk"
            title={
              <>
                Selling on two marketplaces shouldn&apos;t mean <em>running two businesses.</em>
              </>
            }
            description="Seller panels show you their slice. SellerDesk shows you the whole business: what sold, what shipped, what came back and what you actually earned."
          />

          <div className="grid gap-4 sm:grid-cols-2 sd-pub-reveal">
            <div className="sd-pub-card p-6" style={{ backgroundColor: "var(--bg-surface2)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Without SellerDesk
              </p>
              <ul className="mt-5 space-y-3.5">
                {painPoints.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6" style={{ color: "var(--text-tertiary)" }}>
                    <span
                      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: "rgb(var(--rose-500-rgb) / 0.12)", color: "rgb(var(--rose-600-rgb))" }}
                      aria-hidden="true"
                    >
                      <CloseIcon sx={{ fontSize: 13 }} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="sd-pub-card p-6" style={{ borderColor: "var(--brand-border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--brand-text)" }}>
                With SellerDesk
              </p>
              <CheckList
                className="mt-5"
                items={[
                  "Every order from every channel in one queue",
                  "One stock count, with alerts before you run out",
                  "Profit per order, after every fee",
                  "Returns and RTOs tracked to the last parcel",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Modules ──────────────────────────────────────────────── */}
      <section className="sd-pub-section sd-pub-section-alt">
        <div className="sd-pub-container">
          <SectionHeading
            eyebrow="Everything in one place"
            title={
              <>
                Eight modules. <em>One source of truth.</em>
              </>
            }
            description="Each part of SellerDesk handles one job well, and they all share the same products, stock and numbers."
          />

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map(({ key, title, summary, Icon }) => (
              <Link
                key={key}
                href={`/features#${key}`}
                className="sd-pub-card sd-pub-card-hover sd-pub-reveal group flex flex-col p-6"
              >
                <span className="sd-pub-icon">
                  <Icon sx={{ fontSize: 22 }} />
                </span>
                <h3 className="sd-pub-h3 mt-5" style={{ color: "var(--text-primary)" }}>
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  {summary}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--brand-text)" }}>
                  Learn more
                  <ArrowForwardIcon className="transition group-hover:translate-x-1" sx={{ fontSize: 14 }} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow ─────────────────────────────────────────────── */}
      <section className="sd-pub-section">
        <div className="sd-pub-container">
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                From listing to payout, <em>in four steps.</em>
              </>
            }
          />

          <ol className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <span
              aria-hidden="true"
              className="absolute left-5 right-5 top-5 hidden h-px lg:block"
              style={{ background: "linear-gradient(90deg, var(--border-strong), var(--border-subtle))" }}
            />
            {workflowSteps.map((step, index) => (
              <li key={step.title} className="sd-pub-reveal relative">
                <span className="sd-pub-step-num relative">{index + 1}</span>
                <h3 className="sd-pub-h3 mt-5" style={{ color: "var(--text-primary)" }}>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Profit spotlight ─────────────────────────────────────── */}
      <section className="sd-pub-section-tight">
        <div className="sd-pub-container">
          <div className="sd-pub-band grid items-center gap-12 px-6 py-12 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:px-16 lg:py-16">
            <div>
              <p className="sd-pub-eyebrow">Honest numbers</p>
              <h2 className="sd-pub-h2 mt-5">
                Know what you <em>actually</em> earned on every order.
              </h2>
              <p className="sd-pub-band-muted mt-5 max-w-lg text-base leading-7">
                Commissions, shipping, packaging and product cost come off automatically, so the
                profit you see is the profit you keep. No month-end spreadsheet required.
              </p>
              <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
                <div className="sd-pub-band-tile p-4">
                  <p className="font-display text-2xl font-semibold">Per order</p>
                  <p className="sd-pub-band-muted mt-1 text-xs">Margin on every sale</p>
                </div>
                <div className="sd-pub-band-tile p-4">
                  <p className="font-display text-2xl font-semibold">Per channel</p>
                  <p className="sd-pub-band-muted mt-1 text-xs">Meesho vs Flipkart</p>
                </div>
              </div>
            </div>
            <div className="sd-pub-reveal">
              <ProfitBreakdown />
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
