"use client";

import React, { useState } from "react";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
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
  const [courier, setCourier] = useState(COURIERS[0]);
  const [awbNumber, setAwbNumber] = useState("");

  if (!order) return null;

  const handleSubmit = () => {
    const finalAwb =
      awbNumber.trim() ||
      `${courier.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-8)}`;

    onConfirm({ orderId: order.id, courier, awbNumber: finalAwb });
    setAwbNumber("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xs"
      title="Dispatch Shipment"
      icon={LocalShippingOutlinedIcon}
      onSubmit={handleSubmit}
      submitLabel="Dispatch"
      contentClassName="space-y-5"
    >
      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-900 truncate">{order.productName}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
            {order.customerName} · {order.city}
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-500 shrink-0">{order.id}</span>
      </div>

      <div>
        <div className="text-xs font-semibold text-slate-700 mb-2">Courier partner</div>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Courier partner">
          {COURIERS.map((c) => {
            const selected = c === courier;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setCourier(c)}
                className={`px-3 py-2 rounded-lg border text-xs text-left transition-colors ${
                  selected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="awb-input" className="block text-xs font-semibold text-slate-700 mb-2">
          AWB / Tracking number
        </label>
        <input
          id="awb-input"
          type="text"
          value={awbNumber}
          onChange={(e) => setAwbNumber(e.target.value)}
          placeholder="Leave blank to auto-generate"
          className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-lg bg-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>
    </Modal>
  );
}
