import React from "react";

/*
 * Small hand-drawn SVG illustrations for shipment tracking. Colours come from
 * theme tokens so they follow light/dark mode and the active palette.
 */

export function TruckIllustration({ className = "", tone = "brand" }) {
  const body = tone === "danger" ? "#a85741" : tone === "success" ? "#5f7f4b" : "var(--brand)";
  return (
    <svg viewBox="0 0 120 64" className={className} aria-hidden="true">
      {/* shadow */}
      <ellipse cx="60" cy="59" rx="50" ry="3" fill="rgba(0,0,0,0.18)" />
      {/* cargo box */}
      <rect x="4" y="8" width="70" height="38" rx="5" fill={body} />
      <rect x="4" y="8" width="70" height="38" rx="5" fill="url(#sdTruckShine)" />
      <rect x="12" y="17" width="34" height="5" rx="2.5" fill="var(--brand-contrast)" opacity="0.85" />
      <rect x="12" y="26" width="22" height="4" rx="2" fill="var(--brand-contrast)" opacity="0.5" />
      {/* cab */}
      <path d="M76 18h20.5c2 0 3.8 1 4.9 2.6l10.6 15c.7 1 1 2.1 1 3.3V46a3 3 0 0 1-3 3H76z" fill="var(--accent)" />
      <path d="M81 23h14.2c1 0 2 .5 2.5 1.3l6.3 9.2c.5.7 0 1.5-.8 1.5H81z" fill="var(--bg-surface)" opacity="0.92" />
      <rect x="108" y="40" width="6" height="4" rx="1.5" fill="#f3c969" />
      {/* chassis */}
      <rect x="4" y="44" width="110" height="5" rx="2.5" fill="var(--text-primary)" opacity="0.85" />
      {/* wheels */}
      {[24, 92].map((cx) => (
        <g key={cx} className="sd-truck-wheel">
          <circle cx={cx} cy="50" r="9" fill="var(--text-primary)" />
          <circle cx={cx} cy="50" r="4" fill="var(--bg-surface3)" />
          <rect x={cx - 0.9} y="42" width="1.8" height="16" fill="var(--bg-surface3)" opacity="0.6" />
        </g>
      ))}
      <defs>
        <linearGradient id="sdTruckShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function WarehouseIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 80 64" className={className} aria-hidden="true">
      <ellipse cx="40" cy="60" rx="34" ry="3" fill="rgba(0,0,0,0.15)" />
      <path d="M6 26 40 8l34 18v32H6z" fill="var(--bg-surface3)" stroke="var(--border-strong)" strokeWidth="1.5" />
      <path d="M2 27 40 6l38 21" fill="none" stroke="var(--brand)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="22" y="32" width="36" height="26" rx="1.5" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.5" />
      {[37, 42, 47, 52].map((y) => (
        <line key={y} x1="23" x2="57" y1={y} y2={y} stroke="var(--border-strong)" strokeWidth="1.2" />
      ))}
      <rect x="31" y="17" width="18" height="8" rx="1.5" fill="var(--accent)" opacity="0.85" />
    </svg>
  );
}

export function HouseIllustration({ className = "", delivered = false }) {
  return (
    <svg viewBox="0 0 80 64" className={className} aria-hidden="true">
      <ellipse cx="40" cy="60" rx="30" ry="3" fill="rgba(0,0,0,0.15)" />
      <rect x="14" y="28" width="52" height="30" rx="2" fill="var(--bg-surface3)" stroke="var(--border-strong)" strokeWidth="1.5" />
      <path d="M8 31 40 8l32 23" fill="var(--accent)" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" />
      <rect x="34" y="38" width="13" height="20" rx="1.5" fill="var(--brand)" />
      <circle cx="44" cy="48" r="1.2" fill="var(--brand-contrast)" />
      <rect x="20" y="36" width="10" height="9" rx="1" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.2" />
      <rect x="51" y="36" width="10" height="9" rx="1" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.2" />
      {delivered && (
        <g>
          <rect x="18" y="50" width="12" height="8" rx="1" fill="#c79a5c" />
          <line x1="24" x2="24" y1="50" y2="58" stroke="#8b6a3e" strokeWidth="1.2" />
        </g>
      )}
    </svg>
  );
}

export function ParcelIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <ellipse cx="32" cy="58" rx="22" ry="3" fill="rgba(0,0,0,0.15)" />
      <path d="M32 8 56 19v26L32 56 8 45V19z" fill="#c79a5c" />
      <path d="M32 30 56 19v26L32 56z" fill="#a97f45" />
      <path d="M32 30 8 19l24-11 24 11z" fill="#dcb47a" />
      <path d="M20 13.5 44 24.5v8l-5 2.3v-8L15 15.7z" fill="#f2e2c4" opacity="0.9" />
      <rect x="14" y="34" width="10" height="6" rx="1" transform="rotate(25 19 37)" fill="var(--bg-surface)" opacity="0.9" />
    </svg>
  );
}
