"use client";

import React, { useState, useEffect } from "react";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Modal from "@/components/common/Modal";

const CATEGORIES = [
  "Rent",
  "Salaries",
  "Packaging",
  "Shipping",
  "Advertising",
  "Software",
  "Marketplace Fees",
  "Supplier Payments",
  "Product Cost",
  "Other Expenses",
];

const PAYMENT_METHODS = [
  "Bank Transfer / NEFT",
  "UPI",
  "Credit Card",
  "Marketplace Settlement Deduction",
  "Cash",
  "Auto Debit",
];

const INITIAL_FORM = {
  date: new Date().toISOString().split("T")[0],
  category: "Packaging",
  description: "",
  amount: "",
  paymentMethod: "UPI",
  relatedOrderOrPurchase: "N/A",
  notes: "",
};

export default function ExpenseFormDialog({
  open,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...INITIAL_FORM, ...initialData });
    } else {
      setFormData({
        ...INITIAL_FORM,
        date: new Date().toISOString().split("T")[0],
      });
    }
    setErrors({});
  }, [initialData, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.amount || Number(formData.amount) <= 0)
      newErrors.amount = "Valid expense amount is required";
    if (!formData.date) newErrors.date = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    if (!validate()) return;

    onSubmit({
      ...formData,
      amount: Number(formData.amount),
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={initialData ? "Edit Business Expense" : "Record New Business Expense"}
      icon={ReceiptLongIcon}
      onSubmit={handleSubmit}
      submitLabel={initialData ? "Update Expense" : "Record Expense"}
      contentClassName="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Expense Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${
              errors.date ? "border-rose-500" : "border-slate-300 focus:ring-blue-500/20"
            }`}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Expense Description *
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="e.g. Corrugated 3-ply boxes 500 pcs from PackWell"
            className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${
              errors.description ? "border-rose-500" : "border-slate-300 focus:ring-blue-500/20"
            }`}
          />
          {errors.description && <p className="text-[11px] text-rose-600 mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Amount (₹) *
          </label>
          <input
            type="number"
            min="1"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            placeholder="4500"
            className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${
              errors.amount ? "border-rose-500" : "border-slate-300 focus:ring-blue-500/20"
            }`}
          />
          {errors.amount && <p className="text-[11px] text-rose-600 mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Payment Method
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => handleChange("paymentMethod", e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Related Order / PO Reference
          </label>
          <input
            type="text"
            value={formData.relatedOrderOrPurchase}
            onChange={(e) => handleChange("relatedOrderOrPurchase", e.target.value)}
            placeholder="e.g. PO-2026-003 or N/A"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Internal Remarks / Tax Deductible
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="GST invoice available"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
          />
        </div>
      </div>
    </Modal>
  );
}

