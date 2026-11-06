"use client";

import React, { useEffect } from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SystemState from "@/components/common/SystemState";
import "./globals.css";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Application root error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[var(--bg-base)] px-4">
          <SystemState
            code="Application error"
            title="SellerDesk needs a moment."
            description="An unexpected error interrupted the app. Try again, or return to the dashboard."
            icon={ErrorOutlineIcon}
            actionLabel="Try again"
            onAction={reset}
          />
        </div>
      </body>
    </html>
  );
}
