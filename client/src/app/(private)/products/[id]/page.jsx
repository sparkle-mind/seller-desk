"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import ProductFormDialog from "@/features/products/ProductFormDialog";
import { updateProduct } from "@/store/slices/productsSlice";
import { formatCurrency, formatNumber, formatDate } from "@/lib/formatters";

// MUI Icons
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const orders = useSelector((state) => state.orders.items);

  const [editOpen, setEditOpen] = useState(false);

  const product = products.find((p) => p.id === params.id);

  if (!product) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">
          The requested product ID &quot;{params.id}&quot; does not exist.
        </p>
        <Link
          href="/products"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  // Related orders for this product
  const productOrders = orders.filter((o) => o.productId === product.id);

  const totalUnitsSold = productOrders
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((sum, o) => sum + (o.quantity || 1), 0);

  const totalGrossRevenue = productOrders
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const profitPerUnit = product.sellingPrice - product.purchaseCost;
  const marginPct = Math.round((profitPerUnit / product.sellingPrice) * 100);

  const handleUpdate = (data) => {
    dispatch(updateProduct({ id: product.id, ...data }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        subtitle={`SKU: ${product.sku} | Category: ${product.category}`}
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: product.name },
        ]}
        actions={
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/products")}
              sx={{ borderColor: "var(--btn-neutral-border)", color: "var(--btn-neutral-text)" }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditOpen(true)}
            >
              Edit Product
            </Button>
          </>
        }
      />

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Product Image & Quick Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Brand:</span>
              <span className="font-semibold text-slate-800">{product.brand || "DesiCart Internal"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Status:</span>
              <StatusChip status={product.status} />
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Weight:</span>
              <span className="font-semibold text-slate-800">{product.weightKg || 0.5} Kg</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Dimensions:</span>
              <span className="font-semibold text-slate-800">{product.dimensions || "N/A"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Date Added:</span>
              <span className="font-semibold text-slate-800">{formatDate(product.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Center: Financial & Profit Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            <MonetizationOnIcon className="text-emerald-600" />
            <span>Financials & Unit Economics</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-600">Purchase / COGS:</span>
              <span className="text-base font-bold text-slate-900">
                {formatCurrency(product.purchaseCost)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 flex justify-between items-center text-xs">
              <span className="text-blue-900">Default Selling Price:</span>
              <span className="text-base font-bold text-blue-700">
                {formatCurrency(product.sellingPrice)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-600">MRP:</span>
              <span className="text-sm font-bold text-slate-500 line-through">
                {formatCurrency(product.mrp)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex justify-between items-center text-xs">
              <div>
                <div className="font-bold text-emerald-900">Est. Gross Margin per Unit</div>
                <div className="text-[11px] text-emerald-700">{marginPct}% profit margin</div>
              </div>
              <span className="text-base font-bold text-emerald-700">
                +{formatCurrency(profitPerUnit)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Stock & Lifetime Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            <Inventory2Icon className="text-blue-600" />
            <span>Stock & Order Velocity</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-600">Current Available Stock:</span>
              <span className="text-base font-bold text-slate-900">
                {formatNumber(product.stock)} units
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-600">Reorder Threshold:</span>
              <span className="font-bold text-amber-600">
                {product.reorderLevel || 15} units
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-600">Lifetime Units Ordered:</span>
              <span className="text-base font-bold text-slate-900">
                {totalUnitsSold} units
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-600">Total Revenue Generated:</span>
              <span className="text-base font-bold text-blue-600">
                {formatCurrency(totalGrossRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace Listings Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Connected Marketplace Listings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Meesho Card */}
          <div className="p-4 rounded-xl border border-pink-200 bg-pink-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-pink-700 text-sm">MEESHO SELLER PORTAL</span>
              <StatusChip status={product.marketplaceListings?.meesho?.live ? "Active" : "Inactive"} />
            </div>
            <div className="space-y-1 text-slate-700">
              <div>
                Listing / Catalog ID:{" "}
                <strong className="font-mono text-slate-900">
                  {product.marketplaceListings?.meesho?.listingId || "Not assigned"}
                </strong>
              </div>
              <div>
                Listed Selling Price:{" "}
                <strong className="text-slate-900">
                  {formatCurrency(product.marketplaceListings?.meesho?.price || product.sellingPrice)}
                </strong>
              </div>
              <div>
                Platform Commission: <strong>0% (Meesho zero commission model)</strong>
              </div>
            </div>
          </div>

          {/* Flipkart Card */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-700 text-sm">FLIPKART SELLER HUB</span>
              <StatusChip status={product.marketplaceListings?.flipkart?.live ? "Active" : "Inactive"} />
            </div>
            <div className="space-y-1 text-slate-700">
              <div>
                FSN ID:{" "}
                <strong className="font-mono text-slate-900">
                  {product.marketplaceListings?.flipkart?.listingId || "Not assigned"}
                </strong>
              </div>
              <div>
                Listed Selling Price:{" "}
                <strong className="text-slate-900">
                  {formatCurrency(product.marketplaceListings?.flipkart?.price || product.sellingPrice)}
                </strong>
              </div>
              <div>
                Category Commission & Fees: <strong>~12% + Fixed Fee</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variants Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Product Variants ({product.variants?.length || 0})
        </h3>
        {product.variants && product.variants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Variant SKU</th>
                  <th className="px-4 py-2.5">Size</th>
                  <th className="px-4 py-2.5">Color</th>
                  <th className="px-4 py-2.5">Stock</th>
                  <th className="px-4 py-2.5">Cost</th>
                  <th className="px-4 py-2.5">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {product.variants.map((v, idx) => (
                  <tr key={v.id || idx}>
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-900">
                      {v.sku}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{v.size}</td>
                    <td className="px-4 py-2.5 text-slate-700">{v.color}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{v.stock} units</td>
                    <td className="px-4 py-2.5 text-slate-600">{formatCurrency(v.cost || product.purchaseCost)}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{formatCurrency(v.price || product.sellingPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No variants configured for this single SKU product.</p>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Description & Specification</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Edit Form Modal */}
      <ProductFormDialog
        open={editOpen}
        initialData={product}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
      />
    </div>
  );
}

