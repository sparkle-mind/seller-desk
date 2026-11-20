"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import Tooltip from "@mui/material/Tooltip";
import ProductImage from "@/components/common/ProductImage";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import StatCard from "@/components/common/StatCard";
import Button from "@/components/common/Button";
import IconButton from "@/components/common/IconButton";
import ProductFormDialog from "@/features/products/ProductFormDialog";
import { updateProduct } from "@/store/slices/productsSlice";
import { formatCurrency, formatNumber, formatDate } from "@/lib/formatters";

// MUI Icons
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ScaleIcon from "@mui/icons-material/Scale";
import StraightenIcon from "@mui/icons-material/Straighten";
import EventIcon from "@mui/icons-material/Event";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PieChartOutlineIcon from "@mui/icons-material/PieChartOutline";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import StyleIcon from "@mui/icons-material/Style";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Flipkart fee is shown as "~12% + fixed fee"; estimates below use the 12%.
const FLIPKART_COMMISSION = 0.12;

const units = (n) => `${formatNumber(n)} ${Number(n) === 1 ? "unit" : "units"}`;

const surfaceStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-card)",
};

// Section card with an icon title row
function Panel({ title, icon: Icon, iconClass = "text-blue-500", action, className = "", children }) {
  return (
    <section className={`rounded-2xl p-4 sm:p-5 min-w-0 ${className}`} style={surfaceStyle}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          {Icon && <Icon sx={{ fontSize: 18 }} className={iconClass} />}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

// Label / value line used inside panels
function Row({ label, children, hint }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-2.5 text-xs"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <span className="min-w-0" style={{ color: "var(--text-secondary)" }}>
        {label}
        {hint && (
          <span className="block text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {hint}
          </span>
        )}
      </span>
      <span className="shrink-0 text-right font-semibold" style={{ color: "var(--text-primary)" }}>
        {children}
      </span>
    </div>
  );
}

function SpecTile({ icon: Icon, label, value }) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 min-w-0"
      style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border-subtle)" }}
    >
      <Icon sx={{ fontSize: 18 }} style={{ color: "var(--text-tertiary)" }} />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          {label}
        </div>
        <div className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function getStockHealth(stock, reorderLevel) {
  if (stock <= 0) return { label: "Out of Stock", tone: "rose", bar: "bg-rose-500", text: "text-rose-600" };
  if (stock <= reorderLevel) return { label: "Low Stock", tone: "amber", bar: "bg-amber-500", text: "text-amber-600" };
  if (stock <= reorderLevel * 1.5)
    return { label: "Near Reorder Level", tone: "amber", bar: "bg-amber-500", text: "text-amber-600" };
  return { label: "In Stock", tone: "emerald", bar: "bg-emerald-500", text: "text-emerald-600" };
}

