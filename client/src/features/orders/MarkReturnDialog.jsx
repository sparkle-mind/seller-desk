"use client";

import React, { useState } from "react";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import Modal from "@/components/common/Modal";

const RETURN_REASONS = [
  "Product not as described",
  "Damaged / defective item received",
  "Wrong item delivered",
  "Size / colour mismatch",
  "Customer changed mind",
  "Customer refused delivery (COD)",
  "Delayed delivery — customer cancelled",
  "Quality issue / inferior product",
  "Other",
];

export default function MarkReturnDialog({ open, order, onClose, onConfirm }) {
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  if (!order) return null;

  const handleSubmit = (e) => {
    onConfirm({
      orderId: order.id,
      returnReason: reason === "Other" ? customReason || "Other" : reason,
    });
    onClose();
    setReason(RETURN_REASONS[0]);
    setCustomReason("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xs"
      title="Mark as Returned"
      icon={AssignmentReturnIcon}
      tone="rose"
      onSubmit={handleSubmit}
      submitLabel="Confirm Return"
      submitTone="danger"
      contentClassName="space-y-4"
    >
      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs">
        <div className="font-bold text-rose-800">{order.id}</div>
        <div className="text-rose-700 mt-0.5 truncate">{order.productName}</div>
        <div className="text-rose-600 mt-0.5">Customer: {order.customerName}</div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Return Reason *
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          required
        >
          {RETURN_REASONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {reason === "Other" && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Specify Reason *
          </label>
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Describe the return reason..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            required
          />
        </div>
      )}

      <p className="text-[11px] text-slate-500">
        This order will be marked as{" "}
        <strong className="text-rose-700">Returned</strong> and will appear in the{" "}
        <strong>Shipping &amp; Returns</strong> module for inspection.
      </p>
    </Modal>
  );
}
