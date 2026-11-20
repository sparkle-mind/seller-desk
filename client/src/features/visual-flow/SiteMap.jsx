"use client";

import React from "react";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import { SITEMAP, TONES } from "./flowData";

/**
 * Every route in the app, grouped by shell. Each top-level route is a link;
 * dynamic detail routes are listed under their parent (they open from a row
 * on that page).
 */
export default function SiteMap({ query }) {
  const q = query.trim().toLowerCase();
  const hit = (text) => !q || text.toLowerCase().includes(q);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {SITEMAP.map((group, gi) => {
        const t = TONES[group.tone];
        return (
          <div key={group.group} className="flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold ${t.soft} ${t.text}`}>
                {gi + 1}
              </span>
              <div>
                <div className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                  {group.group}
                </div>
                <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  {group.note}
                </div>
              </div>
            </div>

            <ul className="space-y-1.5">
              {group.routes.map((r) => {
                const childHit = (r.children || []).some((c) => hit(c.label) || hit(c.pattern));
                const dim = !(hit(r.label) || hit(r.href) || childHit);
                return (
                  <li key={r.href} style={{ opacity: dim ? 0.3 : 1 }} className="transition-opacity">
                    <Link href={r.href} className="vf-node group flex items-center justify-between gap-3 rounded-xl px-3 py-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${t.dot}`} />
                        <span className="truncate text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                          {r.label}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="font-mono text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {r.href}
                        </span>
                        <ArrowForwardIcon
                          sx={{ fontSize: 14 }}
                          className="-translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      </span>
                    </Link>
                    {r.children?.length > 0 && (
                      <ul className="mt-1 space-y-0.5 pl-4">
                        {r.children.map((c) => (
                          <li
                            key={c.pattern}
                            className="flex items-center gap-1.5 text-[11px]"
                            style={{ color: "var(--text-tertiary)" }}
                            title="Opens from a row on the parent page"
                          >
                            <SubdirectoryArrowRightIcon sx={{ fontSize: 13 }} />
                            <span>{c.label}</span>
                            <span className="truncate font-mono opacity-80">{c.pattern}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
