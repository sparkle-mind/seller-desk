// Single source of truth for the /visual-flow page.
// Derived from the code: which page reads which Redux slice (useSelector) and
// which actions it dispatches. Update this file when a module or slice changes.

// ─── Feature modules (pages under src/app/(private)) ───────────────────────
export const MODULES = [
  {
    id: "dashboard",
    name: "Dashboard",
    href: "/dashboard",
    tone: "blue",
    summary: "Daily overview: sales, profit, low stock and marketplace split.",
    reads: ["products", "orders", "finance"],
    writes: [],
    actions: [],
    dialogs: [],
    detailRoutes: [],
  },
  {
    id: "products",
    name: "Products",
    href: "/products",
    tone: "purple",
    summary: "Product catalogue with pricing, marketplace listings and variants.",
    reads: ["products", "orders"],
    writes: ["products"],
    actions: ["addProduct", "updateProduct", "deleteProduct"],
    dialogs: ["ProductFormDialog"],
    detailRoutes: [{ label: "Product detail", pattern: "/products/[id]" }],
  },
  {
    id: "inventory",
    name: "Inventory",
    href: "/inventory",
    tone: "emerald",
    summary: "Stock levels, manual adjustments, reorder thresholds and the movement log.",
    reads: ["products", "inventory"],
    writes: ["products", "inventory"],
    syncWrites: ["notifications"],
    actions: ["adjustStock", "addMovement", "updateReorderLevel", "updateVariantStock"],
    dialogs: ["StockAdjustmentDialog"],
    detailRoutes: [{ label: "Stock detail", pattern: "/inventory/[id]" }],
  },
  {
    id: "orders",
    name: "Orders",
    href: "/orders",
    tone: "amber",
    summary: "Meesho and Flipkart orders: create, pack, ship, return or cancel. Stock, shipments and returns follow automatically.",
    reads: ["orders", "products"],
    writes: ["orders"],
    syncWrites: ["products", "inventory", "shippingReturns", "notifications"],
    actions: ["createOrder", "editOrder", "markPacked", "markShipped", "markReturned", "cancelOrder", "deleteOrder"],
    dialogs: ["OrderFormDialog", "ShipOrderDialog", "MarkReturnDialog"],
    detailRoutes: [{ label: "Order detail", pattern: "/orders/[id]" }],
  },
  {
    id: "shipping",
    name: "Shipping & Returns",
    href: "/shipping-returns",
    tone: "rose",
    summary: "Shipments, customer returns and RTOs. Delivery updates flow back to orders; eligible returns and received RTOs go back into stock.",
    reads: ["shippingReturns", "orders"],
    writes: ["shippingReturns"],
    syncWrites: ["orders", "products", "inventory", "notifications"],
    actions: ["updateShipmentStatus", "editShipment", "addCustomerReturn", "updateReturnInspection", "addRtoRecord", "updateRtoStatus"],
    dialogs: ["EditShipmentDialog", "ReturnFormDialog", "ReturnInspectionDialog", "RtoFormDialog"],
    detailRoutes: [{ label: "Shipment / return detail", pattern: "/shipping-returns/[id]" }],
  },
  {
    id: "suppliers",
    name: "Suppliers & Purchases",
    href: "/suppliers-purchases",
    tone: "slate",
    summary: "Suppliers and purchase orders; receiving a PO adds stock, paying it reduces the balance.",
    reads: ["suppliersPurchases", "products"],
    writes: ["suppliersPurchases", "products", "inventory"],
    syncWrites: ["notifications"],
    actions: ["addSupplier", "updateSupplier", "addPurchaseOrder", "receivePO", "recordPayment", "cancelPurchaseOrder", "adjustStock", "addMovement"],
    dialogs: ["SupplierFormDialog", "CreatePurchaseOrderDialog", "EditPurchaseOrderDialog", "SupplierDetailsDialog"],
    detailRoutes: [
      { label: "Supplier detail", pattern: "/suppliers-purchases/suppliers/[id]" },
      { label: "Purchase order detail", pattern: "/suppliers-purchases/po/[id]" },
    ],
  },
  {
    id: "finance",
    name: "Finance & Expenses",
    href: "/finance",
    tone: "emerald",
    summary: "Expenses, marketplace settlements and the P&L statement.",
    reads: ["finance", "orders", "products", "shippingReturns"],
    writes: ["finance"],
    actions: ["addExpense", "updateExpense", "deleteExpense", "updateSettlementStatus"],
    dialogs: ["ExpenseFormDialog"],
    detailRoutes: [],
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    href: "/reports",
    tone: "purple",
    summary: "Read-only analytics across every module, with CSV export.",
    reads: ["products", "orders", "finance", "shippingReturns", "suppliersPurchases"],
    writes: [],
    actions: [],
    dialogs: [],
    detailRoutes: [],
  },
  {
    id: "notifications",
    name: "Notifications",
    href: "/notifications",
    tone: "amber",
    summary: "Alerts inbox; the header bell shows the same feed. New alerts are raised by the sync layer as things happen.",
    reads: ["notifications"],
    writes: ["notifications"],
    actions: ["markNotificationRead", "toggleNotificationRead", "markAllNotificationsRead", "deleteNotification", "clearReadNotifications"],
    dialogs: [],
    detailRoutes: [],
  },
  {
    id: "settings",
    name: "Settings",
    href: "/settings",
    tone: "slate",
    summary: "Business profile and preferences; can reset every module to demo data.",
    reads: ["settings"],
    writes: ["settings", "products", "inventory", "orders", "shippingReturns", "suppliersPurchases", "finance", "notifications"],
    actions: ["updateSettings", "reset* (all slices)"],
    dialogs: [],
    detailRoutes: [],
  },
];

