"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { updateSettings, resetSettings } from "@/store/slices/settingsSlice";
import { resetProducts } from "@/store/slices/productsSlice";
import { resetInventory } from "@/store/slices/inventorySlice";
import { resetOrders } from "@/store/slices/ordersSlice";
import { resetShippingReturns } from "@/store/slices/shippingReturnsSlice";
import { resetSuppliersPurchases } from "@/store/slices/suppliersPurchasesSlice";
import { resetFinance } from "@/store/slices/financeSlice";

// MUI
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StoreIcon from "@mui/icons-material/Store";
import TuneIcon from "@mui/icons-material/Tune";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings.data);

  const [formData, setFormData] = useState(settings);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(updateSettings(formData));
    setSnackbarOpen(true);
  };

  const handleResetAllData = () => {
    dispatch(resetProducts());
    dispatch(resetInventory());
    dispatch(resetOrders());
    dispatch(resetShippingReturns());
    dispatch(resetSuppliersPurchases());
    dispatch(resetFinance());
    dispatch(resetSettings());
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & System Configuration"
        subtitle="Manage business profiles, tax preferences, low-stock thresholds, and demo data."
        breadcrumbs={[{ label: "Settings" }]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            <StoreIcon className="text-blue-600" />
            <span>Business Profile &amp; Entity Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Display Business Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Registered Legal Entity Name
              </label>
              <input
                type="text"
                value={formData.registeredEntity}
                onChange={(e) =>
                  handleChange("registeredEntity", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                GSTIN Number (Indian GST)
              </label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => handleChange("gstNumber", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                PAN Number
              </label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => handleChange("panNumber", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Authorized Seller / Owner Name
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => handleChange("ownerName", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Operations Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Warehouse &amp; Fulfillment Address
              </label>
              <textarea
                rows={2}
                value={formData.warehouseAddress}
                onChange={(e) =>
                  handleChange("warehouseAddress", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* System & Regional Preferences */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            <TuneIcon className="text-blue-600" />
            <span>Regional &amp; Inventory Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Operating Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="INR (₹)">Indian Rupee (INR ₹)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date Display Format
              </label>
              <select
                value={formData.dateFormat}
                onChange={(e) => handleChange("dateFormat", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tax Display Preference
              </label>
              <select
                value={formData.taxDisplay}
                onChange={(e) => handleChange("taxDisplay", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="Inclusive">GST Inclusive</option>
                <option value="Exclusive">GST Exclusive</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Low-Stock Threshold
              </label>
              <input
                type="number"
                min="1"
                value={formData.defaultLowStockThreshold}
                onChange={(e) =>
                  handleChange(
                    "defaultLowStockThreshold",
                    Number(e.target.value),
                  )
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Table Page Size Default
              </label>
              <select
                value={formData.pageSizePreference}
                onChange={(e) =>
                  handleChange("pageSizePreference", Number(e.target.value))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value={10}>10 items</option>
                <option value={25}>25 items</option>
                <option value={50}>50 items</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Application Theme
              </label>
              <select
                value={formData.themePreference}
                onChange={(e) =>
                  handleChange("themePreference", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="light">Light Theme (SaaS Dashboard)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Marketplaces Synchronization */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            <LocalShippingIcon className="text-blue-600" />
            <span>Connected Sales Channels</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-pink-200 bg-pink-50/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-pink-700">
                  Meesho Supplier Account
                </div>
                <div className="text-slate-500 text-[11px]">
                  Sync state: Active (Mock ID: MSH-VEND-8891)
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-700">
                Connected
              </span>
            </div>

            <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-blue-700">
                  Flipkart Seller Hub
                </div>
                <div className="text-slate-500 text-[11px]">
                  Sync state: Active (Mock FSN Seller: FSN-DESI-01)
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outlined"
            color="warning"
            startIcon={<RestartAltIcon />}
            onClick={() => setResetDialogOpen(true)}
            size="small"
          >
            Reset All Demo Data
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            size="small"
          >
            Save Preferences
          </Button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={resetDialogOpen}
        title="Reset All Application Demo Data?"
        message="This will reset all products, inventory, orders, shipments, returns, expenses, and settings back to their initial factory demo state."
        confirmLabel="Reset Everything"
        confirmColor="warning"
        onConfirm={handleResetAllData}
        onClose={() => setResetDialogOpen(false)}
      />

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Settings preferences saved successfully!
        </Alert>
      </Snackbar>
    </div>
  );
}
