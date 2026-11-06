import React from "react";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import SystemState from "@/components/common/SystemState";

export default function NotFound() {
  return (
    <SystemState
      code="404 · Page not found"
      title="This page seems to be out of stock."
      description="We couldn’t find the page you were looking for. It may have moved, or the address may be incorrect."
      icon={SearchOffIcon}
      actionLabel="Go to dashboard"
      actionHref="/"
      secondaryLabel="Go back"
      secondaryHref="/"
    />
  );
}
