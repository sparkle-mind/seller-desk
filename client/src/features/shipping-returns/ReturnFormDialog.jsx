"use client";

import React, { useState, useEffect } from "react";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import Modal from "@/components/common/Modal";

const INITIAL_FORM = {
  originalOrderId: "",
  marketplace: "Meesho",
  productName: "",
  sku: "",
  customerName: "",
  returnReason: "Size mismatch",
  refundAmount: 699,
  returnStatus: "In Transit to Warehouse",
  inspectionStatus: "Pending Inspection",
  restockEligibility: "Pending Decision",
  inspectionNotes: "",
};

export default function ReturnFormDialog({ open, initialData, onClose, onSubmit }) {
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
    onSubmit({
      ...formData,
      refundAmount: Number(formData.refundAmount) || 0,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={initialData ? "Edit Customer Return" : "Log New Customer Return"}
      subtitle={initialData?.id}
      icon={AssignmentReturnIcon}
      tone="amber"
      onSubmit={handleSubmit}
      submitLabel={initialData ? "Save Changes" : "Log Return"}
      contentClassName="space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Original Order ID *
          </label>
          <input
            type="text"
            value={formData.originalOrderId}
            onChange={(e) => handleChange("originalOrderId", e.target.value)}
            placeholder="e.g. ORD-2026-1006"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Marketplace *
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
            Customer Name *
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => handleChange("customerName", e.target.value)}
            placeholder="e.g. Sunita Roy"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Refund Amount (₹) *
          </label>
          <input
            type="number"
            min="0"
            value={formData.refundAmount}
            onChange={(e) => handleChange("refundAmount", e.target.value)}
            placeholder="649"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            value={formData.productName}
            onChange={(e) => handleChange("productName", e.target.value)}
            placeholder="e.g. Cotton Hand Block Printed Saree"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Product SKU
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => handleChange("sku", e.target.value)}
            placeholder="e.g. SKU-SAR-002"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Return Reason *
          </label>
          <input
            type="text"
            value={formData.returnReason}
            onChange={(e) => handleChange("returnReason", e.target.value)}
            placeholder="e.g. Size mismatch, Color variance"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Return Status
          </label>
          <select
            value={formData.returnStatus}
            onChange={(e) => handleChange("returnStatus", e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="In Transit to Warehouse">In Transit to Warehouse</option>
            <option value="Received Back">Received Back</option>
            <option value="Refund Processed">Refund Processed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Quality Inspection
          </label>
          <select
            value={formData.inspectionStatus}
            onChange={(e) => handleChange("inspectionStatus", e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="Pending Inspection">Pending Inspection</option>
            <option value="Inspected - Intact">Inspected - Intact</option>
            <option value="Inspected - Damaged">Inspected - Damaged</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

