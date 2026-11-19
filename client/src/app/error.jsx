"use client";

import React, { useEffect } from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SystemState from "@/components/common/SystemState";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application route error:", error);
  }, [error]);

  return (
    <SystemState
      code="Something went wrong"
      title="We hit an unexpected snag."
      description="Your data is still safe. Try loading this page again, or return to the dashboard and continue from there."
      icon={ErrorOutlineIcon}
      actionLabel="Try again"
      onAction={reset}
      secondaryLabel="Back to dashboard"
      secondaryHref="/dashboard"
    />
  );
}
