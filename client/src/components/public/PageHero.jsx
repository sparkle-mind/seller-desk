import React from "react";

// Opening band for inner public pages (features, pricing, about, contact, legal).
export default function PageHero({ eyebrow, title, description, children }) {
  return (
    <section className="relative overflow-hidden">
      <div className="sd-pub-grid-bg" aria-hidden="true" />
      <div className="sd-pub-container relative pb-14 pt-14 text-center sm:pb-16 sm:pt-20 lg:pt-24">
        {eyebrow && <p className="sd-pub-eyebrow justify-center">{eyebrow}</p>}
        <h1 className="sd-pub-h1 mx-auto mt-5 max-w-3xl">{title}</h1>
        {description && <p className="sd-pub-lead mx-auto mt-6 max-w-2xl">{description}</p>}
        {children && <div className="mt-9">{children}</div>}
      </div>
    </section>
  );
}
