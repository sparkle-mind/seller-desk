import React from "react";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import PageHero from "@/components/public/PageHero";
import SectionHeading from "@/components/public/SectionHeading";
import CheckList from "@/components/public/CheckList";
import FaqList from "@/components/public/FaqList";
import CtaBanner from "@/components/public/CtaBanner";
import { faqs, includedEverywhere, plans } from "@/data/marketing";

export const metadata = {
  title: "Pricing",
  description: "Simple SellerDesk plans for marketplace sellers at every stage, from first listing to full team.",
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Simple plans that <em>grow with you.</em>
          </>
        }
        description="Start free, then upgrade when you add a channel or a teammate. No setup fees, no surprises."
      />

      <section className="pb-16 sm:pb-20">
        <div className="sd-pub-container">
          <div className="mx-auto grid max-w-5xl items-stretch gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`sd-pub-card sd-pub-reveal relative flex flex-col p-7 sm:p-8 ${plan.featured ? "sd-pub-plan-featured lg:-my-4 lg:py-12" : ""}`}
              >
                {plan.featured && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: "var(--brand)", color: "var(--brand-contrast)" }}
                  >
                    Most popular
                  </span>
                )}
                <h2 className="sd-pub-h3" style={{ color: "var(--text-primary)" }}>
                  {plan.name}
                </h2>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  {plan.description}
                </p>
                <p className="mt-7 flex items-baseline gap-1.5">
                  <span className="sd-pub-price" style={{ color: "var(--text-primary)" }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                      {plan.period}
                    </span>
                  )}
                </p>

                <div className="sd-pub-hairline my-7" />

                <CheckList className="flex-1" items={plan.features} />

                <Link
                  href={plan.cta.href}
                  className={`sd-pub-btn sd-pub-btn-block sd-pub-btn-lg mt-8 ${plan.featured ? "sd-pub-btn-primary" : "sd-pub-btn-secondary"}`}
                >
                  {plan.cta.label}
                  <ArrowForwardIcon className="sd-pub-arrow" sx={{ fontSize: 18 }} />
                </Link>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-14 flex max-w-4xl flex-col items-center gap-4 sm:mt-16">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Included in every plan
            </p>
            <ul className="flex flex-wrap justify-center gap-x-7 gap-y-3">
              {includedEverywhere.map((item) => (
                <li key={item} className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span className="sd-pub-check" aria-hidden="true">
                    <CheckIcon sx={{ fontSize: 13 }} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="sd-pub-section sd-pub-section-alt">
        <div className="sd-pub-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Questions"
              title={
                <>
                  Good questions, <em>straight answers.</em>
                </>
              }
              description="Can't find what you're looking for? We're happy to help."
            />
            <Link href="/contact" className="sd-pub-btn sd-pub-btn-secondary mt-8">
              Contact us
            </Link>
          </div>
          <FaqList items={faqs} />
        </div>
      </section>

      <CtaBanner
        title={
          <>
            Start free today. <em>Upgrade when you&apos;re ready.</em>
          </>
        }
      />
    </>
  );
}
