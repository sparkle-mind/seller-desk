"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EditShipmentDialog from "@/features/shipping-returns/EditShipmentDialog";
import ReturnFormDialog from "@/features/shipping-returns/ReturnFormDialog";
import ReturnInspectionDialog from "@/features/shipping-returns/ReturnInspectionDialog";
import RtoFormDialog from "@/features/shipping-returns/RtoFormDialog";
import {
  updateShipmentStatus,
  editShipment,
  editCustomerReturn,
  updateReturnInspection,
  editRtoRecord,
  updateRtoStatus,
} from "@/store/slices/shippingReturnsSlice";
import { adjustStock } from "@/store/slices/productsSlice";
import { addMovement } from "@/store/slices/inventorySlice";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";

// MUI
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RateReviewIcon from "@mui/icons-material/RateReview";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import InventoryIcon from "@mui/icons-material/Inventory";
import StorefrontIcon from "@mui/icons-material/Storefront";

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

/* ─── Timeline ─────────────────────────────────────────────────── */
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

/* ══════════════════════════════════════════════════════════════════
   SHIPMENT DETAIL
═══════════════════════════════════════════════════════════════════ */
function ShipmentDetail({ shipment }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const handleMarkDelivered = () => {
    dispatch(updateShipmentStatus({ id: shipment.id, deliveryStatus: "Delivered" }));
  };

  const handleEditSubmit = (payload) => {
    dispatch(editShipment(payload));
  };

  const deliveryDone = shipment.deliveryStatus === "Delivered";
  const isCancelled =
    shipment.deliveryStatus === "Returned to Origin" ||
    shipment.deliveryStatus === "Cancelled";

  const timelineSteps = [
    { title: "Manifest Generated", desc: formatDateTime(shipment.shipmentDate), done: true },
    {
      title: "Ready for Pickup / In Transit",
      desc: `Courier: ${shipment.courierName} | AWB: ${shipment.awbNumber || "Pending"}`,
      done:
        shipment.deliveryStatus !== "Manifest Generated" &&
        shipment.deliveryStatus !== "Ready for Pickup",
      active: shipment.deliveryStatus === "In Transit",
    },
    {
      title: "Out for Delivery",
      desc: `ETA: ${formatDate(shipment.expectedDeliveryDate)}`,
      done:
        shipment.deliveryStatus === "Out for Delivery" ||
        shipment.deliveryStatus === "Delivered",
      active: shipment.deliveryStatus === "Out for Delivery",
    },
    {
      title: "Delivered to Customer",
      desc: shipment.deliveredDate
        ? `Delivered on ${formatDateTime(shipment.deliveredDate)}`
        : deliveryDone
        ? "Delivered"
        : "Pending delivery",
      done: deliveryDone,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Shipment ${shipment.id}`}
        subtitle={`Order: ${shipment.orderId} | Courier: ${shipment.courierName} | AWB: ${shipment.awbNumber || "Pending"}`}
        breadcrumbs={[
          { label: "Shipping & Returns", href: "/shipping-returns" },
          { label: shipment.id },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/shipping-returns")}
              sx={{ borderColor: "#cbd5e1", color: "#334155" }}
            >
              Back
            </Button>
            {!deliveryDone && !isCancelled && (
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={handleMarkDelivered}
              >
                Mark Delivered
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditOpen(true)}
            >
              Edit Shipment
            </Button>
          </div>
        }
      />

      {/* Status Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusChip status={shipment.marketplace} />
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Delivery Status:</span>
            <StatusChip status={shipment.deliveryStatus} />
          </div>
        </div>
        <div className="text-xs text-slate-500">
          Shipped: <strong className="text-slate-800">{formatDateTime(shipment.shipmentDate)}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Shipment Details" icon={LocalShippingIcon}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Courier", value: shipment.courierName },
                { label: "AWB Number", value: shipment.awbNumber || "Pending", mono: true },
                { label: "Destination", value: shipment.destinationCity },
                { label: "Pincode", value: shipment.pincode, mono: true },
                { label: "Shipping Cost", value: formatCurrency(shipment.shippingCost) },
                { label: "Weight", value: `${shipment.weightKg} kg` },
                { label: "Expected Delivery", value: formatDate(shipment.expectedDeliveryDate) },
                { label: "Delivered On", value: shipment.deliveredDate ? formatDateTime(shipment.deliveredDate) : "—" },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{item.label}</div>
                  <div className={`font-bold text-slate-900 mt-0.5 text-xs break-all ${item.mono ? "font-mono" : ""}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Item Summary" icon={InventoryIcon}>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-semibold text-slate-800">{shipment.itemsSummary}</p>
              <p className="text-xs text-slate-500 mt-1">
                Order ID: <span className="font-mono text-blue-600">{shipment.orderId}</span>
              </p>
            </div>
          </SectionCard>
        </div>

        {/* Right 1 col: Timeline */}
        <div>
          <SectionCard title="Delivery Timeline" icon={InfoOutlinedIcon}>
            <Timeline steps={timelineSteps} />
          </SectionCard>
        </div>
      </div>

      <EditShipmentDialog
        open={editOpen}
        shipment={shipment}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   RETURN DETAIL
═══════════════════════════════════════════════════════════════════ */
function ReturnDetail({ returnRecord }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const products = useSelector((state) => state.products.items);
  const [editOpen, setEditOpen] = useState(false);
  const [inspectionOpen, setInspectionOpen] = useState(false);

  const handleEditSubmit = (data) => {
    dispatch(editCustomerReturn(data));
  };

  const handleInspectionSubmit = (data) => {
    dispatch(updateReturnInspection(data));
    if (data.restockEligibility === "Eligible" && !returnRecord.restocked) {
      const prod = products.find(
        (p) => p.sku === returnRecord.sku || p.name === returnRecord.productName
      );
      if (prod) {
        dispatch(adjustStock({ productId: prod.id, newStock: prod.stock + 1 }));
        dispatch(
          addMovement({
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            type: "Return Restock",
            quantity: 1,
            previousStock: prod.stock,
            newStock: prod.stock + 1,
            reason: `Return restocked after inspection (${returnRecord.id})`,
            referenceId: returnRecord.id,
          })
        );
      }
    }
  };

  const timelineSteps = [
    { title: "Return Initiated by Customer", desc: `Raised on ${formatDate(returnRecord.returnDate)}`, done: true },
    {
      title: "In Transit to Warehouse",
      desc: "Package picked up from customer",
      done: returnRecord.returnStatus !== "In Transit to Warehouse",
      active: returnRecord.returnStatus === "In Transit to Warehouse",
    },
    {
      title: "Received at Warehouse",
      desc: "Package received and logged",
      done:
        returnRecord.returnStatus === "Received Back" ||
        returnRecord.returnStatus === "Refund Processed" ||
        returnRecord.returnStatus === "Rejected",
    },
    {
      title: "Quality Inspection",
      desc: returnRecord.inspectionStatus,
      done: returnRecord.inspectionStatus !== "Pending Inspection",
      active: returnRecord.returnStatus === "Received Back" && returnRecord.inspectionStatus === "Pending Inspection",
    },
    {
      title: "Refund / Resolution",
      desc:
        returnRecord.returnStatus === "Refund Processed"
          ? `Refund of ${formatCurrency(returnRecord.refundAmount)} processed`
          : returnRecord.returnStatus === "Rejected"
          ? "Return Rejected"
          : "Pending",
      done: returnRecord.returnStatus === "Refund Processed" || returnRecord.returnStatus === "Rejected",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Return ${returnRecord.id}`}
        subtitle={`Order: ${returnRecord.originalOrderId} | Customer: ${returnRecord.customerName}`}
        breadcrumbs={[
          { label: "Shipping & Returns", href: "/shipping-returns" },
          { label: returnRecord.id },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/shipping-returns")}
              sx={{ borderColor: "#cbd5e1", color: "#334155" }}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RateReviewIcon />}
              onClick={() => setInspectionOpen(true)}
              sx={{ borderColor: "#3b82f6", color: "#1d4ed8" }}
            >
              Inspect Return
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditOpen(true)}
            >
              Edit Details
            </Button>
          </div>
        }
      />

      {/* Status Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusChip status={returnRecord.marketplace} />
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Status:</span>
            <StatusChip status={returnRecord.returnStatus} />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Inspection:</span>
            <StatusChip status={returnRecord.inspectionStatus} />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Eligibility:</span>
            <StatusChip status={returnRecord.restockEligibility} />
          </div>
        </div>
        <div className="text-xs text-slate-500">
          Return Date: <strong className="text-slate-800">{formatDate(returnRecord.returnDate)}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Product Info */}
          <SectionCard title="Returned Product" icon={InventoryIcon}>
            <div className="space-y-0">
              <InfoRow label="Product Name" value={returnRecord.productName} />
              <InfoRow label="SKU" value={returnRecord.sku} mono />
              <InfoRow label="Return Reason" value={returnRecord.returnReason} />
              <InfoRow label="Customer Name" value={returnRecord.customerName} />
              <InfoRow label="Original Order ID" value={returnRecord.originalOrderId} mono />
            </div>
          </SectionCard>

          {/* Financials */}
          <SectionCard title="Financials" icon={StorefrontIcon}>
            <div className="space-y-0">
              <InfoRow label="Refund Amount" value={formatCurrency(returnRecord.refundAmount)} valueClass="text-rose-700" />
              <InfoRow label="Reverse Shipping Fee" value={formatCurrency(returnRecord.reverseShippingFee)} />
              <InfoRow
                label="Net Loss"
                value={formatCurrency((returnRecord.refundAmount || 0) + (returnRecord.reverseShippingFee || 0))}
                valueClass="text-rose-700 font-bold"
              />
              <InfoRow
                label="Restocked"
                value={returnRecord.restocked ? "Yes — Added back to inventory" : "No"}
                valueClass={returnRecord.restocked ? "text-emerald-700" : "text-slate-500"}
              />
            </div>
          </SectionCard>

          {/* Inspection Notes */}
          <SectionCard title="Inspection Notes" icon={RateReviewIcon}>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {returnRecord.inspectionNotes || "No inspection notes recorded yet. Click 'Inspect Return' to add."}
            </p>
          </SectionCard>
        </div>

        {/* Right col: Timeline */}
        <div>
          <SectionCard title="Return Timeline" icon={InfoOutlinedIcon}>
            <Timeline steps={timelineSteps} />
          </SectionCard>
        </div>
      </div>

      <ReturnFormDialog
        open={editOpen}
        initialData={returnRecord}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
      />
      <ReturnInspectionDialog
        open={inspectionOpen}
        returnRecord={returnRecord}
        onClose={() => setInspectionOpen(false)}
        onSubmit={handleInspectionSubmit}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   RTO DETAIL
═══════════════════════════════════════════════════════════════════ */
function RtoDetail({ rto }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const products = useSelector((state) => state.products.items);
  const [editOpen, setEditOpen] = useState(false);

  const handleEditSubmit = (data) => {
    dispatch(editRtoRecord(data));
  };

  const handleMarkReceived = () => {
    dispatch(
      updateRtoStatus({
        id: rto.id,
        rtoStatus: "Received Back & Verified",
        receivedBackDate: new Date().toISOString().split("T")[0],
        notes: rto.notes || "Verified intact and restocked to inventory.",
      })
    );
  };

  const isReceived = rto.rtoStatus === "Received Back & Verified";

  const timelineSteps = [
    {
      title: "Delivery Attempted / Failed",
      desc: `Reason: ${rto.rtoReason}`,
      done: true,
    },
    {
      title: "RTO Initiated by Courier",
      desc: `${rto.courierName} | AWB: ${rto.awbNumber}`,
      done: true,
    },
    {
      title: "In Transit to Seller",
      desc: `Destination was: ${rto.destinationCity}`,
      done: isReceived || rto.rtoStatus === "Received Back & Verified",
      active: rto.rtoStatus === "In Transit to Seller",
    },
    {
      title: "Received & Verified",
      desc: rto.receivedBackDate
        ? `Received on ${formatDate(rto.receivedBackDate)}`
        : isReceived
        ? "Verified"
        : "Pending receipt",
      done: isReceived,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`RTO ${rto.id}`}
        subtitle={`Order: ${rto.originalOrderId} | Courier: ${rto.courierName} | AWB: ${rto.awbNumber}`}
        breadcrumbs={[
          { label: "Shipping & Returns", href: "/shipping-returns" },
          { label: rto.id },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/shipping-returns")}
              sx={{ borderColor: "#cbd5e1", color: "#334155" }}
            >
              Back
            </Button>
            {!isReceived && (
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={handleMarkReceived}
              >
                Mark Received & Verified
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditOpen(true)}
            >
              Edit RTO
            </Button>
          </div>
        }
      />

      {/* Status Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusChip status={rto.marketplace} />
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">RTO Status:</span>
            <StatusChip status={rto.rtoStatus} />
          </div>
          {rto.restocked && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              ✓ Restocked
            </span>
          )}
        </div>
        {rto.receivedBackDate && (
          <div className="text-xs text-slate-500">
            Received: <strong className="text-slate-800">{formatDate(rto.receivedBackDate)}</strong>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="RTO Details" icon={RotateLeftIcon}>
            <div className="space-y-0">
              <InfoRow label="Original Order ID" value={rto.originalOrderId} mono />
              <InfoRow label="Customer Name" value={rto.customerName} />
              <InfoRow label="Destination City" value={rto.destinationCity} />
              <InfoRow label="RTO Reason" value={rto.rtoReason} />
              <InfoRow label="Courier Name" value={rto.courierName} />
              <InfoRow label="AWB Number" value={rto.awbNumber} mono />
              <InfoRow label="Return Shipping Charge" value={formatCurrency(rto.returnShippingCharge)} valueClass="text-rose-700" />
              <InfoRow label="Received Back Date" value={rto.receivedBackDate ? formatDate(rto.receivedBackDate) : "—"} />
            </div>
          </SectionCard>

          {/* Notes */}
          <SectionCard title="Seller Notes" icon={InfoOutlinedIcon}>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {rto.notes || "No notes added yet."}
            </p>
          </SectionCard>
        </div>

        {/* Right col: Timeline */}
        <div>
          <SectionCard title="RTO Timeline" icon={InfoOutlinedIcon}>
            <Timeline steps={timelineSteps} />
          </SectionCard>
        </div>
      </div>

      <RtoFormDialog
        open={editOpen}
        initialData={rto}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ROOT PAGE — resolves which record type to render
═══════════════════════════════════════════════════════════════════ */
export default function ShippingReturnsDetailPage() {
  const params = useParams();
  const { shipments, returns, rtos } = useSelector((state) => state.shippingReturns);

  const id = params.id;

  // Identify record type by ID prefix
  const shipment = shipments.find((s) => s.id === id);
  const returnRecord = returns.find((r) => r.id === id);
  const rto = rtos.find((r) => r.id === id);

  if (shipment) return <ShipmentDetail shipment={shipment} />;
  if (returnRecord) return <ReturnDetail returnRecord={returnRecord} />;
  if (rto) return <RtoDetail rto={rto} />;

  return (
    <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800">Record Not Found</h2>
      <p className="text-sm text-slate-500 mt-1">
        No shipment, return, or RTO found with ID &quot;{id}&quot;.
      </p>
      <Link
        href="/shipping-returns"
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
      >
        <ArrowBackIcon sx={{ fontSize: 16 }} />
        <span>Back to Shipping & Returns</span>
      </Link>
    </div>
  );
}
