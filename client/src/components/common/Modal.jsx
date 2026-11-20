"use client";

import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "./Button";
import DialogHeader from "./DialogHeader";

/**
 * The one modal used across the app. Layout (centred card on desktop, bottom
 * sheet on phones) comes from ThemeRegistry's modal overrides; this component
 * owns the structure: header, scrolling body, footer.
 *
 * Header
 *   title, subtitle, icon (MUI icon component), tone (brand | emerald |
 *   amber | rose | purple | slate), headerExtra (chips next to the title).
 *   Omit `title` to render no header (for fully custom layouts).
 *
 * Body
 *   children, contentClassName
 *
 * Footer (pick one)
 *   - Standard: pass `submitLabel`. Renders Cancel + a submit button.
 *       With `onSubmit`  the body is wrapped in a <form>; submit is type="submit".
 *       Without it       the submit button calls `onConfirm`.
 *     submitTone, submitIcon, submitDisabled, cancelLabel, hideCancel
 *   - Custom:   pass `actions` (any nodes, usually <Button>s).
 *   - None:     pass neither.
 *
 * Behaviour
 *   size       xs | sm | md | lg   (default: sm)
 *   loading    spinner on submit; blocks closing and the cancel button
 *
 *   <Modal open={open} onClose={close} title="Record Payment" icon={PaymentsIcon}
 *          onSubmit={save} submitLabel="Record Payment">
 *     ...fields
 *   </Modal>
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  tone = "brand",
  headerExtra,
  size = "sm",
  children,
  contentClassName = "",
  onSubmit,
  onConfirm,
  submitLabel,
  submitTone = "primary",
  submitIcon,
  submitDisabled = false,
  cancelLabel = "Cancel",
  hideCancel = false,
  actions,
  actionsClassName,
  loading = false,
  closeDisabled = false,
  ...dialogProps
}) {
  const blockClose = loading || closeDisabled;
  const handleClose = (event, reason) => {
    if (blockClose) return;
    onClose?.(event, reason);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  const footer =
    actions ??
    (submitLabel ? (
      <>
        {!hideCancel && (
          <Button variant="outline" tone="neutral" onClick={handleClose} disabled={loading}>
            {cancelLabel}
          </Button>
        )}
        <Button
          type={onSubmit ? "submit" : "button"}
          onClick={onSubmit ? undefined : onConfirm}
          tone={submitTone}
          startIcon={submitIcon}
          disabled={submitDisabled}
          loading={loading}
        >
          {submitLabel}
        </Button>
      </>
    ) : null);

  const body = (
    <>
      {title && (
        <DialogHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          tone={tone}
          onClose={onClose ? handleClose : undefined}
          closeDisabled={blockClose}
        >
          {headerExtra}
        </DialogHeader>
      )}
      <DialogContent className={contentClassName || undefined}>{children}</DialogContent>
      {footer && <DialogActions className={actionsClassName}>{footer}</DialogActions>}
    </>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={size} fullWidth {...dialogProps}>
      {onSubmit ? (
        <form onSubmit={handleSubmit}>
          {body}
        </form>
      ) : (
        body
      )}
    </Dialog>
  );
}
