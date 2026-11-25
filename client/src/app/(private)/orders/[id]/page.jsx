"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductImage from "@/components/common/ProductImage";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "@/components/common/ToastProvider";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ShipOrderDialog from "@/features/orders/ShipOrderDialog";
import OrderFormDialog from "@/features/orders/OrderFormDialog";
import MarkReturnDialog from "@/features/orders/MarkReturnDialog";
import { setOrderStatus, editOrder, deleteOrder } from "@/store/slices/ordersSlice";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";

// MUI
import Button from "@/components/common/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CheckIcon from "@mui/icons-material/Check";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";

// Fulfilment flow: index of the step each status has reached.
const STEPS = [
  { key: "placed", label: "Placed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_STEP = {
  Pending: 0,
  Processing: 1,
  Shipped: 2,
  Delivered: 3,
  Returned: 3,
};

// Options for the status dropdown. Any status can be picked, so a wrong
// click is undone by choosing the previous status again.
const STATUS_OPTIONS = [
  { value: "Pending", hint: "Awaiting packing", dot: "bg-slate-400" },
  { value: "Processing", hint: "Packed, ready for pickup", dot: "bg-amber-500" },
  { value: "Shipped", hint: "Handed to courier", dot: "bg-blue-500" },
  { value: "Delivered", hint: "Received by customer", dot: "bg-emerald-500" },
  { divider: true },
  { value: "Cancelled", hint: "Stop this order", dot: "bg-rose-500" },
  { value: "Returned", hint: "Came back from customer", dot: "bg-amber-600" },
];

const TERMINAL = {
  Cancelled: {
    title: "Order cancelled",
    tone: "rose",
    icon: BlockOutlinedIcon,
  },
  Returned: {
    title: "Order returned",
    tone: "amber",
    icon: AssignmentReturnOutlinedIcon,
  },
};

function Card({ title, icon: Icon, aside, children, className = "" }) {
  return (
    <section className={`bg-white rounded-2xl border border-slate-200 ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            {Icon && <Icon sx={{ fontSize: 18 }} className="text-slate-400" />}
            {title}
          </h3>
          {aside}
        </header>
      )}
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium text-slate-900 text-right ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();
  const orders = useSelector((state) => state.orders.items);
  const products = useSelector((state) => state.products.items);

  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [statusAnchor, setStatusAnchor] = useState(null);

  const order = orders.find((o) => o.id === params.id);
  const product = products.find((p) => p.id === order?.productId);

  if (!order) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Order not found</h2>
        <p className="text-sm text-slate-500 mt-1">
          No order found with ID &quot;{params.id}&quot;.
        </p>
        <Button
          component={Link}
          href="/orders"
          variant="outline"
          tone="neutral"
          startIcon={<ArrowBackIcon />}
          className="!mt-5"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  const status = order.orderStatus;
  const terminal = TERMINAL[status];
  const currentStep = STATUS_STEP[status] ?? 0;
  const statusDot = STATUS_OPTIONS.find((o) => o.value === status)?.dot || "bg-slate-400";

  const fee = order.marketplaceFee || 0;
  const shippingFee = order.shippingFeeCharged || 65;
  const payout = order.sellerSettlement || order.totalAmount - fee - shippingFee;

  const applyStatus = (orderStatus, extra = {}) => {
    dispatch(setOrderStatus({ orderId: order.id, orderStatus, ...extra }));
    toast.success(`Status changed to ${orderStatus}`);
  };

  // Statuses that need more details open their dialog first.
  const handleStatusChange = (next) => {
    setStatusAnchor(null);
    if (next === status) return;
    const hasCourier = order.courier && order.courier !== "Unassigned" && order.awbNumber;
    if (next === "Shipped" && !hasCourier) return setShipDialogOpen(true);
    if (next === "Cancelled") return setCancelDialogOpen(true);
    if (next === "Returned") return setReturnOpen(true);
    applyStatus(next);
  };

  const handleDelete = () => {
    dispatch(deleteOrder(order.id));
    toast.success(`Order ${order.id} deleted`);
    router.push("/orders");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  // The single next action for the current status, shown as the primary CTA.
  const nextAction = {
    Pending: {
      label: "Mark as Packed",
      hint: "Pack the item and generate the manifest.",
      icon: <Inventory2OutlinedIcon />,
      onClick: () => applyStatus("Processing"),
    },
    Processing: {
      label: "Dispatch Shipment",
      hint: "Hand over to a courier and add the AWB number.",
      icon: <LocalShippingOutlinedIcon />,
      onClick: () => setShipDialogOpen(true),
    },
    Shipped: {
      label: "Mark as Delivered",
      hint: `In transit with ${order.courier || "courier"}.`,
      icon: <TaskAltIcon />,
      onClick: () => applyStatus("Delivered"),
    },
  }[status];

  const stepCaption = (idx) => {
    if (idx === 0) return formatDate(order.orderDate, "DD MMM");
    if (idx === 2 && currentStep >= 2) return order.courier || "Courier";
    if (idx === 3 && status === "Delivered") return "Completed";
    return idx <= currentStep ? "Done" : "";
  };

  const closeMenu = () => setMenuAnchor(null);
  const fromMenu = (fn) => () => {
    closeMenu();
    fn();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Order ${order.id}`}
        subtitle={`${order.marketplace} · ${order.marketplaceOrderNo || "No channel order no."}`}
        breadcrumbs={[{ label: "Orders", href: "/orders" }, { label: order.id }]}
        actions={
          <div className="flex items-center gap-2">
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
              startIcon={<MoreHorizIcon />}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              aria-haspopup="menu"
              aria-expanded={Boolean(menuAnchor)}
            >
              More
            </Button>
          </div>
        }
      />

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        PaperProps={{ sx: { width: 210, mt: 0.5 } }}
      >
        <MenuItem onClick={fromMenu(() => setEditOpen(true))}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          <span className="text-xs">Edit order</span>
        </MenuItem>
        <MenuItem onClick={fromMenu(handlePrint)}>
          <ListItemIcon><PrintOutlinedIcon fontSize="small" /></ListItemIcon>
          <span className="text-xs">Print</span>
        </MenuItem>
        <Divider />
        <MenuItem onClick={fromMenu(() => setDeleteOpen(true))} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "inherit" }}><DeleteOutlineIcon fontSize="small" /></ListItemIcon>
          <span className="text-xs">Delete order</span>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={statusAnchor}
        open={Boolean(statusAnchor)}
        onClose={() => setStatusAnchor(null)}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        PaperProps={{ sx: { width: 240, mt: 0.5 } }}
        MenuListProps={{ role: "listbox", "aria-label": "Order status" }}
      >
        {STATUS_OPTIONS.map((opt, i) =>
          opt.divider ? (
            <Divider key={`d${i}`} />
          ) : (
            <MenuItem
              key={opt.value}
              role="option"
              aria-selected={opt.value === status}
              selected={opt.value === status}
              onClick={() => handleStatusChange(opt.value)}
            >
              <span className={`w-2 h-2 rounded-full mr-3 shrink-0 ${opt.dot}`} />
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-semibold text-slate-900">{opt.value}</span>
                <span className="block text-[11px] text-slate-500">{opt.hint}</span>
              </span>
              {opt.value === status && (
                <CheckIcon sx={{ fontSize: 16 }} className="text-emerald-600 ml-2" />
              )}
            </MenuItem>
          )
        )}
      </Menu>

      {/* Status tracker */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
          <button
            type="button"
            onClick={(e) => setStatusAnchor(e.currentTarget)}
            aria-haspopup="listbox"
            aria-expanded={Boolean(statusAnchor)}
            className="inline-flex items-center gap-2 h-8 pl-3 pr-2 rounded-lg border border-slate-200 bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <span className="text-slate-500">Status</span>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
            <span className="font-semibold text-slate-900">{status}</span>
            <KeyboardArrowDownIcon
              sx={{ fontSize: 18 }}
              className={`text-slate-400 transition-transform ${statusAnchor ? "rotate-180" : ""}`}
            />
          </button>
          <StatusChip status={order.marketplace} />
          <StatusChip status={order.paymentStatus} />
          <span className="sm:ml-auto text-slate-500">
            Placed {formatDateTime(order.orderDate)}
          </span>
        </div>

        {terminal ? (
          <div
            className={`mt-5 flex items-start gap-3 rounded-xl border p-4 ${
              terminal.tone === "rose"
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            <terminal.icon sx={{ fontSize: 20 }} className="mt-0.5" />
            <div>
              <div className="text-sm font-semibold">{terminal.title}</div>
              <div className="text-xs opacity-80 mt-0.5">
                {status === "Cancelled"
                  ? order.cancellationReason || "Cancelled by seller"
                  : order.returnReason || "Returned by customer"}
              </div>
              <div className="text-[11px] opacity-70 mt-1.5">
                Changed by mistake? Pick another status from the Status menu above.
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Stepper */}
            {/* Each step is a centred column, so labels never overflow the card. */}
            <ol className="relative grid grid-cols-4 flex-1 min-w-0">
              <span
                aria-hidden="true"
                className="absolute left-[12.5%] right-[12.5%] top-[13px] h-0.5 rounded-full bg-slate-200"
              />
              <span
                aria-hidden="true"
                className="absolute left-[12.5%] top-[13px] h-0.5 rounded-full bg-emerald-600 transition-[width] duration-500"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 75}%` }}
              />
              {STEPS.map((step, idx) => {
                const done = idx <= currentStep;
                const active = idx === currentStep + 1;
                return (
                  <li
                    key={step.key}
                    className="relative flex flex-col items-center text-center min-w-0 px-1"
                    aria-current={active ? "step" : undefined}
                  >
                    <span
                      className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-semibold shrink-0 ring-4 ring-white transition-colors ${
                        done
                          ? "bg-emerald-600 text-white"
                          : active
                            ? "bg-white border-2 border-emerald-600 text-emerald-700"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {done ? <CheckIcon sx={{ fontSize: 15 }} /> : idx + 1}
                    </span>
                    <span
                      className={`mt-2 text-[11px] sm:text-xs font-semibold leading-tight ${
                        done || active ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="mt-0.5 w-full text-[10px] sm:text-[11px] text-slate-500 truncate min-h-[15px]">
                      {stepCaption(idx)}
                    </span>
                  </li>
                );
              })}
            </ol>

            {/* Next action */}
            {nextAction ? (
              <div className="lg:w-72 shrink-0 rounded-xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-[11px] uppercase tracking-wide font-semibold text-slate-500">
                  Next step
                </div>
                <p className="text-xs text-slate-600 mt-1 mb-3">{nextAction.hint}</p>
                <Button
                  fullWidth
                  size="medium"
                  startIcon={nextAction.icon}
                  onClick={nextAction.onClick}
                >
                  {nextAction.label}
                </Button>
              </div>
            ) : (
              <div className="lg:w-72 shrink-0 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-700">
                <TaskAltIcon />
                <div className="text-xs">
                  <div className="font-semibold text-sm">Fulfilment complete</div>
                  Delivered to the customer.
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Item */}
          <Card
            title="Item"
            icon={Inventory2OutlinedIcon}
            aside={<span className="text-xs text-slate-500">Qty {order.quantity}</span>}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <ProductImage
                  src={product?.image}
                  alt=""
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 text-sm truncate">
                  {order.productName}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">{order.sku}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {order.quantity} × {formatCurrency(order.unitPrice)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-900 text-base">
                  {formatCurrency(order.totalAmount)}
                </div>
                <div className="text-[11px] text-slate-500">{order.paymentMethod}</div>
              </div>
            </div>
          </Card>

          {/* Settlement */}
          <Card
            title="Settlement"
            icon={ReceiptLongOutlinedIcon}
            aside={<StatusChip status={order.settlementStatus || "Pending"} />}
          >
            <div className="divide-y divide-slate-100">
              <InfoRow label="Order value" value={formatCurrency(order.totalAmount)} />
              <InfoRow
                label={`${order.marketplace} commission & fees`}
                value={<span className="text-rose-600">−{formatCurrency(fee)}</span>}
              />
              <InfoRow
                label="Shipping charges"
                value={<span className="text-rose-600">−{formatCurrency(shippingFee)}</span>}
              />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
              <span className="text-xs font-medium text-emerald-700">Expected payout</span>
              <span className="text-lg font-semibold text-emerald-700">
                {formatCurrency(payout)}
              </span>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          {/* Customer */}
          <Card title="Customer" icon={PersonOutlineIcon}>
            <div className="text-sm font-semibold text-slate-900">{order.customerName}</div>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <PhoneOutlinedIcon sx={{ fontSize: 15 }} className="text-slate-400" />
                {order.customerPhone || "+91 98765 00000"}
              </div>
              <div className="flex items-start gap-2">
                <PlaceOutlinedIcon sx={{ fontSize: 15 }} className="text-slate-400 mt-px" />
                <span>
                  {order.city}, {order.state} {order.pincode}
                </span>
              </div>
            </div>
          </Card>

          {/* Shipment */}
          <Card title="Shipment" icon={LocalShippingOutlinedIcon}>
            <div className="divide-y divide-slate-100">
              <InfoRow label="Status" value={<StatusChip status={order.shipmentStatus} />} />
              <InfoRow label="Courier" value={order.courier || "Not assigned"} />
              <InfoRow label="AWB" value={order.awbNumber || "Not generated"} mono />
              <InfoRow label="Est. delivery" value="3-5 business days" />
            </div>
          </Card>
        </div>
      </div>

      <ShipOrderDialog
        open={shipDialogOpen}
        order={order}
        onClose={() => setShipDialogOpen(false)}
        onConfirm={(payload) => {
          applyStatus("Shipped", { courier: payload.courier, awbNumber: payload.awbNumber });
        }}
      />

      <OrderFormDialog
        open={editOpen}
        initialData={order}
        onClose={() => setEditOpen(false)}
        onSubmit={(data) => {
          dispatch(editOrder(data));
          toast.success("Order updated");
        }}
      />

      <MarkReturnDialog
        open={returnOpen}
        order={order}
        onClose={() => setReturnOpen(false)}
        onConfirm={(payload) => {
          applyStatus("Returned", { reason: payload.returnReason });
        }}
      />

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Cancel this order?"
        message="The order will be cancelled and a paid order will be marked as Refunded."
        confirmLabel="Cancel Order"
        confirmColor="error"
        onConfirm={() => {
          applyStatus("Cancelled", { reason: "Cancelled by seller" });
        }}
        onClose={() => setCancelDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete order permanently?"
        message={`Delete order ${order.id} for ${order.customerName}? This cannot be undone.`}
        confirmLabel="Delete Order"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
