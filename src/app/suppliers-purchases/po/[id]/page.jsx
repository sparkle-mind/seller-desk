"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EditPurchaseOrderDialog from "@/features/suppliers-purchases/EditPurchaseOrderDialog";
import {
  receivePO,
  recordPayment,
  cancelPurchaseOrder,
  updatePurchaseOrder,
} from "@/store/slices/suppliersPurchasesSlice";
import { adjustStock } from "@/store/slices/productsSlice";
import { addMovement } from "@/store/slices/inventorySlice";
import { formatCurrency, formatDate } from "@/lib/formatters";

// MUI
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import PaymentsIcon from "@mui/icons-material/Payments";
import CancelIcon from "@mui/icons-material/Cancel";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BusinessIcon from "@mui/icons-material/Business";
import InventoryIcon from "@mui/icons-material/Inventory";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

/* ─── helpers ─────────────────────────────────────────────────── */
function InfoRow({ label, value, mono = false, valueClass = "" }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-slate-100 last:border-0 gap-4">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-right text-slate-800 ${mono ? "font-mono" : ""} ${valueClass}`}>
        {value ?? "N/A"}
      </span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
        {Icon && <Icon sx={{ fontSize: 18 }} className="text-blue-600" />}
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Timeline({ steps }) {
  return (
    <div className="space-y-4 relative pl-4 border-l-2 border-slate-200">
      {steps.map((step, idx) => (
        <div key={idx} className="relative">
          <span
            className={`absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
              step.done ? "bg-emerald-500" : step.active ? "bg-amber-400 animate-pulse" : "bg-slate-300"
            }`}
          />
          <div className="text-xs font-bold text-slate-800">{step.title}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{step.desc}</div>
        </div>
      ))}
    </div>
  );
}

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { purchases, suppliers } = useSelector((state) => state.suppliersPurchases);
  const products = useSelector((state) => state.products.items);

  const po = purchases.find((p) => p.id === params.id);
  const supplier = po ? suppliers.find((s) => s.id === po.supplierId) : null;

  // Dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");

  if (!po) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Purchase Order Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">
          No PO found with ID &quot;{params.id}&quot;.
        </p>
        <Link
          href="/suppliers-purchases"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          <span>Back to Suppliers & Purchases</span>
        </Link>
      </div>
    );
  }

  const isReceived = po.status === "Received";
  const isCancelled = po.status === "Cancelled";
  const isPaid = po.paymentStatus === "Paid";
  const balance = (po.totalAmount || 0) - (po.paidAmount || 0);

  const handleReceive = () => {
    dispatch(receivePO({ poId: po.id, receivedDate: new Date().toISOString().split("T")[0] }));
    po.items.forEach((item) => {
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
            reason: `Goods receipt from PO: ${po.poNumber}`,
            referenceId: po.poNumber,
          })
        );
      }
    });
    setReceiveOpen(false);
  };

  const handleCancelPo = () => {
    dispatch(cancelPurchaseOrder({ poId: po.id, reason: "Cancelled by seller" }));
    setCancelOpen(false);
  };

  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;
    dispatch(recordPayment({ poId: po.id, amount: Number(payAmount) }));
    setPayDialogOpen(false);
  };

  const handleEditSubmit = (payload) => {
    dispatch(updatePurchaseOrder(payload));
  };

  const totalQty = po.items.reduce((s, i) => s + i.quantity, 0);
  const totalReceivedQty = po.items.reduce((s, i) => s + (i.receivedQuantity || 0), 0);

  const timelineSteps = [
    {
      title: "Purchase Order Created",
      desc: `Ordered on ${formatDate(po.orderDate)}`,
      done: true,
    },
    {
      title: "Order Dispatched by Vendor",
      desc: `Supplier: ${po.supplierName}`,
      done: po.status !== "Ordered",
      active: po.status === "Ordered",
    },
    {
      title: "Goods In Transit / Partially Received",
      desc: po.status === "Partially Received" ? `${totalReceivedQty} / ${totalQty} units received` : `Expected by ${formatDate(po.expectedDeliveryDate)}`,
      done: po.status === "Received" || po.status === "Partially Received",
      active: po.status === "Partially Received",
    },
    {
      title: "Fully Received",
      desc: po.receivedDate ? `Received on ${formatDate(po.receivedDate)}` : "Pending full receipt",
      done: isReceived,
    },
    {
      title: "Payment Settled",
      desc: isPaid ? `${formatCurrency(po.paidAmount)} paid` : `${formatCurrency(po.paidAmount || 0)} of ${formatCurrency(po.totalAmount)} paid`,
      done: isPaid,
      active: po.paymentStatus === "Partially Paid",
    },
  ];

  if (isCancelled) {
    timelineSteps.splice(1, 3, {
      title: "Order Cancelled",
      desc: po.notes?.includes("[Cancelled:") ? po.notes.split("[Cancelled:")[1].replace("]", "").trim() : "Cancelled by seller",
      done: true,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={po.poNumber}
        subtitle={`Supplier: ${po.supplierName} | Ordered: ${formatDate(po.orderDate)}`}
        breadcrumbs={[
          { label: "Suppliers & Purchases", href: "/suppliers-purchases" },
          supplier
            ? { label: supplier.name, href: `/suppliers-purchases/suppliers/${supplier.id}` }
            : { label: po.supplierName },
          { label: po.poNumber },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.back()}
              sx={{ borderColor: "#cbd5e1", color: "#334155" }}
            >
              Back
            </Button>

            {!isReceived && !isCancelled && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => setCancelOpen(true)}
              >
                Cancel PO
              </Button>
            )}

            {!isReceived && !isCancelled && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setEditOpen(true)}
                sx={{ borderColor: "#3b82f6", color: "#1d4ed8" }}
              >
                Edit PO
              </Button>
            )}

            {!isPaid && !isCancelled && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PaymentsIcon />}
                onClick={() => {
                  setPayAmount(balance);
                  setPayDialogOpen(true);
                }}
                sx={{ borderColor: "#10b981", color: "#065f46" }}
              >
                Record Payment
              </Button>
            )}

            {!isReceived && !isCancelled && (
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<MoveToInboxIcon />}
                onClick={() => setReceiveOpen(true)}
              >
                Mark as Received
              </Button>
            )}
          </div>
        }
      />

      {/* Status Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Order Status:</span>
            <StatusChip status={po.status} />
          </div>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Payment:</span>
            <StatusChip status={po.paymentStatus} />
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {po.receivedDate && (
            <span>Received: <strong className="text-slate-800">{formatDate(po.receivedDate)}</strong></span>
          )}
          <span>ETA: <strong className="text-slate-800">{formatDate(po.expectedDeliveryDate)}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <SectionCard title={`Line Items (${po.items.length})`} icon={InventoryIcon}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="px-3 py-2.5">Product</th>
                    <th className="px-3 py-2.5">SKU</th>
                    <th className="px-3 py-2.5 text-right">Unit Cost</th>
                    <th className="px-3 py-2.5 text-right">Ordered</th>
                    <th className="px-3 py-2.5 text-right">Received</th>
                    <th className="px-3 py-2.5 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {po.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{item.productName}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-500">{item.sku}</td>
                      <td className="px-3 py-2.5 text-right text-slate-700">{formatCurrency(item.unitCost)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`font-semibold ${(item.receivedQuantity || 0) >= item.quantity ? "text-emerald-700" : "text-amber-600"}`}>
                          {item.receivedQuantity ?? 0}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-900">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={5} className="px-3 py-2.5 text-right text-slate-600">Subtotal</td>
                    <td className="px-3 py-2.5 text-right text-slate-900">{formatCurrency(po.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-right text-slate-500">GST / Tax</td>
                    <td className="px-3 py-2 text-right text-slate-700">{formatCurrency(po.tax)}</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-right text-slate-500">Inbound Freight</td>
                    <td className="px-3 py-2 text-right text-slate-700">{formatCurrency(po.shippingCost)}</td>
                  </tr>
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <td colSpan={5} className="px-3 py-3 text-right font-bold text-slate-900 text-sm">Total Amount</td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900 text-sm">{formatCurrency(po.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </SectionCard>

          {/* Payment Summary */}
          <SectionCard title="Payment Summary" icon={AccountBalanceWalletIcon}>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-600">Total PO Amount</span>
                <span className="font-bold text-slate-900">{formatCurrency(po.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-600">Amount Paid</span>
                <span className="font-bold text-emerald-700">{formatCurrency(po.paidAmount || 0)}</span>
              </div>
              <div className="flex justify-between py-2.5 text-sm font-bold">
                <span className={balance > 0 ? "text-amber-800" : "text-emerald-800"}>
                  {balance > 0 ? "Balance Due" : "Fully Settled"}
                </span>
                <span className={balance > 0 ? "text-amber-700" : "text-emerald-700"}>
                  {balance > 0 ? formatCurrency(balance) : "₹0"}
                </span>
              </div>
              {!isPaid && !isCancelled && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PaymentsIcon />}
                  onClick={() => {
                    setPayAmount(balance);
                    setPayDialogOpen(true);
                  }}
                  fullWidth
                  className="mt-2"
                >
                  Record Payment ({formatCurrency(balance)} remaining)
                </Button>
              )}
            </div>
          </SectionCard>

          {/* Supplier Info & Notes */}
          {supplier && (
            <SectionCard title="Supplier Information" icon={BusinessIcon}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0 flex-1">
                  <InfoRow label="Company" value={supplier.company} />
                  <InfoRow label="Contact" value={supplier.contactPerson} />
                  <InfoRow label="Phone" value={supplier.phone} />
                  <InfoRow label="Location" value={`${supplier.city}, ${supplier.state}`} />
                  <InfoRow label="Payment Terms" value={supplier.paymentTerms} />
                </div>
                <Link
                  href={`/suppliers-purchases/suppliers/${supplier.id}`}
                  className="text-xs text-blue-600 hover:underline whitespace-nowrap shrink-0 font-semibold"
                >
                  View Supplier →
                </Link>
              </div>
            </SectionCard>
          )}

          {po.notes && (
            <SectionCard title="Notes & Remarks" icon={InfoOutlinedIcon}>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{po.notes}</p>
            </SectionCard>
          )}
        </div>

        {/* Right col: PO info + Timeline */}
        <div className="space-y-6">
          <SectionCard title="PO Overview" icon={ReceiptIcon}>
            <div className="space-y-0">
              <InfoRow label="PO Number" value={po.poNumber} mono />
              <InfoRow label="Order Date" value={formatDate(po.orderDate)} />
              <InfoRow label="Expected Delivery" value={formatDate(po.expectedDeliveryDate)} />
              {po.receivedDate && (
                <InfoRow label="Received On" value={formatDate(po.receivedDate)} valueClass="text-emerald-700" />
              )}
              <InfoRow
                label="Items Count"
                value={`${po.items.length} product${po.items.length > 1 ? "s" : ""} | ${totalQty} units`}
              />
              <InfoRow
                label="Units Received"
                value={`${totalReceivedQty} / ${totalQty}`}
                valueClass={totalReceivedQty >= totalQty ? "text-emerald-700" : "text-amber-600"}
              />
            </div>
          </SectionCard>

          <SectionCard title="PO Lifecycle" icon={InfoOutlinedIcon}>
            <Timeline steps={timelineSteps} />
          </SectionCard>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <EditPurchaseOrderDialog
        open={editOpen}
        po={po}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDialog
        open={receiveOpen}
        title="Confirm Goods Receipt?"
        message={`Mark PO ${po.poNumber} as received? This will update inventory stock for all ${po.items.length} product(s).`}
        confirmLabel="Confirm Receipt"
        confirmColor="success"
        onConfirm={handleReceive}
        onClose={() => setReceiveOpen(false)}
      />

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel Purchase Order?"
        message={`Cancel PO ${po.poNumber}? The supplier's outstanding balance will be adjusted accordingly.`}
        confirmLabel="Cancel PO"
        confirmColor="error"
        onConfirm={handleCancelPo}
        onClose={() => setCancelOpen(false)}
      />

      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handlePaySubmit}>
          <DialogTitle className="border-b border-slate-200 pb-3 text-sm font-bold text-slate-900">
            Record Payment — {po.poNumber}
          </DialogTitle>
          <DialogContent className="pt-4 space-y-3">
            <p className="text-xs text-slate-600">
              Total: <strong>{formatCurrency(po.totalAmount)}</strong> | Paid:{" "}
              <strong className="text-emerald-700">{formatCurrency(po.paidAmount || 0)}</strong> | Balance:{" "}
              <strong className="text-amber-700">{formatCurrency(balance)}</strong>
            </p>
            <TextField
              label="Payment Amount (₹)"
              type="number"
              size="small"
              fullWidth
              inputProps={{ min: 1, max: balance }}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions className="p-3 border-t border-slate-200">
            <Button onClick={() => setPayDialogOpen(false)} variant="outlined" size="small">Cancel</Button>
            <Button type="submit" variant="contained" size="small">Record Payment</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