// ─── Redux slices (src/store/slices) ───────────────────────────────────────
export const SLICES = [
  { id: "products", name: "products", storageKey: "seller_desk_products", seed: "data/products.js", holds: "Catalogue, prices, stock per product and variant" },
  { id: "inventory", name: "inventory", storageKey: "seller_desk_movements", seed: "data/inventory.js", holds: "Stock movement log (restock, sale, return, adjustment)" },
  { id: "orders", name: "orders", storageKey: "seller_desk_orders", seed: "data/orders.js", holds: "Orders with status, payment and settlement fields" },
  { id: "shippingReturns", name: "shippingReturns", storageKey: "seller_desk_shipments, _returns, _rtos", seed: "data/shipments.js, data/returns.js", holds: "Shipments, customer returns and RTO records" },
  { id: "suppliersPurchases", name: "suppliersPurchases", storageKey: "seller_desk_suppliers, _purchases", seed: "data/suppliers.js, data/purchases.js", holds: "Suppliers, balances and purchase orders" },
  { id: "finance", name: "finance", storageKey: "seller_desk_expenses, _settlements", seed: "data/expenses.js, data/settlements.js", holds: "Expenses and marketplace settlements" },
  { id: "settings", name: "settings", storageKey: "seller_desk_settings", seed: "data/settings.js", holds: "Business profile and preferences" },
  { id: "notifications", name: "notifications", storageKey: "seller_desk_notifications", seed: "data/notifications.js", holds: "Alert feed and read state" },
];

