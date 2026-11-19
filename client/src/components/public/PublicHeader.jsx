"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ThemeToggle from "@/components/common/ThemeToggle";
import BrandMark from "./BrandMark";
import { publicNav } from "@/data/marketing";

export default function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Solid, blurred header once the page scrolls under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={`sd-pub-header${scrolled || menuOpen ? " is-scrolled" : ""}`}>
      <div className="sd-pub-container flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <BrandMark onClick={() => setMenuOpen(false)} />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`sd-pub-navlink${isActive(item.href) ? " is-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link href="/login" className="sd-pub-btn sd-pub-btn-ghost hidden sm:inline-flex">
            Sign in
          </Link>
          <Link href="/signup" className="sd-pub-btn sd-pub-btn-primary hidden sm:inline-flex">
            Get started
            <ArrowForwardIcon className="sd-pub-arrow" sx={{ fontSize: 17 }} />
          </Link>
          <button
            type="button"
            className="sd-pub-menu-btn md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="sd-pub-mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <CloseIcon sx={{ fontSize: 20 }} /> : <MenuIcon sx={{ fontSize: 20 }} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="sd-pub-mobile-menu" className="sd-pub-mobile-menu md:hidden">
          <nav aria-label="Mobile" className="sd-pub-container pb-6 pt-2">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`sd-pub-mobile-link${isActive(item.href) ? " is-active" : ""}`}
              >
                {item.label}
                <ArrowForwardIcon sx={{ fontSize: 18 }} />
              </Link>
            ))}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link href="/login" className="sd-pub-btn sd-pub-btn-secondary sd-pub-btn-block">
                Sign in
              </Link>
              <Link href="/signup" className="sd-pub-btn sd-pub-btn-primary sd-pub-btn-block">
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
