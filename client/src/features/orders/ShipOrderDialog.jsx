"use client";

import React, { useState } from "react";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Modal from "@/components/common/Modal";

const COURIERS = [
  "Ekart Logistics",
  "Shadowfax",
  "Delhivery",
  "Xpressbees",
  "Ecom Express",
  "Blue Dart",
];

export default function ShipOrderDialog({ open, order, onClose, onConfirm }) {
  const [courier, setCourier] = useState("Ekart Logistics");
  const [awbNumber, setAwbNumber] = useState("");
  const [error, setError] = useState("");

  if (!order) return null;

  const handleSubmit = () => {
    const finalAwb =
      awbNumber.trim() ||
      `${courier.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-8)}`;

    onConfirm({
      orderId: order.id,
      courier,
      awbNumber: finalAwb,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xs"
      title="Mark Order as Shipped"
      icon={LocalShippingIcon}
      onSubmit={handleSubmit}
      submitLabel="Dispatch Shipment"
      contentClassName="space-y-4"
    >
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
        <div className="flex justify-between font-bold text-slate-800">
          <span>{order.id}</span>
          <span className="text-blue-600">{order.marketplace}</span>
        </div>
        <div className="text-slate-600 truncate">{order.productName}</div>
        <div className="text-slate-500">
          Customer: {order.customerName} ({order.city})
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Select Courier Partner *
        </label>
        <select
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {COURIERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Tracking / AWB Number (Leave blank to auto-generate)
        </label>
        <input
          type="text"
          value={awbNumber}
          onChange={(e) => setAwbNumber(e.target.value)}
          placeholder="e.g. SFX881290412"
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
        />
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}
    </Modal>
  );
}

