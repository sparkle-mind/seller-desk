import React from "react";
import Link from "next/link";
import PageHero from "./PageHero";

// Shared layout for policy pages: hero, sticky table of contents, prose.
export default function LegalPage({ eyebrow, title, description, updated, sections }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description}>
        <p className="sd-pub-muted text-xs font-medium">Last updated {updated}</p>
      </PageHero>

      <section className="sd-pub-section pt-0 sm:pt-0">
        <div className="sd-pub-container grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-28">
              <p className="sd-pub-eyebrow" style={{ fontSize: "0.66rem" }}>
                On this page
              </p>
              <ol className="mt-4 space-y-2.5">
                {sections.map((section) => (
                  <li key={section.id}>
                    <Link href={`#${section.id}`} className="sd-pub-footer-link">
                      {section.heading}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <article className="sd-pub-card sd-pub-prose max-w-3xl p-6 sm:p-10">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className={index === 0 ? "!mt-0" : ""}>{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.list && (
                  <ul>
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
            <p className="mt-10 text-sm" style={{ color: "var(--text-tertiary)" }}>
              Questions about this page?{" "}
              <Link href="/contact" className="sd-pub-link">
                Contact us
              </Link>
              .
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
