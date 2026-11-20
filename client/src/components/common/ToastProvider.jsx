"use client";

import React, { createContext, forwardRef, useCallback, useContext, useMemo, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

/**
 * App-wide toaster. Wrap the app once (root layout), then in any client
 * component:
 *
 *   const toast = useToast();
 *   toast.success("Calculation saved");
 *   toast.error("Fill in the required fields");
 *   toast.info("Loaded from catalogue");
 *   toast.warning("Selling at a loss");
 *
 * Optional custom title: toast.success("Saved", { title: "All done" }).
 * Toasts queue: a new one waits for the current one to close.
 * Styles live in globals.css (.sd-toast).
 */

const ToastContext = createContext(null);

const VARIANTS = {
  error: { Icon: CancelRoundedIcon, title: "Error" },
  warning: { Icon: WarningRoundedIcon, title: "Warning" },
  success: { Icon: CheckCircleRoundedIcon, title: "Success" },
  info: { Icon: InfoRoundedIcon, title: "Info" },
};

// Enter from the right edge
const SlideIn = (props) => <Slide {...props} direction="left" />;

const ToastCard = forwardRef(function ToastCard({ toast, onClose, ...rest }, ref) {
  const kind = VARIANTS[toast.severity] ? toast.severity : "info";
  const { Icon, title } = VARIANTS[kind];

  return (
    <div
      ref={ref}
      role={kind === "error" ? "alert" : "status"}
      aria-live={kind === "error" ? "assertive" : "polite"}
      {...rest}
      className={`sd-toast sd-toast--${kind}`}
      style={{ ...rest.style, "--t-duration": `${toast.duration}ms` }}
    >
      <span className="sd-toast__badge" aria-hidden="true">
        <Icon sx={{ fontSize: 20 }} />
      </span>
      <div className="sd-toast__content">
        <p className="sd-toast__title">{toast.title || title}</p>
        <p className="sd-toast__msg">{toast.message}</p>
      </div>
      <button type="button" className="sd-toast__close" onClick={onClose} aria-label="Dismiss notification">
        <CloseRoundedIcon sx={{ fontSize: 18 }} />
      </button>
      <span className="sd-toast__progress" aria-hidden="true" />
    </div>
  );
});

// Accepts either a duration number or an options object { duration, title }
const normalize = (opts, fallback) =>
  typeof opts === "number" ? { duration: opts } : { duration: opts?.duration ?? fallback, title: opts?.title };

export default function ToastProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [open, setOpen] = useState(true);
  const current = queue[0];

  const show = useCallback((message, severity = "success", opts) => {
    const { duration, title } = normalize(opts, 3500);
    setQueue((q) => [...q, { id: Date.now() + Math.random(), message, severity, duration, title }]);
    setOpen(true);
  }, []);

  const api = useMemo(
    () => ({
      show,
      success: (m, o) => show(m, "success", o),
      error: (m, o) => show(m, "error", normalize(o, 4500)),
      info: (m, o) => show(m, "info", o),
      warning: (m, o) => show(m, "warning", normalize(o, 4500)),
    }),
    [show]
  );

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        key={current?.id}
        open={Boolean(current) && open}
        autoHideDuration={current?.duration}
        onClose={handleClose}
        TransitionComponent={SlideIn}
        TransitionProps={{
          onExited: () => {
            setQueue((q) => q.slice(1));
            setOpen(true);
          },
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        // Just below the sticky header (h-14 / sm:h-16)
        sx={{
          zIndex: 2000,
          top: "68px !important",
          right: "16px !important",
          left: "auto !important",
          "@media (min-width: 640px)": { top: "76px !important", right: "24px !important" },
          "@media (max-width: 599.95px)": { left: "16px !important" },
        }}
      >
        {current ? <ToastCard toast={current} onClose={handleClose} /> : <span />}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
