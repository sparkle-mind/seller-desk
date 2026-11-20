import React from "react";
import Image from "next/image";

const FALLBACK_SRC = "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

// Hosts allowed in next.config.js `images.remotePatterns`; these go through
// Next's optimizer. Any other URL (e.g. one typed into the product form) is
// rendered unoptimized so next/image does not throw on an unknown host.
const OPTIMIZED_HOSTS = ["images.unsplash.com"];

function isOptimizable(src) {
  try {
    return OPTIMIZED_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

// Product thumbnail built on next/image. Pass width/height for fixed-size
// thumbnails, or `fill` (with a positioned parent) for responsive boxes.
export default function ProductImage({ src, alt, ...props }) {
  const imageSrc = src || FALLBACK_SRC;
  return <Image src={imageSrc} alt={alt || ""} unoptimized={!isOptimizable(imageSrc)} {...props} />;
}
