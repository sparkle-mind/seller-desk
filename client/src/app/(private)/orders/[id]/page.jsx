"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductImage from "@/components/common/ProductImage";
import { useSelector, useDispatch } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ShipOrderDialog from "@/features/orders/ShipOrderDialog";
import OrderFormDialog from "@/features/orders/OrderFormDialog";
import MarkReturnDialog from "@/features/orders/MarkReturnDialog";
import {
  markPacked,
  markShipped,
  updateOrderStatus,
  cancelOrder,
  editOrder,
  deleteOrder,
  markReturned,
} from "@/store/slices/ordersSlice";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

// MUI
import Button from "@/components/common/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PrintIcon from "@mui/icons-material/Print";
import ReceiptIcon from "@mui/icons-material/Receipt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.items);
  const products = useSelector((state) => state.products.items);

  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  const order = orders.find((o) => o.id === params.id);
  const product = products.find((p) => p.id === order?.productId);

  if (!order) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Order Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">
          No order found with ID &quot;{params.id}&quot;.
        </p>
        <Link
          href="/orders"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  const handleMarkDelivered = () => {
    dispatch(updateOrderStatus({ orderId: order.id, orderStatus: "Delivered", shipmentStatus: "Delivered", paymentStatus: "Paid" }));
  };

  const handleDelete = () => {
    dispatch(deleteOrder(order.id));
    router.push("/orders");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  // Timeline events calculation
  const timelineSteps = [
    { title: "Order Placed", time: formatDateTime(order.orderDate), done: true },
    {
      title: "Packed & Manifested",
      time: order.orderStatus !== "Pending" ? "Completed" : "Pending",
      done: order.orderStatus !== "Pending" && order.orderStatus !== "Cancelled",
    },
    {
      title: "Shipped with Courier",
      time:
        order.orderStatus === "Shipped" || order.orderStatus === "Delivered"
          ? `${order.courier || "Courier"} (${order.awbNumber || "AWB generated"})`
          : "Pending dispatch",
      done: order.orderStatus === "Shipped" || order.orderStatus === "Delivered",
    },
    {
      title: "Delivered to Customer",
      time: order.orderStatus === "Delivered" ? "Delivered successfully" : "Pending delivery",
      done: order.orderStatus === "Delivered",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order ${order.id}`}
        subtitle={`Channel: ${order.marketplace} | Channel Order No: ${order.marketplaceOrderNo || "N/A"}`}
        breadcrumbs={[
          { label: "Orders", href: "/orders" },
          { label: order.id },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              tone="neutral"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/orders")}
            >
              Back
            </Button>

            <Button
              variant="outline"
              tone="neutral"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print
            </Button>

            {/* Edit always available */}
            <Button
              variant="outline"
              tone="info"
              startIcon={<EditIcon />}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>

            {order.orderStatus === "Pending" && (
              <Button onClick={() => dispatch(markPacked(order.id))}>
                Mark as Packed
              </Button>
            )}

            {order.orderStatus === "Processing" && (
              <Button
                startIcon={<LocalShippingIcon />}
                onClick={() => setShipDialogOpen(true)}
              >
                Dispatch Shipment
              </Button>
            )}

            {order.orderStatus === "Shipped" && (
              <Button
                tone="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleMarkDelivered}
              >
                Mark as Delivered
              </Button>
            )}

            {(order.orderStatus === "Shipped" || order.orderStatus === "Delivered") && (
              <Button
                variant="outline"
                tone="warning"
                startIcon={<AssignmentReturnIcon />}
                onClick={() => setReturnOpen(true)}
              >
                Mark Returned
              </Button>
            )}

            {(order.orderStatus === "Pending" || order.orderStatus === "Processing") && (
              <Button
                variant="outline"
                tone="danger"
                onClick={() => setCancelDialogOpen(true)}
              >
                Cancel Order
              </Button>
            )}

            {/* Delete — always available */}
            <Button
              variant="outline"
              tone="danger"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      {/* Top Banner Status */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StatusChip status={order.marketplace} />
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Order Status:</span>
            <StatusChip status={order.orderStatus} />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Payment:</span>
            <StatusChip status={order.paymentStatus} />
          </div>
        </div>
        <div className="text-xs text-slate-500">
          Placed on: <strong className="text-slate-800">{formatDateTime(order.orderDate)}</strong>
        </div>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items & Settlement details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Purchased Item Details
              </h3>
              <span className="text-xs text-slate-500">
                Total Quantity: {order.quantity}
              </span>
            </div>

            <div className="p-4 flex items-center gap-4">
              <ProductImage
                src={product?.image}
                alt={order.productName}
                width={64}
                height={64}
                className="w-16 h-16 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 text-sm truncate">
                  {order.productName}
                </h4>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Internal SKU: {order.sku}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Qty: <strong>{order.quantity}</strong> × {formatCurrency(order.unitPrice)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 text-base">
                  {formatCurrency(order.totalAmount)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {order.paymentMethod}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Settlement & Deductions Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              <ReceiptIcon className="text-blue-600" />
              <span>Marketplace Accounting & Net Settlement Breakdown</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Gross Buyer Price (Subtotal):</span>
                <span className="font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                <span>
                  Marketplace Commission & Platform Fee ({order.marketplace}):
                </span>
                <span>-{formatCurrency(order.marketplaceFee || 0)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                <span>Logistics & Shipping Freight Deduction:</span>
                <span>-{formatCurrency(order.shippingFeeCharged || 65)}</span>
              </div>

              <div className="flex justify-between py-2 border-t-2 border-slate-200 text-sm font-bold">
                <span className="text-emerald-800">Net Expected Seller Settlement Payout:</span>
                <span className="text-emerald-700">
                  {formatCurrency(order.sellerSettlement || (order.totalAmount - (order.marketplaceFee || 0) - (order.shippingFeeCharged || 65)))}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>Settlement Status:</span>
                <StatusChip status={order.settlementStatus || "Pending"} />
              </div>
            </div>
          </div>

          {/* Delivery & Tracking Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <LocalShippingIcon className="text-blue-600" />
              <span>Shipment & Logistics Information</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-400">Assigned Courier</div>
                <div className="font-bold text-slate-800 mt-0.5">{order.courier || "Unassigned"}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-400">AWB Tracking #</div>
                <div className="font-bold font-mono text-slate-800 mt-0.5">{order.awbNumber || "Pending"}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-400">Shipment Status</div>
                <div className="font-bold text-slate-800 mt-0.5">{order.shipmentStatus}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-400">Estimated Delivery</div>
                <div className="font-bold text-slate-800 mt-0.5">3-5 Business Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer Details & Timeline */}
        <div className="space-y-6">
          {/* Customer & Address Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              <PersonIcon className="text-slate-600" />
              <span>Customer Details</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="text-slate-400">Customer Name:</div>
                <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
              </div>
              <div>
                <div className="text-slate-400">Contact Phone:</div>
                <div className="font-medium text-slate-700">{order.customerPhone || "+91 98765 00000"}</div>
              </div>
              <div>
                <div className="text-slate-400">Delivery Address:</div>
                <div className="font-medium text-slate-800 mt-0.5">
                  {order.city}, {order.state} - {order.pincode}
                </div>
              </div>
            </div>
          </div>

          {/* Fulfillment Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Fulfillment Timeline
            </h3>

            <div className="space-y-4 relative pl-4 border-l-2 border-slate-200">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  <span
                    className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      step.done ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                  <div className="text-xs font-bold text-slate-800">{step.title}</div>
                  <div className="text-[11px] text-slate-500">{step.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ship Order Dialog */}
      <ShipOrderDialog
        open={shipDialogOpen}
        order={order}
        onClose={() => setShipDialogOpen(false)}
        onConfirm={(payload) => dispatch(markShipped(payload))}
      />

      {/* Edit Order Dialog */}
      <OrderFormDialog
        open={editOpen}
        initialData={order}
        onClose={() => setEditOpen(false)}
        onSubmit={(data) => dispatch(editOrder(data))}
      />

      {/* Mark Returned Dialog */}
      <MarkReturnDialog
        open={returnOpen}
        order={order}
        onClose={() => setReturnOpen(false)}
        onConfirm={(payload) => dispatch(markReturned(payload))}
      />

      {/* Cancel Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order? Payment status will be updated to Refunded."
        confirmLabel="Cancel Order"
        confirmColor="error"
        onConfirm={() => dispatch(cancelOrder({ orderId: order.id, reason: "Cancelled by seller" }))}
        onClose={() => setCancelDialogOpen(false)}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Order Permanently?"
        message={`Delete order ${order.id} for ${order.customerName}? This action cannot be undone.`}
        confirmLabel="Delete Order"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}

