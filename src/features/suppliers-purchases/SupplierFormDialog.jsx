"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";

const INITIAL_FORM = {
  name: "",
  company: "",
  contactPerson: "",
  phone: "",
  email: "",
  city: "",
  state: "Gujarat",
  address: "",
  gstin: "",
  status: "Active",
};

export default function SupplierFormDialog({
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
      setFormData(INITIAL_FORM);
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
    if (!formData.name.trim()) newErrors.name = "Supplier trade name is required";
    if (!formData.company.trim()) newErrors.company = "Company legal name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="font-bold text-slate-900 text-base">
            {initialData ? "Edit Supplier" : "Add New Supplier"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier Trade Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Rajesh Textiles"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-rose-500"
                    : "border-slate-300 focus:ring-blue-500/20"
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Legal Name *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="e.g. Rajesh Textiles Pvt Ltd"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.company
                    ? "border-rose-500"
                    : "border-slate-300 focus:ring-blue-500/20"
                }`}
              />
              {errors.company && <p className="text-[11px] text-rose-600 mt-1">{errors.company}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => handleChange("contactPerson", e.target.value)}
                placeholder="Rajesh Khurana"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+91 98251 44521"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? "border-rose-500"
                    : "border-slate-300 focus:ring-blue-500/20"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="orders@supplier.in"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => handleChange("gstin", e.target.value)}
                placeholder="24AAACR1234F1Z8"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Surat"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Factory / Office Address
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="402, Ring Road Textile Market, Surat, Gujarat"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-200">
          <Button onClick={onClose} variant="outlined" color="inherit" size="small">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" size="small">
            {initialData ? "Save Changes" : "Save Supplier"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

