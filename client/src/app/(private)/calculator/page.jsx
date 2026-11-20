"use client";

import React, { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/common/Button";
import IconButton from "@/components/common/IconButton";
import SearchInput from "@/components/common/SearchInput";
import CardViewToggle from "@/components/common/CardViewToggle";
import DataTable from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import SavedCalculationCard from "@/features/calculator/SavedCalculationCard";
import { useToast } from "@/components/common/ToastProvider";
import {
  saveCalculation,
  updateCalculation,
  deleteCalculation,
} from "@/store/slices/calculatorSlice";
import { calculatePricing, marginTone } from "@/lib/pricingCalculator";
import { formatCurrency, formatDate } from "@/lib/formatters";

import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalculateIcon from "@mui/icons-material/Calculate";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CheckIcon from "@mui/icons-material/Check";

const PLATFORMS = ["Meesho", "Flipkart", "Amazon", "Own Website", "Other"];

const EMPTY_FORM = {
  productName: "",
  platform: "Meesho",
  purchasePrice: "",
  sellingPrice: "",
  commissionType: "percent",
  commissionValue: "",
  forwardShipping: "",
  reverseShipping: "",
  packagingCost: "",
  otherExpenses: "",
  targetMargin: "20",
  notes: "",
};

const INPUT_KEYS = [
  "purchasePrice",
  "sellingPrice",
  "commissionType",
  "commissionValue",
  "forwardShipping",
  "reverseShipping",
  "packagingCost",
  "otherExpenses",
  "targetMargin",
];

const TONE_TEXT = { emerald: "text-emerald-600", amber: "text-amber-600", rose: "text-rose-600" };
const BAR_COLORS = ["#6366f1", "#f59e0b", "#3b82f6", "#f43f5e", "#10b981", "#94a3b8"];

const inputStyle = {
  backgroundColor: "var(--bg-surface2)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

function Field({ label, hint, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-rose-600 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function MoneyInput({ value, onChange, error, suffix = "₹", prefix = true, ...rest }) {
  return (
    <div className="relative">
      {prefix && (
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
          style={{ color: "var(--text-tertiary)" }}
        >
          {suffix}
        </span>
      )}
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={`w-full ${prefix ? "pl-7" : "pl-3"} pr-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition`}
        style={{ ...inputStyle, ...(error ? { borderColor: "rgb(244 63 94)" } : null) }}
        {...rest}
      />
    </div>
  );
}

export default function CalculatorPage() {
  const dispatch = useDispatch();
  const saved = useSelector((state) => state.calculator.saved);
  const products = useSelector((state) => state.products.items || []);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [justSaved, setJustSaved] = useState(false);
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [viewMode, setViewMode] = useState("cards");
  const [toDelete, setToDelete] = useState(null);
  const formTopRef = useRef(null);

  const result = useMemo(() => calculatePricing(form), [form]);
  const hasInput = Number(form.sellingPrice) > 0 || Number(form.purchasePrice) > 0;
  const tone = marginTone(result.profitMargin);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const loadProduct = (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setForm((prev) => ({
      ...prev,
      productName: p.name,
      purchasePrice: String(p.purchaseCost ?? ""),
      sellingPrice: String(p.sellingPrice ?? ""),
    }));
    setErrors({});
    toast.info(`Filled from "${p.name}"`);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!form.productName.trim()) e.productName = "Give this calculation a product name";
    if (!(Number(form.sellingPrice) > 0)) e.sellingPrice = "Enter a selling price";
    if (!(Number(form.purchasePrice) > 0)) e.purchasePrice = "Enter a purchase price";
    if (form.commissionType === "percent" && Number(form.commissionValue) >= 100)
      e.commissionValue = "Commission must be under 100%";
    setErrors(e);
    const count = Object.keys(e).length;
    if (count) toast.error(count === 1 ? Object.values(e)[0] : `Fix ${count} highlighted fields before saving`);
    return count === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const inputs = {};
    INPUT_KEYS.forEach((k) => {
      inputs[k] = k === "commissionType" ? form[k] : Number(form[k]) || 0;
    });
    const payload = {
      productName: form.productName.trim(),
      platform: form.platform,
      notes: form.notes.trim(),
      inputs,
      result: {
        commissionAmount: result.commissionAmount,
        totalCost: result.totalCost,
        netProfit: result.netProfit,
        profitMargin: result.profitMargin,
        roi: result.roi,
        breakEvenPrice: result.breakEvenPrice,
        finalSellingPrice: result.finalSellingPrice,
        isProfit: result.isProfit,
      },
    };
    if (editingId) dispatch(updateCalculation({ id: editingId, ...payload }));
    else dispatch(saveCalculation(payload));
    if (editingId) toast.success(`"${payload.productName}" updated`);
    else if (result.isProfit) toast.success(`"${payload.productName}" saved`);
    else toast.warning(`"${payload.productName}" saved. Heads up: this price sells at a loss.`);
    resetForm();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const toForm = (calc) => {
    const next = { ...EMPTY_FORM, productName: calc.productName, platform: calc.platform, notes: calc.notes || "" };
    INPUT_KEYS.forEach((k) => {
      next[k] = k === "commissionType" ? calc.inputs[k] : String(calc.inputs[k] ?? "");
    });
    return next;
  };

  const handleEdit = (calc) => {
    setForm(toForm(calc));
    setEditingId(calc.id);
    setErrors({});
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast.info(`Editing "${calc.productName}"`);
  };

  const handleDuplicate = (calc) => {
    setForm({ ...toForm(calc), productName: `${calc.productName} (copy)` });
    setEditingId(null);
    setErrors({});
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast.info("Copied into the calculator. Save it to keep the copy.");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return saved.filter((c) => {
      const matchesSearch =
        !q || c.productName.toLowerCase().includes(q) || (c.notes || "").toLowerCase().includes(q);
      const matchesPlatform = platformFilter === "All" || c.platform === platformFilter;
      return matchesSearch && matchesPlatform;
    });
  }, [saved, search, platformFilter]);

  // Flattened rows so DataTable can sort on numbers
  const tableRows = useMemo(
    () =>
      filtered.map((c) => ({
        ...c,
        sellingPrice: c.inputs.sellingPrice,
        totalCost: c.result.totalCost,
        netProfit: c.result.netProfit,
        profitMargin: c.result.profitMargin,
        finalSellingPrice: c.result.finalSellingPrice ?? 0,
      })),
    [filtered]
  );

  const columns = [
    {
      key: "productName",
      label: "Product",
      render: (v, row) => (
        <div className="min-w-0">
          <div className="font-semibold truncate max-w-[220px]" style={{ color: "var(--text-primary)" }}>{v}</div>
          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{row.platform}</div>
        </div>
      ),
    },
    { key: "sellingPrice", label: "Selling Price", align: "right", render: (v) => formatCurrency(v) },
    { key: "totalCost", label: "Total Cost", align: "right", render: (v) => formatCurrency(v) },
    {
      key: "netProfit",
      label: "Profit / Loss",
      align: "right",
      render: (v) => <span className={`font-semibold ${v >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatCurrency(v)}</span>,
    },
    {
      key: "profitMargin",
      label: "Margin",
      align: "right",
      render: (v) => <span className={`font-semibold ${TONE_TEXT[marginTone(v)]}`}>{v.toFixed(1)}%</span>,
    },
    {
      key: "finalSellingPrice",
      label: "Suggested Price",
      align: "right",
      render: (_, row) => (row.result.finalSellingPrice === null ? "N/A" : formatCurrency(row.result.finalSellingPrice)),
    },
    { key: "updatedAt", label: "Saved", render: (v) => formatDate(v) },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton label="Edit calculation" tone="primary" onClick={() => handleEdit(row)}>
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton label="Delete calculation" tone="danger" onClick={() => setToDelete(row)}>
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </div>
      ),
    },
  ];

  const commissionInvalid = form.commissionType === "percent" && Number(form.commissionValue) >= 100;
  const maxBar = Math.max(...result.breakdown.map((b) => b.value), 1);

  return (
    <div ref={formTopRef} className="scroll-mt-24">
      <PageHeader
        title="Pricing Calculator"
        subtitle="Add up every cost of selling one unit, see your real profit and margin, and find the price that hits your target."
        breadcrumbs={[{ label: "Pricing Calculator" }]}
        actions={
          <Button variant="outline" tone="neutral" startIcon={<AddIcon />} onClick={resetForm}>
            New Calculation
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Inputs ───────────────────────────────────────── */}
        <section
          className="lg:col-span-3 rounded-2xl p-4 sm:p-6 space-y-6"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              {editingId ? "Edit calculation" : "Product & pricing"}
            </h2>
            {editingId && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600">
                Editing saved calculation
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Product name *" error={errors.productName} className="sm:col-span-2">
              <input
                type="text"
                value={form.productName}
                onChange={(e) => set("productName", e.target.value)}
                placeholder="e.g. Cotton printed kurta, size M"
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                style={{ ...inputStyle, ...(errors.productName ? { borderColor: "rgb(244 63 94)" } : null) }}
              />
            </Field>

            {products.length > 0 && (
              <Field label="Fill from catalogue" hint="Copies the product name, purchase cost and selling price">
                <select
                  value=""
                  onChange={(e) => loadProduct(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
                  style={inputStyle}
                >
                  <option value="">Choose a product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Platform">
              <select
                value={form.platform}
                onChange={(e) => set("platform", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
                style={inputStyle}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
              Price
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Product purchase price *" hint="What you pay per unit" error={errors.purchasePrice}>
                <MoneyInput value={form.purchasePrice} onChange={(v) => set("purchasePrice", v)} error={errors.purchasePrice} />
              </Field>
              <Field label="Selling price *" hint="Price the customer pays" error={errors.sellingPrice}>
                <MoneyInput value={form.sellingPrice} onChange={(v) => set("sellingPrice", v)} error={errors.sellingPrice} />
              </Field>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
              Selling costs (per unit)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Platform commission"
                error={errors.commissionValue || (commissionInvalid ? "Commission must be under 100%" : null)}
                hint={
                  form.commissionType === "percent"
                    ? `= ${formatCurrency(result.commissionAmount)} on this selling price`
                    : "Flat fee charged per order"
                }
              >
                <div className="flex gap-2">
                  <div className="flex-1 min-w-0">
                    <MoneyInput
                      value={form.commissionValue}
                      onChange={(v) => set("commissionValue", v)}
                      prefix={form.commissionType === "flat"}
                      error={errors.commissionValue || commissionInvalid}
                    />
                  </div>
                  <div
                    role="group"
                    aria-label="Commission type"
                    className="inline-flex items-center gap-1 rounded-lg p-1 shrink-0"
                    style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border)" }}
                  >
                    {[
                      { v: "percent", l: "%" },
                      { v: "flat", l: "₹" },
                    ].map(({ v, l }) => (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={form.commissionType === v}
                        onClick={() => set("commissionType", v)}
                        className="min-w-8 px-2 py-1 rounded-md text-sm font-semibold transition"
                        style={{
                          color: form.commissionType === v ? "var(--brand-text)" : "var(--text-tertiary)",
                          backgroundColor: form.commissionType === v ? "var(--bg-surface)" : "transparent",
                          boxShadow: form.commissionType === v ? "var(--shadow-card)" : "none",
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </Field>
              <Field label="Forward shipping charges" hint="Courier cost to deliver the order">
                <MoneyInput value={form.forwardShipping} onChange={(v) => set("forwardShipping", v)} />
              </Field>
              <Field label="Reverse shipping charges" hint="Average return / RTO cost per order">
                <MoneyInput value={form.reverseShipping} onChange={(v) => set("reverseShipping", v)} />
              </Field>
              <Field label="Packaging costs" hint="Box, poly bag, tape, labels">
                <MoneyInput value={form.packagingCost} onChange={(v) => set("packagingCost", v)} />
              </Field>
              <Field label="Other miscellaneous expenses" hint="Ads, payment gateway, damages, etc." className="sm:col-span-2">
                <MoneyInput value={form.otherExpenses} onChange={(v) => set("otherExpenses", v)} />
              </Field>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
              Target
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Target profit margin (%)" hint="Used to suggest your final selling price">
                <MoneyInput value={form.targetMargin} onChange={(v) => set("targetMargin", v)} prefix={false} />
              </Field>
              <Field label="Notes">
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* ── Results ──────────────────────────────────────── */}
        <aside className="lg:col-span-2">
          <div
            className="lg:sticky lg:top-24 rounded-2xl p-4 sm:p-6 space-y-5"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-2">
              <CalculateIcon sx={{ fontSize: 20 }} style={{ color: "var(--brand-text)" }} />
              <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Result</h2>
            </div>

            {/* Profit headline */}
            <div
              className={`rounded-xl p-4 ring-1 ${
                !hasInput
                  ? "ring-slate-500/20"
                  : result.isProfit
                  ? "bg-emerald-500/10 ring-emerald-500/20"
                  : "bg-rose-500/10 ring-rose-500/20"
              }`}
              style={!hasInput ? { backgroundColor: "var(--bg-surface2)" } : undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  {result.isProfit ? "Net profit per unit" : "Net loss per unit"}
                </span>
                {hasInput &&
                  (result.isProfit ? (
                    <TrendingUpIcon className="text-emerald-600" sx={{ fontSize: 20 }} />
                  ) : (
                    <TrendingDownIcon className="text-rose-600" sx={{ fontSize: 20 }} />
                  ))}
              </div>
              <div
                className={`font-display text-3xl font-bold tracking-tight mt-1 ${
                  hasInput ? (result.isProfit ? "text-emerald-600" : "text-rose-600") : ""
                }`}
                style={!hasInput ? { color: "var(--text-primary)" } : undefined}
              >
                {formatCurrency(result.netProfit)}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Profit margin{" "}
                <span className={`font-bold ${hasInput ? TONE_TEXT[tone] : ""}`}>
                  {result.profitMargin.toFixed(1)}%
                </span>
                {Number(form.purchasePrice) > 0 && (
                  <> · ROI <span className="font-bold">{result.roi.toFixed(1)}%</span></>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric label="Total product cost" value={formatCurrency(result.totalCost)} />
              <Metric
                label="Break-even price"
                value={result.breakEvenPrice === null ? "N/A" : formatCurrency(result.breakEvenPrice)}
              />
            </div>

            {/* Final selling price */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border)" }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Final selling price for {Number(form.targetMargin) || 0}% margin
              </div>
              <div className="flex items-center justify-between gap-3 mt-1">
                <div className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {result.finalSellingPrice === null ? "Not reachable" : formatCurrency(result.finalSellingPrice)}
                </div>
                {result.finalSellingPrice !== null &&
                  result.finalSellingPrice > 0 &&
                  result.finalSellingPrice !== Number(form.sellingPrice) && (
                    <Button variant="soft" onClick={() => set("sellingPrice", String(result.finalSellingPrice))}>
                      Use this price
                    </Button>
                  )}
              </div>
              {result.finalSellingPrice === null && (
                <p className="text-[11px] mt-1 text-amber-600">
                  Commission plus target margin is 100% or more. Lower one of them.
                </p>
              )}
            </div>

            {/* Breakdown */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                Cost breakdown
              </div>
              <ul className="space-y-2">
                {result.breakdown.map((b, i) => (
                  <li key={b.key} className="text-xs">
                    <div className="flex justify-between gap-2" style={{ color: "var(--text-secondary)" }}>
                      <span>{b.label}</span>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{formatCurrency(b.value)}</span>
                    </div>
                    <div className="h-1.5 mt-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-surface2)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${(b.value / maxBar) * 100}%`, backgroundColor: BAR_COLORS[i] }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                fullWidth
                size="medium"
                tone={justSaved ? "success" : "primary"}
                startIcon={justSaved ? <CheckIcon /> : <SaveIcon />}
                onClick={handleSave}
              >
                {justSaved ? "Saved" : editingId ? "Update Calculation" : "Save Calculation"}
              </Button>
              <Button variant="outline" tone="neutral" size="medium" onClick={resetForm} aria-label="Clear form">
                <RestartAltIcon sx={{ fontSize: 18 }} />
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Saved calculations ─────────────────────────────── */}
      <section className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Saved calculations
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {saved.length} saved · open one to edit it in the calculator
            </p>
          </div>
          {saved.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <SearchInput value={search} onChange={setSearch} placeholder="Search product or notes..." />
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg focus:outline-none"
                style={inputStyle}
                aria-label="Filter by platform"
              >
                <option value="All">All platforms</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <CardViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          )}
        </div>

        {saved.length === 0 ? (
          <EmptyState
            icon={CalculateIcon}
            title="No saved calculations yet"
            description="Fill in the calculator above and press Save Calculation. Your saved pricing will show up here as cards."
          />
        ) : filtered.length === 0 ? (
          <EmptyState title="No matches" description="No saved calculations match your search or platform filter." />
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <SavedCalculationCard
                key={c.id}
                calc={c}
                active={c.id === editingId}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={setToDelete}
              />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={tableRows}
            keyField="id"
            initialSortKey="updatedAt"
            initialSortDir="desc"
            emptyMessage="No saved calculations."
          />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this calculation?"
        message={toDelete ? `"${toDelete.productName}" will be removed from your saved calculations.` : ""}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={() => {
          dispatch(deleteCalculation(toDelete.id));
          if (toDelete.id === editingId) resetForm();
          toast.success(`"${toDelete.productName}" deleted`);
        }}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border)" }}>
      <div className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>{label}</div>
      <div className="text-base font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}
