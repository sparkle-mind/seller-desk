"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "@/components/common/ToastProvider";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import FilterBar from "@/components/common/FilterBar";
import DataTable from "@/components/common/DataTable";
import RecordCardView from "@/components/common/RecordCardView";
import CardViewToggle from "@/components/common/CardViewToggle";
import StatusChip from "@/components/common/StatusChip";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import SupplierFormDialog from "@/features/suppliers-purchases/SupplierFormDialog";
import CreatePurchaseOrderDialog from "@/features/suppliers-purchases/CreatePurchaseOrderDialog";
import {
  addSupplier,
  updateSupplier,
  deleteSupplier,
  addPurchaseOrder,
  receivePO,
  recordPayment,
} from "@/store/slices/suppliersPurchasesSlice";
import { adjustStock } from "@/store/slices/productsSlice";
import { addMovement } from "@/store/slices/inventorySlice";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { exportToCsv } from "@/lib/exportCsv";

// MUI
import Button from "@/components/common/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import IconButton from "@/components/common/IconButton";
import Modal from "@/components/common/Modal";
import TextField from "@mui/material/TextField";
import BusinessIcon from "@mui/icons-material/Business";
import PostAddIcon from "@mui/icons-material/PostAdd";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import PaymentsIcon from "@mui/icons-material/Payments";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";

