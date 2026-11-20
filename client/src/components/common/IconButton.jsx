"use client";

import React, { forwardRef } from "react";

/**
 * Icon-only button used for table row actions, header controls, modal close
 * buttons and similar. `label` is required: it becomes the accessible name
 * and the hover tooltip.
 *
 *   tone  default | primary | success | danger   (hover colour)
 *   size  sm | md                                (default: sm)
 *
 *   <IconButton label="Edit product" tone="primary" onClick={edit}>
 *     <EditIcon sx={{ fontSize: 18 }} />
 *   </IconButton>
 */

const SIZE_CLASSES = {
  sm: "p-1.5",
  md: "p-2",
};

const TONE_CLASSES = {
  default: "",
  primary: "hover:!text-blue-600",
  success: "hover:!text-emerald-600",
  danger: "hover:!text-rose-600",
};

const IconButton = forwardRef(function IconButton(
  {
    label,
    tone = "default",
    size = "sm",
    type = "button",
    title,
    className = "",
    children,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={title ?? label}
      className={`sd-icon-btn inline-flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none ${
        SIZE_CLASSES[size] || SIZE_CLASSES.sm
      } ${TONE_CLASSES[tone] || ""} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
});

export default IconButton;
