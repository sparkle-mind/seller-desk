import React from "react";
import Link from "next/link";
import StorefrontIcon from "@mui/icons-material/Storefront";

// SellerDesk logo lockup for public pages: olive tile + italic serif wordmark.
export default function BrandMark({ href = "/", onClick, className = "" }) {
  return (
    <Link href={href} onClick={onClick} className={`sd-pub-brand ${className}`} aria-label="SellerDesk home">
      <span className="sd-pub-brand-icon" aria-hidden="true">
        <StorefrontIcon sx={{ fontSize: 20 }} />
      </span>
      <span className="sd-wordmark">SellerDesk</span>
    </Link>
  );
}
