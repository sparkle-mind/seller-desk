"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "@/components/common/ToastProvider";
import StatusChip from "@/components/common/StatusChip";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import SupplierFormDialog from "@/features/suppliers-purchases/SupplierFormDialog";
import CreatePurchaseOrderDialog from "@/features/suppliers-purchases/CreatePurchaseOrderDialog";
import EditPurchaseOrderDialog from "@/features/suppliers-purchases/EditPurchaseOrderDialog";
import {
  updateSupplier,
  deleteSupplier,
  addPurchaseOrder,
  updatePurchaseOrder,
  receivePO,
  recordPayment,
  cancelPurchaseOrder,
} from "@/store/slices/suppliersPurchasesSlice";
import { adjustStock } from "@/store/slices/productsSlice";
import { addMovement } from "@/store/slices/inventorySlice";
import { formatCurrency, formatDate } from "@/lib/formatters";

// MUI
import Button from "@/components/common/Button";
import IconButton from "@/components/common/IconButton";
import Modal from "@/components/common/Modal";
import TextField from "@mui/material/TextField";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PaymentsIcon from "@mui/icons-material/Payments";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import CancelIcon from "@mui/icons-material/Cancel";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PhoneIcon from "@mui/icons-material/Phone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ScheduleIcon from "@mui/icons-material/Schedule";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

/* ────────────────────────── helpers ────────────────────────── */

const card = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-card)",
};

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const isOpenPo = (po) => po.status !== "Received" && po.status !== "Cancelled";

const PO_FILTERS = [
  { key: "all", label: "All", match: () => true },
  { key: "open", label: "Open", match: isOpenPo },
  { key: "received", label: "Received", match: (po) => po.status === "Received" },
  { key: "cancelled", label: "Cancelled", match: (po) => po.status === "Cancelled" },
];

/* ────────────────────────── building blocks ────────────────────────── */

function Panel({ title, icon: Icon, aside, children, className = "", bodyClassName = "p-5" }) {
  return (
    <section className={`rounded-2xl overflow-hidden ${className}`} style={card}>
      <header
        className="flex items-center justify-between gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand-text)" }}
            >
              <Icon sx={{ fontSize: 18 }} />
            </span>
          )}
          <h2 className="font-display text-base font-bold truncate" style={{ color: "var(--text-primary)" }}>
            {title}
          </h2>
        </div>
        {aside}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

function DetailItem({ icon: Icon, label, children, action }) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: "var(--bg-surface2)", color: "var(--text-tertiary)" }}
      >
        <Icon sx={{ fontSize: 17 }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          {label}
        </div>
        <div className="mt-0.5 text-sm font-semibold break-words" style={{ color: "var(--text-primary)" }}>
          {children}
        </div>
      </div>
      {action}
    </div>
  );
}

function MetaPill({ icon: Icon, children }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: "var(--bg-surface2)",
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
      }}
    >
      {Icon && <Icon sx={{ fontSize: 14 }} />}
      {children}
    </span>
  );
}

