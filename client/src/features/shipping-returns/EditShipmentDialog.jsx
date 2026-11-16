"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";

const COURIERS = [
  "Ekart Logistics",
  "Shadowfax",
  "Delhivery",
  "Xpressbees",
  "Ecom Express",
  "Blue Dart",
];

const DELIVERY_STATUSES = [
  "Manifest Generated",
  "Ready for Pickup",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Delivered (Returned)",
  "Returned to Origin",
  "RTO Initiated",
];

export default function EditShipmentDialog({ open, shipment, onClose, onSubmit }) {
  const [courierName, setCourierName] = useState("");
  const [awbNumber, setAwbNumber] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("In Transit");
  const [shippingCost, setShippingCost] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");

  useEffect(() => {
    if (shipment) {
      setCourierName(shipment.courierName || "Ekart Logistics");
      setAwbNumber(shipment.awbNumber || "");
      setDeliveryStatus(shipment.deliveryStatus || "In Transit");
      setShippingCost(shipment.shippingCost || 65);
      setExpectedDeliveryDate(shipment.expectedDeliveryDate || "");
    }
  }, [shipment, open]);

  if (!shipment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: shipment.id,
      courierName,
      awbNumber,
      deliveryStatus,
      shippingCost: Number(shippingCost) || 0,
      expectedDeliveryDate,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="font-bold text-slate-900 text-base">
            Edit Forward Shipment: {shipment.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </DialogTitle>

        <DialogContent className="space-y-4 pt-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Order: {shipment.orderId}</span>
              <span className="text-blue-600">{shipment.marketplace}</span>
            </div>
            <div className="text-slate-600">Destination: {shipment.destinationCity}</div>
            <div className="text-slate-500">{shipment.itemsSummary}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Courier Partner *
              </label>
              <select
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
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
                AWB / Tracking Number *
              </label>
              <input
                type="text"
                value={awbNumber}
                onChange={(e) => setAwbNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Delivery Status *
              </label>
              <select
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {DELIVERY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Freight Shipping Cost (₹) *
              </label>
              <input
                type="number"
                min="0"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>

            <div className="sm:col-span-2">
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
          </div>
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-200">
          <Button onClick={onClose} variant="outlined" color="inherit" size="small">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" size="small">
            Save Shipment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

