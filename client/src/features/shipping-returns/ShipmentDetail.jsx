"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import { useToast } from "@/components/common/ToastProvider";
import StatusChip from "@/components/common/StatusChip";
import Button from "@/components/common/Button";
import IconButton from "@/components/common/IconButton";
import EditShipmentDialog, { DELIVERY_STATUSES } from "@/features/shipping-returns/EditShipmentDialog";
import { updateShipmentStatus, editShipment } from "@/store/slices/shippingReturnsSlice";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";
import {
  TruckIllustration,
  WarehouseIllustration,
  HouseIllustration,
  ParcelIllustration,
} from "./ShipmentIllustrations";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import UndoIcon from "@mui/icons-material/Undo";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PinDropOutlinedIcon from "@mui/icons-material/PinDropOutlined";
import ScaleOutlinedIcon from "@mui/icons-material/ScaleOutlined";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import HistoryIcon from "@mui/icons-material/History";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

/* ─── status model ─────────────────────────────────────────────── */

const STAGES = [
  { key: "manifest", label: "Manifested", icon: ReceiptLongIcon },
  { key: "pickup", label: "Ready for pickup", icon: Inventory2OutlinedIcon },
  { key: "transit", label: "In transit", icon: LocalShippingOutlinedIcon },
  { key: "ofd", label: "Out for delivery", icon: DeliveryDiningOutlinedIcon },
  { key: "delivered", label: "Delivered", icon: HomeOutlinedIcon },
];

// Where the truck sits on the road for each stage (0 = warehouse, 1 = door).
const TRUCK_POSITION = [0.04, 0.12, 0.5, 0.8, 0.9];

const STATUS_INFO = {
  "Manifest Generated": { stage: 0, title: "Label created", tone: "brand", copy: (s) => `Booked with ${s.courierName}. Pack the order and keep it ready for handover.` },
  "Ready for Pickup": { stage: 1, title: "Waiting for pickup", tone: "brand", copy: (s) => `${s.courierName} will collect the parcel from your warehouse.` },
  "In Transit": { stage: 2, title: "On the way", tone: "brand", moving: true, copy: (s) => `Moving through the ${s.courierName} network towards ${s.destinationCity}.` },
  "Out for Delivery": { stage: 3, title: "Out for delivery", tone: "brand", moving: true, copy: (s) => `The delivery partner is bringing it to ${s.destinationCity} today.` },
  Delivered: { stage: 4, title: "Delivered", tone: "success", copy: (s) => `Handed over to the customer in ${s.destinationCity}.` },
  "Delivered (Returned)": { stage: 4, title: "Delivered, then returned", tone: "warning", copy: () => "The customer received the parcel and later raised a return." },
  "RTO Initiated": { stage: 2, pos: 0.78, title: "RTO initiated", tone: "danger", reverse: true, copy: (s) => `Delivery in ${s.destinationCity} failed. The courier has started the return to origin.` },
  "Returned to Origin": { stage: 2, pos: 0.4, title: "Returning to you (RTO)", tone: "danger", moving: true, reverse: true, copy: () => "Delivery failed, so the courier is sending the parcel back to your warehouse." },
  Cancelled: { stage: 0, title: "Shipment cancelled", tone: "danger", copy: () => "This shipment was cancelled before it was delivered." },
};

const TONE = {
  brand: { text: "var(--brand-text)", soft: "var(--brand-soft)", solid: "var(--brand)" },
  success: { text: "rgb(var(--emerald-600-rgb))", soft: "rgb(var(--emerald-500-rgb) / 0.12)", solid: "rgb(var(--emerald-500-rgb))" },
  warning: { text: "rgb(var(--amber-600-rgb))", soft: "rgb(var(--amber-500-rgb) / 0.12)", solid: "rgb(var(--amber-500-rgb))" },
  danger: { text: "rgb(var(--rose-600-rgb))", soft: "rgb(var(--rose-500-rgb) / 0.12)", solid: "rgb(var(--rose-500-rgb))" },
};

const card = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-card)",
};

/* ─── small pieces ─────────────────────────────────────────────── */

