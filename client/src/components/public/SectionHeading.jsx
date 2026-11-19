import React from "react";

// Eyebrow + serif headline + lead paragraph, used to open every public section.
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as: Heading = "h2",
  className = "",
}) {
  const centered = align === "center";

  return (
    <div className={`${centered ? "mx-auto max-w-2xl text-center" : "max-w-xl"} ${className}`}>
      {eyebrow && <p className="sd-pub-eyebrow">{eyebrow}</p>}
      <Heading className={`sd-pub-h2 ${eyebrow ? "mt-4" : ""}`}>{title}</Heading>
      {description && <p className="sd-pub-lead mt-5">{description}</p>}
    </div>
  );
}
