"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";

import Checkbox from "@mui/material/Checkbox";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";

import Button from "./Button";
import IconButton from "./IconButton";
import Modal from "./Modal";

import { useToast } from "@/components/common/ToastProvider";
import { logoutService } from "@/lib/api/services/authServices";

const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

export default function SignOutDialog({
  open,
  onClose,
  name = "Vikram Malhotra",
  organization = "DesiCart Retail LLP",
}) {
  const router = useRouter();
  const toast = useToast();

  const email = useSelector((state) => state.settings.data.email);

  const [clearData, setClearData] = useState(false);

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutService,

    onSuccess: (data) => {
      // Optional browser data cleanup
      if (clearData) {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (error) {
          console.error("Error clearing browser data:", error);
        }
      }

      toast.success(data?.message || "Logged out successfully");

      // Redirect after successful logout
      window.location.replace("/login");
    },

    onError: (error) => {
      console.error("Logout Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Unable to sign out. Please try again.",
      );
    },
  });

  const signingOut = logoutMutation.isPending;

  useEffect(() => {
    if (open) {
      setClearData(false);
      logoutMutation.reset();
    }
  }, [open]);

  const handleClose = () => {
    if (!signingOut) {
      onClose();
    }
  };

  // Handle logout
  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="xs"
      closeDisabled={signingOut}
      contentClassName="!pt-6 !pb-2"
      actionsClassName="!px-6 !pb-5 !pt-3 gap-1"
      aria-labelledby="sign-out-title"
      aria-describedby="sign-out-description"
      actions={
        <>
          <Button
            variant="outline"
            tone="neutral"
            onClick={handleClose}
            disabled={signingOut}
            fullWidth
          >
            Cancel
          </Button>

          <Button
            tone="danger"
            onClick={handleSignOut}
            loading={signingOut}
            disabled={signingOut}
            fullWidth
            autoFocus
            startIcon={<LogoutIcon fontSize="small" />}
          >
            {signingOut ? "Signing out..." : "Sign Out"}
          </Button>
        </>
      }
    >
      <div className="relative flex flex-col items-center text-center">
        <IconButton
          label="Close"
          onClick={handleClose}
          disabled={signingOut}
          className="absolute -top-2 -right-2"
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <div className="sd-pop-in w-12 h-12 rounded-2xl ring-1 flex items-center justify-center bg-rose-500/10 ring-rose-500/20">
          <LogoutIcon sx={{ fontSize: 24 }} className="text-rose-500" />
        </div>

        <h2
          id="sign-out-title"
          className="font-display mt-4 text-lg font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Sign out of SellerDesk?
        </h2>

        <p
          id="sign-out-description"
          className="mt-1 text-sm max-w-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          You'll need to sign in again to manage orders, inventory and payouts.
        </p>
      </div>

      {/* Signed-in account */}
      <div
        className="mt-5 flex items-center gap-3 p-3 rounded-xl"
        style={{
          backgroundColor: "var(--bg-surface2)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="relative shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background:
                "linear-gradient(135deg, var(--brand-500), var(--brand-700))",
              color: "var(--brand-contrast)",
            }}
          >
            {initialsOf(name)}
          </div>

          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
            style={{
              backgroundColor: "rgb(var(--emerald-500-rgb))",
              borderColor: "var(--bg-surface2)",
            }}
          />
        </div>

        <div className="min-w-0 text-left">
          <div
            className="text-sm font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {name}
          </div>

          <div
            className="text-[11px] truncate"
            style={{ color: "var(--text-tertiary)" }}
          >
            {organization}
            {email ? ` · ${email}` : ""}
          </div>
        </div>
      </div>

      {/* Optional data wipe */}
      <label
        className="mt-3 flex items-start gap-1 p-2 -mx-1 rounded-xl cursor-pointer transition-colors hover:bg-surface2"
        htmlFor="sign-out-clear-data"
      >
        <Checkbox
          id="sign-out-clear-data"
          size="small"
          checked={clearData}
          onChange={(e) => setClearData(e.target.checked)}
          disabled={signingOut}
          sx={{ p: 0.5, mt: "-2px" }}
        />

        <span className="text-left">
          <span
            className="block text-xs font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Also clear demo data from this browser
          </span>

          <span
            className="block text-[11px] mt-0.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            Removes saved orders, products, settings and theme preferences.
            Default demo records load on your next sign-in.
          </span>
        </span>
      </label>
    </Modal>
  );
}
