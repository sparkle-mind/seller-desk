"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";

export default function StockAdjustmentDialog({
  open,
  product,
  onClose,
  onSubmit,
}) {
  const [adjustmentType, setAdjustmentType] = useState("Stock In"); // "Stock In" | "Stock Out" | "Manual Set" | "Damage"
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setAdjustmentType("Stock In");
    setQuantity("");
    setReason("");
    setError("");
  }, [open, product]);

  if (!product) return null;

  const currentStock = Number(product.stock) || 0;

  const calculateNewStock = () => {
    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) return currentStock;

    if (adjustmentType === "Stock In") {
      return currentStock + qtyNum;
    }
    if (adjustmentType === "Stock Out" || adjustmentType === "Damage") {
      return Math.max(0, currentStock - qtyNum);
    }
    if (adjustmentType === "Manual Set") {
      return qtyNum;
    }
    return currentStock;
  };

  const newCalculatedStock = calculateNewStock();

  const handleSubmit = (e) => {
    e.preventDefault();
    const qtyNum = Number(quantity);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError("Please enter a valid positive quantity");
      return;
    }

    if (
      (adjustmentType === "Stock Out" || adjustmentType === "Damage") &&
      qtyNum > currentStock
    ) {
      setError(`Cannot remove ${qtyNum} units. Only ${currentStock} units available.`);
      return;
    }

    if (!reason.trim()) {
      setError("Please specify a reason for this inventory adjustment");
      return;
    }

    onSubmit({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: adjustmentType,
      quantityChange:
        adjustmentType === "Stock In"
          ? qtyNum
          : adjustmentType === "Manual Set"
          ? qtyNum - currentStock
          : -qtyNum,
      previousStock: currentStock,
      newStock: newCalculatedStock,
      reason,
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="font-bold text-slate-900 text-base">
            Adjust Stock Level
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
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="font-semibold text-slate-900 truncate">{product.name}</div>
            <div className="text-slate-500 font-mono">SKU: {product.sku}</div>
            <div className="text-slate-700 font-bold">
              Current Available Stock: <span className="text-blue-600">{currentStock} units</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adjustment Type *
            </label>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Stock In">Stock In (+ Add Goods)</option>
              <option value="Stock Out">Stock Out (- Remove Goods)</option>
              <option value="Damage">Damage / Scrap (- Transit / Defect)</option>
              <option value="Manual Set">Manual Stock Audit (Set Absolute Count)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {adjustmentType === "Manual Set" ? "New Total Count *" : "Quantity to Adjust *"}
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError("");
              }}
              placeholder="e.g. 20"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adjustment Reason *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder="e.g. Physical inventory count discrepancy, Supplier receipt"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* New Stock Preview */}
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Updated Stock Will Be:</span>
            <span className="text-sm font-bold text-blue-700">{newCalculatedStock} units</span>
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-200">
          <Button onClick={onClose} variant="outlined" color="inherit" size="small">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" size="small">
            Confirm Adjustment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