function etaInfo(shipment, info) {
  const expected = shipment.expectedDeliveryDate ? dayjs(shipment.expectedDeliveryDate) : null;
  if (info.stage === 4 && shipment.deliveredDate) {
    const late = expected && dayjs(shipment.deliveredDate).startOf("day").isAfter(expected, "day");
    return {
      label: "Delivered on",
      value: formatDate(shipment.deliveredDate),
      note: expected ? (late ? `Late, ETA was ${formatDate(expected)}` : "On time") : null,
      tone: late ? "warning" : "success",
    };
  }
  if (!expected) return { label: "Expected delivery", value: "Not set", note: null, tone: "brand" };
  if (info.stage === 4 || info.tone === "danger") {
    return { label: "Expected delivery", value: formatDate(expected), note: null, tone: "brand" };
  }
  const days = expected.startOf("day").diff(dayjs().startOf("day"), "day");
  return {
    label: "Expected delivery",
    value: formatDate(expected),
    note: days > 1 ? `in ${days} days` : days === 1 ? "tomorrow" : days === 0 ? "today" : `overdue by ${-days} day${days === -1 ? "" : "s"}`,
    tone: days < 0 ? "danger" : "brand",
  };
}

function RouteScene({ info, stage, city }) {
  const pos = info.pos ?? TRUCK_POSITION[stage];
  const tone = TONE[info.tone];
  const delivered = stage === 4 && info.tone !== "danger";

  return (
    <div className="relative h-20 sm:h-28" role="img" aria-label={`${info.title}: parcel ${Math.round(pos * 100)}% of the way to ${city}`}>
      {/* origin + destination */}
      <div className="absolute bottom-3 left-0 flex w-11 flex-col items-center sm:w-24">
        <WarehouseIllustration className="w-11 sm:w-20" />
      </div>
      <div className="absolute bottom-3 right-0 flex w-11 flex-col items-center sm:w-24">
        <HouseIllustration className="w-11 sm:w-20" delivered={delivered} />
      </div>

      {/* road; --truck-w keeps the truck fully on the road at every width */}
      <div className="absolute bottom-4 left-12 right-12 [--truck-w:3.75rem] sm:left-[5.5rem] sm:right-[5.5rem] sm:[--truck-w:7rem]">
        <div className="relative h-2.5 rounded-full sm:h-3" style={{ backgroundColor: "var(--bg-surface3)" }}>
          {/* travelled distance: from the warehouse, or back from the customer for RTO */}
          <div
            className={`absolute inset-y-0 rounded-full transition-[width] duration-700 ${info.reverse ? "right-0" : "left-0"}`}
            style={{
              width: `calc(${info.reverse ? 1 - pos : pos} * (100% - var(--truck-w)) + var(--truck-w) / 2)`,
              backgroundColor: tone.solid,
              opacity: 0.85,
            }}
          />
          <div className={`sd-road-dash absolute inset-x-2 top-1/2 h-[2px] -translate-y-1/2 ${info.moving ? "is-moving" : ""}`} />
        </div>

        {/* truck */}
        <div
          className="absolute bottom-1 transition-[left] duration-700 ease-out"
          style={{ left: `calc(${pos} * (100% - var(--truck-w)))`, width: "var(--truck-w)" }}
        >
          <div className={info.moving ? "sd-truck is-moving" : "sd-truck"} style={info.reverse ? { transform: "scaleX(-1)" } : undefined}>
            {info.moving && (
              <span className="sd-truck-speed" aria-hidden="true">
                <i /><i /><i />
              </span>
            )}
            <TruckIllustration className="block w-full" tone={info.tone === "danger" ? "danger" : delivered ? "success" : "brand"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({ stage, info, shipment }) {
  const failed = info.tone === "danger";
  return (
    <ol className="relative mt-2 grid grid-cols-5">
      <div className="absolute left-[10%] right-[10%] top-[15px] h-0.5 sm:top-[17px]" style={{ backgroundColor: "var(--border)" }} aria-hidden="true" />
      <div
        className="absolute left-[10%] top-[15px] h-0.5 transition-[width] duration-700 sm:top-[17px]"
        style={{ width: `${(stage / 4) * 80}%`, backgroundColor: TONE[info.tone].solid }}
        aria-hidden="true"
      />
      {STAGES.map((s, i) => {
        const done = i < stage || (i === stage && i === 4);
        const current = i === stage && i !== 4;
        const Icon = failed && i === stage ? UndoIcon : done ? CheckCircleIcon : s.icon;
        const date =
          i === 0 ? formatDate(shipment.shipmentDate, "DD MMM") :
          i === 4 && shipment.deliveredDate ? formatDate(shipment.deliveredDate, "DD MMM") :
          i === 3 && !done && shipment.expectedDeliveryDate ? `ETA ${formatDate(shipment.expectedDeliveryDate, "DD MMM")}` : "";
        return (
          <li key={s.key} className="relative flex flex-col items-center text-center" aria-current={current ? "step" : undefined}>
            <span
              className={`relative z-[1] flex h-8 w-8 items-center justify-center rounded-full sm:h-9 sm:w-9 ${current ? "sd-step-pulse" : ""}`}
              style={
                done || current
                  ? { backgroundColor: TONE[info.tone].solid, color: "var(--brand-contrast)", boxShadow: "0 0 0 4px var(--bg-surface)" }
                  : { backgroundColor: "var(--bg-surface2)", color: "var(--text-tertiary)", border: "1px solid var(--border)", boxShadow: "0 0 0 4px var(--bg-surface)" }
              }
            >
              <Icon sx={{ fontSize: 18 }} />
            </span>
            <span
              className="mt-2 px-0.5 text-[10px] font-semibold leading-tight sm:text-xs"
              style={{ color: done || current ? "var(--text-primary)" : "var(--text-tertiary)" }}
            >
              {failed && i === stage ? "Returning" : s.label}
            </span>
            {date && (
              <span className="mt-0.5 hidden text-[10px] sm:block" style={{ color: "var(--text-tertiary)" }}>
                {date}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function DetailTile({ icon: Icon, label, value, mono, action }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl p-3" style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border-subtle)" }}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--bg-surface)", color: "var(--brand-text)", border: "1px solid var(--border)" }}>
        <Icon sx={{ fontSize: 17 }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          {label}
        </div>
        <div className={`mt-0.5 truncate text-sm font-semibold ${mono ? "font-mono tracking-tight" : ""}`} style={{ color: "var(--text-primary)" }} title={typeof value === "string" ? value : undefined}>
          {value}
        </div>
      </div>
      {action}
    </div>
  );
}

function Panel({ title, icon: Icon, children, aside }) {
  return (
    <section className="overflow-hidden rounded-2xl" style={card}>
      <header className="flex items-center justify-between gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand-text)" }}>
            <Icon sx={{ fontSize: 18 }} />
          </span>
          <h2 className="font-display text-base font-bold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h2>
        </div>
        {aside}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ─── page ─────────────────────────────────────────────────────── */

export default function ShipmentDetail({ shipment }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const [editOpen, setEditOpen] = useState(false);

  const info = STATUS_INFO[shipment.deliveryStatus] || {
    stage: 0, title: shipment.deliveryStatus, tone: "brand", copy: () => "",
  };
  const stage = info.stage;
  const tone = TONE[info.tone];
  const eta = etaInfo(shipment, info);
  const deliveryDone = stage === 4;
  const isClosed = deliveryDone || info.tone === "danger";

  const handleMarkDelivered = () => {
    dispatch(updateShipmentStatus({ id: shipment.id, deliveryStatus: "Delivered" }));
    toast.success("Shipment marked as delivered");
  };

  const handleStatusChange = (e) => {
    const next = e.target.value;
    if (next === shipment.deliveryStatus) return;
    dispatch(updateShipmentStatus({ id: shipment.id, deliveryStatus: next }));
    toast.success(`Status changed to "${next}"`);
  };

  const handleEditSubmit = (payload) => {
    dispatch(editShipment(payload));
    toast.success("Shipment updated");
  };

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Couldn't copy ${label}`);
    }
  };

  const history = [
    {
      title: "Manifest generated",
      desc: `Shipping label created with ${shipment.courierName}`,
      time: formatDateTime(shipment.shipmentDate),
      state: "done",
      icon: ReceiptLongIcon,
    },
    {
      title: "Handed to courier",
      desc: `AWB ${shipment.awbNumber || "pending"}`,
      time: stage >= 2 ? "Picked up" : stage === 1 ? "Awaiting pickup" : "",
      state: stage >= 2 ? "done" : stage === 1 ? "current" : "pending",
      icon: Inventory2OutlinedIcon,
    },
    {
      title: info.reverse ? "Return to origin" : "In transit",
      desc: info.reverse ? "Delivery failed, heading back to the warehouse" : `Moving towards ${shipment.destinationCity}`,
      time: "",
      state: info.reverse ? "failed" : stage > 2 ? "done" : stage === 2 ? "current" : "pending",
      icon: info.reverse ? UndoIcon : LocalShippingOutlinedIcon,
    },
    {
      title: "Out for delivery",
      desc: shipment.expectedDeliveryDate ? `ETA ${formatDate(shipment.expectedDeliveryDate)}` : "ETA not set",
      time: "",
      state: info.reverse ? "pending" : stage > 3 ? "done" : stage === 3 ? "current" : "pending",
      icon: DeliveryDiningOutlinedIcon,
    },
    {
      title: shipment.deliveryStatus === "Delivered (Returned)" ? "Delivered, later returned" : "Delivered to customer",
      desc: shipment.deliveredDate ? `Received in ${shipment.destinationCity}` : "Pending delivery",
      time: shipment.deliveredDate ? formatDateTime(shipment.deliveredDate) : "",
      state: deliveryDone ? "done" : "pending",
      icon: HomeOutlinedIcon,
    },
  ];

  const stateStyle = {
    done: { backgroundColor: "rgb(var(--emerald-500-rgb) / 0.14)", color: "rgb(var(--emerald-600-rgb))", border: "1px solid rgb(var(--emerald-500-rgb) / 0.35)" },
    current: { backgroundColor: tone.solid, color: "var(--brand-contrast)", border: "1px solid transparent" },
    failed: { backgroundColor: TONE.danger.soft, color: TONE.danger.text, border: "1px solid rgb(var(--rose-500-rgb) / 0.35)" },
    pending: { backgroundColor: "var(--bg-surface2)", color: "var(--text-tertiary)", border: "1px dashed var(--border-strong)" },
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm" style={{ color: "var(--text-tertiary)" }}>
        <Link href="/shipping-returns" className="inline-flex items-center gap-1.5 py-1 pr-2 font-medium transition hover:opacity-80" style={{ color: "var(--text-secondary)" }}>
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          Shipping &amp; Returns
        </Link>
        <ChevronRightIcon sx={{ fontSize: 16 }} style={{ color: "var(--breadcrumb-sep)" }} />
        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{shipment.id}</span>
      </nav>

      {/* ── Tracking hero ── */}
      <section className="sd-rise-in relative overflow-hidden rounded-2xl" style={card}>
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-32 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: tone.soft }} />
        <div aria-hidden="true" className="sd-hero-grid pointer-events-none absolute inset-0" />

        <div className="relative p-5 sm:p-7">
          {/* top row */}
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status={shipment.marketplace} />
                <span className="text-xs font-semibold tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  SHIPMENT {shipment.id}
                </span>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ border: "1px dashed var(--border-strong)", color: "var(--text-tertiary)" }}>
                  Demo Data
                </span>
              </div>
              <h1 className="sd-page-title mt-3 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: tone.text }}>
                {info.title}
              </h1>
              <p className="mt-1.5 max-w-xl text-sm" style={{ color: "var(--text-secondary)" }}>
                {info.copy(shipment)}
              </p>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
              <div className="rounded-xl px-4 py-3 sm:min-w-[200px]" style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  <EventOutlinedIcon sx={{ fontSize: 14 }} />
                  {eta.label}
                </div>
                <div className="font-display mt-0.5 text-xl font-bold" style={{ color: "var(--text-primary)" }}>{eta.value}</div>
                {eta.note && (
                  <div className="text-xs font-semibold" style={{ color: TONE[eta.tone].text }}>{eta.note}</div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {!isClosed && (
                  <Button tone="success" startIcon={<CheckCircleIcon />} onClick={handleMarkDelivered}>
                    Mark Delivered
                  </Button>
                )}
                <Button variant="outline" tone="neutral" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                  Edit
                </Button>
              </div>
            </div>
          </div>

          {/* route illustration */}
          <div className="mt-6 rounded-2xl px-3 pt-4 sm:px-6" style={{ background: "linear-gradient(180deg, var(--bg-surface2), transparent)" }}>
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
              <label htmlFor="shipment-status" className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Delivery status
              </label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: tone.solid }}
                />
                <select
                  id="shipment-status"
                  value={shipment.deliveryStatus}
                  onChange={handleStatusChange}
                  className="cursor-pointer appearance-none rounded-full py-1.5 pl-7 pr-9 text-sm font-semibold outline-none transition focus-visible:ring-2"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    color: tone.text,
                    border: `1px solid ${tone.solid}`,
                    boxShadow: `0 0 0 3px ${tone.soft}`,
                  }}
                >
                  {(DELIVERY_STATUSES.includes(shipment.deliveryStatus)
                    ? DELIVERY_STATUSES
                    : [shipment.deliveryStatus, ...DELIVERY_STATUSES]
                  ).map((s) => (
                    <option key={s} value={s} style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-surface)" }}>
                      {s}
                    </option>
                  ))}
                </select>
                <ExpandMoreIcon
                  aria-hidden="true"
                  sx={{ fontSize: 18 }}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                  style={{ color: tone.text }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
              <span>Your warehouse</span>
              <span className="text-right">
                {shipment.destinationCity} · {shipment.pincode}
              </span>
            </div>
            <RouteScene info={info} stage={stage} city={shipment.destinationCity} />
          </div>

          <div className="mt-5">
            <Stepper stage={stage} info={info} shipment={shipment} />
          </div>
        </div>
      </section>

      {/* ── Details ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Shipment details" icon={LocalShippingOutlinedIcon}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailTile icon={LocalShippingOutlinedIcon} label="Courier" value={shipment.courierName} />
              <DetailTile
                icon={QrCode2Icon}
                label="AWB number"
                value={shipment.awbNumber || "Pending"}
                mono
                action={
                  shipment.awbNumber && (
                    <IconButton label="Copy AWB number" onClick={() => copy(shipment.awbNumber, "AWB number")}>
                      <ContentCopyIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  )
                }
              />
              <DetailTile icon={PlaceOutlinedIcon} label="Destination" value={shipment.destinationCity} />
              <DetailTile icon={PinDropOutlinedIcon} label="Pincode" value={shipment.pincode} mono />
              <DetailTile icon={EventOutlinedIcon} label="Shipped on" value={formatDateTime(shipment.shipmentDate)} />
              <DetailTile icon={HomeOutlinedIcon} label="Delivered on" value={shipment.deliveredDate ? formatDateTime(shipment.deliveredDate) : "Not yet"} />
            </div>
          </Panel>

          <Panel title="Package" icon={Inventory2OutlinedIcon}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center self-center rounded-2xl" style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border-subtle)" }}>
                <ParcelIllustration className="w-16" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{shipment.itemsSummary}</p>
                <Link
                  href={`/orders/${shipment.orderId}`}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                  style={{ color: "var(--brand-text)" }}
                >
                  Order <span className="font-mono">{shipment.orderId}</span>
                  <OpenInNewIcon sx={{ fontSize: 13 }} />
                </Link>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "var(--bg-surface2)" }}>
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      <ScaleOutlinedIcon sx={{ fontSize: 13 }} /> Weight
                    </div>
                    <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{shipment.weightKg} kg</div>
                  </div>
                  <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "var(--bg-surface2)" }}>
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      <CurrencyRupeeIcon sx={{ fontSize: 13 }} /> Shipping cost
                    </div>
                    <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{formatCurrency(shipment.shippingCost)}</div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Tracking history */}
        <div>
          <Panel title="Tracking history" icon={HistoryIcon}>
            <ol className="relative">
              {history.map((h, i) => {
                const Icon = h.state === "done" ? CheckCircleIcon : h.icon;
                const last = i === history.length - 1;
                return (
                  <li key={h.title} className="relative flex gap-3 pb-5 last:pb-0">
                    {!last && (
                      <span
                        aria-hidden="true"
                        className="absolute left-[15px] top-9 bottom-1 w-px"
                        style={{ backgroundColor: h.state === "done" ? "rgb(var(--emerald-500-rgb) / 0.45)" : "var(--border)" }}
                      />
                    )}
                    <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${h.state === "current" ? "sd-step-pulse" : ""}`} style={stateStyle[h.state]}>
                      <Icon sx={{ fontSize: 16 }} />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: h.state === "pending" ? "var(--text-tertiary)" : "var(--text-primary)" }}>
                          {h.title}
                        </span>
                        {h.state === "current" && (
                          <span className="rounded-full px-1.5 py-px text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: tone.soft, color: tone.text }}>
                            Now
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>{h.desc}</div>
                      {h.time && <div className="mt-0.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>{h.time}</div>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </div>
      </div>

      <EditShipmentDialog open={editOpen} shipment={shipment} onClose={() => setEditOpen(false)} onSubmit={handleEditSubmit} />
    </div>
  );
}
