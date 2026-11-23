import React from "react";

/** Inline validation message linked to its input via aria-describedby. */
export default function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <span id={id} role="alert" className="sd-pub-field-error">
      {message}
    </span>
  );
}