// ─── Business flows: step-by-step stories ──────────────────────────────────
// Each step: where it happens (module id), what the user does, the Redux
// actions dispatched, and which slices change.
export const FLOWS = [
  {
    id: "boot",
    title: "App start-up",
    tone: "slate",
    summary: "How data is loaded when any app page opens.",
    steps: [
      { module: null, title: "Open any app page", detail: "AppLayout wraps the page with the sidebar and header; public and auth routes skip it.", actions: [], slices: [] },
      { module: null, title: "ReduxProvider boots the store", detail: "StoreInitializer dispatches initialize* for all 8 slices.", actions: ["initialize*"], slices: SLICES.map((s) => s.id) },
      { module: null, title: "Load saved data or demo seed", detail: "Each slice reads its localStorage key; when empty it falls back to the seed file in src/data.", actions: [], slices: SLICES.map((s) => s.id) },
      { module: "dashboard", title: "Pages render from the store", detail: "Every change is written back to localStorage, so data survives a refresh.", actions: [], slices: [] },
    ],
  },
  {
    id: "order",
    title: "Order lifecycle",
    tone: "amber",
    summary: "From a marketplace order to delivery, return or cancellation.",
    steps: [
      { module: "orders", title: "Create order", detail: "Picks a product from the catalogue. Sync layer deducts the units (variant-aware), logs a Sale movement and raises a New order alert.", actions: ["createOrder", "↳ adjustStock / updateVariantStock", "↳ addMovement", "↳ pushNotification"], slices: ["orders", "products", "inventory", "notifications"] },
      { module: "orders", title: "Pack", detail: "Order moves to Processing / Ready for Pickup; an existing shipment follows.", actions: ["markPacked"], slices: ["orders", "shippingReturns"] },
      { module: "orders", title: "Ship", detail: "Ship dialog sets courier and AWB. Sync layer creates the shipment record and links it to the order.", actions: ["markShipped", "↳ addShipment"], slices: ["orders", "shippingReturns"] },
      { module: "shipping", title: "Track delivery", detail: "Updating the shipment (In Transit, Delivered...) updates the order's status, courier and delivered date, and raises a Delivered alert.", actions: ["updateShipmentStatus", "↳ syncOrderFields"], slices: ["shippingReturns", "orders", "notifications"] },
      { module: "orders", title: "Cancel if needed", detail: "Cancelling releases the held units back to stock and cancels the shipment.", actions: ["cancelOrder", "↳ adjustStock", "↳ addMovement"], slices: ["orders", "products", "inventory", "shippingReturns"] },
      { module: "finance", title: "Counts toward revenue", detail: "Dashboard, Finance P&L and Reports compute totals from orders.", actions: [], slices: [] },
    ],
  },
  {
    id: "procurement",
    title: "Procurement & restock",
    tone: "blue",
    summary: "Buying stock from a supplier and paying for it.",
    steps: [
      { module: "suppliers", title: "Add supplier", detail: "Supplier record with contact and balance.", actions: ["addSupplier"], slices: ["suppliersPurchases"] },
      { module: "suppliers", title: "Create purchase order", detail: "Line items reference catalogue products; supplier balance increases.", actions: ["addPurchaseOrder"], slices: ["suppliersPurchases"] },
      { module: "suppliers", title: "Receive PO", detail: "Marks the PO received, adds each item's quantity to stock and logs a movement.", actions: ["receivePO", "adjustStock", "addMovement"], slices: ["suppliersPurchases", "products", "inventory"] },
      { module: "suppliers", title: "Record payment", detail: "Paid amount goes up, outstanding balance goes down.", actions: ["recordPayment"], slices: ["suppliersPurchases"] },
      { module: "inventory", title: "Stock visible in Inventory", detail: "New level and the movement appear in the Inventory log.", actions: [], slices: [] },
    ],
  },
  {
    id: "returns",
    title: "Returns & restock",
    tone: "rose",
    summary: "Customer returns and RTOs come back, get checked and go back on the shelf.",
    steps: [
      { module: "orders", title: "Mark order returned", detail: "Sync layer opens a customer return linked to the order, with SKU, quantity and refund amount.", actions: ["markReturned", "↳ addCustomerReturn"], slices: ["orders", "shippingReturns", "notifications"] },
      { module: "shipping", title: "Inspect", detail: "Condition and restock eligibility are recorded.", actions: ["updateReturnInspection"], slices: ["shippingReturns"] },
      { module: "shipping", title: "Restock if eligible", detail: "The returned SKU gets its quantity back once (the return is flagged restocked) with a Return Restock movement.", actions: ["↳ adjustStock / updateVariantStock", "↳ addMovement"], slices: ["products", "inventory", "notifications"] },
      { module: "shipping", title: "RTO received", detail: "For failed deliveries, receiving the RTO restocks the original order's own product and closes the shipment as Returned to Origin.", actions: ["updateRtoStatus", "↳ adjustStock", "↳ addMovement"], slices: ["shippingReturns", "orders", "products", "inventory"] },
      { module: "finance", title: "Refunds hit finance", detail: "Finance totals return refund amounts.", actions: [], slices: [] },
    ],
  },
  {
    id: "stock",
    title: "Manual stock control",
    tone: "emerald",
    summary: "Correcting stock by hand and setting reorder alerts.",
    steps: [
      { module: "inventory", title: "Adjust stock", detail: "Stock adjustment dialog sets a new level with a reason.", actions: ["adjustStock", "addMovement"], slices: ["products", "inventory"] },
      { module: "inventory", title: "Set reorder level", detail: "Threshold used to flag low stock.", actions: ["updateReorderLevel"], slices: ["products"] },
      { module: "inventory", title: "Edit variant stock", detail: "Per-variant quantities on the stock detail page.", actions: ["updateVariantStock"], slices: ["products"] },
      { module: "dashboard", title: "Low-stock alerts", detail: "Dashboard and Products highlight items at or below the threshold.", actions: [], slices: [] },
    ],
  },
  {
    id: "money",
    title: "Money in, money out",
    tone: "purple",
    summary: "How finance figures are assembled.",
    steps: [
      { module: "finance", title: "Record expenses", detail: "Ads, packaging, rent and other costs.", actions: ["addExpense", "updateExpense"], slices: ["finance"] },
      { module: "finance", title: "Track settlements", detail: "Marketplace payouts move from Pending to Settled.", actions: ["updateSettlementStatus"], slices: ["finance"] },
      { module: "finance", title: "Build P&L", detail: "Combines orders, product costs, returns and expenses.", actions: [], slices: [] },
      { module: "reports", title: "Analyse and export", detail: "Reports reads every slice and exports CSV.", actions: [], slices: [] },
    ],
  },
];

