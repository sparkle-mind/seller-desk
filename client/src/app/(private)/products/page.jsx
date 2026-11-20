"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import ProductImage from "@/components/common/ProductImage";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "@/components/common/ToastProvider";
import PageHeader from "@/components/common/PageHeader";
import FilterBar from "@/components/common/FilterBar";
import DataTable from "@/components/common/DataTable";
import RecordCardView from "@/components/common/RecordCardView";
import CardViewToggle from "@/components/common/CardViewToggle";
import StatusChip from "@/components/common/StatusChip";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ProductFormDialog from "@/features/products/ProductFormDialog";
import { addProduct, updateProduct, deleteProduct } from "@/store/slices/productsSlice";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { exportToCsv } from "@/lib/exportCsv";

// MUI Icons & components
import Button from "@/components/common/Button";
import IconButton from "@/components/common/IconButton";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Tooltip from "@mui/material/Tooltip";

export default function ProductsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const products = useSelector((state) => state.products.items);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [marketplaceFilter, setMarketplaceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Filtered dataset
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Search
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.sku.toLowerCase().includes(q) ||
        (prod.brand && prod.brand.toLowerCase().includes(q));

      // Category filter
      const matchesCategory =
        categoryFilter === "all" || prod.category === categoryFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "all" || prod.status === statusFilter;

      // Marketplace filter
      let matchesMarketplace = true;
      if (marketplaceFilter === "meesho") {
        matchesMarketplace = prod.marketplaceListings?.meesho?.live;
      } else if (marketplaceFilter === "flipkart") {
        matchesMarketplace = prod.marketplaceListings?.flipkart?.live;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesMarketplace;
    });
  }, [products, search, categoryFilter, marketplaceFilter, statusFilter]);

  // Extract categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(set)];
  }, [products]);

  // Actions
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (prod, e) => {
    e.stopPropagation();
    setEditingProduct(prod);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (id, e) => {
    e.stopPropagation();
    setDeletingProductId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingProductId) {
      dispatch(deleteProduct(deletingProductId));
      toast.success("Product deleted");
    }
  };

  const handleFormSubmit = (data) => {
    if (editingProduct) {
      dispatch(updateProduct({ id: editingProduct.id, ...data }));
      toast.success(`"${data.name || editingProduct.name}" updated`);
    } else {
      dispatch(addProduct(data));
      toast.success(`"${data.name}" added to products`);
    }
  };

  const handleExport = () => {
    const exportData = filteredProducts.map((p) => ({
      ID: p.id,
      Name: p.name,
      SKU: p.sku,
      Category: p.category,
      Brand: p.brand || "",
      PurchaseCost: p.purchaseCost,
      SellingPrice: p.sellingPrice,
      MRP: p.mrp,
      Stock: p.stock,
      ReorderLevel: p.reorderLevel,
      Status: p.status,
      MeeshoLive: p.marketplaceListings?.meesho?.live ? "Yes" : "No",
      MeeshoListingId: p.marketplaceListings?.meesho?.listingId || "",
      FlipkartLive: p.marketplaceListings?.flipkart?.live ? "Yes" : "No",
      FlipkartListingId: p.marketplaceListings?.flipkart?.listingId || "",
    }));
    exportToCsv("SellerDesk_Products_Catalog", exportData);
  };

  // Columns definition
  const columns = [
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <ProductImage
            src={row.image}
            alt={row.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
          />
          <div className="overflow-hidden">
            <Link
              href={`/products/${row.id}`}
              className="font-semibold text-slate-900 hover:text-blue-600 transition block truncate max-w-[220px]"
              title={row.name}
            >
              {row.name}
            </Link>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="font-mono text-slate-600">{row.sku}</span>
              <span>•</span>
              <span>{row.category}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "purchaseCost",
      label: "Cost",
      sortable: true,
      align: "right",
      render: (val) => (
        <span className="text-slate-600 font-medium">{formatCurrency(val)}</span>
      ),
    },
    {
      key: "sellingPrice",
      label: "Selling Price",
      sortable: true,
      align: "right",
      render: (val) => (
        <span className="font-bold text-slate-900">{formatCurrency(val)}</span>
      ),
    },
    {
      key: "profitMargin",
      label: "Est. Margin",
      sortable: false,
      align: "right",
      render: (_, row) => {
        const profit = row.sellingPrice - row.purchaseCost;
        const marginPct = Math.round((profit / row.sellingPrice) * 100);
        return (
          <div className="text-right">
            <div className="text-emerald-700 font-bold text-xs">{formatCurrency(profit)}</div>
            <div className="text-[10px] text-emerald-600 font-medium">{marginPct}%</div>
          </div>
        );
      },
    },
    {
      key: "stock",
      label: "Available Stock",
      sortable: true,
      render: (val, row) => {
        const isLow = val <= (row.reorderLevel || 15);
        const isOut = val === 0;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-slate-800"}`}>
                {formatNumber(val)} units
              </span>
            </div>
            <div>
              <StatusChip
                status={isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "marketplaces",
      label: "Marketplaces",
      sortable: false,
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          {row.marketplaceListings?.meesho?.live ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-600" />
              MSH: {row.marketplaceListings.meesho.listingId} (₹{row.marketplaceListings.meesho.price})
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">Meesho: Not Listed</span>
          )}

          {row.marketplaceListings?.flipkart?.live ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              FK: {row.marketplaceListings.flipkart.listingId} (₹{row.marketplaceListings.flipkart.price})
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">Flipkart: Not Listed</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="View Details">
            <Link
              href={`/products/${row.id}`}
              className="p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
            >
              <VisibilityIcon sx={{ fontSize: 18 }} />
            </Link>
          </Tooltip>

          <IconButton
            label="Edit Product"
            tone="primary"
            onClick={(e) => handleOpenEdit(row, e)}
          >
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <IconButton
            label="Delete Product"
            tone="danger"
            onClick={(e) => handleOpenDelete(row.id, e)}
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products Catalog"
        subtitle="Manage internal products, SKUs, pricing, variants, and marketplace listings."
        breadcrumbs={[{ label: "Products" }]}
        actions={
          <>
            <Button
              variant="outline"
              tone="neutral"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
            <Button
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
            >
              Add Product
            </Button>
          </>
        }
      />

      {/* Filter and Search Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search product by name or SKU..."
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
            value: marketplaceFilter,
            onChange: setMarketplaceFilter,
            options: [
              { label: "All Channels", value: "all" },
              { label: "Live on Meesho", value: "meesho" },
              { label: "Live on Flipkart", value: "flipkart" },
            ],
          },
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All Statuses", value: "all" },
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ],
          },
        ]}
        onReset={() => {
          setSearch("");
          setCategoryFilter("all");
          setMarketplaceFilter("all");
          setStatusFilter("all");
        }}
      >
        <span className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredProducts.length}</strong> of {products.length} products
        </span>
        <CardViewToggle value={viewMode} onChange={setViewMode} />
      </FilterBar>

      {viewMode === "table" ? (
        <DataTable
          columns={columns}
          data={filteredProducts}
          keyField="id"
          initialSortKey="stock"
          initialSortDir="asc"
          defaultRowsPerPage={10}
          emptyMessage="No products match your current search or filter criteria."
        />
      ) : (
        <RecordCardView
          items={filteredProducts}
          columns={columns}
          fields={["sellingPrice", "stock", "marketplaces", "status"]}
          title={(product) => (
            <Link href={`/products/${product.id}`} className="hover:text-blue-600">
              {product.name}
            </Link>
          )}
          subtitle={(product) => `${product.sku} · ${product.category}`}
          emptyMessage="No products match your current search or filter criteria."
        />
      )}

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormDialog
        open={formDialogOpen}
        initialData={editingProduct}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Confirm Deletion Modal */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Product?"
        message="Are you sure you want to delete this product from your catalog? This will remove it from inventory and catalog reports."
        confirmLabel="Delete Product"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
