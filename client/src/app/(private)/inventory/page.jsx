"use client";

import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import FilterBar from "@/components/common/FilterBar";
import DataTable from "@/components/common/DataTable";
import RecordCardView from "@/components/common/RecordCardView";
import CardViewToggle from "@/components/common/CardViewToggle";
import StatusChip from "@/components/common/StatusChip";
import StockAdjustmentDialog from "@/features/inventory/StockAdjustmentDialog";
import { adjustStock } from "@/store/slices/productsSlice";
import { addMovement } from "@/store/slices/inventorySlice";
import { calculateInventoryMetrics } from "@/lib/calculations";
import { formatCurrency, formatNumber, formatDateTime } from "@/lib/formatters";
import { exportToCsv } from "@/lib/exportCsv";

// MUI
import Button from "@/components/common/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditNoteIcon from "@mui/icons-material/EditNote";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import CategoryIcon from "@mui/icons-material/Category";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export default function InventoryPage() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const movements = useSelector((state) => state.inventory.movements);

  const [currentTab, setCurrentTab] = useState(0); // 0: Stock Table, 1: Movement History
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);

  const inventoryMetrics = useMemo(() => {
    return calculateInventoryMetrics(products);
  }, [products]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(set)];
  }, [products]);

  // Filtered products for stock table
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.sku.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "all" || prod.category === categoryFilter;

      let matchesStatus = true;
      if (statusFilter === "in_stock") {
        matchesStatus = prod.stock > (prod.reorderLevel || 15);
      } else if (statusFilter === "low_stock") {
        matchesStatus = prod.stock > 0 && prod.stock <= (prod.reorderLevel || 15);
      } else if (statusFilter === "out_of_stock") {
        matchesStatus = prod.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  // Handle stock adjustment submit
  const handleAdjustmentSubmit = (adj) => {
    dispatch(
      adjustStock({
        productId: adj.productId,
        newStock: adj.newStock,
      })
    );

    dispatch(
      addMovement({
        productId: adj.productId,
        productName: adj.productName,
        sku: adj.sku,
        type: adj.type,
        quantity: adj.quantityChange,
        previousStock: adj.previousStock,
        newStock: adj.newStock,
        reason: adj.reason,
        referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
      })
    );
  };

  const handleOpenAdjust = (prod) => {
    setSelectedProduct(prod);
    setAdjustDialogOpen(true);
  };

  const handleExportStock = () => {
    const data = filteredProducts.map((p) => ({
      SKU: p.sku,
      Product: p.name,
      Category: p.category,
      AvailableStock: p.stock,
      ReservedStock: Math.floor(p.stock * 0.1),
      ReorderLevel: p.reorderLevel || 15,
      UnitPurchaseCost: p.purchaseCost,
      TotalInventoryValue: p.stock * p.purchaseCost,
      Status:
        p.stock === 0
          ? "Out of Stock"
          : p.stock <= (p.reorderLevel || 15)
          ? "Low Stock"
          : "In Stock",
    }));
    exportToCsv("SellerDesk_Inventory_Valuation", data);
  };

  const handleExportMovements = () => {
    const data = movements.map((m) => ({
      ID: m.id,
      Date: m.date,
      Product: m.productName,
      SKU: m.sku,
      Type: m.type,
      Quantity: m.quantity,
      PreviousStock: m.previousStock,
      NewStock: m.newStock,
      Reason: m.reason,
      Reference: m.referenceId || "",
      PerformedBy: m.performedBy || "Store Admin",
    }));
    exportToCsv("SellerDesk_Stock_Movements", data);
  };

  // Columns for Stock Table
  const stockColumns = [
    {
      key: "name",
      label: "Product & SKU",
      sortable: true,
      render: (_, row) => (
        <div>
          <Link
            href={`/inventory/${row.id}`}
            className="font-semibold text-slate-900 hover:text-blue-600 transition truncate max-w-[260px] block"
            title="Click to view full inventory breakdown"
          >
            {row.name}
          </Link>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="font-mono text-slate-600">{row.sku}</span>
            <span>•</span>
            <span>{row.category}</span>
          </div>
        </div>
      ),
    },
    {
      key: "stock",
      label: "Available Stock",
      sortable: true,
      align: "right",
      render: (val, row) => (
        <span
          className={`font-bold text-sm ${
            val === 0
              ? "text-rose-600"
              : val <= (row.reorderLevel || 15)
              ? "text-amber-600"
              : "text-slate-900"
          }`}
        >
          {formatNumber(val)} units
        </span>
      ),
    },
    {
      key: "reservedStock",
      label: "Reserved",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <span className="text-slate-500 text-xs">
          {Math.floor(row.stock * 0.1)} units
        </span>
      ),
    },
    {
      key: "reorderLevel",
      label: "Reorder At",
      sortable: true,
      align: "right",
      render: (val) => (
        <span className="text-slate-600 font-mono text-xs">{val || 15}</span>
      ),
    },
    {
      key: "purchaseCost",
      label: "Unit Cost",
      sortable: true,
      align: "right",
      render: (val) => (
        <span className="text-slate-600">{formatCurrency(val)}</span>
      ),
    },
    {
      key: "inventoryValue",
      label: "Stock Valuation",
      sortable: true,
      align: "right",
      render: (_, row) => (
        <span className="font-bold text-slate-900">
          {formatCurrency(row.stock * row.purchaseCost)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Stock Status",
      sortable: false,
      render: (_, row) => {
        const isOut = row.stock === 0;
        const isLow = row.stock <= (row.reorderLevel || 15);
        return (
          <StatusChip
            status={isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
          />
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            component={Link}
            href={`/inventory/${row.id}`}
            variant="soft"
            tone="neutral"
          >
            Details
          </Button>
          <Button
            variant="soft"
            startIcon={<EditNoteIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleOpenAdjust(row)}
          >
            Adjust
          </Button>
        </div>
      ),
    },
  ];

  // Columns for Movement History Table
  const movementColumns = [
    {
      key: "date",
      label: "Date & Time",
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600">{formatDateTime(val)}</span>
      ),
    },
    {
      key: "productName",
      label: "Product & SKU",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900 truncate max-w-[240px]">
            {val}
          </div>
          <div className="text-[11px] font-mono text-slate-500">{row.sku}</div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Movement Type",
      sortable: true,
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: "quantity",
      label: "Quantity Change",
      sortable: true,
      align: "right",
      render: (val) => (
        <span
          className={`font-bold text-xs ${
            val > 0
              ? "text-emerald-700"
              : val < 0
              ? "text-rose-700"
              : "text-slate-600"
          }`}
        >
          {val > 0 ? `+${val}` : val} units
        </span>
      ),
    },
    {
      key: "newStock",
      label: "New Stock",
      sortable: true,
      align: "right",
      render: (val, row) => (
        <div className="text-right">
          <div className="font-bold text-slate-900">{val} units</div>
          <div className="text-[10px] text-slate-400">was {row.previousStock}</div>
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason & Reference",
      sortable: false,
      render: (val, row) => (
        <div className="text-xs">
          <div className="text-slate-800">{val}</div>
          {row.referenceId && (
            <div className="text-[10px] text-slate-400 font-mono">
              Ref: {row.referenceId}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Stock Management"
        subtitle="Real-time stock valuation, reorder thresholds, adjustments, and movement logs."
        breadcrumbs={[{ label: "Inventory" }]}
        actions={
          <Button
            variant="outline"
            tone="neutral"
            startIcon={<FileDownloadIcon />}
            onClick={currentTab === 0 ? handleExportStock : handleExportMovements}
          >
            Export {currentTab === 0 ? "Inventory CSV" : "Movements CSV"}
          </Button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total SKUs"
          value={formatNumber(inventoryMetrics.totalSkus)}
          subtitle="Catalog breadth"
          icon={CategoryIcon}
          color="blue"
        />

        <StatCard
          title="Units in Stock"
          value={formatNumber(inventoryMetrics.totalUnits)}
          subtitle="Physical inventory"
          icon={WarehouseIcon}
          color="purple"
        />

        <StatCard
          title="Inventory Value"
          value={formatCurrency(inventoryMetrics.totalValue)}
          subtitle={`₹${Math.round(inventoryMetrics.potentialRetailValue / 1000)}k retail potential`}
          icon={AccountBalanceWalletIcon}
          color="emerald"
          tooltip="Total valuation at internal purchase cost"
        />

        <StatCard
          title="Low Stock SKUs"
          value={formatNumber(inventoryMetrics.lowStockCount)}
          subtitle="At or below reorder"
          icon={WarningAmberIcon}
          color={inventoryMetrics.lowStockCount > 0 ? "amber" : "slate"}
        />

        <StatCard
          title="Out of Stock"
          value={formatNumber(inventoryMetrics.outOfStockCount)}
          subtitle="Urgent replenishment"
          icon={ErrorOutlineIcon}
          color={inventoryMetrics.outOfStockCount > 0 ? "rose" : "slate"}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
            },
          }}
        >
          <Tab label={`Active Stock Inventory (${products.length})`} />
          <Tab label={`Stock Movement History (${movements.length})`} />
        </Tabs>
      </div>

      {/* Tab 0: Active Stock Inventory */}
      {currentTab === 0 && (
        <div className="space-y-4">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by product name or SKU..."
            filters={[
              {
                value: categoryFilter,
                onChange: setCategoryFilter,
                options: categories.map((c) => ({
                  label: c === "all" ? "All Categories" : c,
                  value: c,
                })),
              },
              {
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: "All Stock Statuses", value: "all" },
                  { label: "In Stock (> Reorder)", value: "in_stock" },
                  { label: "Low Stock (≤ Reorder)", value: "low_stock" },
                  { label: "Out of Stock (0 units)", value: "out_of_stock" },
                ],
              },
            ]}
            onReset={() => {
              setSearch("");
              setCategoryFilter("all");
              setStatusFilter("all");
            }}
          >
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredProducts.length}</strong> items
            </span>
            <CardViewToggle value={viewMode} onChange={setViewMode} />
          </FilterBar>

          {viewMode === "table" ? (
            <DataTable
              columns={stockColumns}
              data={filteredProducts}
              keyField="id"
              initialSortKey="stock"
              initialSortDir="asc"
              defaultRowsPerPage={10}
              emptyMessage="No inventory records found."
            />
          ) : (
            <RecordCardView
              items={filteredProducts}
              columns={stockColumns}
              fields={["stock", "reservedStock", "reorderLevel", "inventoryValue", "status"]}
              title={(product) => (
                <Link href={`/inventory/${product.id}`} className="hover:text-blue-600">
                  {product.name}
                </Link>
              )}
              subtitle={(product) => `${product.sku} · ${product.category}`}
              emptyMessage="No inventory records found."
            />
          )}
        </div>
      )}

      {/* Tab 1: Stock Movement History */}
      {currentTab === 1 && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <CardViewToggle value={viewMode} onChange={setViewMode} />
          </div>
          {viewMode === "table" ? (
            <DataTable
              columns={movementColumns}
              data={movements}
              keyField="id"
              initialSortKey="date"
              initialSortDir="desc"
              defaultRowsPerPage={10}
              emptyMessage="No stock movements recorded yet."
            />
          ) : (
            <RecordCardView
              items={movements}
              columns={movementColumns}
              fields={["date", "type", "quantity", "newStock", "reason"]}
              title={(movement) => movement.productName}
              subtitle={(movement) => `${movement.sku} · ${formatDateTime(movement.date)}`}
              emptyMessage="No stock movements recorded yet."
            />
          )}
        </div>
      )}

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={adjustDialogOpen}
        product={selectedProduct}
        onClose={() => setAdjustDialogOpen(false)}
        onSubmit={handleAdjustmentSubmit}
      />
    </div>
  );
}