const MARKETPLACES = [
  {
    key: "meesho",
    name: "Meesho",
    portal: "Meesho Seller Portal",
    idLabel: "Catalog ID",
    dot: "bg-pink-500",
    accent: "text-pink-600",
    commission: 0,
    feeNote: "0% commission",
  },
  {
    key: "flipkart",
    name: "Flipkart",
    portal: "Flipkart Seller Hub",
    idLabel: "FSN ID",
    dot: "bg-blue-500",
    accent: "text-blue-600",
    commission: FLIPKART_COMMISSION,
    feeNote: "~12% + fixed fee",
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const orders = useSelector((state) => state.orders.items);

  const [editOpen, setEditOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const product = products.find((p) => p.id === params.id);

  if (!product) {
    return (
      <div className="p-8 text-center rounded-2xl" style={surfaceStyle}>
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Product Not Found
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          The requested product ID &quot;{params.id}&quot; does not exist.
        </p>
        <Button component={Link} href="/products" startIcon={<ArrowBackIcon />} className="!mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  // Related orders for this product
  const productOrders = orders.filter((o) => o.productId === product.id);
  const validOrders = productOrders.filter((o) => o.orderStatus !== "Cancelled");
  const totalUnitsSold = validOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);
  const totalGrossRevenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const recentOrders = [...productOrders]
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    .slice(0, 5);

  // Unit economics
  const cost = product.purchaseCost || 0;
  const price = product.sellingPrice || 0;
  const profitPerUnit = price - cost;
  const marginPct = price ? Math.round((profitPerUnit / price) * 100) : 0;
  const costPct = price ? Math.min(100, Math.max(0, (cost / price) * 100)) : 100;
  const discountPct = product.mrp > price ? Math.round(((product.mrp - price) / product.mrp) * 100) : 0;

  // Stock
  const stock = product.stock || 0;
  const reorderLevel = product.reorderLevel || 15;
  const health = getStockHealth(stock, reorderLevel);
  const barMax = Math.max(stock, reorderLevel * 3, 1);
  const stockPct = Math.min(100, (stock / barMax) * 100);
  const reorderPct = Math.min(100, (reorderLevel / barMax) * 100);

  const variants = product.variants || [];

  const handleUpdate = (data) => {
    dispatch(updateProduct({ id: product.id, ...data }));
  };

  const copySku = async () => {
    try {
      await navigator.clipboard.writeText(product.sku);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Could not copy SKU", e);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        subtitle={`${product.category} · ${product.brand || "DesiCart Internal"}`}
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: product.name },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              tone="neutral"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/products")}
            >
              Back
            </Button>
            <Button startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
              Edit Product
            </Button>
          </>
        }
      />

      {/* Overview: image + identity + pricing */}
      <section className="rounded-2xl p-4 sm:p-5" style={surfaceStyle}>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,280px)_1fr] gap-5 lg:gap-7">
          <div
            className="relative aspect-square w-full rounded-xl overflow-hidden"
            style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border-subtle)" }}
          >
            <ProductImage
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 280px, 100vw"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip status={product.status} />
              <StatusChip status={health.label === "Near Reorder Level" ? "Low Stock" : health.label} />
              <span
                className="inline-flex items-center gap-1 rounded-lg pl-2.5 pr-1 py-0.5 text-[11px] font-mono font-semibold"
                style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
              >
                {product.sku}
                <IconButton label={copied ? "Copied" : "Copy SKU"} onClick={copySku} className="!p-1">
                  {copied ? (
                    <CheckIcon sx={{ fontSize: 13 }} className="text-emerald-500" />
                  ) : (
                    <ContentCopyIcon sx={{ fontSize: 13 }} />
                  )}
                </IconButton>
              </span>
            </div>

            {/* Price block */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Selling price
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(price)}
                </span>
                {product.mrp > price && (
                  <>
                    <span className="text-sm line-through" style={{ color: "var(--text-tertiary)" }}>
                      MRP {formatCurrency(product.mrp)}
                    </span>
                    <span className="rounded-md px-1.5 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700">
                      {discountPct}% off
                    </span>
                  </>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--text-secondary)" }}>
                {product.description}
              </p>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-auto">
              <SpecTile icon={StorefrontIcon} label="Brand" value={product.brand || "DesiCart Internal"} />
              <SpecTile icon={ScaleIcon} label="Weight" value={`${product.weightKg || 0.5} kg`} />
              <SpecTile icon={StraightenIcon} label="Dimensions" value={product.dimensions || "N/A"} />
              <SpecTile icon={EventIcon} label="Added" value={formatDate(product.createdAt)} />
            </div>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Stock"
          value={units(stock)}
          subtitle={`${health.label} · reorder at ${formatNumber(reorderLevel)}`}
          icon={Inventory2Icon}
          color={health.tone}
        />
        <StatCard
          title="Margin / Unit"
          value={formatCurrency(profitPerUnit)}
          subtitle={`${marginPct}% gross margin`}
          icon={TrendingUpIcon}
          color={profitPerUnit >= 0 ? "emerald" : "rose"}
        />
        <StatCard
          title="Units Sold"
          value={formatNumber(totalUnitsSold)}
          subtitle={`${validOrders.length} ${validOrders.length === 1 ? "order" : "orders"}, excl. cancelled`}
          icon={ShoppingBagIcon}
          color="purple"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(totalGrossRevenue)}
          subtitle="Lifetime gross order value"
          icon={CurrencyRupeeIcon}
          color="blue"
        />
      </div>

      {/* Economics + stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Unit Economics" icon={PieChartOutlineIcon} iconClass="text-emerald-500">
          {/* Cost vs margin bar */}
          <div className="mb-1 flex justify-between text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            <span>Cost {Math.round(costPct)}%</span>
            <span>Margin {marginPct}%</span>
          </div>
          <div
            className="flex h-2.5 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "var(--bg-surface2)" }}
            role="img"
            aria-label={`Cost is ${Math.round(costPct)}% of the selling price, margin is ${marginPct}%`}
          >
            <div className="h-full bg-slate-400" style={{ width: `${costPct}%` }} />
            <div className="h-full bg-emerald-500" style={{ width: `${100 - costPct}%` }} />
          </div>

          <div className="mt-3">
            <Row label="Purchase cost (COGS)">{formatCurrency(cost)}</Row>
            <Row label="Default selling price">{formatCurrency(price)}</Row>
            <Row label="MRP">{formatCurrency(product.mrp)}</Row>
            <Row label="Gross margin per unit" hint={`${marginPct}% of selling price`}>
              <span className={profitPerUnit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                {profitPerUnit >= 0 ? "+" : ""}
                {formatCurrency(profitPerUnit)}
              </span>
            </Row>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {MARKETPLACES.map((m) => {
              const listedPrice = product.marketplaceListings?.[m.key]?.price || price;
              const net = Math.round(listedPrice * (1 - m.commission) - cost);
              return (
                <div
                  key={m.key}
                  className="rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border-subtle)" }}
                >
                  <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
                    Est. net on {m.name}
                  </div>
                  <div className={`mt-0.5 text-base font-bold ${net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatCurrency(net)}
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    after {m.feeNote}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          title="Stock Health"
          icon={WarehouseIcon}
          iconClass="text-blue-500"
          action={
            <Button
              component={Link}
              href={`/inventory/${product.id}`}
              variant="ghost"
              endIcon={<ChevronRightIcon />}
            >
              Manage stock
            </Button>
          }
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="font-display text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                {formatNumber(stock)}
                <span className="ml-1.5 text-sm font-normal" style={{ color: "var(--text-tertiary)" }}>
                  {Number(stock) === 1 ? "unit" : "units"} on hand
                </span>
              </div>
              <div className={`mt-0.5 text-xs font-semibold ${health.text}`}>{health.label}</div>
            </div>
          </div>

          {/* Level bar with reorder marker */}
          <div className="relative mt-4 mb-6">
            <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--bg-surface2)" }}>
              <div className={`h-full rounded-full ${health.bar}`} style={{ width: `${stockPct}%` }} />
            </div>
            <Tooltip title={`Reorder threshold: ${units(reorderLevel)}`} arrow>
              <div
                className="absolute -top-1 h-[18px] w-0.5 rounded-full bg-amber-500"
                style={{ left: `calc(${reorderPct}% - 1px)` }}
              />
            </Tooltip>
            <div
              className="absolute top-4 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-amber-600"
              style={{ left: `${reorderPct}%` }}
            >
              Reorder at {formatNumber(reorderLevel)}
            </div>
          </div>

          <Row label="Reorder threshold">{units(reorderLevel)}</Row>
          <Row label="Buffer above threshold">
            <span className={stock - reorderLevel <= 0 ? "text-rose-600" : ""}>{units(stock - reorderLevel)}</span>
          </Row>
          <Row label="Lifetime units ordered">{units(totalUnitsSold)}</Row>
          <Row label="Variants">{formatNumber(variants.length)}</Row>
        </Panel>
      </div>

      {/* Marketplace listings */}
      <Panel title="Marketplace Listings" icon={StorefrontIcon} iconClass="text-purple-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MARKETPLACES.map((m) => {
            const listing = product.marketplaceListings?.[m.key];
            const listedPrice = listing?.price || price;
            const diff = listedPrice - price;
            return (
              <div
                key={m.key}
                className="rounded-xl p-4"
                style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                    {m.portal}
                  </span>
                  <StatusChip status={listing?.live ? "Active" : "Inactive"} />
                </div>
                <Row label={m.idLabel}>
                  <span className="font-mono">{listing?.listingId || "Not assigned"}</span>
                </Row>
                <Row
                  label="Listed price"
                  hint={diff === 0 ? "Same as default price" : `${diff > 0 ? "+" : "−"}${formatCurrency(Math.abs(diff))} vs default`}
                >
                  {formatCurrency(listedPrice)}
                </Row>
                <div className="flex items-center justify-between gap-4 pt-2.5 text-xs">
                  <span style={{ color: "var(--text-secondary)" }}>Commission & fees</span>
                  <span className={`font-semibold ${m.accent}`}>{m.feeNote}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Variants + recent orders */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Panel
          title={`Variants (${variants.length})`}
          icon={StyleIcon}
          iconClass="text-amber-500"
          className="xl:col-span-3"
        >
          {variants.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:-mx-5">
              <table className="w-full text-left text-xs">
                <thead
                  className="uppercase tracking-wider text-[10px]"
                  style={{ backgroundColor: "var(--bg-surface2)", color: "var(--text-tertiary)" }}
                >
                  <tr>
                    <th className="px-4 sm:px-5 py-2.5 font-semibold">Variant SKU</th>
                    <th className="px-3 py-2.5 font-semibold">Size</th>
                    <th className="px-3 py-2.5 font-semibold">Color</th>
                    <th className="px-3 py-2.5 font-semibold text-right">Stock</th>
                    <th className="px-3 py-2.5 font-semibold text-right">Cost</th>
                    <th className="px-4 sm:px-5 py-2.5 font-semibold text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, idx) => (
                    <tr key={v.id || idx} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                      <td className="px-4 sm:px-5 py-3 font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                        {v.sku}
                      </td>
                      <td className="px-3 py-3" style={{ color: "var(--text-secondary)" }}>{v.size}</td>
                      <td className="px-3 py-3" style={{ color: "var(--text-secondary)" }}>{v.color}</td>
                      <td
                        className={`px-3 py-3 text-right font-semibold ${v.stock <= 0 ? "text-rose-600" : ""}`}
                        style={v.stock > 0 ? { color: "var(--text-primary)" } : undefined}
                      >
                        {formatNumber(v.stock)}
                      </td>
                      <td className="px-3 py-3 text-right" style={{ color: "var(--text-secondary)" }}>
                        {formatCurrency(v.cost || cost)}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>
                        {formatCurrency(v.price || price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs italic" style={{ color: "var(--text-tertiary)" }}>
              No variants configured for this single SKU product.
            </p>
          )}
        </Panel>

        <Panel
          title="Recent Orders"
          icon={ReceiptLongIcon}
          iconClass="text-blue-500"
          className="xl:col-span-2"
          action={
            productOrders.length > 0 && (
              <Button component={Link} href="/orders" variant="ghost" endIcon={<ChevronRightIcon />}>
                All orders
              </Button>
            )
          }
        >
          {recentOrders.length > 0 ? (
            <ul className="-mx-2">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/orders/${o.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition hover:bg-surface2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold font-mono truncate" style={{ color: "var(--text-primary)" }}>
                        {o.id}
                      </div>
                      <div className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                        {o.marketplace} · {formatDate(o.orderDate)} · {units(o.quantity || 1)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                        {formatCurrency(o.totalAmount)}
                      </span>
                      <StatusChip status={o.orderStatus} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs italic" style={{ color: "var(--text-tertiary)" }}>
              No orders for this product yet.
            </p>
          )}
        </Panel>
      </div>

      {/* Edit Form Modal */}
      <ProductFormDialog
        open={editOpen}
        initialData={product}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
