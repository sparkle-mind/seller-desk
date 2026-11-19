import React from "react";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Closing call-to-action band shared by every public page.
export default function CtaBanner({
  eyebrow = "Ready when you are",
  title = (
    <>
      Bring every channel to <em>one calm desk.</em>
    </>
  ),
  description = "Set up your workspace, add your catalog and see your first orders in one place today.",
  primary = { label: "Get started free", href: "/signup" },
  secondary = { label: "Talk to us", href: "/contact" },
}) {
  return (
    <section className="sd-pub-section-tight">
      <div className="sd-pub-container">
        <div className="sd-pub-band sd-pub-reveal px-6 py-14 text-center sm:px-12 lg:py-20">
          <p className="sd-pub-eyebrow justify-center">{eyebrow}</p>
          <h2 className="sd-pub-h2 mx-auto mt-5 max-w-2xl">{title}</h2>
          <p className="sd-pub-band-muted mx-auto mt-5 max-w-xl text-base leading-7">{description}</p>
          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href={primary.href} className="sd-pub-btn sd-pub-btn-primary sd-pub-btn-lg">
              {primary.label}
              <ArrowForwardIcon className="sd-pub-arrow" sx={{ fontSize: 18 }} />
            </Link>
            {secondary && (
              <Link href={secondary.href} className="sd-pub-btn sd-pub-btn-outline sd-pub-btn-lg">
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
