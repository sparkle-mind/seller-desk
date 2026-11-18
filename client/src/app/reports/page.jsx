"use client";

import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import DataTable from "@/components/common/DataTable";
import StatusChip from "@/components/common/StatusChip";
import {
  calculateDashboardMetrics,
  calculateMarketplaceMetrics,
  filterByDateRange,
} from "@/lib/calculations";
import { formatCurrency, formatNumber, formatDate } from "@/lib/formatters";
import { exportToCsv } from "@/lib/exportCsv";

// MUI
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

// Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const REPORT_TABS = [
  "Sales Report",
  "Orders Report",
  "Product Performance",
  "Inventory Valuation",
  "Expenses Report",
  "Profit & Loss",
  "Marketplace Share",
  "Returns & RTO Analysis",
  "Supplier Purchases",
];

const COLORS = ["var(--chart-blue)", "var(--chart-pink)", "var(--chart-emerald)", "var(--chart-amber)", "var(--chart-purple)", "var(--chart-cyan)"];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState("all");
  const [marketplaceFilter, setMarketplaceFilter] = useState("all");

  const products = useSelector((state) => state.products.items);
  const orders = useSelector((state) => state.orders.items);
  const expenses = useSelector((state) => state.finance.expenses);
  const { returns, rtos } = useSelector((state) => state.shippingReturns);
  const purchases = useSelector((state) => state.suppliersPurchases.purchases);

  // Filtered orders & expenses
  const filteredOrders = useMemo(() => {
    let res = filterByDateRange(orders, "orderDate", dateRange);
    if (marketplaceFilter !== "all") {
      res = res.filter((o) => o.marketplace.toLowerCase() === marketplaceFilter.toLowerCase());
    }
    return res;
  }, [orders, dateRange, marketplaceFilter]);

  const filteredExpenses = useMemo(() => {
    return filterByDateRange(expenses, "date", dateRange);
  }, [expenses, dateRange]);

  const metrics = useMemo(() => {
    return calculateDashboardMetrics(filteredOrders, products, filteredExpenses);
  }, [filteredOrders, products, filteredExpenses]);

  const channelMetrics = useMemo(() => {
    return calculateMarketplaceMetrics(filteredOrders);
  }, [filteredOrders]);

  // Handle Print
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Handle CSV Export based on active report
  const handleExport = () => {
    const reportName = REPORT_TABS[activeTab].replace(/\s+/g, "_");
    let exportData = [];

    if (activeTab === 0 || activeTab === 1) {
      exportData = filteredOrders.map((o) => ({
        OrderID: o.id,
        Date: o.orderDate,
        Marketplace: o.marketplace,
        Product: o.productName,
        SKU: o.sku,
        Quantity: o.quantity,
        Amount: o.totalAmount,
        Status: o.orderStatus,
        SettlementStatus: o.settlementStatus,
      }));
    } else if (activeTab === 2) {
      exportData = products.map((p) => {
        const pOrders = filteredOrders.filter((o) => o.productId === p.id);
        const units = pOrders.reduce((s, o) => s + (o.quantity || 1), 0);
        const rev = pOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        return {
          SKU: p.sku,
          Name: p.name,
          Category: p.category,
          Cost: p.purchaseCost,
          Price: p.sellingPrice,
          UnitsSold: units,
          Revenue: rev,
          GrossProfit: rev - units * p.purchaseCost,
        };
      });
    } else if (activeTab === 3) {
      exportData = products.map((p) => ({
        SKU: p.sku,
        Name: p.name,
        Category: p.category,
        Stock: p.stock,
        Cost: p.purchaseCost,
        InventoryValue: p.stock * p.purchaseCost,
        RetailValue: p.stock * p.sellingPrice,
      }));
    } else if (activeTab === 4) {
      exportData = filteredExpenses.map((e) => ({
        ID: e.id,
        Date: e.date,
        Category: e.category,
        Description: e.description,
        Amount: e.amount,
        Method: e.paymentMethod,
      }));
    } else if (activeTab === 7) {
      exportData = returns.map((r) => ({
        ReturnID: r.id,
        OrderID: r.originalOrderId,
        Marketplace: r.marketplace,
        Product: r.productName,
        Reason: r.returnReason,
        RefundAmount: r.refundAmount,
        Inspection: r.inspectionStatus,
        Restock: r.restockEligibility,
      }));
    } else if (activeTab === 8) {
      exportData = purchases.map((p) => ({
        PO: p.poNumber,
        Supplier: p.supplierName,
        Date: p.orderDate,
        Total: p.totalAmount,
        Paid: p.paidAmount || 0,
        Status: p.status,
      }));
    } else {
      exportData = filteredOrders.map((o) => ({
        ID: o.id,
        Amount: o.totalAmount,
      }));
    }

    exportToCsv(`SellerDesk_${reportName}`, exportData);
  };

  // Product performance list
  const productPerformance = useMemo(() => {
    return products.map((p) => {
      const pOrders = filteredOrders.filter(
        (o) => o.productId === p.id && o.orderStatus !== "Cancelled"
      );
      const unitsSold = pOrders.reduce((s, o) => s + (o.quantity || 1), 0);
      const revenue = pOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
      const cogs = unitsSold * p.purchaseCost;
      const profit = revenue - cogs;
      const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        unitsSold,
        revenue,
        cogs,
        profit,
        margin,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [products, filteredOrders]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics Center"
        subtitle="Business intelligence, sales velocity, channel distribution, and financial statements."
        breadcrumbs={[{ label: "Reports & Analytics" }]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={marketplaceFilter}
              onChange={(e) => setMarketplaceFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Channels</option>
              <option value="meesho">Meesho</option>
              <option value="flipkart">Flipkart</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
            </select>

            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ borderColor: "var(--btn-neutral-border)", color: "var(--btn-neutral-text)" }}
            >
              Print Report
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
            >
              Export Report CSV
            </Button>
          </div>
        }
      />

      {/* Report Selection Tabs (Horizontal Scrollable) */}
      <div className="border-b border-slate-200 bg-white rounded-xl shadow-sm px-2 pt-2">
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8125rem",
              minHeight: 44,
            },
          }}
        >
          {REPORT_TABS.map((tab, idx) => (
            <Tab key={idx} label={tab} />
          ))}
        </Tabs>
      </div>

      {/* REPORT VIEW 0: Sales Report */}
      {activeTab === 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Gross Sales"
              value={formatCurrency(metrics.totalSales)}
              subtitle="All non-cancelled"
              icon={TrendingUpIcon}
              color="blue"
            />
            <StatCard
              title="Total Orders"
              value={filteredOrders.length}
              subtitle={`${metrics.deliveredCount} delivered`}
              icon={BarChartIcon}
              color="purple"
            />
            <StatCard
              title="Meesho Share"
              value={formatCurrency(channelMetrics.meesho.sales)}
              subtitle={`${channelMetrics.meesho.count} orders`}
              color="rose"
            />
            <StatCard
              title="Flipkart Share"
              value={formatCurrency(channelMetrics.flipkart.sales)}
              subtitle={`${channelMetrics.flipkart.count} orders`}
              color="blue"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">
              Daily Sales Volume &amp; Fulfillment Trends
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { day: "01 Mar", meesho: 4200, flipkart: 6800 },
                    { day: "02 Mar", meesho: 5100, flipkart: 7400 },
                    { day: "03 Mar", meesho: 6300, flipkart: 8900 },
                    { day: "04 Mar", meesho: 5800, flipkart: 9200 },
                    { day: "05 Mar", meesho: 7200, flipkart: 10400 },
                    { day: "06 Mar", meesho: channelMetrics.meesho.sales / 5, flipkart: channelMetrics.flipkart.sales / 5 },
                  ]}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <RechartsTooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="meesho" name="Meesho Sales" fill="var(--chart-meesho)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="flipkart" name="Flipkart Sales" fill="var(--chart-flipkart)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* REPORT VIEW 2: Product Performance */}
      {activeTab === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">
              Revenue and Profit by Product
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productPerformance.slice(0, 6).map((p) => ({
                    name: p.sku,
                    revenue: p.revenue,
                    profit: p.profit,
                  }))}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <RechartsTooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="revenue" name="Total Revenue (₹)" fill="var(--chart-blue-2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Gross Profit (₹)" fill="var(--chart-emerald)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-slate-900 text-sm">
              Product Profitability Leaderboard
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3 text-right">Units Sold</th>
                    <th className="px-4 py-3 text-right">Gross Revenue</th>
                    <th className="px-4 py-3 text-right">COGS</th>
                    <th className="px-4 py-3 text-right">Gross Profit</th>
                    <th className="px-4 py-3 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productPerformance.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900 max-w-[200px] truncate" title={p.name}>
                        {p.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{p.sku}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{p.unitsSold}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-700">{formatCurrency(p.revenue)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(p.cogs)}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">+{formatCurrency(p.profit)}</td>
                      <td className="px-4 py-3 text-right font-bold">{p.margin}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT VIEW 6: Marketplace Share */}
      {activeTab === 6 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                Channel Gross Revenue Share
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparison of net volume delivered
              </p>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Meesho", value: channelMetrics.meesho.sales },
                      { name: "Flipkart", value: channelMetrics.flipkart.sales },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="var(--chart-meesho)" />
                    <Cell fill="var(--chart-flipkart)" />
                  </Pie>
                  <RechartsTooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 mt-4">
              <div className="flex justify-between">
                <span className="text-pink-700 font-bold">Meesho:</span>
                <span className="font-bold">{formatCurrency(channelMetrics.meesho.sales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-bold">Flipkart:</span>
                <span className="font-bold">{formatCurrency(channelMetrics.flipkart.sales)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Channel Operational Metrics
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg border border-pink-200 bg-pink-50/40 space-y-1">
                <div className="font-bold text-pink-700 text-sm">Meesho Operational Summary</div>
                <div>Commission Rate: 0%</div>
                <div>Average Order Value (AOV): {formatCurrency(channelMetrics.meesho.count ? channelMetrics.meesho.sales / channelMetrics.meesho.count : 0)}</div>
                <div>Returns Ratio: ~{Math.round((channelMetrics.meesho.returned / (channelMetrics.meesho.count || 1)) * 100)}%</div>
              </div>

              <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/40 space-y-1">
                <div className="font-bold text-blue-700 text-sm">Flipkart Operational Summary</div>
                <div>Commission Rate: ~12-15% + Fixed Closure Fees</div>
                <div>Average Order Value (AOV): {formatCurrency(channelMetrics.flipkart.count ? channelMetrics.flipkart.sales / channelMetrics.flipkart.count : 0)}</div>
                <div>Returns Ratio: ~{Math.round((channelMetrics.flipkart.returned / (channelMetrics.flipkart.count || 1)) * 100)}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT VIEW 7: Returns & RTO Analysis */}
      {activeTab === 7 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Customer Returns"
              value={returns.length}
              subtitle="Buyer return requests"
              color="amber"
            />
            <StatCard
              title="RTO Packages"
              value={rtos.length}
              subtitle="Courier delivery failure"
              color="rose"
            />
            <StatCard
              title="Restocked & Saved"
              value={returns.filter((r) => r.restockEligibility === "Eligible").length}
              subtitle="Inspected Intact"
              color="emerald"
            />
            <StatCard
              title="Damaged / Scrap"
              value={returns.filter((r) => r.restockEligibility === "Ineligible").length}
              subtitle="Total transit losses"
              color="rose"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">
              Return Reasons Frequency
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { reason: "Size mismatch", count: 3 },
                    { reason: "Color variance", count: 2 },
                    { reason: "Transit damage", count: 2 },
                    { reason: "Customer refusal", count: 2 },
                    { reason: "Address untraceable", count: 1 },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="reason" angle={-15} textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip />
                  <Bar dataKey="count" name="Count" fill="var(--chart-red)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* For any other active tab: Show clean structured table of current dataset */}
      {activeTab !== 0 && activeTab !== 2 && activeTab !== 6 && activeTab !== 7 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center">
          <h3 className="text-base font-bold text-slate-800 mb-2">
            {REPORT_TABS[activeTab]}
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
            Report dataset synthesized from underlying mock database with consistent accounting logic.
          </p>
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
          >
            Export Complete {REPORT_TABS[activeTab]} to CSV
          </Button>
        </div>
      )}
    </div>
  );
}

