"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { formatCurrency } from "@/lib/formatters";

export default function CreatePurchaseOrderDialog({
  open,
  suppliers = [],
  products = [],
  onClose,
  onSubmit,
}) {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [items, setItems] = useState([
    {
      productId: products[0]?.id || "",
      productName: products[0]?.name || "",
      sku: products[0]?.sku || "",
      quantity: 50,
      unitCost: products[0]?.purchaseCost || 300,
    },
  ]);
  const [taxRate, setTaxRate] = useState(5); // 5% GST
  const [shippingCost, setShippingCost] = useState(800);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleAddItem = () => {
    const firstProd = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: firstProd?.id || "",
        productName: firstProd?.name || "",
        sku: firstProd?.sku || "",
        quantity: 20,
        unitCost: firstProd?.purchaseCost || 250,
      },
    ]);
  };

  const handleItemProductChange = (index, prodId) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      unitCost: prod.purchaseCost,
    };
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitCost) || 0),
    0
  );
  const taxAmount = Math.round((subtotal * Number(taxRate)) / 100);
  const totalAmount = subtotal + taxAmount + (Number(shippingCost) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId) {
      setError("Please select a supplier");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one product item");
      return;
    }

    const sup = suppliers.find((s) => s.id === supplierId);

    const payload = {
      supplierId,
      supplierName: sup?.name || "Supplier",
      orderDate,
      expectedDeliveryDate: expectedDate,
      items: items.map((it) => ({
        ...it,
        quantity: Number(it.quantity),
        receivedQuantity: 0,
        unitCost: Number(it.unitCost),
        total: Number(it.quantity) * Number(it.unitCost),
      })),
      subtotal,
      tax: taxAmount,
      shippingCost: Number(shippingCost) || 0,
      totalAmount,
      paidAmount: 0,
      notes,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="font-bold text-slate-900 text-base">
            Create Purchase Order (PO)
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier *
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Order Date
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Order Line Items
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <AddIcon sx={{ fontSize: 16 }} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 items-center text-xs"
                >
                  <div className="col-span-12 sm:col-span-5">
                    <select
                      value={it.productId}
                      onChange={(e) => handleItemProductChange(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs truncate"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      placeholder="Qty"
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-center"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={it.unitCost}
                      onChange={(e) => handleItemChange(idx, "unitCost", e.target.value)}
                      placeholder="Unit Cost"
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-right"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-2 text-right font-bold text-slate-800">
                    {formatCurrency((Number(it.quantity) || 0) * (Number(it.unitCost) || 0))}
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length === 1}
                      className="text-rose-500 hover:text-rose-700 disabled:opacity-30"
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Taxes, Freight & Total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase Notes / Payment Terms
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 50% advance token paid, balance on arrival via NEFT"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1">
                  GST Tax ({taxRate}%):
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="border border-slate-300 rounded px-1 py-0.5 text-[10px] bg-white"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                  </select>
                </span>
                <span className="font-semibold text-slate-900">+{formatCurrency(taxAmount)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Inbound Freight:</span>
                <input
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number(e.target.value))}
                  className="w-20 px-2 py-0.5 border border-slate-300 rounded text-right text-xs bg-white"
                />
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
                <span>Total PO Amount:</span>
                <span className="text-blue-700">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-200">
          <Button onClick={onClose} variant="outlined" color="inherit" size="small">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" size="small">
            Issue Purchase Order
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

