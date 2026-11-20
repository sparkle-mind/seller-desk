"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductImage from "@/components/common/ProductImage";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "@/components/common/ToastProvider";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import StatusChip from "@/components/common/StatusChip";
import StockAdjustmentDialog from "@/features/inventory/StockAdjustmentDialog";
import {
  adjustStock,
  updateReorderLevel,
  updateVariantStock,
} from "@/store/slices/productsSlice";
import { addMovement } from "@/store/slices/inventorySlice";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
} from "@/lib/formatters";

// MUI Icons & components
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import TextField from "@mui/material/TextField";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AddBoxIcon from "@mui/icons-material/AddBox";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TuneIcon from "@mui/icons-material/Tune";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();

  const products = useSelector((state) => state.products.items);
  const movements = useSelector((state) => state.inventory.movements);

  const product = products.find((p) => p.id === params.id || p.sku === params.id);

  // Dialog states
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [newReorderValue, setNewReorderValue] = useState("");

  const [editingVariant, setEditingVariant] = useState(null);
  const [variantStockInput, setVariantStockInput] = useState("");

  if (!product) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Inventory SKU Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">
          No inventory record found for &quot;{params.id}&quot;.
        </p>
        <Link
          href="/inventory"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          <span>Back to Inventory</span>
        </Link>
      </div>
    );
  }

  const currentStock = Number(product.stock) || 0;
  const reorderLevel = Number(product.reorderLevel) || 15;
  const isOut = currentStock === 0;
  const isLow = currentStock > 0 && currentStock <= reorderLevel;
  const reservedStock = Math.floor(currentStock * 0.1);
  const availableToSell = Math.max(0, currentStock - reservedStock);

  // Filter movements for this product
  const itemMovements = movements.filter(
    (m) => m.productId === product.id || m.sku === product.sku
  );

  // Quick Adjustment handler
  const handleAdjustmentSubmit = (adj) => {
    dispatch(adjustStock({ productId: product.id, newStock: adj.newStock }));
    dispatch(
      addMovement({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        type: adj.type,
        quantity: adj.quantityChange,
        previousStock: adj.previousStock,
        newStock: adj.newStock,
        reason: adj.reason,
        referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
      })
    );
    toast.success(`Stock adjusted to ${adj.newStock} units`);
  };

  // Quick stock replenishment shortcut
  const handleQuickAdd = (qty) => {
    const newStock = currentStock + qty;
    dispatch(adjustStock({ productId: product.id, newStock }));
    dispatch(
      addMovement({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        type: "Stock In",
        quantity: qty,
        previousStock: currentStock,
        newStock,
        reason: `Quick replenishment (+${qty} units)`,
        referenceId: `QUICK-${Date.now().toString().slice(-4)}`,
      })
    );
    toast.success(`Added ${qty} units. Stock is now ${newStock}`);
  };

  // Reorder Level save
  const handleSaveReorder = (e) => {
    e.preventDefault();
    const val = Number(newReorderValue);
    if (!isNaN(val) && val >= 1) {
      dispatch(updateReorderLevel({ productId: product.id, reorderLevel: val }));
      toast.success(`Reorder level set to ${val}`);
      setReorderDialogOpen(false);
    }
  };

  // Variant Stock edit submit
  const handleVariantStockSave = (e) => {
    e.preventDefault();
    if (!editingVariant) return;
    const qty = Number(variantStockInput);
    if (!isNaN(qty) && qty >= 0) {
      dispatch(
        updateVariantStock({
          productId: product.id,
          variantId: editingVariant.id,
          newStock: qty,
        })
      );
      dispatch(
        addMovement({
          productId: product.id,
          productName: product.name,
          sku: editingVariant.sku || product.sku,
          type: "Manual Adjustment",
          quantity: qty - editingVariant.stock,
          previousStock: currentStock,
          newStock: currentStock + (qty - editingVariant.stock),
          reason: `Variant stock update (${editingVariant.size}/${editingVariant.color})`,
          referenceId: `VAR-${editingVariant.id}`,
        })
      );
      toast.success(`Variant ${editingVariant.size}/${editingVariant.color} stock set to ${qty}`);
      setEditingVariant(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Inventory: ${product.name}`}
        subtitle={`Internal SKU: ${product.sku} | Category: ${product.category} | Storage Bin: Shelf B-04`}
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: product.sku },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              tone="neutral"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/inventory")}
            >
              Back
            </Button>
            <Button startIcon={<EditNoteIcon />} onClick={() => setAdjustDialogOpen(true)}>
              Adjust Stock
            </Button>
            <Button
              variant="outline"
              tone="neutral"
              startIcon={<TuneIcon />}
              onClick={() => {
                setNewReorderValue(product.reorderLevel || 15);
                setReorderDialogOpen(true);
              }}
            >
              Configure Threshold
            </Button>
          </div>
        }
      />

      {/* Top Inventory Status Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ProductImage
            src={product.image}
            alt={product.name}
            width={56}
            height={56}
            className="w-14 h-14 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-base">{product.name}</span>
              <StatusChip
                status={isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
              />
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              SKU: {product.sku} • Warehouse: Unit 4, Bhiwandi Logistics Center
            </div>
          </div>
        </div>

        {/* Quick Replenish Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Quick Stock In:</span>
          {[25, 50, 100].map((qty) => (
            <Button
              key={qty}
              variant="soft"
              tone="success"
              onClick={() => handleQuickAdd(qty)}
            >
              +{qty} Units
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="On-Hand Units"
          value={`${formatNumber(currentStock)} units`}
          subtitle={`Available: ${availableToSell}`}
          icon={WarehouseIcon}
          color="blue"
        />

        <StatCard
          title="Reserved Units"
          value={`${reservedStock} units`}
          subtitle="Held for open orders"
          icon={LocalShippingIcon}
          color="purple"
        />

        <StatCard
          title="Reorder Level"
          value={`${reorderLevel} units`}
          subtitle={isLow ? "Low stock triggered" : "Healthy buffer"}
          icon={WarningAmberIcon}
          color={isLow ? "amber" : "slate"}
        />

        <StatCard
          title="Inventory Cost Value"
          value={formatCurrency(currentStock * product.purchaseCost)}
          subtitle={`@ ${formatCurrency(product.purchaseCost)} unit cost`}
          icon={AccountBalanceWalletIcon}
          color="emerald"
        />

        <StatCard
          title="Retail Potential"
          value={formatCurrency(currentStock * product.sellingPrice)}
          subtitle={`@ ${formatCurrency(product.sellingPrice)} selling price`}
          icon={AccountBalanceWalletIcon}
          color="blue"
        />
      </div>

      {/* Middle Section: Channel Allocation & Physical Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Channel Inventory Mapping */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Marketplace Inventory Allocations</span>
            <span className="text-xs text-slate-500 font-normal">Real-time sync</span>
          </h3>

          <div className="space-y-3 text-xs">
            {/* Meesho Allocation */}
            <div className="p-3.5 rounded-lg border border-pink-200 bg-pink-50/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-pink-700">Meesho Live Listing</div>
                <div className="text-slate-500 text-[11px]">
                  Catalog ID: {product.marketplaceListings?.meesho?.listingId || "MSH-LST-DEFAULT"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 text-sm">
                  {product.marketplaceListings?.meesho?.live ? Math.floor(availableToSell * 0.5) : 0} units
                </div>
                <div className="text-[10px] text-pink-600 font-medium">
                  {product.marketplaceListings?.meesho?.live ? "Allocated 50%" : "Paused"}
                </div>
              </div>
            </div>

            {/* Flipkart Allocation */}
            <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-blue-700">Flipkart Smart Fulfillment</div>
                <div className="text-slate-500 text-[11px]">
                  FSN: {product.marketplaceListings?.flipkart?.listingId || "FSN-FK-DEFAULT"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 text-sm">
                  {product.marketplaceListings?.flipkart?.live ? Math.floor(availableToSell * 0.4) : 0} units
                </div>
                <div className="text-[10px] text-blue-600 font-medium">
                  {product.marketplaceListings?.flipkart?.live ? "Allocated 40%" : "Paused"}
                </div>
              </div>
            </div>

            {/* Buffer Allocation */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-slate-600">
              <span>Safety Reserve Buffer (Offline / Exchanges):</span>
              <span className="font-bold text-slate-800">
                {Math.max(0, availableToSell - Math.floor(availableToSell * 0.5) - Math.floor(availableToSell * 0.4))} units
              </span>
            </div>
          </div>
        </div>

        {/* Physical Storage & Dimensions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Physical Warehouse Specifications
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-slate-400">Warehouse Location</div>
              <div className="font-bold text-slate-800 mt-0.5">Bhiwandi Hub 4</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-slate-400">Bin / Shelf Number</div>
              <div className="font-bold font-mono text-slate-800 mt-0.5">SHELF-B04-SEC2</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-slate-400">Single Unit Weight</div>
              <div className="font-bold text-slate-800 mt-0.5">{product.weightKg || 0.5} Kg</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-slate-400">Carton Dimensions</div>
              <div className="font-bold text-slate-800 mt-0.5">{product.dimensions || "30x25x4 cm"}</div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-blue-900">
            <strong>Barcoding &amp; Scanning:</strong> Barcode labels compliant with GS1 &amp; Ekart/Delhivery scanning standard.
          </div>
        </div>
      </div>

      {/* Variants Stock Table with Inline Edit Action */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Variant-Level Inventory Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Click &quot;Edit Stock&quot; to modify individual variant inventories
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
            {product.variants?.length || 0} Variants Configured
          </span>
        </div>

        {product.variants && product.variants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Variant SKU</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Color</th>
                  <th className="px-4 py-3 text-right">Available Stock</th>
                  <th className="px-4 py-3 text-right">Unit Cost</th>
                  <th className="px-4 py-3 text-right">Variant Valuation</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {product.variants.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {v.sku}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{v.size}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{v.color}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {v.stock} units
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(v.cost || product.purchaseCost)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700">
                      {formatCurrency(v.stock * (v.cost || product.purchaseCost))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="soft"
                        onClick={() => {
                          setEditingVariant(v);
                          setVariantStockInput(v.stock);
                        }}
                      >
                        Edit Stock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 italic">
            Single-SKU item without size/color variants. Adjust stock using the main &quot;Adjust Stock&quot; button above.
          </div>
        )}
      </div>

      {/* Movement History for this product */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HistoryIcon className="text-slate-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Stock Movement History for this SKU
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {itemMovements.length} log entries recorded
          </span>
        </div>

        {itemMovements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3">Movement Type</th>
                  <th className="px-4 py-3 text-right">Change</th>
                  <th className="px-4 py-3 text-right">Resulting Stock</th>
                  <th className="px-4 py-3">Reason &amp; Reference</th>
                  <th className="px-4 py-3">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itemMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(m.date)}</td>
                    <td className="px-4 py-3">
                      <StatusChip status={m.type} />
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      <span className={m.quantity > 0 ? "text-emerald-700" : "text-rose-700"}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity} units
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {m.newStock} units
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 font-medium">{m.reason}</div>
                      {m.referenceId && (
                        <div className="text-[10px] text-slate-400 font-mono">Ref: {m.referenceId}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{m.performedBy || "Admin"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 italic">
            No movements recorded for this item yet. Adjust stock to generate logs.
          </div>
        )}
      </div>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={adjustDialogOpen}
        product={product}
        onClose={() => setAdjustDialogOpen(false)}
        onSubmit={handleAdjustmentSubmit}
      />

      {/* Reorder Level Dialog */}
      <Modal
        open={reorderDialogOpen}
        onClose={() => setReorderDialogOpen(false)}
        size="xs"
        title="Configure Low-Stock Reorder Threshold"
        icon={TuneIcon}
        tone="amber"
        onSubmit={handleSaveReorder}
        submitLabel="Save Threshold"
        contentClassName="space-y-3"
      >
        <p className="text-xs text-slate-600">
          When available stock falls at or below this count, SellerDesk triggers a low-stock alert.
        </p>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reorder Threshold Count (units) *
          </label>
          <input
            type="number"
            min="1"
            value={newReorderValue}
            onChange={(e) => setNewReorderValue(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bold"
            required
          />
        </div>
      </Modal>

      {/* Variant Stock Dialog */}
      <Modal
        open={Boolean(editingVariant)}
        onClose={() => setEditingVariant(null)}
        size="xs"
        title="Edit Variant Inventory"
        subtitle={editingVariant?.sku}
        icon={EditNoteIcon}
        onSubmit={handleVariantStockSave}
        submitLabel="Update Variant Stock"
        contentClassName="space-y-3"
      >
        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
          <div className="font-bold text-slate-800">SKU: {editingVariant?.sku}</div>
          <div className="text-slate-600">
            Size: {editingVariant?.size} • Color: {editingVariant?.color}
          </div>
          <div className="text-slate-700">
            Current Count: <strong>{editingVariant?.stock} units</strong>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            New Available Stock *
          </label>
          <input
            type="number"
            min="0"
            value={variantStockInput}
            onChange={(e) => setVariantStockInput(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bold"
            required
          />
        </div>
      </Modal>
    </div>
  );
}

