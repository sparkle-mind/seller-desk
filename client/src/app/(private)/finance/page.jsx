"use client";

import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "@/components/common/ToastProvider";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import FilterBar from "@/components/common/FilterBar";
import DataTable from "@/components/common/DataTable";
import RecordCardView from "@/components/common/RecordCardView";
import CardViewToggle from "@/components/common/CardViewToggle";
import StatusChip from "@/components/common/StatusChip";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExpenseFormDialog from "@/features/finance/ExpenseFormDialog";
import {
  addExpense,
  updateExpense,
  deleteExpense,
  updateSettlementStatus,
} from "@/store/slices/financeSlice";
import {
  calculateDashboardMetrics,
  filterByDateRange,
} from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { exportToCsv } from "@/lib/exportCsv";

// MUI
import Button from "@/components/common/Button";
import IconButton from "@/components/common/IconButton";
import Modal from "@/components/common/Modal";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Recharts
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const EXP_COLORS = [
  "var(--chart-blue)",
  "var(--chart-violet)",
  "var(--chart-amber)",
  "var(--chart-emerald)",
  "var(--chart-pink)",
  "var(--chart-red)",
  "var(--chart-cyan)",
  "var(--chart-slate)",
];

export default function FinancePage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { expenses, settlements } = useSelector((state) => state.finance);
  const products = useSelector((state) => state.products.items);
  const orders = useSelector((state) => state.orders.items);
  const returns = useSelector((state) => state.shippingReturns.returns);

  const [currentTab, setCurrentTab] = useState(0); // 0: Expenses, 1: Settlements, 2: P&L Statement
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  // Dialogs
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingExpId, setDeletingExpId] = useState(null);

  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [utrInput, setUtrInput] = useState("");

  // Filters
  const filteredExpenses = useMemo(() => {
    let result = filterByDateRange(expenses, "date", dateRange);

    return result.filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        e.id.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.relatedOrderOrPurchase &&
          e.relatedOrderOrPurchase.toLowerCase().includes(q));

      const matchesCat =
        categoryFilter === "all" || e.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [expenses, search, categoryFilter, dateRange]);

  const filteredSettlements = useMemo(() => {
    return settlements.filter((s) => {
      const q = search.toLowerCase();
      return (
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.marketplace.toLowerCase().includes(q) ||
        s.cyclePeriod.toLowerCase().includes(q) ||
        (s.utrNumber && s.utrNumber.toLowerCase().includes(q))
      );
    });
  }, [settlements, search]);

  // Overall Financial Calculations
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(orders, products, expenses);
  }, [orders, products, expenses]);

  const totalRefunds = useMemo(() => {
    return returns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
  }, [returns]);

  const totalSettlementsPaid = useMemo(() => {
    return settlements
      .filter((s) => s.status === "Settled")
      .reduce((sum, s) => sum + (s.netPayoutAmount || 0), 0);
  }, [settlements]);

  const totalSettlementsPending = useMemo(() => {
    return settlements
      .filter((s) => s.status === "Pending")
      .reduce((sum, s) => sum + (s.netPayoutAmount || 0), 0);
  }, [settlements]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(expenses.map((e) => e.category));
    return ["all", ...Array.from(set)];
  }, [expenses]);

  // Category breakdown for chart
  const categoryChartData = useMemo(() => {
    const sums = {};
    expenses.forEach((e) => {
      sums[e.category] = (sums[e.category] || 0) + e.amount;
    });
    return Object.entries(sums).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setExpenseDialogOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setExpenseDialogOpen(true);
  };

  const handleExpenseSubmit = (data) => {
    if (editingExpense) {
      dispatch(updateExpense({ id: editingExpense.id, ...data }));
      toast.success("Expense updated");
    } else {
      dispatch(addExpense(data));
      toast.success("Expense recorded");
    }
  };

  const handleConfirmDelete = () => {
    if (deletingExpId) {
      dispatch(deleteExpense(deletingExpId));
      toast.success("Expense deleted");
    }
  };

  const handleSettlePayoutSubmit = (e) => {
    e.preventDefault();
    if (!selectedSettlement) return;
    dispatch(
      updateSettlementStatus({
        id: selectedSettlement.id,
        status: "Settled",
        utrNumber: utrInput || `UTR${Date.now().toString().slice(-8)}`,
      }),
    );
    toast.success(`Settlement ${selectedSettlement.id} marked as settled`);
    setSettlementDialogOpen(false);
  };

  const handleExport = () => {
    if (currentTab === 0) {
      const data = filteredExpenses.map((e) => ({
        ExpenseID: e.id,
        Date: e.date,
        Category: e.category,
        Description: e.description,
        Amount: e.amount,
        PaymentMethod: e.paymentMethod,
        Reference: e.relatedOrderOrPurchase,
        Notes: e.notes || "",
      }));
      exportToCsv("SellerDesk_Expenses", data);
    } else {
      const data = filteredSettlements.map((s) => ({
        SettlementID: s.id,
        Marketplace: s.marketplace,
        Date: s.settlementDate,
        Period: s.cyclePeriod,
        GrossSales: s.grossSales,
        MarketplaceFees: s.marketplaceFees,
        ShippingDeductions: s.shippingDeductions,
        ReturnsDeductions: s.returnsDeductions,
        Taxes: s.taxTcsTds,
        NetPayout: s.netPayoutAmount,
        Status: s.status,
        UTR: s.utrNumber,
      }));
      exportToCsv("SellerDesk_Marketplace_Settlements", data);
    }
  };

  // Expenses Columns
  const expenseColumns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (val) => (
        <span className="text-slate-600 font-medium">{formatDate(val)}</span>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (val) => (
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
          {val}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description & Reference",
      sortable: true,
      render: (val, row) => (
        <div className="max-w-[280px]">
          <div className="font-semibold text-slate-800 truncate" title={val}>
            {val}
          </div>
          {row.relatedOrderOrPurchase &&
            row.relatedOrderOrPurchase !== "N/A" && (
              <div className="text-[10px] text-blue-600 font-mono">
                Ref: {row.relatedOrderOrPurchase}
              </div>
            )}
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      align: "right",
      render: (val) => (
        <span className="font-bold text-slate-900">{formatCurrency(val)}</span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      sortable: true,
      render: (val) => <span className="text-xs text-slate-600">{val}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton label="Edit Expense" tone="primary" onClick={() => handleOpenEdit(row)}>
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <IconButton
            label="Delete Expense"
            tone="danger"
            onClick={() => {
              setDeletingExpId(row.id);
              setDeleteDialogOpen(true);
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </div>
      ),
    },
  ];

  // Settlements Columns
  const settlementColumns = [
    {
      key: "id",
      label: "Settlement ID",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900">{val}</div>
          <div className="text-xs text-slate-500">{row.cyclePeriod}</div>
        </div>
      ),
    },
    {
      key: "marketplace",
      label: "Channel",
      sortable: true,
      render: (val) => <StatusChip status={val} />,
    },
    {
      key: "grossSales",
      label: "Gross Sales",
      sortable: true,
      align: "right",
      render: (val) => (
        <span className="text-slate-700">{formatCurrency(val)}</span>
      ),
    },
    {
      key: "deductions",
      label: "Deductions (Fees + Ship + Returns)",
      sortable: false,
      align: "right",
      render: (_, row) => (
        <div className="text-right text-xs text-rose-600">
          -
          {formatCurrency(
            row.marketplaceFees +
              row.shippingDeductions +
              row.returnsDeductions,
          )}
        </div>
      ),
    },
    {
      key: "netPayoutAmount",
      label: "Net Bank Payout",
      sortable: true,
      align: "right",
      render: (val) => (
        <span className="font-bold text-emerald-700 text-sm">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status & UTR",
      sortable: true,
      render: (val, row) => (
        <div>
          <StatusChip status={val} />
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {row.utrNumber || "Pending"}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Action",
      sortable: false,
      align: "right",
      render: (_, row) =>
        row.status !== "Settled" && (
          <Button
            variant="soft"
            startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
            onClick={() => {
              setSelectedSettlement(row);
              setUtrInput(`UTR${Date.now().toString().slice(-8)}`);
              setSettlementDialogOpen(true);
            }}
          >
            Mark Settled
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance & Expenses Management"
        subtitle="Transparent accounting model, marketplace fee reconciliation, overhead expenses, and settlements."
        breadcrumbs={[{ label: "Finance & Expenses" }]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              tone="neutral"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
            <Button startIcon={<AddIcon />} onClick={handleOpenAdd}>
              Record Expense
            </Button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Gross Sales"
          value={formatCurrency(metrics.totalSales)}
          subtitle="Delivered & Shipped"
          icon={CurrencyRupeeIcon}
          color="blue"
        />

        <StatCard
          title="Total Expenses"
          value={formatCurrency(metrics.totalExpenses)}
          subtitle="All business costs"
          icon={ReceiptLongIcon}
          color="amber"
        />

        <StatCard
          title="Customer Refunds"
          value={formatCurrency(totalRefunds)}
          subtitle={`${returns.length} return claims`}
          icon={AssignmentReturnIcon}
          color="rose"
        />

        <StatCard
          title="Est. Contribution"
          value={formatCurrency(metrics.grossProfit)}
          subtitle="Sales - COGS - Fees"
          icon={TrendingUpIcon}
          color="emerald"
          tooltip="Gross profit from orders before warehouse overheads"
        />

        <StatCard
          title="Settlements Received"
          value={formatCurrency(totalSettlementsPaid)}
          subtitle="Credited to bank"
          icon={AccountBalanceWalletIcon}
          color="emerald"
        />

        <StatCard
          title="Pending Payouts"
          value={formatCurrency(totalSettlementsPending)}
          subtitle="In release cycle"
          icon={AccountBalanceWalletIcon}
          color="blue"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <Tabs
          value={currentTab}
          onChange={(_, val) => {
            setCurrentTab(val);
            setSearch("");
            setCategoryFilter("all");
          }}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
            },
          }}
        >
          <Tab label={`Business Expenses (${expenses.length})`} />
          <Tab label={`Marketplace Settlements (${settlements.length})`} />
          <Tab label="Profit & Loss Statement" />
        </Tabs>
      </div>

      {/* Tab 0: Business Expenses */}
      {currentTab === 0 && (
        <div className="space-y-6">
          {/* Chart & Summary Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                Expense Distribution by Category
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Operational cost centers breakdown
              </p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryChartData}
                    margin={{ top: 5, right: 10, left: -10, bottom: 25 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border-subtle)"
                    />
                    <XAxis
                      dataKey="name"
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 10, fill: "var(--chart-slate)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => `₹${v / 1000}k`}
                    />
                    <RechartsTooltip formatter={(v) => formatCurrency(v)} />
                    <Bar
                      dataKey="value"
                      name="Amount (₹)"
                      fill="var(--brand-500)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  Expense Proportions
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Key drivers of business outflows
                </p>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((_, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={EXP_COLORS[idx % EXP_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(v) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                Total Recorded:{" "}
                <strong>{formatCurrency(metrics.totalExpenses)}</strong>
              </div>
            </div>
          </div>

          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search expense description, reference..."
            filters={[
              {
                value: categoryFilter,
                onChange: setCategoryFilter,
                options: categories.map((c) => ({
                  label: c === "all" ? "All Categories" : c,
                  value: c,
                })),
              },
            ]}
            onReset={() => {
              setSearch("");
              setCategoryFilter("all");
            }}
          >
            <CardViewToggle value={viewMode} onChange={setViewMode} />
          </FilterBar>

          {viewMode === "table" ? (
            <DataTable
              columns={expenseColumns}
              data={filteredExpenses}
              keyField="id"
              initialSortKey="date"
              initialSortDir="desc"
              defaultRowsPerPage={10}
              emptyMessage="No expenses found matching the criteria."
            />
          ) : (
            <RecordCardView
              items={filteredExpenses}
              columns={expenseColumns}
              fields={["date", "category", "amount", "paymentMethod"]}
              title={(expense) => expense.description}
              subtitle={(expense) => `${expense.id} · ${expense.relatedOrderOrPurchase || "No reference"}`}
              emptyMessage="No expenses found matching the criteria."
            />
          )}
        </div>
      )}

      {/* Tab 1: Marketplace Settlements */}
      {currentTab === 1 && (
        <div className="space-y-4">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search settlement ID, period, UTR..."
            onReset={() => setSearch("")}
          >
            <CardViewToggle value={viewMode} onChange={setViewMode} />
          </FilterBar>

          {viewMode === "table" ? (
            <DataTable
              columns={settlementColumns}
              data={filteredSettlements}
              keyField="id"
              initialSortKey="date"
              initialSortDir="desc"
              defaultRowsPerPage={10}
              emptyMessage="No settlement records found."
            />
          ) : (
            <RecordCardView
              items={filteredSettlements}
              columns={settlementColumns}
              fields={["marketplace", "grossSales", "deductions", "netPayoutAmount", "status"]}
              title={(settlement) => settlement.id}
              subtitle={(settlement) => settlement.cyclePeriod}
              emptyMessage="No settlement records found."
            />
          )}
        </div>
      )}

      {/* Tab 2: Profit & Loss Statement (Transparent Accounting Model) */}
      {currentTab === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 mx-auto">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Internal Profit &amp; Loss (P&amp;L) Accounting Model
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly structured accounting rules to avoid double-counting
              product costs, supplier POs, and marketplace freight.
            </p>
          </div>

          {/* Statement Lines */}
          <div className="space-y-3 text-sm">
            {/* Revenue */}
            <div className="flex justify-between py-2 border-b border-slate-100 font-bold text-slate-900">
              <span>
                1. Gross Marketplace Sales (Delivered &amp; Shipped Orders)
              </span>
              <span>+{formatCurrency(metrics.totalSales)}</span>
            </div>

            {/* Direct Cost of Goods Sold */}
            <div className="flex justify-between py-1 text-slate-600 pl-4">
              <span>Cost of Goods Sold (Unit Purchase Cost of Sold SKUs)</span>
              <span>
                -
                {formatCurrency(
                  metrics.totalSales - metrics.grossProfit - 1800 - 1500,
                )}
              </span>
            </div>

            {/* Platform Fees */}
            <div className="flex justify-between py-1 text-slate-600 pl-4">
              <span>Marketplace Commissions &amp; Collection Fees</span>
              <span>-₹1,800</span>
            </div>

            {/* Forward Shipping */}
            <div className="flex justify-between py-1 text-slate-600 pl-4">
              <span>Forward Courier Shipping Freight</span>
              <span>-₹1,500</span>
            </div>

            {/* Contribution Profit */}
            <div className="flex justify-between py-2.5 border-t border-b border-slate-200 font-bold text-emerald-800 bg-emerald-50/50 px-2 rounded">
              <span>
                Gross Contribution Profit (Sales - COGS - Marketplace Fees -
                Freight)
              </span>
              <span>+{formatCurrency(metrics.grossProfit)}</span>
            </div>

            {/* Fixed Overheads */}
            <div className="pt-2 font-bold text-slate-900">
              2. Operating Overhead Expenses
            </div>

            <div className="flex justify-between py-1 text-slate-600 pl-4">
              <span>Warehouse Rent &amp; Storage</span>
              <span>-₹28,000</span>
            </div>

            <div className="flex justify-between py-1 text-slate-600 pl-4">
              <span>Salaries &amp; Warehouse Packing Staff</span>
              <span>-₹42,000</span>
            </div>

            <div className="flex justify-between py-1 text-slate-600 pl-4">
              <span>Packaging Materials (Poly Bags, Boxes, Bubble Wraps)</span>
              <span>-₹13,050</span>
            </div>

            <div className="flex justify-between py-1 text-slate-600 pl-4">
              <span>
                Advertising &amp; Listing Promotions (Flipkart PLA, Meesho
                Boost)
              </span>
              <span>-₹17,200</span>
            </div>

            <div className="flex justify-between py-1 text-slate-600 pl-4">
              <span>Software, Label Printers &amp; Cloud Tools</span>
              <span>-₹1,999</span>
            </div>

            <div className="flex justify-between py-1 text-slate-600 pl-4">
              <span>Warehouse Power &amp; Utilities</span>
              <span>-₹6,120</span>
            </div>

            {/* Net Estimated Profit */}
            <div className="flex justify-between py-3 border-t-2 border-slate-900 font-bold text-base text-slate-900 bg-slate-50 px-3 rounded-lg">
              <span>Net Operating Profit</span>
              <span className="text-blue-700">
                {formatCurrency(metrics.estimatedProfit)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
            <strong>Accounting Rule Notice:</strong> Raw supplier purchases
            (e.g. bulk PO invoices) are capitalized into physical inventory
            value and only recognized as COGS when goods are fulfilled. Supplier
            payments are cash-flow transactions rather than direct expense
            deductions to prevent double counting.
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      <ExpenseFormDialog
        open={expenseDialogOpen}
        initialData={editingExpense}
        onClose={() => setExpenseDialogOpen(false)}
        onSubmit={handleExpenseSubmit}
      />

      {/* Delete Expense Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Expense Record?"
        message="Are you sure you want to delete this recorded expense?"
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDialogOpen(false)}
      />

      {/* Mark Settlement Received Modal */}
      <Modal
        open={settlementDialogOpen}
        onClose={() => setSettlementDialogOpen(false)}
        size="xs"
        title="Confirm Settlement Payout"
        icon={CurrencyRupeeIcon}
        tone="emerald"
        onSubmit={handleSettlePayoutSubmit}
        submitLabel="Confirm Received"
        contentClassName="space-y-3"
      >
        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
          <div className="font-bold text-slate-800">
            Settlement: {selectedSettlement?.id} (
            {selectedSettlement?.marketplace})
          </div>
          <div className="text-slate-600">
            Cycle: {selectedSettlement?.cyclePeriod}
          </div>
          <div className="text-slate-800 font-bold text-sm">
            Net Payout:{" "}
            {formatCurrency(selectedSettlement?.netPayoutAmount)}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Bank UTR / Transaction Reference #
          </label>
          <input
            type="text"
            value={utrInput}
            onChange={(e) => setUtrInput(e.target.value)}
            placeholder="e.g. HDFC00921820"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
            required
          />
        </div>
      </Modal>
    </div>
  );
}
