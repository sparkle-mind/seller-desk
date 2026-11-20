"use client";

import React, { useState, useEffect } from "react";
import EditNoteIcon from "@mui/icons-material/EditNote";
import Modal from "@/components/common/Modal";
import { formatCurrency } from "@/lib/formatters";

export default function EditPurchaseOrderDialog({ open, po, onClose, onSubmit }) {
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [status, setStatus] = useState("Ordered");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (po) {
      setExpectedDeliveryDate(po.expectedDeliveryDate || "");
      setShippingCost(po.shippingCost || 0);
      setStatus(po.status || "Ordered");
      setPaymentStatus(po.paymentStatus || "Pending");
      setNotes(po.notes || "");
    }
  }, [po, open]);

  if (!po) return null;

  const handleSubmit = (e) => {
    onSubmit({
      id: po.id,
      expectedDeliveryDate,
      shippingCost: Number(shippingCost) || 0,
      status,
      paymentStatus,
      notes,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Edit Purchase Order"
      subtitle={po.poNumber}
      icon={EditNoteIcon}
      onSubmit={handleSubmit}
      submitLabel="Update Purchase Order"
      contentClassName="space-y-4"
    >
      <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
        <div className="flex justify-between font-bold text-slate-800">
          <span>Supplier: {po.supplierName}</span>
          <span className="text-blue-600">{formatCurrency(po.totalAmount)}</span>
        </div>
        <div className="text-slate-600">
          Items: {po.items.map((i) => `${i.productName} (×${i.quantity})`).join(", ")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Expected Delivery Date
          </label>
          <input
            type="date"
            value={expectedDeliveryDate}
            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Inbound Freight Shipping Cost (₹)
          </label>
          <input
            type="number"
            min="0"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            PO Fulfillment Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="Ordered">Ordered (Dispatched by vendor)</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Payment Status
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            PO Notes &amp; Terms
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dispatched via V-Trans, LR tracking pending"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>
      </div>
    </Modal>
  );
}

