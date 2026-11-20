"use client";

import React from "react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "primary",
  onConfirm,
  onClose,
}) {
  // Accept MUI colour names from older call sites ("error" -> "danger")
  const submitTone = confirmColor === "error" ? "danger" : confirmColor;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xs"
      title={title}
      icon={WarningAmberIcon}
      tone={submitTone === "danger" ? "rose" : "amber"}
      submitLabel={confirmLabel}
      submitTone={submitTone}
      cancelLabel={cancelLabel}
      onConfirm={() => {
        onConfirm();
        onClose();
      }}
    >
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {message}
      </p>
    </Modal>
  );
}
