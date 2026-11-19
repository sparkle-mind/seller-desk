import React from "react";
import CheckIcon from "@mui/icons-material/Check";

export default function CheckList({ items, className = "" }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          <span className="sd-pub-check mt-0.5" aria-hidden="true">
            <CheckIcon sx={{ fontSize: 14 }} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
