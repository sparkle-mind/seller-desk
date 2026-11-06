"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";

const INITIAL_FORM = {
  originalOrderId: "",
  marketplace: "Meesho",
  courierName: "Delhivery",
  awbNumber: "",
  customerName: "",
  destinationCity: "",
  rtoReason: "Customer unavailable after 3 attempts",
  returnShippingCharge: 80,
  rtoStatus: "In Transit to Seller",
  notes: "",
};

export default function RtoFormDialog({ open, initialData, onClose, onSubmit }) {
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...INITIAL_FORM, ...initialData });
    } else {
      setFormData(INITIAL_FORM);
    }
  }, [initialData, open]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      returnShippingCharge: Number(formData.returnShippingCharge) || 0,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="font-bold text-slate-900 text-base">
            {initialData ? `Edit RTO Record: ${initialData.id}` : "Log New Courier RTO"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </DialogTitle>

        <DialogContent className="space-y-3 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Order ID *
              </label>
              <input
                type="text"
                value={formData.originalOrderId}
                onChange={(e) => handleChange("originalOrderId", e.target.value)}
                placeholder="e.g. ORD-2026-1007"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Channel *
              </label>
              <select
                value={formData.marketplace}
                onChange={(e) => handleChange("marketplace", e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Meesho">Meesho</option>
                <option value="Flipkart">Flipkart</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Courier *
              </label>
              <input
                type="text"
                value={formData.courierName}
                onChange={(e) => handleChange("courierName", e.target.value)}
                placeholder="e.g. Delhivery, Shadowfax"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                AWB Tracking #
              </label>
              <input
                type="text"
                value={formData.awbNumber}
                onChange={(e) => handleChange("awbNumber", e.target.value)}
                placeholder="e.g. DEL1109934201"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                placeholder="e.g. Vikas Dubey"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination City
              </label>
              <input
                type="text"
                value={formData.destinationCity}
                onChange={(e) => handleChange("destinationCity", e.target.value)}
                placeholder="e.g. Kanpur, UP"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reverse Shipping Freight Loss (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.returnShippingCharge}
                onChange={(e) => handleChange("returnShippingCharge", e.target.value)}
                placeholder="80"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                RTO Status
              </label>
              <select
                value={formData.rtoStatus}
                onChange={(e) => handleChange("rtoStatus", e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="In Transit to Seller">In Transit to Seller</option>
                <option value="Received Back & Verified">Received Back &amp; Verified</option>
                <option value="Lost in RTO">Lost in RTO (Transit Claim)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                RTO Failure Reason *
              </label>
              <input
                type="text"
                value={formData.rtoReason}
                onChange={(e) => handleChange("rtoReason", e.target.value)}
                placeholder="e.g. Customer refused delivery (COD), Address untraceable"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes &amp; Investigation
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Condition remarks or claim notes"
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
            {initialData ? "Save Changes" : "Log RTO"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

