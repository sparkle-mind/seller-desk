"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";

export default function ReturnInspectionDialog({
  open,
  returnRecord,
  onClose,
  onSubmit,
}) {
  const [inspectionStatus, setInspectionStatus] = useState("Inspected - Intact");
  const [restockEligibility, setRestockEligibility] = useState("Eligible");
  const [returnStatus, setReturnStatus] = useState("Received Back");
  const [inspectionNotes, setInspectionNotes] = useState("");

  useEffect(() => {
    if (returnRecord) {
      setInspectionStatus(returnRecord.inspectionStatus || "Inspected - Intact");
      setRestockEligibility(returnRecord.restockEligibility || "Eligible");
      setReturnStatus(returnRecord.returnStatus || "Received Back");
      setInspectionNotes(returnRecord.inspectionNotes || "");
    }
  }, [returnRecord, open]);

  if (!returnRecord) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: returnRecord.id,
      inspectionStatus,
      restockEligibility,
      returnStatus,
      inspectionNotes,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="font-bold text-slate-900 text-base">
            Record Return Quality Inspection
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
            <div className="flex justify-between font-bold text-slate-800">
              <span>{returnRecord.id}</span>
              <span className="text-blue-600">Order: {returnRecord.originalOrderId}</span>
            </div>
            <div className="font-semibold text-slate-900">{returnRecord.productName}</div>
            <div className="text-slate-500 font-mono">SKU: {returnRecord.sku}</div>
            <div className="text-slate-600">
              Customer: <strong>{returnRecord.customerName}</strong> • Reason: &quot;{returnRecord.returnReason}&quot;
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physical Inspection Outcome *
            </label>
            <select
              value={inspectionStatus}
              onChange={(e) => {
                const val = e.target.value;
                setInspectionStatus(val);
                if (val === "Inspected - Intact") {
                  setRestockEligibility("Eligible");
                } else if (val === "Inspected - Damaged") {
                  setRestockEligibility("Ineligible");
                }
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Inspected - Intact">Inspected - Intact (Original tags & packaging fine)</option>
              <option value="Inspected - Damaged">Inspected - Damaged (Used, torn, defective or incomplete)</option>
              <option value="Pending Inspection">Pending Inspection</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Restock Eligibility *
            </label>
            <select
              value={restockEligibility}
              onChange={(e) => setRestockEligibility(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Eligible">Eligible for Resale (Restock to available inventory)</option>
              <option value="Ineligible">Ineligible (Scrap / Supplier return / Loss)</option>
              <option value="Pending Decision">Pending Decision</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Return Status *
            </label>
            <select
              value={returnStatus}
              onChange={(e) => setReturnStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Received Back">Received Back at Warehouse</option>
              <option value="Refund Processed">Refund Processed</option>
              <option value="In Transit to Warehouse">In Transit to Warehouse</option>
              <option value="Rejected">Rejected (Fake product returned)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Inspector Notes & Findings
            </label>
            <textarea
              rows={2}
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              placeholder="e.g. Tags intact, verified barcode, item sanitized and returned to shelf"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-200">
          <Button onClick={onClose} variant="outlined" color="inherit" size="small">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" size="small">
            Save Inspection Record
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

