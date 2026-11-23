"use client";

import React, { forwardRef, useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

/** Password input with a show/hide toggle. Works with react-hook-form's register(). */
const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative block">
      <input
        {...props}
        ref={ref}
        type={visible ? "text" : "password"}
        className="sd-pub-input pr-12"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-xl transition hover:opacity-80"
        style={{ color: "var(--text-tertiary)" }}
      >
        {visible ? (
          <VisibilityOffOutlinedIcon sx={{ fontSize: 19 }} />
        ) : (
          <VisibilityOutlinedIcon sx={{ fontSize: 19 }} />
        )}
      </button>
    </span>
  );
});

export default PasswordInput;
