"use client";

import React from "react";
import Chip from "@mui/material/Chip";

export default function StatusChip({ status, type = "default", size = "small" }) {
  if (!status) return null;

  const normalized = status.toString().trim();

  // Color mappings
  const getStatusStyle = () => {
    switch (normalized.toLowerCase()) {
      // Success states
      case "delivered":
      case "settled":
      case "paid":
      case "active":
      case "in stock":
      case "received":
      case "received back & verified":
      case "inspected - intact":
      case "eligible":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };

      // Warning states
      case "pending":
      case "processing":
      case "in transit":
      case "manifest generated":
      case "ready for pickup":
      case "out for delivery":
      case "partially paid":
      case "partially received":
      case "ordered":
      case "low stock":
      case "pending inspection":
      case "pending decision":
      case "in transit to seller":
      case "in transit to warehouse":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };

      // Danger / Red states
      case "cancelled":
      case "returned":
      case "returned to origin":
      case "out of stock":
      case "refunded":
      case "deducted":
      case "inspected - damaged":
      case "ineligible":
      case "rejected":
      case "lost in rto":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
        };

      // Marketplace brands
      case "meesho":
        return {
          bg: "bg-pink-50 text-pink-700 border-pink-200 font-semibold",
          dot: "bg-pink-600",
        };
      case "flipkart":
        return {
          bg: "bg-flipkart/10 text-[#2874f0] dark:text-[#8ab4ff] border-flipkart/25 font-semibold",
          dot: "bg-flipkart",
        };

      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  const style = getStatusStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {normalized}
    </span>
  );
}

