"use client";

import React, { useState } from "react";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import Drawer from "@mui/material/Drawer";
import { useAppTheme } from "@/theme/ThemeContext";
import { navigationItems } from "./AppSidebar";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isPrivateRoute } from "@/lib/publicRoutes";

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { background } = useAppTheme();
  const pathname = usePathname();
  const primaryMobileItems = navigationItems.filter((item) =>
    ["Dashboard", "Orders", "Products", "Inventory"].includes(item.name),
  );
  const isMoreActive = !primaryMobileItems.some((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );

  // Auth, public and unknown (404) routes render without the dashboard shell.
  if (!isPrivateRoute(pathname)) {
    return <div className="min-h-[100dvh] sd-app-bg">{children}</div>;
  }

  return (
    <div
      className={`min-h-[100dvh] flex font-sans sd-app-bg ${
        background === "network" ? "bg-network" : ""
      }`}
    >
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:block  w-64  shrink-0 fixed inset-y-0 left-0 z-40"
        style={{ boxShadow: "var(--sidebar-elevation)" }}
      >
        <AppSidebar />
      </aside>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: 280,
            border: "none",
            backgroundColor: "var(--sidebar-bg)",
            "@media (max-width: 575px)": {
              width: 250,
            },
          },
        }}
      >
        <AppSidebar onClose={() => setMobileOpen(false)} />
      </Drawer>

      {/* Main */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        <AppHeader onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="sd-main-content flex-1 p-4 sm:p-6 lg:p-8 max-w-[2500px] w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      <nav className="sd-mobile-nav lg:hidden" aria-label="Primary navigation">
        {primaryMobileItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`sd-mobile-nav-item text-center${isActive ? " is-active" : ""}`}
            >
              <Icon sx={{ fontSize: 21 }} />
              <span>{item.name}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="More navigation options"
          aria-current={isMoreActive ? "page" : undefined}
          className={`sd-mobile-nav-item text-center${isMoreActive ? " is-active" : ""}`}
        >
          <MoreHorizIcon sx={{ fontSize: 22 }} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
