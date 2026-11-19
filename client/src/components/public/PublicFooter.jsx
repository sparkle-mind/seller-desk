import React from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";
import { footerNav } from "@/data/marketing";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="sd-pub-footer">
      <div className="sd-pub-container py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <BrandMark />
            <p className="sd-pub-body mt-5">
              The calm back office for Meesho and Flipkart sellers. Catalog, stock, orders,
              shipping and profit, together in one workspace.
            </p>
            <Link href="/signup" className="sd-pub-btn sd-pub-btn-primary mt-6">
              Create your workspace
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerNav.map((group) => (
              <div key={group.title}>
                <p className="sd-pub-eyebrow" style={{ fontSize: "0.68rem" }}>
                  {group.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="sd-pub-footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="sd-pub-hairline mt-12" />

        <div className="mt-6 flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="sd-pub-muted">© {year} SellerDesk. All rights reserved.</p>
          <p className="sd-pub-muted">Made for marketplace sellers in India.</p>
        </div>
      </div>
    </footer>
  );
}