// ─── Automatic sync rules (src/store/syncListeners.js) ─────────────────────
// Each rule runs after the trigger action, whichever page dispatched it.
export const SYNC_RULES = [
  { trigger: "Order created", effect: "Units deducted from the product or variant, Sale movement logged, New order alert.", module: "orders", slices: ["products", "inventory", "notifications"] },
  { trigger: "Order edited / cancelled / deleted", effect: "Held units re-balanced or released back to stock; a cancelled order cancels its shipment.", module: "orders", slices: ["products", "inventory", "shippingReturns"] },
  { trigger: "Order shipped / packed", effect: "Shipment record created (or updated) and linked to the order by shipmentId.", module: "orders", slices: ["shippingReturns", "orders"] },
  { trigger: "Shipment status changed", effect: "Order status, courier, AWB and delivered date follow the shipment; Delivered alert.", module: "shipping", slices: ["orders", "notifications"] },
  { trigger: "Order marked returned", effect: "Customer return opened with SKU, quantity and refund; stock waits for inspection.", module: "orders", slices: ["shippingReturns", "notifications"] },
  { trigger: "Return inspected as Eligible", effect: "Returned SKU restocked once by its real quantity; return flagged restocked.", module: "shipping", slices: ["products", "inventory", "notifications"] },
  { trigger: "RTO logged / received", effect: "Order marked Returned; on receipt the original order's product is restocked (fixes the old products[0] bug).", module: "shipping", slices: ["orders", "products", "inventory"] },
  { trigger: "Stock crosses reorder level or 0", effect: "Low stock / Out of stock alert, from any source. Loading or resetting data never alerts.", module: "inventory", slices: ["notifications"] },
  { trigger: "Purchase order received", effect: "Purchase received alert with the units added.", module: "suppliers", slices: ["notifications"] },
];

// ─── Sitemap ───────────────────────────────────────────────────────────────
export const SITEMAP = [
  {
    group: "Public site",
    tone: "slate",
    note: "Marketing shell, no sidebar",
    routes: [
      { label: "Home", href: "/" },
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    group: "Authentication",
    tone: "amber",
    note: "UI only in this demo; any sign-in opens the app",
    routes: [
      { label: "Login", href: "/login" },
      { label: "Sign up", href: "/signup" },
      { label: "Forgot password", href: "/forgot-password" },
    ],
  },
  {
    group: "Seller app",
    tone: "blue",
    note: "Sidebar + header shell, Redux store",
    routes: MODULES.map((m) => ({ label: m.name, href: m.href, children: m.detailRoutes })),
  },
];

export const TONES = {
  blue: { dot: "bg-blue-500", text: "text-blue-600", soft: "bg-blue-500/10", ring: "ring-blue-500/30", stroke: "rgb(59 130 246)" },
  emerald: { dot: "bg-emerald-500", text: "text-emerald-600", soft: "bg-emerald-500/10", ring: "ring-emerald-500/30", stroke: "rgb(16 185 129)" },
  amber: { dot: "bg-amber-500", text: "text-amber-600", soft: "bg-amber-500/10", ring: "ring-amber-500/30", stroke: "rgb(245 158 11)" },
  rose: { dot: "bg-rose-500", text: "text-rose-600", soft: "bg-rose-500/10", ring: "ring-rose-500/30", stroke: "rgb(244 63 94)" },
  purple: { dot: "bg-purple-500", text: "text-purple-600", soft: "bg-purple-500/10", ring: "ring-purple-500/30", stroke: "rgb(168 85 247)" },
  slate: { dot: "bg-slate-500", text: "text-slate-600", soft: "bg-slate-500/10", ring: "ring-slate-500/30", stroke: "rgb(100 116 139)" },
};

export const moduleById = (id) => MODULES.find((m) => m.id === id);
export const sliceById = (id) => SLICES.find((s) => s.id === id);
