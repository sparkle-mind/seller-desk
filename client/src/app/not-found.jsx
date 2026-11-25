import React from "react";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import SystemState from "@/components/common/SystemState";

export const metadata = {
  title: "Page not found | SellerDesk",
};

// Global 404. Unknown URLs render outside the dashboard shell (see
// isPrivateRoute in AppLayout), so this fills the whole viewport.
export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-4 sm:px-6">
      <SystemState
        code="404 · Page not found"
        title="This page seems to be out of stock."
        description="We couldn’t find the page you were looking for. It may have moved, or the address may be incorrect."
        icon={SearchOffIcon}
        actionLabel="Go to dashboard"
        actionHref="/dashboard"
        secondaryLabel="Back to home"
        secondaryHref="/"
      />
    </main>
  );
}