function ProgressBar({ value, tone = "emerald", height = "h-2" }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full overflow-hidden rounded-full ${height}`} style={{ backgroundColor: "var(--bg-surface3)" }}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${tone === "amber" ? "bg-amber-500" : "bg-emerald-500"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ────────────────────────── page ────────────────────────── */

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();

  const { suppliers, purchases } = useSelector((state) => state.suppliersPurchases);
  const products = useSelector((state) => state.products.items);

  const supplier = suppliers.find((s) => s.id === params.id);
  const supplierPOs = useMemo(
    () =>
      purchases
        .filter((p) => p.supplierId === params.id)
        .slice()
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)),
    [purchases, params.id]
  );

  // Dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createPoOpen, setCreatePoOpen] = useState(false);
  const [editPoOpen, setEditPoOpen] = useState(false);
  const [editingPo, setEditingPo] = useState(null);

  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [selectedPoForReceive, setSelectedPoForReceive] = useState(null);

  const [cancelPoOpen, setCancelPoOpen] = useState(false);
  const [cancellingPo, setCancellingPo] = useState(null);

  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedPoForPay, setSelectedPoForPay] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  const [poFilter, setPoFilter] = useState("all");

  if (!supplier) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl p-8 text-center" style={card}>
          <span
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand-text)" }}
          >
            <StorefrontOutlinedIcon sx={{ fontSize: 28 }} />
          </span>
          <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Supplier not found
          </h2>
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            No supplier exists with ID &quot;{params.id}&quot;. It may have been deleted.
          </p>
          <div className="mt-6">
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/suppliers-purchases")}>
              Back to suppliers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handlers
  const handleEditSubmit = (data) => {
    dispatch(updateSupplier({ id: supplier.id, ...data }));
    toast.success("Supplier updated");
  };

  const handleDelete = () => {
    dispatch(deleteSupplier(supplier.id));
    toast.success(`Supplier "${supplier.name}" deleted`);
    router.push("/suppliers-purchases");
  };

  const handleCreatePo = (payload) => {
    dispatch(addPurchaseOrder({ ...payload, supplierId: supplier.id, supplierName: supplier.name }));
    toast.success("Purchase order created");
  };

  const handleEditPoSubmit = (payload) => {
    dispatch(updatePurchaseOrder(payload));
    toast.success("Purchase order updated");
  };

  const handleConfirmReceivePo = () => {
    if (!selectedPoForReceive) return;
    dispatch(receivePO({ poId: selectedPoForReceive.id, receivedDate: new Date().toISOString().split("T")[0] }));

    selectedPoForReceive.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
      if (prod) {
        const newStock = prod.stock + item.quantity;
        dispatch(adjustStock({ productId: prod.id, newStock }));
        dispatch(
          addMovement({
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            type: "Stock In",
            quantity: item.quantity,
            previousStock: prod.stock,
            newStock,
            reason: `Goods receipt from PO: ${selectedPoForReceive.poNumber}`,
            referenceId: selectedPoForReceive.poNumber,
          })
        );
      }
    });
    toast.success(`${selectedPoForReceive.poNumber} received. Stock updated.`);
    setReceiveDialogOpen(false);
  };

  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!selectedPoForPay || !payAmount || Number(payAmount) <= 0) return;
    dispatch(recordPayment({ poId: selectedPoForPay.id, amount: Number(payAmount) }));
    toast.success(`Payment of ₹${Number(payAmount).toLocaleString("en-IN")} recorded`);
    setPayDialogOpen(false);
  };

  const handleCancelPo = () => {
    if (!cancellingPo) return;
    dispatch(cancelPurchaseOrder({ poId: cancellingPo.id, reason: "Cancelled by seller" }));
    toast.success(`${cancellingPo.poNumber || cancellingPo.id} cancelled`);
    setCancelPoOpen(false);
  };

  const copyToClipboard = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Couldn't copy ${label.toLowerCase()}`);
    }
  };

  // Summary
  const activePOs = supplierPOs.filter((p) => p.status !== "Cancelled");
  const totalPoValue = activePOs.reduce((s, p) => s + (p.totalAmount || 0), 0);
  const totalPaid = activePOs.reduce((s, p) => s + (p.paidAmount || 0), 0);
  const paidPct = totalPoValue > 0 ? (totalPaid / totalPoValue) * 100 : 0;
  const outstanding = supplier.outstandingBalance || 0;
  const unitsSourced = supplierPOs
    .filter((p) => p.status === "Received")
    .reduce((s, p) => s + p.items.reduce((q, i) => q + i.quantity, 0), 0);
  const lastOrder = supplierPOs[0];

  const filterCounts = Object.fromEntries(
    PO_FILTERS.map((f) => [f.key, supplierPOs.filter(f.match).length])
  );
  const activeFilter = PO_FILTERS.find((f) => f.key === poFilter) || PO_FILTERS[0];
  const visiblePOs = supplierPOs.filter(activeFilter.match);

  const location = [supplier.city, supplier.state].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm"
        style={{ color: "var(--text-tertiary)" }}
      >
        <Link
          href="/suppliers-purchases"
          className="inline-flex items-center gap-1.5 rounded-lg py-1 pr-2 font-medium transition hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          Suppliers &amp; Purchases
        </Link>
        <ChevronRightIcon sx={{ fontSize: 16 }} style={{ color: "var(--breadcrumb-sep)" }} />
        <span className="truncate font-medium" style={{ color: "var(--text-primary)" }}>
          {supplier.name}
        </span>
      </nav>

      {/* ── Hero ── */}
      <section className="sd-rise-in relative overflow-hidden rounded-2xl p-5 sm:p-7" style={card}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: "var(--brand-soft)" }}
        />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-4 sm:gap-5">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold sm:h-16 sm:w-16 sm:text-xl"
              style={{
                background: "linear-gradient(135deg, var(--brand-500, var(--brand)), var(--brand-700, var(--brand)))",
                backgroundColor: "var(--brand)",
                color: "var(--brand-contrast)",
                boxShadow: "0 0 0 6px var(--bg-surface2)",
              }}
            >
              {initials(supplier.name)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="sd-page-title text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  {supplier.name}
                </h1>
                <StatusChip status={supplier.status} />
              </div>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {supplier.company}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <MetaPill icon={StorefrontOutlinedIcon}>{supplier.id}</MetaPill>
                {location && <MetaPill icon={LocationOnIcon}>{location}</MetaPill>}
                {supplier.paymentTerms && <MetaPill icon={ScheduleIcon}>{supplier.paymentTerms}</MetaPill>}
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ border: "1px dashed var(--border-strong)", color: "var(--text-tertiary)" }}
                >
                  Demo Data
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <Button startIcon={<PostAddIcon />} onClick={() => setCreatePoOpen(true)}>
              New Purchase Order
            </Button>
            <Button variant="outline" tone="neutral" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <IconButton label="Delete supplier" tone="danger" size="md" onClick={() => setDeleteOpen(true)}>
              <DeleteOutlineIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </div>
        </div>

        {/* Quick contact strip */}
        <div
          className="relative mt-6 grid grid-cols-1 gap-2 pt-5 sm:grid-cols-3"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          {[
            supplier.phone && {
              icon: PhoneIcon,
              label: "Call",
              value: supplier.phone,
              href: `tel:${supplier.phone.replace(/\s+/g, "")}`,
            },
            supplier.email && {
              icon: MailOutlineIcon,
              label: "Email",
              value: supplier.email,
              href: `mailto:${supplier.email}`,
            },
            {
              icon: VerifiedOutlinedIcon,
              label: "GSTIN",
              value: supplier.gstin || "Not provided",
              onClick: supplier.gstin ? () => copyToClipboard(supplier.gstin, "GSTIN") : undefined,
              mono: true,
            },
          ]
            .filter(Boolean)
            .map((item) => {
              const content = (
                <>
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "var(--bg-surface)", color: "var(--brand-text)", border: "1px solid var(--border)" }}
                  >
                    <item.icon sx={{ fontSize: 18 }} />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      {item.label}
                    </span>
                    <span
                      className={`block truncate text-sm font-semibold ${item.mono ? "font-mono tracking-tight" : ""}`}
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.value}
                    </span>
                  </span>
                  {item.onClick && (
                    <ContentCopyIcon sx={{ fontSize: 15 }} className="ml-auto shrink-0" style={{ color: "var(--text-tertiary)" }} />
                  )}
                </>
              );
              const cls =
                "flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 transition hover:brightness-[0.98]";
              const style = { backgroundColor: "var(--bg-surface2)" };
              if (item.href)
                return (
                  <a key={item.label} href={item.href} className={cls} style={style}>
                    {content}
                  </a>
                );
              if (item.onClick)
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className={cls}
                    style={style}
                    title={`Copy ${item.label}`}
                  >
                    {content}
                  </button>
                );
              return (
                <div key={item.label} className={cls} style={style}>
                  {content}
                </div>
              );
            })}
        </div>
      </section>

      {/* ── Payables overview ── */}
      <section className="overflow-hidden rounded-2xl" style={card}>
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16 }} />
                Outstanding balance
              </div>
              <div
                className={`font-display mt-1.5 text-3xl font-bold tracking-tight sm:text-4xl ${outstanding > 0 ? "text-amber-600" : "text-emerald-600"}`}
              >
                {formatCurrency(outstanding)}
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                {outstanding > 0
                  ? `Due to ${supplier.name} on ${supplier.paymentTerms || "agreed"} terms`
                  : "All dues settled with this supplier"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:text-right">
              <div>
                <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>Total billed</div>
                <div className="mt-0.5 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(totalPoValue)}
                </div>
              </div>
              <div>
                <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>Paid</div>
                <div className="mt-0.5 text-lg font-bold text-emerald-600">{formatCurrency(totalPaid)}</div>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <ProgressBar value={paidPct} />
            <div className="mt-2 flex justify-between text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              <span>{Math.round(paidPct)}% of PO value paid</span>
              <span>{formatCurrency(Math.max(0, totalPoValue - totalPaid))} unpaid on POs</span>
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          style={{ borderTop: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface2)", borderColor: "var(--border-subtle)" }}
        >
          {[
            { label: "Purchase orders", value: supplierPOs.length, sub: `${filterCounts.open} open`, icon: ReceiptLongIcon },
            { label: "Units received", value: unitsSourced.toLocaleString("en-IN"), sub: "across received POs", icon: Inventory2OutlinedIcon },
            {
              label: "Last order",
              value: lastOrder ? formatDate(lastOrder.orderDate, "DD MMM") : "None",
              sub: lastOrder ? lastOrder.poNumber : "No POs yet",
              icon: ScheduleIcon,
            },
          ].map((stat) => (
            <div key={stat.label} className="flex min-w-0 items-center gap-3 px-5 py-4 sm:px-6" style={{ borderColor: "var(--border-subtle)" }}>
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-tertiary)", border: "1px solid var(--border)" }}
              >
                <stat.icon sx={{ fontSize: 18 }} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                  {stat.label}
                </div>
                <div className="text-base font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                  {stat.value}
                </div>
                <div className="truncate text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  {stat.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: profile */}
        <div className="space-y-6">
          <Panel title="Contact" icon={PersonOutlineIcon}>
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              <DetailItem icon={PersonOutlineIcon} label="Contact person">
                {supplier.contactPerson || "Sales Desk"}
              </DetailItem>
              <DetailItem
                icon={PhoneIcon}
                label="Phone"
                action={
                  supplier.phone && (
                    <IconButton label="Copy phone" onClick={() => copyToClipboard(supplier.phone, "Phone")}>
                      <ContentCopyIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  )
                }
              >
                {supplier.phone ? (
                  <a href={`tel:${supplier.phone.replace(/\s+/g, "")}`} className="hover:underline">
                    {supplier.phone}
                  </a>
                ) : (
                  "N/A"
                )}
              </DetailItem>
              <DetailItem
                icon={MailOutlineIcon}
                label="Email"
                action={
                  supplier.email && (
                    <IconButton label="Copy email" onClick={() => copyToClipboard(supplier.email, "Email")}>
                      <ContentCopyIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  )
                }
              >
                {supplier.email ? (
                  <a href={`mailto:${supplier.email}`} className="hover:underline">
                    {supplier.email}
                  </a>
                ) : (
                  "N/A"
                )}
              </DetailItem>
            </div>
          </Panel>

          <Panel title="Business & Legal" icon={VerifiedOutlinedIcon}>
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              <DetailItem icon={StorefrontOutlinedIcon} label="Registered name">
                {supplier.company || "N/A"}
              </DetailItem>
              <DetailItem
                icon={VerifiedOutlinedIcon}
                label="GSTIN"
                action={
                  supplier.gstin && (
                    <IconButton label="Copy GSTIN" onClick={() => copyToClipboard(supplier.gstin, "GSTIN")}>
                      <ContentCopyIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  )
                }
              >
                <span className="font-mono tracking-tight">{supplier.gstin || "N/A"}</span>
              </DetailItem>
              <DetailItem icon={ScheduleIcon} label="Payment terms">
                {supplier.paymentTerms || "N/A"}
              </DetailItem>
              <DetailItem icon={LocationOnIcon} label="Address">
                <span className="font-medium leading-6">{supplier.address || location || "N/A"}</span>
              </DetailItem>
            </div>

            {supplier.categories?.length > 0 && (
              <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <div className="mb-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Supplies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {supplier.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: "var(--brand-soft)",
                        color: "var(--brand-text)",
                        border: "1px solid var(--brand-border)",
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* Right: purchase orders */}
        <div className="lg:col-span-2">
          <Panel
            title="Purchase Orders"
            icon={ReceiptLongIcon}
            bodyClassName=""
            aside={
              supplierPOs.length > 0 && (
                <Button variant="soft" startIcon={<PostAddIcon />} onClick={() => setCreatePoOpen(true)}>
                  New PO
                </Button>
              )
            }
          >
            {supplierPOs.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <span
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "var(--bg-surface2)", color: "var(--text-tertiary)" }}
                >
                  <ReceiptLongIcon />
                </span>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  No purchase orders yet
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Raise your first PO to start tracking stock and payments with this supplier.
                </p>
                <div className="mt-4">
                  <Button startIcon={<PostAddIcon />} onClick={() => setCreatePoOpen(true)}>
                    Create first PO
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Filter tabs */}
                <div
                  role="tablist"
                  aria-label="Filter purchase orders"
                  className="flex gap-1 overflow-x-auto px-5 pt-4"
                >
                  {PO_FILTERS.map((f) => {
                    const active = f.key === poFilter;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setPoFilter(f.key)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                        style={
                          active
                            ? { backgroundColor: "var(--brand-soft-strong)", color: "var(--brand-text)", border: "1px solid var(--brand-border)" }
                            : { color: "var(--text-secondary)", border: "1px solid transparent" }
                        }
                      >
                        {f.label}
                        <span
                          className="rounded-md px-1.5 text-[10px]"
                          style={{ backgroundColor: active ? "var(--bg-surface)" : "var(--bg-surface2)" }}
                        >
                          {filterCounts[f.key]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {visiblePOs.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
                    No {activeFilter.label.toLowerCase()} purchase orders.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y" style={{ borderTop: "1px solid var(--border-subtle)", borderColor: "var(--border-subtle)" }}>
                    {visiblePOs.map((po) => {
                      const paid = po.paidAmount || 0;
                      const pct = po.totalAmount ? (paid / po.totalAmount) * 100 : 0;
                      const qty = po.items.reduce((s, i) => s + i.quantity, 0);
                      const open = isOpenPo(po);
                      const canPay = po.paymentStatus !== "Paid" && po.status !== "Cancelled";

                      return (
                        <li
                          key={po.id}
                          className="grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1fr)_auto] md:items-center md:gap-5"
                          style={{ borderColor: "var(--border-subtle)" }}
                        >
                          {/* PO + dates */}
                          <div className="min-w-0">
                            <Link
                              href={`/suppliers-purchases/po/${po.id}`}
                              className="text-sm font-bold hover:underline"
                              style={{ color: "var(--brand-text)" }}
                            >
                              {po.poNumber}
                            </Link>
                            <div className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                              Ordered {formatDate(po.orderDate)}
                            </div>
                            <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                              {po.receivedDate
                                ? `Received ${formatDate(po.receivedDate)}`
                                : po.expectedDeliveryDate
                                  ? `ETA ${formatDate(po.expectedDeliveryDate)}`
                                  : null}
                            </div>
                          </div>

                          {/* Items */}
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }} title={po.items.map((i) => i.productName).join(", ")}>
                              {po.items[0]?.productName}
                            </div>
                            <div className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                              {po.items.length} {po.items.length === 1 ? "item" : "items"} · {qty.toLocaleString("en-IN")} units
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              <StatusChip status={po.status} />
                            </div>
                          </div>

                          {/* Amount + payment */}
                          <div className="min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                {formatCurrency(po.totalAmount)}
                              </span>
                              <StatusChip status={po.paymentStatus} />
                            </div>
                            <div className="mt-2">
                              <ProgressBar value={pct} tone={pct >= 100 ? "emerald" : "amber"} height="h-1.5" />
                            </div>
                            <div className="mt-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                              {formatCurrency(paid)} paid
                              {po.totalAmount - paid > 0 && ` · ${formatCurrency(po.totalAmount - paid)} due`}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-0.5">
                            {open && (
                              <IconButton
                                label="Mark as received"
                                tone="success"
                                onClick={() => {
                                  setSelectedPoForReceive(po);
                                  setReceiveDialogOpen(true);
                                }}
                              >
                                <MoveToInboxIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            )}
                            {canPay && (
                              <IconButton
                                label="Record payment"
                                tone="primary"
                                onClick={() => {
                                  setSelectedPoForPay(po);
                                  setPayAmount(po.totalAmount - paid);
                                  setPayDialogOpen(true);
                                }}
                              >
                                <PaymentsIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            )}
                            {open && (
                              <IconButton
                                label="Edit PO"
                                tone="primary"
                                onClick={() => {
                                  setEditingPo(po);
                                  setEditPoOpen(true);
                                }}
                              >
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            )}
                            {open && (
                              <IconButton
                                label="Cancel PO"
                                tone="danger"
                                onClick={() => {
                                  setCancellingPo(po);
                                  setCancelPoOpen(true);
                                }}
                              >
                                <CancelIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            )}
                            <IconButton label="View PO" onClick={() => router.push(`/suppliers-purchases/po/${po.id}`)}>
                              <ChevronRightIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </Panel>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <SupplierFormDialog
        open={editOpen}
        initialData={supplier}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Supplier?"
        message={`Are you sure you want to delete "${supplier.name}"? This action cannot be undone.`}
        confirmLabel="Delete Supplier"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />

      <CreatePurchaseOrderDialog
        open={createPoOpen}
        suppliers={[supplier]}
        products={products}
        onClose={() => setCreatePoOpen(false)}
        onSubmit={handleCreatePo}
      />

      <EditPurchaseOrderDialog
        open={editPoOpen}
        po={editingPo}
        onClose={() => setEditPoOpen(false)}
        onSubmit={handleEditPoSubmit}
      />

      {/* Receive PO confirm */}
      <ConfirmDialog
        open={receiveDialogOpen}
        title="Confirm Goods Receipt?"
        message={`Mark PO ${selectedPoForReceive?.poNumber} as received? This will update inventory stock for all items.`}
        confirmLabel="Confirm Receipt"
        confirmColor="success"
        onConfirm={handleConfirmReceivePo}
        onClose={() => setReceiveDialogOpen(false)}
      />

      {/* Cancel PO confirm */}
      <ConfirmDialog
        open={cancelPoOpen}
        title="Cancel Purchase Order?"
        message={`Are you sure you want to cancel PO ${cancellingPo?.poNumber}? The outstanding balance will be adjusted.`}
        confirmLabel="Cancel PO"
        confirmColor="error"
        onConfirm={handleCancelPo}
        onClose={() => setCancelPoOpen(false)}
      />

      {/* Pay Dialog */}
      <Modal
        open={payDialogOpen}
        onClose={() => setPayDialogOpen(false)}
        size="xs"
        title="Record Payment"
        subtitle={selectedPoForPay?.poNumber}
        icon={PaymentsIcon}
        tone="emerald"
        onSubmit={handlePaySubmit}
        submitLabel="Record Payment"
        contentClassName="space-y-3"
      >
        <p className="text-xs text-slate-600">
          Total: <strong>{formatCurrency(selectedPoForPay?.totalAmount)}</strong> | Paid so far:{" "}
          <strong>{formatCurrency(selectedPoForPay?.paidAmount || 0)}</strong>
        </p>
        <TextField
          label="Payment Amount (₹)"
          type="number"
          size="small"
          fullWidth
          inputProps={{ min: 1, max: (selectedPoForPay?.totalAmount || 0) - (selectedPoForPay?.paidAmount || 0) }}
          value={payAmount}
          onChange={(e) => setPayAmount(e.target.value)}
          required
        />
      </Modal>
    </div>
  );
}
