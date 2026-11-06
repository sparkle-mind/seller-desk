"use client";

import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

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
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="flex items-center gap-2 font-bold" style={{ color: "var(--text-primary)" }}>
        <WarningAmberIcon className="text-amber-500" />
        <span>{title}</span>
      </DialogTitle>
      <DialogContent>
        <DialogContentText className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions className="p-4 pt-2">
        <Button onClick={onClose} variant="outlined" color="inherit" size="small">
          {cancelLabel}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant="contained"
          color={confirmColor}
          size="small"
          autoFocus
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

