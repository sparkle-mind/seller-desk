import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);

/**
 * Filter items by date range filter: 'all' | 'today' | '7days' | '30days' | 'thisMonth'
 */
export function filterByDateRange(items, dateField = "orderDate", range = "all") {
  if (!items || !items.length || range === "all") return items;

  // Assume reference date is 2026-03-06 (matching current dataset)
  const now = dayjs("2026-03-06T23:59:59");

  return items.filter((item) => {
    const val = item[dateField] || item.date || item.createdAt;
    if (!val) return true;
    const d = dayjs(val);

    if (range === "today") {
      return d.isSame(now, "day");
    }
    if (range === "7days") {
      return d.isSameOrAfter(now.subtract(7, "day"), "day");
    }
    if (range === "30days") {
      return d.isSameOrAfter(now.subtract(30, "day"), "day");
    }
    if (range === "thisMonth") {
      return d.isSame(now, "month");
    }
    return true;
  });
}

/**
 * Computes dashboard KPIs from current orders, products, and expenses
 */
export function calculateDashboardMetrics(orders = [], products = [], expenses = []) {
  const validOrders = orders.filter((o) => o.orderStatus !== "Cancelled");
  const deliveredOrders = orders.filter((o) => o.orderStatus === "Delivered");

  // Total Sales from valid orders
  const totalSales = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "Pending" || o.orderStatus === "Processing"
  ).length;

  // Calculate COGS for all valid sold items
  const productMap = new Map();
  products.forEach((p) => productMap.set(p.id, p));

  const totalCOGS = validOrders.reduce((sum, o) => {
    const prod = productMap.get(o.productId);
    const unitCost = prod ? prod.purchaseCost : (o.unitPrice * 0.45);
    return sum + (unitCost * (o.quantity || 1));
  }, 0);

  const totalMarketplaceFees = validOrders.reduce(
    (sum, o) => sum + (o.marketplaceFee || 0),
    0
  );

  const totalOrderShipping = validOrders.reduce(
    (sum, o) => sum + (o.shippingFeeCharged || 0),
    0
  );

  // Contribution profit from orders
  const grossProfit = totalSales - totalCOGS - totalMarketplaceFees - totalOrderShipping;

  // Filter operational overhead expenses (rent, salaries, packaging, software, advertising, etc.)
  // excluding double-counted Product Cost and Supplier Payments
  const overheadExpenses = expenses.filter(
    (e) => e.category !== "Product Cost" && e.category !== "Supplier Payments"
  );
  const totalOverhead = overheadExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalAllExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Net Estimated Profit
  const estimatedProfit = Math.max(0, grossProfit - (totalOverhead * 0.25)); // proportional monthly overhead

  // Inventory stats
  const lowStockProducts = products.filter(
    (p) => p.stock > 0 && p.stock <= (p.reorderLevel || 15)
  ).length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;

  return {
    totalSales,
    totalOrders,
    pendingOrders,
    estimatedProfit,
    totalExpenses: totalAllExpenses,
    overheadExpenses: totalOverhead,
    lowStockProducts,
    outOfStockProducts,
    grossProfit,
    deliveredCount: deliveredOrders.length,
    cancelledCount: orders.filter((o) => o.orderStatus === "Cancelled").length,
    returnedCount: orders.filter((o) => o.orderStatus === "Returned").length,
  };
}

/**
 * Calculates marketplace comparison metrics
 */
export function calculateMarketplaceMetrics(orders = []) {
  const meeshoOrders = orders.filter((o) => o.marketplace === "Meesho");
  const flipkartOrders = orders.filter((o) => o.marketplace === "Flipkart");

  const meeshoSales = meeshoOrders
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const flipkartSales = flipkartOrders
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return {
    meesho: {
      count: meeshoOrders.length,
      sales: meeshoSales,
      delivered: meeshoOrders.filter((o) => o.orderStatus === "Delivered").length,
      cancelled: meeshoOrders.filter((o) => o.orderStatus === "Cancelled").length,
      returned: meeshoOrders.filter((o) => o.orderStatus === "Returned").length,
    },
    flipkart: {
      count: flipkartOrders.length,
      sales: flipkartSales,
      delivered: flipkartOrders.filter((o) => o.orderStatus === "Delivered").length,
      cancelled: flipkartOrders.filter((o) => o.orderStatus === "Cancelled").length,
      returned: flipkartOrders.filter((o) => o.orderStatus === "Returned").length,
    },
  };
}

/**
 * Inventory valuation summary
 */
export function calculateInventoryMetrics(products = []) {
  const totalSkus = products.length;
  const totalUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const totalValue = products.reduce(
    (sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.purchaseCost) || 0)),
    0
  );
  const potentialRetailValue = products.reduce(
    (sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.sellingPrice) || 0)),
    0
  );

  const lowStockItems = products.filter(
    (p) => p.stock > 0 && p.stock <= (p.reorderLevel || 15)
  );
  const outOfStockItems = products.filter((p) => p.stock === 0);

  return {
    totalSkus,
    totalUnits,
    totalValue,
    potentialRetailValue,
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length,
    lowStockItems,
    outOfStockItems,
  };
}

