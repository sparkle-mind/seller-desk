import React from "react";
import PageHero from "@/components/public/PageHero";
import SectionHeading from "@/components/public/SectionHeading";
import CtaBanner from "@/components/public/CtaBanner";
import { modules, values } from "@/data/marketing";

export const metadata = {
  title: "About",
  description: "Why we built SellerDesk: a calmer, clearer back office for India's marketplace sellers.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About SellerDesk"
        title={
          <>
            We build the back office <em>sellers deserve.</em>
          </>
        }
        description="Marketplaces made it easy to start selling. Running the business behind the listings is still hard. SellerDesk exists to make that part calm, clear and quick."
      />

      <section className="pb-16 sm:pb-24">
        <div className="sd-pub-container grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="sd-pub-card sd-pub-reveal p-7 sm:p-10">
            <p className="sd-pub-eyebrow">Our story</p>
            <div className="mt-6 space-y-4">
              <p className="sd-pub-lead" style={{ color: "var(--text-primary)" }}>
                Most small sellers run their business from a patchwork of seller panels,
                spreadsheets, notebooks and chat threads.
              </p>
              <p className="sd-pub-body">
                Each marketplace shows its own orders, its own payouts and its own idea of your
                stock. Bringing it all together falls to you, usually late at night and usually
                with a calculator. Small mistakes become stock-outs, missed returns and margins
                that quietly disappear.
              </p>
              <p className="sd-pub-body">
                SellerDesk puts every part of that work in one place. Products, inventory, orders,
                shipping, suppliers and finance share the same data, so the numbers always agree
                and the next action is always clear.
              </p>
            </div>
          </div>

          <div className="sd-pub-band sd-pub-reveal flex flex-col justify-between p-7 sm:p-10">
            <div>
              <p className="sd-pub-eyebrow">Our mission</p>
              <p className="font-display mt-6 text-2xl font-medium leading-snug sm:text-3xl">
                Give every marketplace seller the clarity of a large operations team, without the
                overhead.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3">
              <div className="sd-pub-band-tile p-4">
                <p className="font-display text-3xl font-semibold">{modules.length}</p>
                <p className="sd-pub-band-muted mt-1 text-xs">Connected modules</p>
              </div>
              <div className="sd-pub-band-tile p-4">
                <p className="font-display text-3xl font-semibold">2</p>
                <p className="sd-pub-band-muted mt-1 text-xs">Marketplaces, one view</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sd-pub-section sd-pub-section-alt">
        <div className="sd-pub-container">
          <SectionHeading
            eyebrow="What we believe"
            title={
              <>
                Principles behind <em>every screen.</em>
              </>
            }
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ title, description, Icon }) => (
              <div key={title} className="sd-pub-card sd-pub-card-hover sd-pub-reveal p-6">
                <span className="sd-pub-icon">
                  <Icon sx={{ fontSize: 21 }} />
                </span>
                <h3 className="sd-pub-h3 mt-5" style={{ fontSize: "1.15rem", color: "var(--text-primary)" }}>
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        eyebrow="Join us"
        title={
          <>
            Spend less time managing. <em>More time selling.</em>
          </>
        }
      />
    </>
  );
}
