"use client";

import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";
import StatusChip from "@/components/common/StatusChip";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function SupplierDetailsDialog({
  open,
  supplier,
  purchaseOrders = [],
  onClose,
  onEdit,
}) {
  if (!supplier) return null;

  const supplierPos = purchaseOrders.filter((p) => p.supplierId === supplier.id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <BusinessIcon className="text-blue-600" />
          <span className="font-bold text-slate-900 text-base">
            {supplier.name} ({supplier.company})
          </span>
          <StatusChip status={supplier.status} />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </button>
      </DialogTitle>

      <DialogContent className="space-y-5 pt-4">
        {/* Contact & Legal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-slate-400">Contact Person</div>
            <div className="font-bold text-slate-800 mt-0.5">{supplier.contactPerson || "Sales Desk"}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-slate-400">Phone Number</div>
            <div className="font-bold text-slate-800 mt-0.5">{supplier.phone}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-slate-400">GSTIN / Tax ID</div>
            <div className="font-bold font-mono text-slate-800 mt-0.5">{supplier.gstin || "N/A"}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-slate-400">City &amp; State</div>
            <div className="font-bold text-slate-800 mt-0.5">{supplier.city}, {supplier.state}</div>
          </div>
        </div>

        {/* Financial Balances */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-600">Lifetime Total Purchases:</span>
            <span className="text-base font-bold text-slate-900">{formatCurrency(supplier.totalPurchases)}</span>
          </div>

          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 flex items-center justify-between">
            <span className="text-xs text-amber-900 font-medium">Current Outstanding Balance Due:</span>
            <span className="text-base font-bold text-amber-700">{formatCurrency(supplier.outstandingBalance)}</span>
          </div>
        </div>

        {/* Address & Terms */}
        <div className="text-xs space-y-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">Factory / Registered Address:</span>
          <p className="text-slate-700">{supplier.address || `${supplier.city}, ${supplier.state}`}</p>
        </div>

        {/* PO History with this supplier */}
        <div className="space-y-2">
          <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Purchase Orders Issued to this Vendor ({supplierPos.length})
          </div>
          {supplierPos.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2">PO #</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2 text-right">Total Amount</th>
                    <th className="px-3 py-2 text-right">Paid</th>
                    <th className="px-3 py-2">Order Status</th>
                    <th className="px-3 py-2">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplierPos.map((po) => (
                    <tr key={po.id}>
                      <td className="px-3 py-2 font-bold text-slate-900">{po.poNumber}</td>
                      <td className="px-3 py-2 text-slate-600">{formatDate(po.orderDate)}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-800">{formatCurrency(po.totalAmount)}</td>
                      <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(po.paidAmount || 0)}</td>
                      <td className="px-3 py-2"><StatusChip status={po.status} /></td>
                      <td className="px-3 py-2"><StatusChip status={po.paymentStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No purchase orders recorded for this supplier.</p>
          )}
        </div>
      </DialogContent>

      <DialogActions className="p-4 border-t border-slate-200">
        <Button onClick={onClose} variant="outlined" size="small">
          Close
        </Button>
        <Button
          onClick={() => {
            onClose();
            onEdit(supplier);
          }}
          variant="contained"
          size="small"
        >
          Edit Supplier Details
        </Button>
      </DialogActions>
    </Dialog>
  );
}

