"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import StatusChip from "@/components/common/StatusChip";
import {
  calculateDashboardMetrics,
  calculateMarketplaceMetrics,
  filterByDateRange,
} from "@/lib/calculations";
import { formatCurrency, formatNumber, formatDate } from "@/lib/formatters";

// MUI Icons
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddBoxIcon from "@mui/icons-material/AddBox";
import PostAddIcon from "@mui/icons-material/PostAdd";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const PIE_COLORS = ["var(--chart-emerald)", "var(--chart-blue-2)", "var(--chart-amber)", "var(--chart-purple)", "var(--chart-red)", "var(--chart-pink)"];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");

  const products = useSelector((state) => state.products.items);
  const orders = useSelector((state) => state.orders.items);
  const expenses = useSelector((state) => state.finance.expenses);

  // Apply filters
  const filteredOrders = useMemo(() => {
    let result = filterByDateRange(orders, "orderDate", dateRange);
    if (channelFilter !== "all") {
      result = result.filter((o) => o.marketplace.toLowerCase() === channelFilter.toLowerCase());
    }
    return result;
  }, [orders, dateRange, channelFilter]);

  const filteredExpenses = useMemo(() => {
    return filterByDateRange(expenses, "date", dateRange);
  }, [expenses, dateRange]);

  const metrics = useMemo(() => {
    return calculateDashboardMetrics(filteredOrders, products, filteredExpenses);
  }, [filteredOrders, products, filteredExpenses]);

  const channelMetrics = useMemo(() => {
    return calculateMarketplaceMetrics(filteredOrders);
  }, [filteredOrders]);

  // Orders by Status for Donut Chart
  const ordersByStatusData = useMemo(() => {
    const counts = {};
    filteredOrders.forEach((o) => {
      counts[o.orderStatus] = (counts[o.orderStatus] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  // Monthly Sales vs Expenses
  const monthlyTrendsData = [
    { month: "Nov '25", sales: 42000, expenses: 26000, profit: 16000 },
    { month: "Dec '25", sales: 58000, expenses: 31000, profit: 27000 },
    { month: "Jan '26", sales: 74000, expenses: 39000, profit: 35000 },
    { month: "Feb '26", sales: 92000, expenses: 46000, profit: 46000 },
    { month: "Mar '26", sales: metrics.totalSales || 38000, expenses: metrics.totalExpenses || 22000, profit: metrics.estimatedProfit || 16000 },
  ];

  // Top-selling products
  const topProductsData = useMemo(() => {
    const salesMap = {};
    filteredOrders.forEach((o) => {
      if (o.orderStatus !== "Cancelled") {
        salesMap[o.productName] = (salesMap[o.productName] || 0) + (o.quantity || 1);
      }
    });

    return Object.entries(salesMap)
      .map(([name, qty]) => ({
        name: name.length > 22 ? name.substring(0, 22) + "..." : name,
        fullName: name,
        unitsSold: qty,
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);
  }, [filteredOrders]);

  // Low Stock Items
  const lowStockItems = useMemo(() => {
    return products
      .filter((p) => p.stock <= (p.reorderLevel || 15))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
  }, [products]);

  // Recent Orders
  const recentOrders = useMemo(() => {
    return [...filteredOrders]
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, 5);
  }, [filteredOrders]);

  // Recent Expenses
  const recentExpenses = useMemo(() => {
    return [...filteredExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [filteredExpenses]);

  return (
    <div className="space-y-6">
      {/* Top Header with Date Range Filter */}
      <PageHeader
        title="Business Dashboard"
        subtitle="Performance overview across Meesho & Flipkart multi-channel sales."
        badge="Multi-Channel"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer shadow-sm"
            >
              <option value="all">All Channels</option>
              <option value="meesho">Meesho Orders</option>
              <option value="flipkart">Flipkart Orders</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer shadow-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
            </select>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Sales"
          value={formatCurrency(metrics.totalSales)}
          subtitle={`${metrics.totalOrders} total orders`}
          icon={CurrencyRupeeIcon}
          color="blue"
          tooltip="Gross sales from all non-cancelled marketplace orders in period"
        />

        <StatCard
          title="Total Orders"
          value={formatNumber(metrics.totalOrders)}
          subtitle={`${metrics.deliveredCount} delivered`}
          icon={ShoppingBagIcon}
          color="purple"
          tooltip="Total orders received across Meesho and Flipkart"
        />

        <StatCard
          title="Est. Profit"
          value={formatCurrency(metrics.estimatedProfit)}
          subtitle="Net of COGS & fees"
          icon={TrendingUpIcon}
          color="emerald"
          tooltip="Revenue minus Product COGS, Marketplace Commissions, and proportional overheads"
        />

        <StatCard
          title="Total Expenses"
          value={formatCurrency(metrics.totalExpenses)}
          subtitle="Operational & Ads"
          icon={ReceiptLongIcon}
          color="amber"
          tooltip="All recorded business expenses including rent, ads, salaries, and shipping"
        />

        <StatCard
          title="Pending Orders"
          value={formatNumber(metrics.pendingOrders)}
          subtitle="Awaiting dispatch"
          icon={HourglassTopIcon}
          color="blue"
          tooltip="Orders in Pending or Processing state ready for packing"
        />

        <StatCard
          title="Low Stock Items"
          value={formatNumber(metrics.lowStockProducts)}
          subtitle={`${metrics.outOfStockProducts} out of stock`}
          icon={WarningAmberIcon}
          color={metrics.lowStockProducts > 0 ? "rose" : "slate"}
          tooltip="SKUs with quantity at or below their reorder threshold"
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="sd-feature-band bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-white">Quick Operations</h3>
          <p className="text-xs text-slate-300">
            Rapid shortcuts to manage daily catalog, inventory, and order operations.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
          >
            <AddBoxIcon sx={{ fontSize: 16 }} />
            <span>Add Product</span>
          </Link>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
          >
            <EditNoteIcon sx={{ fontSize: 16 }} />
            <span>Stock Adjustment</span>
          </Link>
          <Link
            href="/suppliers-purchases"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
          >
            <PostAddIcon sx={{ fontSize: 16 }} />
            <span>Create PO</span>
          </Link>
          <Link
            href="/finance"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
          >
            <ReceiptLongIcon sx={{ fontSize: 16 }} />
            <span>Record Expense</span>
          </Link>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales vs Expenses Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Monthly Sales, Expenses & Profit Trends
              </h3>
              <p className="text-xs text-slate-500">
                Revenue vs Operational Outflows (Indian Rupees)
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              ₹ INR
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--chart-slate)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--chart-slate)" }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <RechartsTooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{
                    backgroundColor: "var(--chart-tooltip-bg)",
                    borderColor: "var(--chart-tooltip-border)",
                    color: "var(--chart-tooltip-text)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="sales" name="Gross Sales" fill="var(--brand-500)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="var(--chart-amber)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Net Profit" fill="var(--chart-emerald)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status Donut Chart (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Orders by Status
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              Distribution across active pipeline
            </p>
          </div>

          <div className="h-56 sm:h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {ordersByStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--chart-tooltip-bg)",
                    color: "var(--chart-tooltip-text)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs pt-2 border-t border-slate-100">
            {ordersByStatusData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-slate-600 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="truncate">{item.name}:</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Marketplace Comparison & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marketplace Comparison */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
            Marketplace Performance: Meesho vs Flipkart
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Order volume and gross sales distribution
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3.5 rounded-lg border border-pink-200 bg-pink-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-700">MEESHO</span>
                <span className="w-2 h-2 rounded-full bg-pink-600" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                {formatCurrency(channelMetrics.meesho.sales)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {channelMetrics.meesho.count} orders ({channelMetrics.meesho.delivered} delivered)
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700">FLIPKART</span>
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                {formatCurrency(channelMetrics.flipkart.sales)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {channelMetrics.flipkart.count} orders ({channelMetrics.flipkart.delivered} delivered)
              </div>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={[
                  { name: "Meesho", sales: channelMetrics.meesho.sales, orders: channelMetrics.meesho.count },
                  { name: "Flipkart", sales: channelMetrics.flipkart.sales, orders: channelMetrics.flipkart.count },
                ]}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-subtle)" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600 }} />
                <RechartsTooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="sales" name="Gross Sales (₹)" fill="var(--chart-blue-2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Top Selling Products
            </h3>
            <Link
              href="/reports"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View Report</span>
              <ArrowForwardIcon sx={{ fontSize: 14 }} />
            </Link>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Best performers by total units ordered
          </p>

          <div className="space-y-3">
            {topProductsData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition text-xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-600 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <span className="font-medium text-slate-800 truncate" title={item.fullName}>
                    {item.fullName}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                    {item.unitsSold} sold
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Recent Orders
              </h3>
              <p className="text-xs text-slate-500">
                Latest transactions across Meesho & Flipkart
              </p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>All Orders ({orders.length})</span>
              <ArrowForwardIcon sx={{ fontSize: 14 }} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {ord.id}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {formatDate(ord.orderDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={ord.marketplace} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {ord.customerName}
                      <div className="text-[10px] text-slate-400">{ord.city}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={ord.orderStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/orders/${ord.id}`}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Low Stock Watchlist
                </h3>
                <p className="text-xs text-slate-500">
                  Products needing urgent reorder
                </p>
              </div>
              <Link
                href="/inventory"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Manage
              </Link>
            </div>

            <div className="p-3 space-y-2">
              {lowStockItems.map((prod) => (
                <div
                  key={prod.id}
                  className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 transition flex items-center justify-between text-xs"
                >
                  <div className="overflow-hidden pr-2">
                    <div className="font-semibold text-slate-900 truncate">
                      {prod.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {prod.sku} • Reorder at: {prod.reorderLevel}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        prod.stock === 0
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {prod.stock === 0 ? "Out of Stock" : `${prod.stock} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50">
            <Link
              href="/suppliers-purchases"
              className="block w-full text-center py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
            >
              Order from Suppliers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

