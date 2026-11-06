"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
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
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PostAddIcon from "@mui/icons-material/PostAdd";
import BusinessIcon from "@mui/icons-material/Business";
import PaymentsIcon from "@mui/icons-material/Payments";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import CancelIcon from "@mui/icons-material/Cancel";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import ReceiptIcon from "@mui/icons-material/Receipt";

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

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { suppliers, purchases } = useSelector((state) => state.suppliersPurchases);
  const products = useSelector((state) => state.products.items);

  const supplier = suppliers.find((s) => s.id === params.id);
  const supplierPOs = purchases.filter((p) => p.supplierId === params.id);

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

  if (!supplier) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Supplier Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">
          No supplier found with ID &quot;{params.id}&quot;.
        </p>
        <Link
          href="/suppliers-purchases"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          <span>Back to Suppliers</span>
        </Link>
      </div>
    );
  }

  // Handlers
  const handleEditSubmit = (data) => {
    dispatch(updateSupplier({ id: supplier.id, ...data }));
  };

  const handleDelete = () => {
    dispatch(deleteSupplier(supplier.id));
    router.push("/suppliers-purchases");
  };

  const handleCreatePo = (payload) => {
    dispatch(addPurchaseOrder({ ...payload, supplierId: supplier.id, supplierName: supplier.name }));
  };

  const handleEditPoSubmit = (payload) => {
    dispatch(updatePurchaseOrder(payload));
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
    setReceiveDialogOpen(false);
  };

  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!selectedPoForPay || !payAmount || Number(payAmount) <= 0) return;
    dispatch(recordPayment({ poId: selectedPoForPay.id, amount: Number(payAmount) }));
    setPayDialogOpen(false);
  };

  const handleCancelPo = () => {
    if (!cancellingPo) return;
    dispatch(cancelPurchaseOrder({ poId: cancellingPo.id, reason: "Cancelled by seller" }));
    setCancelPoOpen(false);
  };

  // KPI summary
  const totalPoValue = supplierPOs.reduce((s, p) => s + (p.totalAmount || 0), 0);
  const pendingPoCount = supplierPOs.filter((p) => p.status === "Ordered").length;
  const totalPaid = supplierPOs.reduce((s, p) => s + (p.paidAmount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={supplier.name}
        subtitle={`${supplier.company} | ${supplier.city}, ${supplier.state} | GSTIN: ${supplier.gstin || "N/A"}`}
        breadcrumbs={[
          { label: "Suppliers & Purchases", href: "/suppliers-purchases" },
          { label: supplier.name },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/suppliers-purchases")}
              sx={{ borderColor: "#cbd5e1", color: "#334155" }}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PostAddIcon />}
              onClick={() => setCreatePoOpen(true)}
              sx={{ borderColor: "#3b82f6", color: "#1d4ed8" }}
            >
              New Purchase Order
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditOpen(true)}
            >
              Edit Supplier
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total POs",
            value: supplierPOs.length,
            icon: ReceiptIcon,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Total PO Value",
            value: formatCurrency(totalPoValue),
            icon: ShoppingCartCheckoutIcon,
            color: "bg-purple-50 text-purple-600",
          },
          {
            label: "Total Paid",
            value: formatCurrency(totalPaid),
            icon: PaymentsIcon,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Outstanding Balance",
            value: formatCurrency(supplier.outstandingBalance),
            icon: AccountBalanceWalletIcon,
            color: supplier.outstandingBalance > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600",
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
              <card.icon sx={{ fontSize: 22 }} />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">{card.label}</div>
              <div className="text-base font-bold text-slate-900 leading-tight">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Supplier Info */}
        <div className="space-y-6">
          {/* Contact Details */}
          <SectionCard title="Contact Details" icon={BusinessIcon}>
            <div className="space-y-0">
              <InfoRow label="Contact Person" value={supplier.contactPerson || "Sales Desk"} />
              <InfoRow label="Phone" value={supplier.phone} />
              <InfoRow label="Email" value={supplier.email} />
              <InfoRow label="Payment Terms" value={supplier.paymentTerms} />
              <InfoRow label="Status" value={<StatusChip status={supplier.status} />} />
            </div>
          </SectionCard>

          {/* Location */}
          <SectionCard title="Location & Legal" icon={LocationOnIcon}>
            <div className="space-y-0">
              <InfoRow label="City" value={supplier.city} />
              <InfoRow label="State" value={supplier.state} />
              <InfoRow label="GSTIN" value={supplier.gstin || "N/A"} mono />
              <InfoRow label="Address" value={supplier.address || `${supplier.city}, ${supplier.state}`} />
            </div>
            {supplier.categories?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Product Categories</div>
                <div className="flex flex-wrap gap-1.5">
                  {supplier.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right 2 cols: Purchase Orders */}
        <div className="lg:col-span-2">
          <SectionCard title={`Purchase Orders (${supplierPOs.length})`} icon={ReceiptIcon}>
            {supplierPOs.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                No purchase orders for this supplier yet.
                <div className="mt-2">
                  <Button variant="outlined" size="small" startIcon={<PostAddIcon />} onClick={() => setCreatePoOpen(true)}>
                    Create First PO
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                      <th className="px-3 py-2.5">PO #</th>
                      <th className="px-3 py-2.5">Order Date</th>
                      <th className="px-3 py-2.5">Items</th>
                      <th className="px-3 py-2.5 text-right">Total</th>
                      <th className="px-3 py-2.5 text-right">Paid</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Payment</th>
                      <th className="px-3 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supplierPOs.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-50 transition">
                        <td className="px-3 py-2.5">
                          <Link
                            href={`/suppliers-purchases/po/${po.id}`}
                            className="font-bold text-blue-600 hover:underline"
                          >
                            {po.poNumber}
                          </Link>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {po.receivedDate ? `Received: ${formatDate(po.receivedDate)}` : `ETA: ${formatDate(po.expectedDeliveryDate)}`}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">{formatDate(po.orderDate)}</td>
                        <td className="px-3 py-2.5">
                          <div className="max-w-[150px]">
                            <div className="truncate font-medium text-slate-800">{po.items[0]?.productName}</div>
                            {po.items.length > 1 && (
                              <div className="text-[10px] text-blue-600">+{po.items.length - 1} more</div>
                            )}
                            <div className="text-[10px] text-slate-400">
                              Qty: {po.items.reduce((s, i) => s + i.quantity, 0)} units
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-slate-900">{formatCurrency(po.totalAmount)}</td>
                        <td className="px-3 py-2.5 text-right text-slate-600">{formatCurrency(po.paidAmount || 0)}</td>
                        <td className="px-3 py-2.5"><StatusChip status={po.status} /></td>
                        <td className="px-3 py-2.5"><StatusChip status={po.paymentStatus} /></td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit PO */}
                            {po.status !== "Received" && po.status !== "Cancelled" && (
                              <Tooltip title="Edit PO">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPo(po);
                                    setEditPoOpen(true);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
                                >
                                  <EditIcon sx={{ fontSize: 15 }} />
                                </button>
                              </Tooltip>
                            )}

                            {/* Receive PO */}
                            {po.status !== "Received" && po.status !== "Cancelled" && (
                              <Tooltip title="Mark as Received">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPoForReceive(po);
                                    setReceiveDialogOpen(true);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                                >
                                  <MoveToInboxIcon sx={{ fontSize: 15 }} />
                                </button>
                              </Tooltip>
                            )}

                            {/* Pay */}
                            {po.paymentStatus !== "Paid" && po.status !== "Cancelled" && (
                              <Tooltip title="Record Payment">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPoForPay(po);
                                    setPayAmount(po.totalAmount - (po.paidAmount || 0));
                                    setPayDialogOpen(true);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                >
                                  <PaymentsIcon sx={{ fontSize: 15 }} />
                                </button>
                              </Tooltip>
                            )}

                            {/* Cancel */}
                            {po.status !== "Received" && po.status !== "Cancelled" && (
                              <Tooltip title="Cancel PO">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancellingPo(po);
                                    setCancelPoOpen(true);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                >
                                  <CancelIcon sx={{ fontSize: 15 }} />
                                </button>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
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
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handlePaySubmit}>
          <DialogTitle className="border-b border-slate-200 pb-3 text-sm font-bold text-slate-900">
            Record Payment — {selectedPoForPay?.poNumber}
          </DialogTitle>
          <DialogContent className="pt-4 space-y-3">
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
