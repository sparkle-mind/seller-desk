"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import FilterBar from "@/components/common/FilterBar";
import DataTable from "@/components/common/DataTable";
import RecordCardView from "@/components/common/RecordCardView";
import CardViewToggle from "@/components/common/CardViewToggle";
import StatusChip from "@/components/common/StatusChip";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ShipOrderDialog from "@/features/orders/ShipOrderDialog";
import OrderFormDialog from "@/features/orders/OrderFormDialog";
import MarkReturnDialog from "@/features/orders/MarkReturnDialog";
import {
  createOrder,
  editOrder,
  deleteOrder,
  markPacked,
  markShipped,
  cancelOrder,
  markReturned,
} from "@/store/slices/ordersSlice";
import { filterByDateRange } from "@/lib/calculations";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { exportToCsv } from "@/lib/exportCsv";

// MUI
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import InventoryIcon from "@mui/icons-material/Inventory";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Link from "next/link";

export default function OrdersPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const orders = useSelector((state) => state.orders.items);

  const [search, setSearch] = useState("");
  const [marketplaceFilter, setMarketplaceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  // Dialog states
  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [selectedOrderForShip, setSelectedOrderForShip] = useState(null);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrderForDelete, setSelectedOrderForDelete] = useState(null);

  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);

  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // ── Filters ──────────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let result = filterByDateRange(orders, "orderDate", dateRange);
    return result.filter((ord) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        ord.id.toLowerCase().includes(q) ||
        (ord.marketplaceOrderNo &&
          ord.marketplaceOrderNo.toLowerCase().includes(q)) ||
        ord.sku.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.city.toLowerCase().includes(q) ||
        ord.productName.toLowerCase().includes(q);

      const matchesMarketplace =
        marketplaceFilter === "all" ||
        ord.marketplace.toLowerCase() === marketplaceFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" || ord.orderStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "all" || ord.paymentStatus === paymentFilter;

      return (
        matchesSearch && matchesMarketplace && matchesStatus && matchesPayment
      );
    });
  }, [
    orders,
    search,
    marketplaceFilter,
    statusFilter,
    paymentFilter,
    dateRange,
  ]);

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const summary = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.orderStatus === "Pending").length,
      processing: orders.filter((o) => o.orderStatus === "Processing").length,
      shipped: orders.filter((o) => o.orderStatus === "Shipped").length,
      delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
      returned: orders.filter((o) => o.orderStatus === "Returned").length,
      cancelled: orders.filter((o) => o.orderStatus === "Cancelled").length,
    }),
    [orders],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCreateOrder = (data) => dispatch(createOrder(data));
  const handleEditOrder = (data) => dispatch(editOrder(data));
  const handleConfirmDelete = () => {
    if (selectedOrderForDelete)
      dispatch(deleteOrder(selectedOrderForDelete.id));
  };
  const handleConfirmCancel = () => {
    if (selectedOrderForCancel)
      dispatch(
        cancelOrder({
          orderId: selectedOrderForCancel.id,
          reason: "Cancelled by seller",
        }),
      );
  };
  const handleConfirmReturn = (payload) => dispatch(markReturned(payload));
  const handleConfirmShip = (payload) => dispatch(markShipped(payload));

  const handleExport = () => {
    const data = filteredOrders.map((o) => ({
      OrderID: o.id,
      MarketplaceOrderNo: o.marketplaceOrderNo || "",
      Marketplace: o.marketplace,
      OrderDate: o.orderDate,
      CustomerName: o.customerName,
      City: o.city,
      State: o.state,
      Product: o.productName,
      SKU: o.sku,
      Quantity: o.quantity,
      Amount: o.totalAmount,
      PaymentStatus: o.paymentStatus,
      OrderStatus: o.orderStatus,
      ShipmentStatus: o.shipmentStatus,
      Courier: o.courier || "",
      AWB: o.awbNumber || "",
      SettlementStatus: o.settlementStatus || "",
    }));
    exportToCsv("SellerDesk_Orders", data);
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = [
    {
      key: "id",
      label: "Order ID",
      sortable: true,
      render: (val, row) => (
        <div>
          <Link
            href={`/orders/${val}`}
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition"
            onClick={(e) => e.stopPropagation()}
          >
            {val}
          </Link>
          <div className="text-[10px] text-slate-400 font-mono">
            {row.marketplaceOrderNo || "MANUAL"}
          </div>
          <div className="text-[10px] text-slate-500">
            {formatDateTime(row.orderDate)}
          </div>
        </div>
      ),
    },
    {
      key: "marketplace",
      label: "Channel",
      sortable: true,
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: "productName",
      label: "Product",
      sortable: true,
      render: (val, row) => (
        <div className="max-w-[200px]">
          <div
            className="font-semibold text-slate-800 dark:text-slate-200 truncate"
            title={val}
          >
            {val}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            SKU: {row.sku} × {row.quantity}
          </div>
        </div>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {val}
          </div>
          <div className="text-[11px] text-slate-500">
            {row.city}, {row.state}
          </div>
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "Amount",
      sortable: true,
      align: "right",
      render: (val, row) => (
        <div className="text-right">
          <div className="font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(val)}
          </div>
          <div className="text-[10px] text-slate-400">{row.paymentMethod}</div>
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
      key: "orderStatus",
      label: "Status",
      sortable: true,
      render: (val, row) => (
        <div className="space-y-1">
          <StatusChip status={val} />
          {row.courier && row.courier !== "Unassigned" && (
            <div className="text-[10px] text-slate-500">
              {row.courier} • <span className="font-mono">{row.awbNumber}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          {/* View */}
          <Tooltip title="View Details">
            <Link
              href={`/orders/${row.id}`}
              className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              onClick={(e) => e.stopPropagation()}
            >
              <VisibilityIcon sx={{ fontSize: 16 }} />
            </Link>
          </Tooltip>

          {/* Edit */}
          <Tooltip title="Edit Order">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditingOrder(row);
                setOrderFormOpen(true);
              }}
              className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </button>
          </Tooltip>

          {/* Pack */}
          {row.orderStatus === "Pending" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(markPacked(row.id));
              }}
              className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition"
            >
              Pack
            </button>
          )}

          {/* Ship */}
          {row.orderStatus === "Processing" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOrderForShip(row);
                setShipDialogOpen(true);
              }}
              className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition"
            >
              Ship
            </button>
          )}

          {/* Mark Return */}
          {(row.orderStatus === "Shipped" ||
            row.orderStatus === "Delivered") && (
            <Tooltip title="Mark as Returned">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOrderForReturn(row);
                  setReturnDialogOpen(true);
                }}
                className="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
              >
                <AssignmentReturnIcon sx={{ fontSize: 16 }} />
              </button>
            </Tooltip>
          )}

          {/* Cancel */}
          {(row.orderStatus === "Pending" ||
            row.orderStatus === "Processing") && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOrderForCancel(row);
                setCancelDialogOpen(true);
              }}
              className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition"
            >
              Cancel
            </button>
          )}

          {/* Delete */}
          <Tooltip title="Delete Order">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOrderForDelete(row);
                setDeleteDialogOpen(true);
              }}
              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            >
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title=" Orders Management (Customer)"
        subtitle="Create, process, track and manage all customer's orders from Meesho and Flipkart."
        breadcrumbs={[{ label: "Orders" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              sx={{ borderColor: "var(--btn-neutral-border)", color: "var(--btn-neutral-text)" }}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingOrder(null);
                setOrderFormOpen(true);
              }}
            >
              New Order
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          {
            title: "Total",
            value: summary.total,
            icon: ShoppingBagIcon,
            color: "blue",
          },
          {
            title: "Pending",
            value: summary.pending,
            icon: HourglassTopIcon,
            color: "amber",
          },
          {
            title: "Processing",
            value: summary.processing,
            icon: InventoryIcon,
            color: "purple",
          },
          {
            title: "Shipped",
            value: summary.shipped,
            icon: LocalShippingIcon,
            color: "blue",
          },
          {
            title: "Delivered",
            value: summary.delivered,
            icon: CheckCircleOutlineIcon,
            color: "emerald",
          },
          {
            title: "Returned",
            value: summary.returned,
            icon: AssignmentReturnIcon,
            color: "amber",
          },
          {
            title: "Cancelled",
            value: summary.cancelled,
            icon: CancelOutlinedIcon,
            color: "rose",
          },
        ].map((c) => (
          <StatCard
            key={c.title}
            title={c.title}
            value={c.value}
            icon={c.icon}
            color={c.color}
          />
        ))}
      </div>

      {/* Filters */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order, customer, SKU, city..."
        filters={[
          {
            value: marketplaceFilter,
            onChange: setMarketplaceFilter,
            options: [
              { label: "All Channels", value: "all" },
              { label: "Meesho", value: "meesho" },
              { label: "Flipkart", value: "flipkart" },
              { label: "Manual / Direct", value: "manual / direct" },
            ],
          },
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All Statuses", value: "all" },
              { label: "Pending", value: "Pending" },
              { label: "Processing", value: "Processing" },
              { label: "Shipped", value: "Shipped" },
              { label: "Delivered", value: "Delivered" },
              { label: "Returned", value: "Returned" },
              { label: "Cancelled", value: "Cancelled" },
            ],
          },
          {
            value: paymentFilter,
            onChange: setPaymentFilter,
            options: [
              { label: "All Payments", value: "all" },
              { label: "Paid", value: "Paid" },
              { label: "Pending", value: "Pending" },
              { label: "Refunded", value: "Refunded" },
            ],
          },
          {
            value: dateRange,
            onChange: setDateRange,
            options: [
              { label: "All Dates", value: "all" },
              { label: "Today", value: "today" },
              { label: "Last 7 Days", value: "7days" },
              { label: "Last 30 Days", value: "30days" },
              { label: "This Month", value: "thisMonth" },
            ],
          },
        ]}
        onReset={() => {
          setSearch("");
          setMarketplaceFilter("all");
          setStatusFilter("all");
          setPaymentFilter("all");
          setDateRange("all");
        }}
      >
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          <strong>{filteredOrders.length}</strong> / {orders.length} orders
        </span>
        <CardViewToggle value={viewMode} onChange={setViewMode} />
      </FilterBar>

      {viewMode === "table" ? (
        <DataTable
          columns={columns}
          data={filteredOrders}
          keyField="id"
          initialSortKey="id"
          initialSortDir="desc"
          defaultRowsPerPage={10}
          emptyMessage="No orders found."
          onRowClick={(row) => router.push(`/orders/${row.id}`)}
        />
      ) : (
        <RecordCardView
          items={filteredOrders}
          columns={columns}
          fields={["marketplace", "productName", "customerName", "totalAmount", "paymentStatus", "orderStatus"]}
          title={(order) => order.id}
          subtitle={(order) => `${order.marketplaceOrderNo || "Manual"} · ${order.customerName}`}
          onCardClick={(order) => router.push(`/orders/${order.id}`)}
          emptyMessage="No orders found."
        />
      )}

      {/* ── Dialogs ── */}
      <OrderFormDialog
        open={orderFormOpen}
        initialData={editingOrder}
        onClose={() => setOrderFormOpen(false)}
        onSubmit={editingOrder ? handleEditOrder : handleCreateOrder}
      />

      <ShipOrderDialog
        open={shipDialogOpen}
        order={selectedOrderForShip}
        onClose={() => setShipDialogOpen(false)}
        onConfirm={handleConfirmShip}
      />

      <MarkReturnDialog
        open={returnDialogOpen}
        order={selectedOrderForReturn}
        onClose={() => setReturnDialogOpen(false)}
        onConfirm={handleConfirmReturn}
      />

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Cancel Order?"
        message={`Cancel order ${selectedOrderForCancel?.id}? Payment will be marked as refunded.`}
        confirmLabel="Cancel Order"
        confirmColor="error"
        onConfirm={handleConfirmCancel}
        onClose={() => setCancelDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Order Permanently?"
        message={`Delete ${selectedOrderForDelete?.id} (${selectedOrderForDelete?.customerName})? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