export default function SuppliersPurchasesPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const router = useRouter();
  const { suppliers, purchases } = useSelector((state) => state.suppliersPurchases);
  const products = useSelector((state) => state.products.items);

  const [currentTab, setCurrentTab] = useState(0); // 0: Suppliers, 1: Purchase Orders
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  // Dialog states
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteSupDialogOpen, setDeleteSupDialogOpen] = useState(false);
  const [deletingSupId, setDeletingSupId] = useState(null);

  const [poDialogOpen, setPoDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [selectedPoForReceive, setSelectedPoForReceive] = useState(null);

  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedPoForPay, setSelectedPoForPay] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  // Summary Metrics
  const summary = useMemo(() => {
    const totalPurchasesAmount = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const totalOutstanding = suppliers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);
    const pendingDeliveries = purchases.filter((p) => p.status === "Ordered").length;

    return {
      totalSuppliers: suppliers.length,
      totalPurchasesAmount,
      totalOutstanding,
      pendingDeliveries,
    };
  }, [suppliers, purchases]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, statusFilter]);

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.poNumber.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchases, search, statusFilter]);

  // Handlers for Supplier
  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierDialogOpen(true);
  };

  const handleOpenEditSupplier = (sup) => {
    setEditingSupplier(sup);
    setSupplierDialogOpen(true);
  };

  const handleSupplierSubmit = (data) => {
    if (editingSupplier) {
      dispatch(updateSupplier({ id: editingSupplier.id, ...data }));
      toast.success(`Supplier "${data.name || editingSupplier.name}" updated`);
    } else {
      dispatch(addSupplier(data));
      toast.success(`Supplier "${data.name}" added`);
    }
  };

  const handleConfirmDeleteSupplier = () => {
    if (deletingSupId) {
      dispatch(deleteSupplier(deletingSupId));
      toast.success("Supplier deleted");
    }
  };

  // Handlers for PO
  const handleCreatePoSubmit = (payload) => {
    dispatch(addPurchaseOrder(payload));
    toast.success("Purchase order created");
  };

  const handleConfirmReceivePo = () => {
    if (!selectedPoForReceive) return;

    // 1. Mark PO as Received
    dispatch(
      receivePO({
        poId: selectedPoForReceive.id,
        receivedDate: new Date().toISOString().split("T")[0],
      })
    );

    // 2. Increment stock for all items without double counting
    selectedPoForReceive.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
      if (prod) {
        const newStockCount = prod.stock + item.quantity;
        dispatch(
          adjustStock({
            productId: prod.id,
            newStock: newStockCount,
          })
        );

        dispatch(
          addMovement({
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            type: "Stock In",
            quantity: item.quantity,
            previousStock: prod.stock,
            newStock: newStockCount,
            reason: `Goods receipt from PO: ${selectedPoForReceive.poNumber}`,
            referenceId: selectedPoForReceive.poNumber,
          })
        );
      }
    });

    toast.success(`${selectedPoForReceive.poNumber} received. Stock updated.`);
    setReceiveDialogOpen(false);
  };

  const handleConfirmPaySubmit = (e) => {
    e.preventDefault();
    if (!selectedPoForPay || !payAmount || Number(payAmount) <= 0) return;

    dispatch(
      recordPayment({
        poId: selectedPoForPay.id,
        amount: Number(payAmount),
      })
    );
    toast.success(`Payment of ₹${Number(payAmount).toLocaleString("en-IN")} recorded`);
    setPayDialogOpen(false);
  };

  const handleExport = () => {
    if (currentTab === 0) {
      const data = filteredSuppliers.map((s) => ({
        ID: s.id,
        TradeName: s.name,
        LegalCompany: s.company,
        ContactPerson: s.contactPerson,
        Phone: s.phone,
        Email: s.email,
        City: s.city,
        State: s.state,
        GSTIN: s.gstin,
        TotalPurchases: s.totalPurchases,
        OutstandingBalance: s.outstandingBalance,
        Status: s.status,
      }));
      exportToCsv("SellerDesk_Suppliers", data);
    } else {
      const data = filteredPurchases.map((p) => ({
        PONumber: p.poNumber,
        Supplier: p.supplierName,
        OrderDate: p.orderDate,
        ExpectedDelivery: p.expectedDeliveryDate,
        ReceivedDate: p.receivedDate || "Pending",
        ItemsCount: p.items.length,
        TotalAmount: p.totalAmount,
        PaidAmount: p.paidAmount || 0,
        Status: p.status,
        PaymentStatus: p.paymentStatus,
      }));
      exportToCsv("SellerDesk_Purchase_Orders", data);
    }
  };

  // Suppliers Columns
  const supplierColumns = [
    {
      key: "name",
      label: "Supplier & Company",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-xs text-slate-500">{row.company}</div>
          <div className="text-[11px] font-mono text-slate-400">GSTIN: {row.gstin || "N/A"}</div>
        </div>
      ),
    },
    {
      key: "contactPerson",
      label: "Contact Person",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-800">{val || "Sales Desk"}</div>
          <div className="text-xs text-slate-500">{row.phone}</div>
          <div className="text-[11px] text-blue-600">{row.email}</div>
        </div>
      ),
    },
    {
      key: "city",
      label: "Location",
      sortable: true,
      render: (val, row) => (
        <span className="text-slate-700 text-xs font-medium">
          {val}, {row.state}
        </span>
      ),
    },
    {
      key: "totalPurchases",
      label: "Lifetime Purchases",
      sortable: true,
      align: "right",
      render: (val) => (
        <span className="font-bold text-slate-900">{formatCurrency(val)}</span>
      ),
    },
    {
      key: "outstandingBalance",
      label: "Balance Due",
      sortable: true,
      align: "right",
      render: (val) => (
        <span
          className={`font-bold ${
            val > 0 ? "text-amber-700 font-semibold" : "text-emerald-700"
          }`}
        >
          {val > 0 ? formatCurrency(val) : "Cleared (₹0)"}
        </span>
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
          <IconButton
            label="Edit Supplier"
            tone="primary"
            onClick={() => handleOpenEditSupplier(row)}
          >
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <IconButton
            label="Delete Supplier"
            tone="danger"
            onClick={() => {
              setDeletingSupId(row.id);
              setDeleteSupDialogOpen(true);
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </div>
      ),
    },
  ];

  // Purchase Orders Columns
  const poColumns = [
    {
      key: "poNumber",
      label: "PO Number",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-[11px] text-slate-500">
            Ordered: {formatDate(row.orderDate)}
          </div>
        </div>
      ),
    },
    {
      key: "supplierName",
      label: "Supplier",
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-slate-800">{val}</span>
      ),
    },
    {
      key: "items",
      label: "Items Ordered",
      sortable: false,
      render: (items) => (
        <div className="max-w-[200px]">
          <div className="font-medium text-slate-800 text-xs truncate">
            {items[0]?.productName || "Products"}
          </div>
          {items.length > 1 && (
            <div className="text-[10px] text-blue-600 font-semibold">
              + {items.length - 1} additional items
            </div>
          )}
          <div className="text-[11px] text-slate-400">
            Total Qty: {items.reduce((s, i) => s + i.quantity, 0)} units
          </div>
        </div>
      ),
    },
    {
      key: "expectedDeliveryDate",
      label: "Expected / Received",
      sortable: true,
      render: (val, row) => (
        <div className="text-xs">
          {row.receivedDate ? (
            <div className="text-emerald-700 font-bold">
              Received on: {formatDate(row.receivedDate)}
            </div>
          ) : (
            <div className="text-slate-600">ETA: {formatDate(val)}</div>
          )}
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      sortable: true,
      align: "right",
      render: (val, row) => (
        <div className="text-right">
          <div className="font-bold text-slate-900">{formatCurrency(val)}</div>
          <div className="text-[10px] text-slate-400">
            Paid: {formatCurrency(row.paidAmount || 0)}
          </div>
        </div>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      sortable: true,
      render: (val) => <StatusChip status={val} />,
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
        <div className="flex items-center justify-end gap-1.5">
          {row.status !== "Received" && (
            <Button
              variant="soft"
              tone="success"
              startIcon={<MoveToInboxIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                setSelectedPoForReceive(row);
                setReceiveDialogOpen(true);
              }}
            >
              Receive
            </Button>
          )}

          {row.paymentStatus !== "Paid" && (
            <Button
              variant="soft"
              startIcon={<PaymentsIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                setSelectedPoForPay(row);
                setPayAmount(row.totalAmount - (row.paidAmount || 0));
                setPayDialogOpen(true);
              }}
            >
              Pay
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers & Purchase Management"
        subtitle="Manage manufacturing vendors, bulk purchasing, goods receiving, and accounts payable."
        breadcrumbs={[{ label: "Suppliers & Purchases" }]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              tone="neutral"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
            {currentTab === 0 ? (
              <Button
                startIcon={<AddIcon />}
                onClick={handleOpenAddSupplier}
              >
                Add Supplier
              </Button>
            ) : (
              <Button
                startIcon={<PostAddIcon />}
                onClick={() => setPoDialogOpen(true)}
              >
                Create Purchase Order
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Active Suppliers"
          value={summary.totalSuppliers}
          subtitle="Surat, Jaipur, Tirupur..."
          icon={BusinessIcon}
          color="blue"
        />

        <StatCard
          title="Lifetime Purchases"
          value={formatCurrency(summary.totalPurchasesAmount)}
          subtitle={`${purchases.length} total orders`}
          icon={ShoppingCartCheckoutIcon}
          color="purple"
        />

        <StatCard
          title="Outstanding Payable"
          value={formatCurrency(summary.totalOutstanding)}
          subtitle="Vendor credit balance"
          icon={AccountBalanceWalletIcon}
          color={summary.totalOutstanding > 0 ? "amber" : "emerald"}
          tooltip="Total unpaid balance across all vendor accounts"
        />

        <StatCard
          title="Inbound Shipments"
          value={summary.pendingDeliveries}
          subtitle="POs in transit"
          icon={MoveToInboxIcon}
          color="blue"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <Tabs
          value={currentTab}
          onChange={(_, val) => {
            setCurrentTab(val);
            setSearch("");
            setStatusFilter("all");
          }}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
            },
          }}
        >
          <Tab label={`Suppliers Directory (${suppliers.length})`} />
          <Tab label={`Purchase Orders (${purchases.length})`} />
        </Tabs>
      </div>

      {/* Filters */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          currentTab === 0
            ? "Search supplier name, company, city..."
            : "Search PO number, supplier..."
        }
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options:
              currentTab === 0
                ? [
                    { label: "All Statuses", value: "all" },
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                  ]
                : [
                    { label: "All PO Statuses", value: "all" },
                    { label: "Ordered", value: "Ordered" },
                    { label: "Received", value: "Received" },
                  ],
          },
        ]}
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
        }}
      >
        <CardViewToggle value={viewMode} onChange={setViewMode} />
      </FilterBar>

      {/* Tables */}
      {currentTab === 0 && (
        viewMode === "table" ? (
          <DataTable
            columns={supplierColumns}
            data={filteredSuppliers}
            keyField="id"
            initialSortKey="totalPurchases"
            initialSortDir="desc"
            defaultRowsPerPage={10}
            emptyMessage="No suppliers found."
            onRowClick={(row) => router.push(`/suppliers-purchases/suppliers/${row.id}`)}
          />
        ) : (
          <RecordCardView
            items={filteredSuppliers}
            columns={supplierColumns}
            fields={["contactPerson", "city", "totalPurchases", "outstandingBalance", "status"]}
            title={(supplier) => supplier.name}
            subtitle={(supplier) => supplier.company}
            onCardClick={(supplier) => router.push(`/suppliers-purchases/suppliers/${supplier.id}`)}
            emptyMessage="No suppliers found."
          />
        )
      )}

      {currentTab === 1 && (
        viewMode === "table" ? (
          <DataTable
            columns={poColumns}
            data={filteredPurchases}
            keyField="id"
            initialSortKey="poNumber"
            initialSortDir="desc"
            defaultRowsPerPage={10}
            emptyMessage="No purchase orders found."
            onRowClick={(row) => router.push(`/suppliers-purchases/po/${row.id}`)}
          />
        ) : (
          <RecordCardView
            items={filteredPurchases}
            columns={poColumns}
            fields={["items", "expectedDeliveryDate", "totalAmount", "paymentStatus", "status"]}
            title={(purchase) => purchase.poNumber}
            subtitle={(purchase) => purchase.supplierName}
            onCardClick={(purchase) => router.push(`/suppliers-purchases/po/${purchase.id}`)}
            emptyMessage="No purchase orders found."
          />
        )
      )}

      {/* Add / Edit Supplier Dialog */}
      <SupplierFormDialog
        open={supplierDialogOpen}
        initialData={editingSupplier}
        onClose={() => setSupplierDialogOpen(false)}
        onSubmit={handleSupplierSubmit}
      />

      {/* Delete Supplier Confirmation */}
      <ConfirmDialog
        open={deleteSupDialogOpen}
        title="Delete Supplier?"
        message="Are you sure you want to remove this supplier record? Outstanding balances should be reconciled first."
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDeleteSupplier}
        onClose={() => setDeleteSupDialogOpen(false)}
      />

      {/* Create Purchase Order Dialog */}
      <CreatePurchaseOrderDialog
        open={poDialogOpen}
        suppliers={suppliers}
        products={products}
        onClose={() => setPoDialogOpen(false)}
        onSubmit={handleCreatePoSubmit}
      />

      {/* Goods Receipt Confirmation Dialog */}
      <ConfirmDialog
        open={receiveDialogOpen}
        title="Receive Goods into Inventory?"
        message={`Confirming receipt of PO ${selectedPoForReceive?.poNumber} will automatically increment your active inventory stock count for all ${selectedPoForReceive?.items.length} items without double counting.`}
        confirmLabel="Confirm Receipt & Update Stock"
        confirmColor="primary"
        onConfirm={handleConfirmReceivePo}
        onClose={() => setReceiveDialogOpen(false)}
      />

      {/* Pay Supplier Modal */}
      <Modal
        open={payDialogOpen}
        onClose={() => setPayDialogOpen(false)}
        size="xs"
        title="Record Vendor Payment"
        icon={PaymentsIcon}
        tone="emerald"
        onSubmit={handleConfirmPaySubmit}
        submitLabel="Record Payment"
        contentClassName="space-y-3"
      >
        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
          <div className="font-bold text-slate-800">PO: {selectedPoForPay?.poNumber}</div>
          <div className="text-slate-600">Supplier: {selectedPoForPay?.supplierName}</div>
          <div className="text-slate-700">
            Total PO Amount: <strong>{formatCurrency(selectedPoForPay?.totalAmount)}</strong>
          </div>
          <div className="text-slate-700">
            Remaining Due:{" "}
            <strong className="text-amber-700">
              {formatCurrency((selectedPoForPay?.totalAmount || 0) - (selectedPoForPay?.paidAmount || 0))}
            </strong>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Payment Amount (₹) *
          </label>
          <input
            type="number"
            min="1"
            max={(selectedPoForPay?.totalAmount || 0) - (selectedPoForPay?.paidAmount || 0)}
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bold"
            required
          />
        </div>
      </Modal>
    </div>
  );
}
