"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const CATEGORIES = [
  "Ethnic Wear",
  "Western Wear",
  "Electronics & Audio",
  "Mobile Accessories",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Bags & Luggage",
  "Footwear",
  "Fashion Accessories",
];

const INITIAL_FORM = {
  name: "",
  sku: "",
  category: "Ethnic Wear",
  brand: "",
  description: "",
  purchaseCost: "",
  sellingPrice: "",
  mrp: "",
  stock: "",
  reorderLevel: 15,
  weightKg: 0.5,
  dimensions: "30x25x4 cm",
  image: "",
  status: "Active",
  meeshoListingId: "",
  meeshoLive: true,
  meeshoPrice: "",
  flipkartListingId: "",
  flipkartLive: true,
  flipkartPrice: "",
  variants: [],
};

export default function ProductFormDialog({
  open,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...INITIAL_FORM,
        ...initialData,
        meeshoListingId: initialData.marketplaceListings?.meesho?.listingId || "",
        meeshoLive: initialData.marketplaceListings?.meesho?.live ?? true,
        meeshoPrice: initialData.marketplaceListings?.meesho?.price || initialData.sellingPrice || "",
        flipkartListingId: initialData.marketplaceListings?.flipkart?.listingId || "",
        flipkartLive: initialData.marketplaceListings?.flipkart?.live ?? true,
        flipkartPrice: initialData.marketplaceListings?.flipkart?.price || initialData.sellingPrice || "",
        variants: initialData.variants || [],
      });
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

  // Variant management
  const handleAddVariant = () => {
    const newVariant = {
      id: `VAR-${Date.now()}`,
      size: "M",
      color: "Default",
      sku: `${formData.sku || "SKU"}-${formData.variants.length + 1}`,
      stock: 10,
      cost: formData.purchaseCost || 0,
      price: formData.sellingPrice || 0,
    };
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  const handleUpdateVariant = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const handleRemoveVariant = (index) => {
    const updated = formData.variants.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.sku.trim()) newErrors.sku = "Internal SKU is required";
    if (!formData.purchaseCost || Number(formData.purchaseCost) <= 0)
      newErrors.purchaseCost = "Valid purchase cost is required";
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0)
      newErrors.sellingPrice = "Valid selling price is required";
    if (formData.stock === "" || Number(formData.stock) < 0)
      newErrors.stock = "Opening stock cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      purchaseCost: Number(formData.purchaseCost),
      sellingPrice: Number(formData.sellingPrice),
      mrp: Number(formData.mrp) || Number(formData.sellingPrice) * 1.5,
      stock: Number(formData.stock),
      reorderLevel: Number(formData.reorderLevel) || 15,
      weightKg: Number(formData.weightKg) || 0.5,
      marketplaceListings: {
        meesho: {
          listingId: formData.meeshoListingId || `MSH-${Date.now().toString().slice(-4)}`,
          live: Boolean(formData.meeshoLive),
          price: Number(formData.meeshoPrice) || Number(formData.sellingPrice),
        },
        flipkart: {
          listingId: formData.flipkartListingId || `FSN-FK-${Date.now().toString().slice(-5)}`,
          live: Boolean(formData.flipkartLive),
          price: Number(formData.flipkartPrice) || Number(formData.sellingPrice),
        },
      },
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="font-bold text-slate-900 text-lg">
            {initialData ? "Edit Internal Product" : "Add New Internal Product"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <CloseIcon />
          </button>
        </DialogTitle>

        <DialogContent className="space-y-6 pt-5">
          {/* Section 1: Basic Information */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              1. Basic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Embroidered Rayon Anarkali Kurta"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-300 focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal SKU *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  placeholder="e.g. SKU-KUR-001"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.sku
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-300 focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                />
                {errors.sku && (
                  <p className="text-xs text-rose-600 mt-1">{errors.sku}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  placeholder="e.g. Kesar Vastra"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Brief specifications, fabric details or warranty"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => handleChange("image", e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Stock */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              2. Pricing, Stock & Physical Specs
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purchase Cost (₹) *
                </label>
                <input
                  type="number"
                  value={formData.purchaseCost}
                  onChange={(e) => handleChange("purchaseCost", e.target.value)}
                  placeholder="320"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.purchaseCost
                      ? "border-rose-500"
                      : "border-slate-300 focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                />
                {errors.purchaseCost && (
                  <p className="text-xs text-rose-600 mt-1">{errors.purchaseCost}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => handleChange("sellingPrice", e.target.value)}
                  placeholder="749"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.sellingPrice
                      ? "border-rose-500"
                      : "border-slate-300 focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                />
                {errors.sellingPrice && (
                  <p className="text-xs text-rose-600 mt-1">{errors.sellingPrice}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  MRP (₹)
                </label>
                <input
                  type="number"
                  value={formData.mrp}
                  onChange={(e) => handleChange("mrp", e.target.value)}
                  placeholder="1899"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opening Stock *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  placeholder="45"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.stock
                      ? "border-rose-500"
                      : "border-slate-300 focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                />
                {errors.stock && (
                  <p className="text-xs text-rose-600 mt-1">{errors.stock}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reorder Alert Level
                </label>
                <input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => handleChange("reorderLevel", e.target.value)}
                  placeholder="15"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weight (Kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weightKg}
                  onChange={(e) => handleChange("weightKg", e.target.value)}
                  placeholder="0.45"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dimensions (L x W x H)
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => handleChange("dimensions", e.target.value)}
                  placeholder="32x26x4 cm"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Estimated Profit Calculator Preview */}
            {formData.purchaseCost && formData.sellingPrice && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <span>
                  Estimated Gross Margin per unit:{" "}
                  <strong>
                    ₹{Number(formData.sellingPrice) - Number(formData.purchaseCost)}
                  </strong>
                </span>
                <span className="font-bold">
                  {Math.round(
                    ((Number(formData.sellingPrice) - Number(formData.purchaseCost)) /
                      Number(formData.sellingPrice)) *
                      100
                  )}
                  % Margin
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Marketplace Listing Mappings (Meesho & Flipkart) */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              3. Marketplace Listing References
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg border border-pink-200 bg-pink-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-700">Meesho Listing Info</span>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.meeshoLive}
                      onChange={(e) => handleChange("meeshoLive", e.target.checked)}
                      className="rounded text-pink-600 focus:ring-pink-500"
                    />
                    <span>Live on Meesho</span>
                  </label>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Meesho Listing ID / Catalog ID
                  </label>
                  <input
                    type="text"
                    value={formData.meeshoListingId}
                    onChange={(e) => handleChange("meeshoListingId", e.target.value)}
                    placeholder="MSH-KUR-9812"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Meesho Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.meeshoPrice}
                    onChange={(e) => handleChange("meeshoPrice", e.target.value)}
                    placeholder="729"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700">Flipkart Listing Info</span>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.flipkartLive}
                      onChange={(e) => handleChange("flipkartLive", e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Live on Flipkart</span>
                  </label>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Flipkart FSN / Listing ID
                  </label>
                  <input
                    type="text"
                    value={formData.flipkartListingId}
                    onChange={(e) => handleChange("flipkartListingId", e.target.value)}
                    placeholder="FSN-KUR-45120"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Flipkart Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.flipkartPrice}
                    onChange={(e) => handleChange("flipkartPrice", e.target.value)}
                    placeholder="749"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                4. Variants ({formData.variants.length})
              </h4>
              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <AddIcon sx={{ fontSize: 16 }} />
                <span>Add Variant</span>
              </button>
            </div>

            {formData.variants.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No variants added yet. Click &quot;Add Variant&quot; for size/color options.
              </p>
            ) : (
              <div className="space-y-2">
                {formData.variants.map((v, idx) => (
                  <div
                    key={v.id || idx}
                    className="grid grid-cols-5 sm:grid-cols-6 gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 items-center text-xs"
                  >
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) => handleUpdateVariant(idx, "size", e.target.value)}
                      placeholder="Size"
                      className="px-2 py-1 border border-slate-300 rounded bg-white"
                    />
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => handleUpdateVariant(idx, "color", e.target.value)}
                      placeholder="Color"
                      className="px-2 py-1 border border-slate-300 rounded bg-white"
                    />
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => handleUpdateVariant(idx, "sku", e.target.value)}
                      placeholder="SKU"
                      className="px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                    />
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => handleUpdateVariant(idx, "stock", Number(e.target.value))}
                      placeholder="Stock"
                      className="px-2 py-1 border border-slate-300 rounded bg-white"
                    />
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => handleUpdateVariant(idx, "price", Number(e.target.value))}
                      placeholder="Price"
                      className="px-2 py-1 border border-slate-300 rounded bg-white hidden sm:block"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-rose-500 hover:text-rose-700 justify-self-center"
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions className="p-4 border-t border-slate-200">
          <Button onClick={onClose} variant="outlined" color="inherit" size="small">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" size="small">
            {initialData ? "Save Changes" : "Create Product"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

