"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";

const MARKETPLACES = ["Meesho", "Flipkart", "Manual / Direct"];
const PAYMENT_METHODS = [
  "Prepaid (UPI)",
  "Prepaid (Credit Card)",
  "Prepaid (Net Banking)",
  "Cash on Delivery",
  "Prepaid (Debit Card)",
];
const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Returned",
  "Cancelled",
];

const EMPTY_FORM = {
  marketplace: "Meesho",
  marketplaceOrderNo: "",
  orderStatus: "Pending",
  customerName: "",
  customerPhone: "",
  city: "",
  state: "",
  pincode: "",
  productId: "",
  productName: "",
  sku: "",
  quantity: 1,
  unitPrice: "",
  paymentMethod: "Prepaid (UPI)",
  marketplaceFee: 0,
  shippingFeeCharged: 65,
  notes: "",
};

export default function OrderFormDialog({ open, initialData, onClose, onSubmit }) {
  const products = useSelector((state) => state.products.items);
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          marketplace: initialData.marketplace || "Meesho",
          marketplaceOrderNo: initialData.marketplaceOrderNo || "",
          orderStatus: initialData.orderStatus || "Pending",
          customerName: initialData.customerName || "",
          customerPhone: initialData.customerPhone || "",
          city: initialData.city || "",
          state: initialData.state || "",
          pincode: initialData.pincode || "",
          productId: initialData.productId || "",
          productName: initialData.productName || "",
          sku: initialData.sku || "",
          quantity: initialData.quantity || 1,
          unitPrice: initialData.unitPrice || "",
          paymentMethod: initialData.paymentMethod || "Prepaid (UPI)",
          marketplaceFee: initialData.marketplaceFee ?? 0,
          shippingFeeCharged: initialData.shippingFeeCharged ?? 65,
          notes: initialData.notes || "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, initialData]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleProductSelect = (productId) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setForm((f) => ({
        ...f,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        unitPrice: prod.sellingPrice || prod.mrp || "",
      }));
    } else {
      set("productId", "");
    }
  };

  const totalAmount = (Number(form.unitPrice) || 0) * (Number(form.quantity) || 1);
  const netSettlement =
    totalAmount - (Number(form.marketplaceFee) || 0) - (Number(form.shippingFeeCharged) || 65);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice),
      totalAmount,
      marketplaceFee: Number(form.marketplaceFee),
      shippingFeeCharged: Number(form.shippingFeeCharged),
      sellerSettlement: netSettlement,
    };
    if (isEdit) {
      payload.id = initialData.id;
      payload.orderStatus = form.orderStatus;
    }
    onSubmit(payload);
    onClose();
  };

  const inputCls =
    "w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100";
  const labelCls = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="font-bold text-slate-900 text-base">
            {isEdit ? `Edit Order — ${initialData?.id}` : "Create New Order"}
          </span>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </DialogTitle>

        <DialogContent className="pt-4">
          <div className="space-y-5">
            {/* ── Channel & Order No ── */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Channel & Order Info
              </div>
              <div className={`grid grid-cols-2 gap-3 ${isEdit ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
                <div>
                  <label className={labelCls}>Marketplace *</label>
                  <select
                    value={form.marketplace}
                    onChange={(e) => set("marketplace", e.target.value)}
                    className={inputCls}
                    required
                  >
                    {MARKETPLACES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                {isEdit && (
                  <div>
                    <label className={labelCls}>Order Status *</label>
                    <select
                      value={form.orderStatus}
                      onChange={(e) => set("orderStatus", e.target.value)}
                      className={inputCls}
                      required
                    >
                      {!ORDER_STATUSES.includes(form.orderStatus) && (
                        <option value={form.orderStatus}>{form.orderStatus}</option>
                      )}
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className={labelCls}>Channel Order No.</label>
                  <input
                    type="text"
                    value={form.marketplaceOrderNo}
                    onChange={(e) => set("marketplaceOrderNo", e.target.value)}
                    placeholder="e.g. MSH-OD-9012481"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Payment Method *</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => set("paymentMethod", e.target.value)}
                    className={inputCls}
                    required
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Customer ── */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Customer Details
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Customer Name *</label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => set("customerName", e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input
                    type="text"
                    value={form.customerPhone}
                    onChange={(e) => set("customerPhone", e.target.value)}
                    placeholder="+91 98765 12340"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="e.g. Jaipur"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>State *</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    placeholder="e.g. Rajasthan"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Pincode</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => set("pincode", e.target.value)}
                    placeholder="302015"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>
            </div>

            {/* ── Product ── */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Product & Pricing
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3">
                  <label className={labelCls}>Select Product (optional — auto-fills details)</label>
                  <select
                    value={form.productId}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">— Enter manually below —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.sku} (₹{p.sellingPrice || p.mrp})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Product Name *</label>
                  <input
                    type="text"
                    value={form.productName}
                    onChange={(e) => set("productName", e.target.value)}
                    placeholder="Embroidered Rayon Anarkali Kurta"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>SKU</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="SKU-KUR-001-M"
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => set("quantity", e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Unit Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.unitPrice}
                    onChange={(e) => set("unitPrice", e.target.value)}
                    placeholder="729"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Marketplace Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.marketplaceFee}
                    onChange={(e) => set("marketplaceFee", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Shipping Fee Deduction (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.shippingFeeCharged}
                    onChange={(e) => set("shippingFeeCharged", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Live calculation preview */}
              {form.unitPrice && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center gap-6">
                  <div>
                    <span className="text-slate-500">Total Amount:</span>{" "}
                    <strong className="text-slate-900">₹{totalAmount.toLocaleString("en-IN")}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Net Settlement:</span>{" "}
                    <strong className="text-emerald-700">₹{netSettlement.toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* ── Notes ── */}
            <div>
              <label className={labelCls}>Internal Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Gift packaging requested, fragile item..."
                className={inputCls}
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-200">
          <Button onClick={onClose} variant="outlined" color="inherit" size="small">
            Cancel
          </Button>
          <Button type="submit" variant="contained" size="small">
            {isEdit ? "Save Changes" : "Create Order"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
