import React from "react";
import Link from "next/link";
import "@/components/public/public.css";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata = {
  title: {
    default: "SellerDesk | The calm back office for marketplace sellers",
    template: "%s | SellerDesk",
  },
  description:
    "SellerDesk brings Meesho and Flipkart orders, inventory, shipping, suppliers and profit into one calm workspace.",
};

// Marketing shell for public pages. AppLayout skips the dashboard chrome for
// these routes (see src/lib/publicRoutes.js).
export default function PublicLayout({ children }) {
  return (
    <div className="sd-pub">
      <Link href="#main-content" className="sd-pub-skip">
        Skip to content
      </Link>
      <PublicHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
