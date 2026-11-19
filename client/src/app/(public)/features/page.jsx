import React from "react";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PageHero from "@/components/public/PageHero";
import SectionHeading from "@/components/public/SectionHeading";
import CheckList from "@/components/public/CheckList";
import CtaBanner from "@/components/public/CtaBanner";
import { modules, thoughtfulDetails } from "@/data/marketing";

export const metadata = {
  title: "Features",
  description:
    "Catalog, inventory, unified orders, shipping and returns, suppliers, finance and reports. Every SellerDesk module, explained.",
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title={
          <>
            Everything behind every order, <em>beautifully organised.</em>
          </>
        }
        description="Eight connected modules share one catalog, one stock count and one set of numbers, so every part of the business stays in step."
      >
        <nav aria-label="Jump to a module" className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
          {modules.map(({ key, title, Icon }) => (
            <a key={key} href={`#${key}`} className="sd-pub-pill transition hover:-translate-y-0.5" style={{ paddingLeft: "0.7rem" }}>
              <Icon sx={{ fontSize: 15 }} style={{ color: "var(--brand-text)" }} />
              {title}
            </a>
          ))}
        </nav>
      </PageHero>

      <section className="sd-pub-section pt-4 sm:pt-6">
        <div className="sd-pub-container space-y-6 lg:space-y-8">
          {modules.map(({ key, title, summary, points, Icon }, index) => (
            <article
              key={key}
              id={key}
              className="sd-pub-card sd-pub-reveal grid scroll-mt-28 items-center gap-8 overflow-hidden p-6 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-12"
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="flex items-center gap-3">
                  <span className="sd-pub-icon">
                    <Icon sx={{ fontSize: 22 }} />
                  </span>
                  <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                    {String(index + 1).padStart(2, "0")} / {String(modules.length).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="sd-pub-h2 mt-6" style={{ fontSize: "clamp(1.7rem, 1.3rem + 1.2vw, 2.4rem)" }}>
                  {title}
                </h2>
                <p className="sd-pub-lead mt-4">{summary}</p>
              </div>

              <div
                className={`rounded-2xl p-6 sm:p-8 ${index % 2 === 1 ? "lg:order-1" : ""}`}
                style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border-subtle)", borderRadius: 16 }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  What you get
                </p>
                <CheckList className="mt-5" items={points} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sd-pub-section sd-pub-section-alt">
        <div className="sd-pub-container">
          <SectionHeading
            eyebrow="Thoughtful details"
            title={
              <>
                The little things that make <em>long days lighter.</em>
              </>
            }
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {thoughtfulDetails.map(({ title, description, Icon }) => (
              <div key={title} className="sd-pub-card sd-pub-card-hover sd-pub-reveal flex gap-4 p-6">
                <span className="sd-pub-icon">
                  <Icon sx={{ fontSize: 21 }} />
                </span>
                <div>
                  <h3 className="sd-pub-h3" style={{ fontSize: "1.12rem", color: "var(--text-primary)" }}>
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/pricing" className="sd-pub-btn sd-pub-btn-secondary">
              Compare plans
              <ArrowForwardIcon className="sd-pub-arrow" sx={{ fontSize: 17 }} />
            </Link>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
