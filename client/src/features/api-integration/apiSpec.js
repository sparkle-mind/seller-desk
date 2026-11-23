// Single source of truth for the /api-integration page.
//
// Everything here reflects the code as it is today:
//   * LIVE_ENDPOINTS   routes the Express server (server/src) actually serves,
//                      with responses captured by running it.
//   * OPERATIONS       work the UI performs through Redux slices + localStorage.
//                      None of these have an HTTP endpoint, so no URL is given.
//   * SCHEMAS          record shapes taken from the seed files (src/data) and
//                      the slices / form dialogs that create them.
// Do not add paths that the server does not register.

// ─── Server ──────────────────────────────────────────────────────────────────

export const SERVER = {
  defaultBaseUrl: "http://localhost:5000",
  portSource: "server/src/server.js (process.env.PORT || 5000)",
  framework: "Express 5 (ES modules)",
  middleware: ["express.json() (100kb body limit, default options)"],
  entry: "server/src/app.js",
};

// Real response bodies observed from the running server.
const HTML_404 = (method, path) =>
  `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Error</title>\n</head>\n<body>\n<pre>Cannot ${method} ${path}</pre>\n</body>\n</html>`;

const HTML_400 =
  `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Error</title>\n</head>\n<body>\n<pre>SyntaxError: Expected property name or &#39;}&#39; in JSON at position 1 (line 1 column 2)<br> &nbsp; &nbsp;at JSON.parse (&lt;anonymous&gt;)<br> &nbsp; &nbsp;at parse (...\\server\\node_modules\\body-parser\\lib\\types\\json.js:93:21)<br> ...</pre>\n</body>\n</html>`;

const HTML_413 =
  `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Error</title>\n</head>\n<body>\n<pre>PayloadTooLargeError: request entity too large<br> &nbsp; &nbsp;at readStream (...\\server\\node_modules\\raw-body\\index.js...)<br> ...</pre>\n</body>\n</html>`;

export const LIVE_ENDPOINTS = [
  {
    id: "get-root",
    method: "GET",
    path: "/",
    tag: "System",
    summary: "Welcome / health check",
    description:
      "The only route registered on the Express app. Returns a fixed JSON message, so it is useful as a liveness check. It does not touch the database.",
    source: "server/src/app.js",
    auth: "None",
    parameters: [],
    headers: [
      { name: "If-None-Match", in: "header", type: "string", required: false, note: "Optional. Send the ETag from a previous response to get 304 Not Modified." },
    ],
    requestBody: null,
    responses: [
      {
        status: 200,
        description: "Server is running.",
        contentType: "application/json; charset=utf-8",
        schema: "WelcomeResponse",
        headers: { ETag: 'W/"36-j+drWa5QPjf+lyBLSpkImb29Uyk"', "Content-Length": "54", "X-Powered-By": "Express" },
        example: { success: true, message: "Welcome to Express Server" },
      },
      {
        status: 304,
        description: "If-None-Match matched the current ETag. Empty body.",
        contentType: null,
        example: null,
      },
    ],
    alsoAnswers: [
      { method: "HEAD", path: "/", note: "Express answers HEAD from the GET handler: 200 with headers, no body." },
      { method: "OPTIONS", path: "/", note: 'Express answers automatically: 200, header "Allow: GET, HEAD", text body "GET, HEAD". This is not a CORS preflight response.' },
    ],
  },
];

// Server-wide error behaviour (Express defaults; there is no custom handler).
export const SERVER_ERRORS = [
  {
    status: 400,
    title: "Bad Request (malformed JSON)",
    when: "Any request with Content-Type: application/json whose body is not valid JSON. express.json() runs before routing, so this happens even for paths that do not exist.",
    contentType: "text/html; charset=utf-8",
    body: HTML_400,
    risk: "The response includes the full stack trace with absolute file paths from the server machine.",
    tryIt: { method: "POST", path: "/", contentType: "application/json", body: "{bad" },
  },
  {
    status: 404,
    title: "Not Found",
    when: "Any method or path other than GET/HEAD/OPTIONS on \"/\". That includes every /api/... path, and POST/PUT/PATCH/DELETE on \"/\".",
    contentType: "text/html; charset=utf-8",
    body: HTML_404("GET", "/api/products"),
    tryIt: { method: "GET", path: "/api/products" },
  },
  {
    status: 413,
    title: "Payload Too Large",
    when: "A JSON body larger than 100kb (express.json() default limit).",
    contentType: "text/html; charset=utf-8",
    body: HTML_413,
    risk: "Also returns a stack trace with server file paths.",
  },
  {
    status: 500,
    title: "Internal Server Error",
    when: "An exception thrown inside a route. GET / cannot throw today, but any future route without its own handling would fall through to Express's default HTML error page.",
    contentType: "text/html; charset=utf-8",
    body: null,
  },
];

// ─── Schemas ─────────────────────────────────────────────────────────────────
// field: [name, type, note]. Types follow JSON / OpenAPI naming.

const f = (name, type, note = "", extra = {}) => ({ name, type, note, ...extra });

export const SCHEMAS = {
  WelcomeResponse: {
    source: "server/src/app.js",
    kind: "server",
    fields: [f("success", "boolean", "Always true"), f("message", "string", '"Welcome to Express Server"')],
  },
  User: {
    source: "server/prisma/schema.prisma",
    kind: "database",
    note: "Defined in Prisma only. No route reads or writes it, Prisma Client is never imported, and there are no migrations.",
    fields: [
      f("id", "integer", "@id @default(autoincrement())"),
      f("name", "string"),
      f("email", "string", "@unique"),
      f("password", "string", "Stored as given; no hashing library is installed"),
      f("createdAt", "date-time", "@default(now())"),
      f("updatedAt", "date-time", "@updatedAt"),
    ],
  },
  Product: {
    source: "src/data/products.js · productsSlice",
    kind: "client",
    storageKey: "seller_desk_products",
    fields: [
      f("id", "string", 'Generated: "PROD-" + (count + 1), 3 digits'),
      f("name", "string", "Required"),
      f("sku", "string", "Required"),
      f("category", "string", 'e.g. "Ethnic Wear", "Electronics & Audio"'),
      f("brand", "string"),
      f("description", "string"),
      f("purchaseCost", "number", "Required, > 0"),
      f("sellingPrice", "number", "Required, > 0"),
      f("mrp", "number", "Defaults to sellingPrice × 1.5 when empty"),
      f("stock", "integer", "≥ 0. Equals the sum of variant stock when variants exist"),
      f("reorderLevel", "integer", "Default 15, min 1"),
      f("weightKg", "number", "Default 0.5"),
      f("dimensions", "string", 'e.g. "32x26x4 cm"'),
      f("image", "string (url)"),
      f("status", "string", '"Active"'),
      f("marketplaceListings", "object", "{ meesho: Listing, flipkart: Listing }"),
      f("variants", "Variant[]", "Default []"),
      f("createdAt", "date-time", "Generated"),
    ],
  },
  Listing: {
    source: "src/data/products.js",
    kind: "client",
    fields: [
      f("listingId", "string", 'e.g. "MSH-KUR-9812", "FSN-KUR-45120"'),
      f("live", "boolean"),
      f("price", "number", "Defaults to sellingPrice"),
    ],
  },
  Variant: {
    source: "src/data/products.js",
    kind: "client",
    fields: [
      f("id", "string", 'e.g. "VAR-001-M"'),
      f("size", "string"),
      f("color", "string"),
      f("sku", "string"),
      f("stock", "integer"),
      f("cost", "number"),
      f("price", "number"),
    ],
  },
  StockMovement: {
    source: "src/data/inventory.js · inventorySlice",
    kind: "client",
    storageKey: "seller_desk_movements",
    fields: [
      f("id", "string", 'Generated: "MOV-2026-" + (count + 1)'),
      f("date", "date-time", "Generated"),
      f("productId", "string"),
      f("productName", "string"),
      f("sku", "string"),
      f("type", "string", '"Stock In" | "Stock Out" | "Damage" | "Manual Set" | "Sale" | "Return Restock" | "Order Cancelled" | "Order Deleted" | "Order Edited" | "Damage / Loss" | "Manual Adjustment"'),
      f("quantity", "integer", "Signed change (negative for removals)"),
      f("previousStock", "integer"),
      f("newStock", "integer"),
      f("reason", "string"),
      f("referenceId", "string", 'e.g. "PO-2026-001", "ADJ-4821", order id'),
      f("performedBy", "string", 'Default "Store Admin"'),
    ],
  },
  Order: {
    source: "src/data/orders.js · ordersSlice",
    kind: "client",
    storageKey: "seller_desk_orders",
    fields: [
      f("id", "string", 'Generated: "ORD-{year}-" + (9000 + count + 1)'),
      f("marketplaceOrderNo", "string", 'Generated when empty: "MANUAL-" + 8 digits'),
      f("marketplace", "string", '"Meesho" | "Flipkart"'),
      f("orderDate", "date-time", "Generated"),
      f("customerName", "string", "Required"),
      f("customerPhone", "string"),
      f("city", "string", "Required"),
      f("state", "string", "Required"),
      f("pincode", "string"),
      f("productId", "string"),
      f("productName", "string", "Required"),
      f("sku", "string"),
      f("quantity", "integer", "Required"),
      f("unitPrice", "number", "Required"),
      f("totalAmount", "number", "quantity × unitPrice"),
      f("paymentMethod", "string", '"Prepaid (UPI)" | "Prepaid (Credit Card)" | "Prepaid (Net Banking)" | "Prepaid (Debit Card)" | "Cash on Delivery"'),
      f("paymentStatus", "string", '"Pending" | "Paid" | "Refunded" | "Cancelled" | "Partially Paid"'),
      f("orderStatus", "string", '"Pending" | "Processing" | "Shipped" | "Delivered" | "Returned" | "Cancelled"'),
      f("shipmentStatus", "string", '"Pending" | "Ready for Pickup" | "In Transit" | "Out for Delivery" | "Delivered" | "Returned to Origin" | "Cancelled" | ...'),
      f("shipmentId", "string | null", "Linked by the sync layer when shipped"),
      f("courier", "string", 'Default "Unassigned"'),
      f("awbNumber", "string | null"),
      f("deliveredDate", "date-time | null"),
      f("marketplaceFee", "number", "Default 0"),
      f("shippingFeeCharged", "number", "Default 65"),
      f("sellerSettlement", "number", "totalAmount − marketplaceFee − shippingFeeCharged"),
      f("settlementStatus", "string", '"Pending" | "Settled" | "Deducted" | "Cancelled"'),
      f("notes", "string", "Optional"),
      f("returnReason", "string", "Set by markReturned"),
      f("cancellationReason", "string", "Set by cancelOrder"),
      f("stockCommittedQty", "integer", "Internal. Units this order holds; set by the sync layer"),
    ],
  },
  Shipment: {
    source: "src/data/shipments.js · shippingReturnsSlice",
    kind: "client",
    storageKey: "seller_desk_shipments",
    fields: [
      f("id", "string", 'Generated: "SHP-" + (max + 1)'),
      f("orderId", "string"),
      f("marketplace", "string"),
      f("courierName", "string"),
      f("awbNumber", "string"),
      f("shipmentDate", "date-time"),
      f("expectedDeliveryDate", "date", "YYYY-MM-DD"),
      f("deliveredDate", "date-time | null", "Set when deliveryStatus becomes Delivered"),
      f("deliveryStatus", "string", '"Manifest Generated" | "Ready for Pickup" | "In Transit" | "Out for Delivery" | "Delivered" | "Delivered (Returned)" | "Returned to Origin" | "RTO Initiated" | "Cancelled"'),
      f("shippingCost", "number", "Default 65"),
      f("destinationCity", "string"),
      f("pincode", "string"),
      f("itemsSummary", "string"),
      f("weightKg", "number"),
    ],
  },
  CustomerReturn: {
    source: "src/data/returns.js · shippingReturnsSlice",
    kind: "client",
    storageKey: "seller_desk_returns",
    fields: [
      f("id", "string", 'Generated: "RET-2026-" + (count + 1)'),
      f("originalOrderId", "string", "Required"),
      f("marketplace", "string"),
      f("productName", "string", "Required"),
      f("sku", "string"),
      f("customerName", "string", "Required"),
      f("returnReason", "string", "Required"),
      f("returnDate", "date", "Generated, YYYY-MM-DD"),
      f("refundAmount", "number", "Required"),
      f("inspectionStatus", "string", '"Pending Inspection" | "Inspected - Intact" | "Inspected - Damaged"'),
      f("restockEligibility", "string", '"Pending Decision" | "Eligible" | "Ineligible"'),
      f("returnStatus", "string", '"In Transit to Warehouse" | "Received Back" | "Refund Processed" | "Rejected"'),
      f("restocked", "boolean", "Set once by the sync layer"),
      f("inspectionNotes", "string"),
      f("reverseShippingFee", "number"),
    ],
  },
  RtoRecord: {
    source: "src/data/returns.js · shippingReturnsSlice",
    kind: "client",
    storageKey: "seller_desk_rtos",
    fields: [
      f("id", "string", 'Generated: "RTO-2026-" + (count + 1)'),
      f("originalOrderId", "string", "Required"),
      f("marketplace", "string"),
      f("courierName", "string", "Required"),
      f("awbNumber", "string"),
      f("customerName", "string"),
      f("destinationCity", "string"),
      f("rtoReason", "string", "Required"),
      f("returnShippingCharge", "number", "Default 80"),
      f("rtoStatus", "string", '"In Transit to Seller" | "Received Back & Verified"'),
      f("receivedBackDate", "date | null"),
      f("restocked", "boolean"),
      f("notes", "string"),
    ],
  },
  Supplier: {
    source: "src/data/suppliers.js · suppliersPurchasesSlice",
    kind: "client",
    storageKey: "seller_desk_suppliers",
    fields: [
      f("id", "string", 'Generated: "SUP-" + (count + 1)'),
      f("name", "string", "Required (trade name)"),
      f("company", "string", "Required (legal name)"),
      f("contactPerson", "string"),
      f("phone", "string", "Required"),
      f("email", "string"),
      f("city", "string", "Required"),
      f("state", "string"),
      f("address", "string"),
      f("categories", "string[]"),
      f("totalPurchases", "number", "Default 0; increased by addPurchaseOrder"),
      f("outstandingBalance", "number", "Default 0; changed by PO create, payment and cancel"),
      f("paymentTerms", "string", 'e.g. "Net 30"'),
      f("gstin", "string"),
      f("status", "string", 'Default "Active"'),
    ],
  },
  PurchaseOrder: {
    source: "src/data/purchases.js · suppliersPurchasesSlice",
    kind: "client",
    storageKey: "seller_desk_purchases",
    fields: [
      f("id", "string", 'Generated: "PO-2026-" + (count + 1)'),
      f("poNumber", "string", "Same as id"),
      f("supplierId", "string", "Required"),
      f("supplierName", "string"),
      f("orderDate", "date"),
      f("expectedDeliveryDate", "date"),
      f("receivedDate", "date | null"),
      f("status", "string", '"Ordered" | "Received" | "Cancelled"'),
      f("paymentStatus", "string", '"Pending" | "Partially Paid" | "Paid"'),
      f("items", "PurchaseOrderItem[]", "Required, at least one"),
      f("subtotal", "number"),
      f("tax", "number"),
      f("shippingCost", "number"),
      f("totalAmount", "number", "subtotal + tax + shippingCost"),
      f("paidAmount", "number", "Default 0"),
      f("notes", "string"),
    ],
  },
  PurchaseOrderItem: {
    source: "src/data/purchases.js",
    kind: "client",
    fields: [
      f("productId", "string"),
      f("productName", "string"),
      f("sku", "string"),
      f("quantity", "integer"),
      f("receivedQuantity", "integer", "0 until received"),
      f("unitCost", "number"),
      f("total", "number", "quantity × unitCost"),
    ],
  },
  Expense: {
    source: "src/data/expenses.js · financeSlice",
    kind: "client",
    storageKey: "seller_desk_expenses",
    fields: [
      f("id", "string", 'Generated: "EXP-2026-" + (count + 1)'),
      f("date", "date", "Required"),
      f("category", "string", '"Rent" | "Salaries" | "Packaging" | "Shipping" | "Advertising" | "Software" | "Marketplace Fees" | "Supplier Payments" | "Product Cost" | "Other Expenses"'),
      f("description", "string", "Required"),
      f("amount", "number", "Required, > 0"),
      f("paymentMethod", "string", '"Bank Transfer / NEFT" | "UPI" | "Credit Card" | "Marketplace Settlement Deduction" | "Cash" | "Auto Debit"'),
      f("relatedOrderOrPurchase", "string", 'Default "N/A"'),
      f("notes", "string"),
    ],
  },
  Settlement: {
    source: "src/data/settlements.js · financeSlice",
    kind: "client",
    storageKey: "seller_desk_settlements",
    fields: [
      f("id", "string", 'e.g. "SET-2026-001"'),
      f("marketplace", "string"),
      f("settlementDate", "date"),
      f("cyclePeriod", "string", 'e.g. "Feb 01 - Feb 07, 2026"'),
      f("grossSales", "number"),
      f("marketplaceFees", "number"),
      f("shippingDeductions", "number"),
      f("returnsDeductions", "number"),
      f("taxTcsTds", "number"),
      f("netPayoutAmount", "number"),
      f("status", "string", '"Pending" | "Settled"'),
      f("utrNumber", "string"),
      f("bankAccount", "string"),
    ],
  },
  Notification: {
    source: "src/data/notifications.js · notificationsSlice",
    kind: "client",
    storageKey: "seller_desk_notifications",
    fields: [
      f("id", "string", 'Generated: "NTF-{timestamp}-{random}"'),
      f("category", "string", '"order" | "inventory" | "finance" | "returns" | "purchase" | "system"'),
      f("priority", "string", '"normal" | "high"'),
      f("title", "string"),
      f("message", "string"),
      f("href", "string", "In-app route to open"),
      f("createdAt", "date-time"),
      f("read", "boolean"),
    ],
  },
  Settings: {
    source: "src/data/settings.js · settingsSlice",
    kind: "client",
    storageKey: "seller_desk_settings",
    fields: [
      f("businessName", "string"),
      f("brandTagline", "string"),
      f("registeredEntity", "string"),
      f("gstNumber", "string"),
      f("panNumber", "string"),
      f("ownerName", "string"),
      f("email", "string"),
      f("phone", "string"),
      f("currency", "string", '"INR (₹)"'),
      f("dateFormat", "string", '"DD/MM/YYYY"'),
      f("taxDisplay", "string", '"Inclusive"'),
      f("defaultLowStockThreshold", "integer"),
      f("pageSizePreference", "integer"),
      f("themePreference", "string"),
      f("warehouseAddress", "string"),
      f("supportEmail", "string"),
      f("marketplaceToggles", "object", "{ meesho: boolean, flipkart: boolean }"),
    ],
  },
  SavedCalculation: {
    source: "app/(private)/calculator/page.jsx · calculatorSlice",
    kind: "client",
    storageKey: "seller_desk_calculations",
    fields: [
      f("id", "string", 'Generated: "CALC-" + base36 timestamp'),
      f("productName", "string", "Required"),
      f("platform", "string", '"Meesho" | "Flipkart"'),
      f("notes", "string"),
      f("inputs", "object", "purchasePrice, sellingPrice, commissionType (\"percent\" | flat), commissionValue, forwardShipping, reverseShipping, packagingCost, otherExpenses, targetMargin"),
      f("result", "object", "commissionAmount, totalCost, netProfit, profitMargin, roi, breakEvenPrice, finalSellingPrice, isProfit"),
      f("createdAt", "date-time", "Generated"),
      f("updatedAt", "date-time", "Generated, refreshed on update"),
    ],
  },
};

// ─── Client operations without an API ────────────────────────────────────────
// kind: read | create | update | delete | action

const P = "app/(private)";

export const MODULES = [
  { id: "products", name: "Products", slice: "products", schemas: ["Product", "Variant", "Listing"] },
  { id: "inventory", name: "Inventory", slice: "inventory", schemas: ["StockMovement"] },
  { id: "orders", name: "Orders", slice: "orders", schemas: ["Order"] },
  { id: "shipping", name: "Shipping & Returns", slice: "shippingReturns", schemas: ["Shipment", "CustomerReturn", "RtoRecord"] },
  { id: "suppliers", name: "Suppliers & Purchases", slice: "suppliersPurchases", schemas: ["Supplier", "PurchaseOrder", "PurchaseOrderItem"] },
  { id: "finance", name: "Finance & Expenses", slice: "finance", schemas: ["Expense", "Settlement"] },
  { id: "notifications", name: "Notifications", slice: "notifications", schemas: ["Notification"] },
  { id: "settings", name: "Settings", slice: "settings", schemas: ["Settings"] },
  { id: "calculator", name: "Pricing Calculator", slice: "calculator", schemas: ["SavedCalculation"] },
];

export const OPERATIONS = [
  // Products
  {
    module: "products", kind: "read", action: "state.products.items", summary: "List products",
    usedIn: [`${P}/products`, `${P}/inventory`, `${P}/dashboard`, `${P}/reports`, "OrderFormDialog"], returns: "Product[]",
  },
  {
    module: "products", kind: "create", action: "products/addProduct", summary: "Create a product",
    usedIn: [`${P}/products/page.jsx`], returns: "Product",
    payload: "Product (without id, createdAt)",
    example: {
      name: "Embroidered Rayon Anarkali Kurta with Dupatta", sku: "SKU-KUR-001", category: "Ethnic Wear", brand: "Kesar Vastra",
      description: "Premium rayon fabric with gold zari embroidery.", purchaseCost: 320, sellingPrice: 749, mrp: 1899, stock: 45,
      reorderLevel: 15, weightKg: 0.45, dimensions: "32x26x4 cm", image: "", status: "Active",
      marketplaceListings: { meesho: { listingId: "MSH-KUR-9812", live: true, price: 729 }, flipkart: { listingId: "FSN-KUR-45120", live: true, price: 749 } },
      variants: [],
    },
    validation: [
      ["name", "Product name is required"], ["sku", "Internal SKU is required"],
      ["purchaseCost", "Valid purchase cost is required"], ["sellingPrice", "Valid selling price is required"],
      ["stock", "Opening stock cannot be negative"],
    ],
    notes: ["The form also spreads its flat helper fields (meeshoListingId, meeshoLive, meeshoPrice, flipkartListingId, flipkartLive, flipkartPrice) into the saved record.", "IDs come from count + 1, so after a delete a new product can reuse an existing id."],
  },
  {
    module: "products", kind: "update", action: "products/updateProduct", summary: "Update a product (merge)",
    usedIn: [`${P}/products/page.jsx`, `${P}/products/[id]/page.jsx`], returns: "Product",
    payload: "{ id } + any Product fields", example: { id: "PROD-001", sellingPrice: 799, status: "Active" },
    validation: "Same as create when sent from ProductFormDialog",
    effects: ["Low/out-of-stock notification when stock crosses the threshold"],
  },
  {
    module: "products", kind: "delete", action: "products/deleteProduct", summary: "Delete a product",
    usedIn: [`${P}/products/page.jsx`], payload: "id (string)", example: "PROD-001",
  },
  {
    module: "products", kind: "action", action: "products/adjustStock", summary: "Set absolute stock for a product",
    usedIn: [`${P}/inventory`, `${P}/suppliers-purchases/po/[id]`, `${P}/suppliers-purchases/suppliers/[id]`, "syncListeners"],
    fields: [f("productId", "string", "", { required: true }), f("newStock", "integer", "Clamped to ≥ 0", { required: true })],
    example: { productId: "PROD-001", newStock: 60 },
    notes: ["Pages dispatch addMovement separately to log the change; the two are not atomic."],
    effects: ["Low/out-of-stock notification"],
  },
  {
    module: "products", kind: "action", action: "products/updateReorderLevel", summary: "Change reorder level",
    usedIn: [`${P}/inventory/[id]/page.jsx`],
    fields: [f("productId", "string", "", { required: true }), f("reorderLevel", "integer", "Clamped to ≥ 1", { required: true })],
    example: { productId: "PROD-001", reorderLevel: 20 },
  },
  {
    module: "products", kind: "action", action: "products/updateVariantStock", summary: "Set variant stock (internal)",
    usedIn: ["store/syncListeners.js"], internal: true,
    fields: [f("productId", "string", "", { required: true }), f("variantId", "string", "", { required: true }), f("newStock", "integer", "", { required: true })],
    example: { productId: "PROD-001", variantId: "VAR-001-M", newStock: 17 },
    notes: ["Recomputes product.stock as the sum of all variant stock."],
  },

  // Inventory
  {
    module: "inventory", kind: "read", action: "state.inventory.movements", summary: "List stock movements",
    usedIn: [`${P}/inventory`, `${P}/inventory/[id]`], returns: "StockMovement[]",
  },
  {
    module: "inventory", kind: "create", action: "inventory/addMovement", summary: "Log a stock movement",
    usedIn: [`${P}/inventory`, `${P}/inventory/[id]`, `${P}/suppliers-purchases`, `${P}/suppliers-purchases/po/[id]`, `${P}/suppliers-purchases/suppliers/[id]`, "syncListeners"],
    payload: "StockMovement (without id, date, performedBy)",
    example: { productId: "PROD-001", productName: "Embroidered Rayon Anarkali Kurta with Dupatta", sku: "SKU-KUR-001", type: "Stock In", quantity: 20, previousStock: 45, newStock: 65, reason: "Vendor restock", referenceId: "ADJ-4821" },
    validation: [
      ["quantity", "Please enter a valid positive quantity"],
      ["quantity", "Cannot remove {n} units. Only {stock} units available."],
      ["reason", "Please specify a reason for this inventory adjustment"],
    ],
  },

  // Orders
  {
    module: "orders", kind: "read", action: "state.orders.items", summary: "List orders",
    usedIn: [`${P}/orders`, `${P}/orders/[id]`, `${P}/dashboard`, `${P}/reports`, `${P}/finance`], returns: "Order[]",
  },
  {
    module: "orders", kind: "create", action: "orders/createOrder", summary: "Create a manual order",
    usedIn: [`${P}/orders/page.jsx`], returns: "Order",
    payload: "Order form fields",
    example: {
      marketplace: "Meesho", marketplaceOrderNo: "", orderStatus: "Pending", customerName: "Priya Sharma", customerPhone: "+91 98765 12340",
      city: "Jaipur", state: "Rajasthan", pincode: "302015", productId: "PROD-001", productName: "Embroidered Rayon Anarkali Kurta with Dupatta",
      sku: "SKU-KUR-001-M", quantity: 1, unitPrice: 729, totalAmount: 729, paymentMethod: "Prepaid (UPI)", marketplaceFee: 0, shippingFeeCharged: 65, sellerSettlement: 664, notes: "",
    },
    validation: "HTML required on customerName, city, state, productName, quantity, unitPrice, paymentMethod, marketplace, orderStatus",
    notes: ["paymentStatus is Pending for cash methods, Paid otherwise.", "sellerSettlement is recomputed by the reducer."],
    effects: ["Deducts stock (product or matching variant), logs a \"Sale\" movement and stores stockCommittedQty", "New-order notification", "High-priority \"Oversold\" notification when stock was short", "Low/out-of-stock notification when stock crosses the threshold"],
  },
  {
    module: "orders", kind: "update", action: "orders/editOrder", summary: "Edit an order (merge)",
    usedIn: [`${P}/orders/page.jsx`, `${P}/orders/[id]/page.jsx`], payload: "{ id } + Order fields",
    example: { id: "ORD-2026-1001", quantity: 2, unitPrice: 729, totalAmount: 1458 },
    effects: ["If product, SKU or quantity changed and the order holds stock: releases it (\"Order Edited\") and commits the new line (\"Sale\")"],
  },
  {
    module: "orders", kind: "delete", action: "orders/deleteOrder", summary: "Delete an order",
    usedIn: [`${P}/orders/page.jsx`, `${P}/orders/[id]/page.jsx`], payload: "id (string)", example: "ORD-2026-1001",
    effects: ["Returns any stock the order held (\"Order Deleted\" movement), unless it was already cancelled"],
  },
  {
    module: "orders", kind: "action", action: "orders/markPacked", summary: "Mark packed",
    usedIn: [`${P}/orders/page.jsx`, `${P}/orders/[id]/page.jsx`], payload: "orderId (string)", example: "ORD-2026-1001",
    notes: ["Sets orderStatus Processing, shipmentStatus Ready for Pickup."],
    effects: ["Mirrors status to the linked shipment"],
  },
  {
    module: "orders", kind: "action", action: "orders/markShipped", summary: "Mark shipped",
    usedIn: [`${P}/orders/page.jsx`, `${P}/orders/[id]/page.jsx`],
    fields: [f("orderId", "string", "", { required: true }), f("courier", "string"), f("awbNumber", "string", "Generated from courier + timestamp when blank")],
    example: { orderId: "ORD-2026-1001", courier: "Shadowfax", awbNumber: "SFX881290412" },
    effects: ["Creates a Shipment (or updates the linked one) and stores shipmentId on the order"],
  },
  {
    module: "orders", kind: "action", action: "orders/updateOrderStatus", summary: "Update order / shipment / payment status",
    usedIn: [`${P}/orders/[id]/page.jsx`],
    fields: [f("orderId", "string", "", { required: true }), f("orderStatus", "string"), f("shipmentStatus", "string"), f("paymentStatus", "string")],
    example: { orderId: "ORD-2026-1001", orderStatus: "Delivered", shipmentStatus: "Delivered", paymentStatus: "Paid" },
    effects: ["Mirrors status to the linked shipment and stamps deliveredDate when Delivered"],
  },
  {
    module: "orders", kind: "action", action: "orders/markReturned", summary: "Mark returned",
    usedIn: [`${P}/orders/page.jsx`, `${P}/orders/[id]/page.jsx`],
    fields: [f("orderId", "string", "", { required: true }), f("returnReason", "string", "Required in the dialog")],
    example: { orderId: "ORD-2026-1001", returnReason: "Product not as described" },
    effects: ["Opens a CustomerReturn for the order and clears its committed stock", "\"Return opened\" notification"],
  },
  {
    module: "orders", kind: "action", action: "orders/cancelOrder", summary: "Cancel an order",
    usedIn: [`${P}/orders/[id]/page.jsx`],
    fields: [f("orderId", "string", "", { required: true }), f("reason", "string", 'Default "Cancelled by seller"')],
    example: { orderId: "ORD-2026-1001", reason: "Cancelled by seller" },
    notes: ["paymentStatus becomes Refunded if it was Paid, otherwise Cancelled."],
    effects: ["Returns committed stock (\"Order Cancelled\" movement)", "Sets the linked shipment to Cancelled unless delivered", "\"Order cancelled\" notification"],
  },

  // Shipping & returns
  {
    module: "shipping", kind: "read", action: "state.shippingReturns.{shipments, returns, rtos}", summary: "List shipments, returns and RTOs",
    usedIn: [`${P}/shipping-returns`, `${P}/shipping-returns/[id]`], returns: "Shipment[] · CustomerReturn[] · RtoRecord[]",
  },
  {
    module: "shipping", kind: "action", action: "shippingReturns/updateShipmentStatus", summary: "Update shipment status",
    usedIn: [`${P}/shipping-returns/[id]/page.jsx`],
    fields: [f("id", "string", "", { required: true }), f("deliveryStatus", "string"), f("courierName", "string"), f("awbNumber", "string"), f("shippingCost", "number"), f("expectedDeliveryDate", "date")],
    example: { id: "SHP-001", deliveryStatus: "Delivered" },
    notes: ["deliveredDate is stamped the first time status becomes Delivered."],
    effects: ["Mirrors delivery status back to the order", "\"Order delivered\" notification when it becomes Delivered"],
  },
  {
    module: "shipping", kind: "update", action: "shippingReturns/editShipment", summary: "Edit a shipment",
    usedIn: [`${P}/shipping-returns/page.jsx`, `${P}/shipping-returns/[id]/page.jsx`],
    fields: [f("id", "string", "", { required: true }), f("courierName", "string"), f("awbNumber", "string", "Required"), f("deliveryStatus", "string"), f("shippingCost", "number", "Required"), f("expectedDeliveryDate", "date")],
    example: { id: "SHP-001", courierName: "Shadowfax", awbNumber: "SFX881290412", deliveryStatus: "In Transit", shippingCost: 65, expectedDeliveryDate: "2026-03-08" },
    effects: ["Mirrors delivery status back to the order"],
  },
  {
    module: "shipping", kind: "create", action: "shippingReturns/addCustomerReturn", summary: "Create a customer return",
    usedIn: [`${P}/shipping-returns/page.jsx`], payload: "CustomerReturn (without id, returnDate, restocked)",
    example: { originalOrderId: "ORD-2026-1006", marketplace: "Flipkart", productName: "100% Glace Cotton King Size Bedsheet", sku: "SKU-BED-004-GEO", customerName: "Sunita Roy", returnReason: "Size mismatch", refundAmount: 649, returnStatus: "In Transit to Warehouse", inspectionStatus: "Pending Inspection", restockEligibility: "Pending Decision", inspectionNotes: "" },
    validation: "HTML required on originalOrderId, productName, customerName, returnReason, refundAmount",
  },
  {
    module: "shipping", kind: "update", action: "shippingReturns/editCustomerReturn", summary: "Edit a customer return",
    usedIn: [`${P}/shipping-returns/page.jsx`, `${P}/shipping-returns/[id]/page.jsx`], payload: "{ id } + CustomerReturn fields",
    example: { id: "RET-2026-001", refundAmount: 649 },
  },
  {
    module: "shipping", kind: "action", action: "shippingReturns/updateReturnInspection", summary: "Record return inspection",
    usedIn: [`${P}/shipping-returns/page.jsx`, `${P}/shipping-returns/[id]/page.jsx`],
    fields: [f("id", "string", "", { required: true }), f("inspectionStatus", "string"), f("restockEligibility", "string"), f("returnStatus", "string"), f("inspectionNotes", "string")],
    example: { id: "RET-2026-001", inspectionStatus: "Inspected - Intact", restockEligibility: "Eligible", returnStatus: "Received Back", inspectionNotes: "Tags intact." },
    effects: ["When Eligible, restocks the SKU once, logs a \"Return Restock\" movement and sets restocked", "\"Return restocked\" or \"Return could not be restocked\" notification"],
  },
  {
    module: "shipping", kind: "create", action: "shippingReturns/addRtoRecord", summary: "Create an RTO record",
    usedIn: [`${P}/shipping-returns/page.jsx`], payload: "RtoRecord (without id, restocked, receivedBackDate)",
    example: { originalOrderId: "ORD-2026-1007", marketplace: "Meesho", courierName: "Delhivery", awbNumber: "DEL1109934201", customerName: "Vikas Dubey", destinationCity: "Kanpur, UP", rtoReason: "Customer refused delivery (COD)", returnShippingCharge: 85, rtoStatus: "In Transit to Seller", notes: "" },
    validation: "HTML required on originalOrderId, courierName, rtoReason",
    effects: ["Sets the order to Returned / Returned to Origin and clears its committed stock", "Sets the linked shipment to RTO Initiated"],
  },
  {
    module: "shipping", kind: "update", action: "shippingReturns/editRtoRecord", summary: "Edit an RTO record",
    usedIn: [`${P}/shipping-returns/page.jsx`, `${P}/shipping-returns/[id]/page.jsx`], payload: "{ id } + RtoRecord fields",
    example: { id: "RTO-2026-001", notes: "Sealed box intact." },
  },
  {
    module: "shipping", kind: "action", action: "shippingReturns/updateRtoStatus", summary: "Update RTO status",
    usedIn: [`${P}/shipping-returns/page.jsx`, `${P}/shipping-returns/[id]/page.jsx`],
    fields: [f("id", "string", "", { required: true }), f("rtoStatus", "string"), f("receivedBackDate", "date"), f("notes", "string")],
    example: { id: "RTO-2026-001", rtoStatus: "Received Back & Verified", receivedBackDate: "2026-03-09", notes: "Verified intact and restocked to inventory." },
    effects: ["On receipt, restocks the order's product once and logs a \"Return Restock\" movement", "Sets the linked shipment to Returned to Origin", "\"RTO received\" notification"],
  },
  {
    module: "shipping", kind: "create", action: "shippingReturns/addShipment", summary: "Create a shipment (internal)",
    usedIn: ["store/syncListeners.js"], internal: true, payload: "Shipment (without id)",
    example: { orderId: "ORD-2026-1001", marketplace: "Meesho", courierName: "Shadowfax", awbNumber: "SFX881290412" },
    notes: ["Only created by the sync layer when an order is shipped; no page dispatches it."],
  },

  // Suppliers & purchases
  {
    module: "suppliers", kind: "read", action: "state.suppliersPurchases.{suppliers, purchases}", summary: "List suppliers and purchase orders",
    usedIn: [`${P}/suppliers-purchases`, `${P}/suppliers-purchases/po/[id]`, `${P}/suppliers-purchases/suppliers/[id]`], returns: "Supplier[] · PurchaseOrder[]",
  },
  {
    module: "suppliers", kind: "create", action: "suppliersPurchases/addSupplier", summary: "Create a supplier",
    usedIn: [`${P}/suppliers-purchases/page.jsx`], payload: "Supplier form fields",
    example: { name: "Rajesh Textiles & Weaving", company: "Rajesh Textiles Pvt Ltd", contactPerson: "Rajesh Khurana", phone: "+91 98251 44521", email: "orders@rajeshtextiles.in", city: "Surat", state: "Gujarat", address: "402, Ring Road Textile Market, Surat", gstin: "24AAACR1234F1Z8", status: "Active" },
    validation: [["name", "Supplier trade name is required"], ["company", "Company legal name is required"], ["phone", "Phone number is required"], ["city", "City is required"]],
  },
  {
    module: "suppliers", kind: "update", action: "suppliersPurchases/updateSupplier", summary: "Update a supplier (merge)",
    usedIn: [`${P}/suppliers-purchases/page.jsx`, `${P}/suppliers-purchases/suppliers/[id]/page.jsx`], payload: "{ id } + Supplier fields",
    example: { id: "SUP-001", paymentTerms: "Net 15" },
  },
  {
    module: "suppliers", kind: "delete", action: "suppliersPurchases/deleteSupplier", summary: "Delete a supplier",
    usedIn: [`${P}/suppliers-purchases/page.jsx`, `${P}/suppliers-purchases/suppliers/[id]/page.jsx`], payload: "id (string)", example: "SUP-001",
    notes: ["Existing purchase orders keep the deleted supplierId."],
  },
  {
    module: "suppliers", kind: "create", action: "suppliersPurchases/addPurchaseOrder", summary: "Create a purchase order",
    usedIn: [`${P}/suppliers-purchases/page.jsx`, `${P}/suppliers-purchases/suppliers/[id]/page.jsx`], payload: "PurchaseOrder (without id, poNumber, status, paymentStatus, receivedDate)",
    example: {
      supplierId: "SUP-001", supplierName: "Rajesh Textiles & Weaving", orderDate: "2026-01-10", expectedDeliveryDate: "2026-01-22",
      items: [{ productId: "PROD-001", productName: "Embroidered Rayon Anarkali Kurta", sku: "SKU-KUR-001", quantity: 60, receivedQuantity: 0, unitCost: 320, total: 19200 }],
      subtotal: 19200, tax: 960, shippingCost: 800, totalAmount: 20960, paidAmount: 0, notes: "Festive season pre-stock lot",
    },
    validation: [["supplierId", "Please select a supplier"], ["items", "Add at least one product item"]],
    effects: ["Adds totalAmount to supplier.totalPurchases and the unpaid part to outstandingBalance"],
  },
  {
    module: "suppliers", kind: "update", action: "suppliersPurchases/updatePurchaseOrder", summary: "Edit a purchase order (merge)",
    usedIn: [`${P}/suppliers-purchases/po/[id]/page.jsx`, `${P}/suppliers-purchases/suppliers/[id]/page.jsx`], payload: "{ id } + PurchaseOrder fields",
    example: { id: "PO-2026-001", expectedDeliveryDate: "2026-01-25" },
    notes: ["Does not re-balance the supplier when totals change."],
  },
  {
    module: "suppliers", kind: "action", action: "suppliersPurchases/receivePO", summary: "Receive a purchase order",
    usedIn: [`${P}/suppliers-purchases/po/[id]/page.jsx`, `${P}/suppliers-purchases/suppliers/[id]/page.jsx`],
    fields: [f("poId", "string", "", { required: true }), f("receivedDate", "date", "Defaults to today")],
    example: { poId: "PO-2026-001", receivedDate: "2026-01-20" },
    notes: ["Ignored if already Received.", "The page then dispatches adjustStock + addMovement per item; stock is not changed by this action itself."],
    effects: ["PO receipt notification"],
  },
  {
    module: "suppliers", kind: "action", action: "suppliersPurchases/recordPayment", summary: "Record a PO payment",
    usedIn: [`${P}/suppliers-purchases/po/[id]/page.jsx`, `${P}/suppliers-purchases/suppliers/[id]/page.jsx`],
    fields: [f("poId", "string", "", { required: true }), f("amount", "number", "", { required: true })],
    example: { poId: "PO-2026-001", amount: 10000 },
    notes: ["paymentStatus becomes Paid when paidAmount ≥ totalAmount, otherwise Partially Paid.", "Reduces supplier outstandingBalance (not below 0)."],
  },
  {
    module: "suppliers", kind: "action", action: "suppliersPurchases/cancelPurchaseOrder", summary: "Cancel a purchase order",
    usedIn: [`${P}/suppliers-purchases/po/[id]/page.jsx`, `${P}/suppliers-purchases/suppliers/[id]/page.jsx`],
    fields: [f("poId", "string", "", { required: true }), f("reason", "string")],
    example: { poId: "PO-2026-004", reason: "Cancelled by seller" },
    notes: ["Ignored if already Received. Appends the reason to notes and removes the unpaid amount from the supplier balance."],
  },
  {
    module: "suppliers", kind: "action", action: "suppliersPurchases/adjustSupplierBalance", summary: "Set supplier balance",
    usedIn: [], unused: true,
    fields: [f("supplierId", "string", "", { required: true }), f("newBalance", "number", "", { required: true }), f("reason", "string", "Accepted but not stored")],
    example: { supplierId: "SUP-001", newBalance: 0, reason: "Reconciled" },
  },

  // Finance
  {
    module: "finance", kind: "read", action: "state.finance.{expenses, settlements}", summary: "List expenses and settlements",
    usedIn: [`${P}/finance`, `${P}/dashboard`, `${P}/reports`], returns: "Expense[] · Settlement[]",
  },
  {
    module: "finance", kind: "create", action: "finance/addExpense", summary: "Create an expense",
    usedIn: [`${P}/finance/page.jsx`], payload: "Expense (without id)",
    example: { date: "2026-03-02", category: "Packaging", description: "Corrugated 3-ply boxes (500 pcs)", amount: 6800, paymentMethod: "UPI", relatedOrderOrPurchase: "N/A", notes: "Supplied by PackWell Containers Surat" },
    validation: [["description", "Description is required"], ["amount", "Valid expense amount is required"], ["date", "Date is required"]],
  },
  {
    module: "finance", kind: "update", action: "finance/updateExpense", summary: "Update an expense (merge)",
    usedIn: [`${P}/finance/page.jsx`], payload: "{ id } + Expense fields",
    example: { id: "EXP-2026-003", amount: 7200 }, validation: "Same as create",
  },
  {
    module: "finance", kind: "delete", action: "finance/deleteExpense", summary: "Delete an expense",
    usedIn: [`${P}/finance/page.jsx`], payload: "id (string)", example: "EXP-2026-003",
  },
  {
    module: "finance", kind: "action", action: "finance/updateSettlementStatus", summary: "Mark a settlement settled",
    usedIn: [`${P}/finance/page.jsx`],
    fields: [f("id", "string", "", { required: true }), f("status", "string"), f("utrNumber", "string", 'Generated "UTR" + 8 digits when blank')],
    example: { id: "SET-2026-005", status: "Settled", utrNumber: "MSH20260301901238" },
  },
  {
    module: "finance", kind: "create", action: "finance/addSettlement", summary: "Create a settlement",
    usedIn: [], unused: true, payload: "Settlement (without id, settlementDate, status, utrNumber, bankAccount)",
    example: { marketplace: "Meesho", cyclePeriod: "Mar 01 - Mar 07, 2026", grossSales: 64500, marketplaceFees: 0, shippingDeductions: 4850, returnsDeductions: 2400, taxTcsTds: 645, netPayoutAmount: 56605 },
    notes: ["Settlements are only seeded; there is no marketplace payout import."],
  },
  {
    module: "finance", kind: "update", action: "finance/editSettlement", summary: "Edit a settlement",
    usedIn: [], unused: true, payload: "{ id } + Settlement fields", example: { id: "SET-2026-001", netPayoutAmount: 56605 },
  },

  // Notifications
  {
    module: "notifications", kind: "read", action: "state.notifications.items", summary: "List notifications",
    usedIn: [`${P}/notifications`, "AppHeader", "AppSidebar (unread count)"], returns: "Notification[] (max 100)",
  },
  {
    module: "notifications", kind: "action", action: "notifications/markNotificationRead", summary: "Mark one read",
    usedIn: [`${P}/notifications/page.jsx`, "AppHeader"], payload: "id (string)", example: "NTF-001",
  },
  {
    module: "notifications", kind: "action", action: "notifications/toggleNotificationRead", summary: "Toggle read / unread",
    usedIn: [`${P}/notifications/page.jsx`], payload: "id (string)", example: "NTF-001",
  },
  {
    module: "notifications", kind: "action", action: "notifications/markAllNotificationsRead", summary: "Mark all read",
    usedIn: [`${P}/notifications/page.jsx`, "AppHeader"], payload: "none", example: null,
  },
  {
    module: "notifications", kind: "delete", action: "notifications/deleteNotification", summary: "Delete a notification",
    usedIn: [`${P}/notifications/page.jsx`], payload: "id (string)", example: "NTF-001",
  },
  {
    module: "notifications", kind: "delete", action: "notifications/clearReadNotifications", summary: "Delete all read notifications",
    usedIn: [`${P}/notifications/page.jsx`], payload: "none", example: null,
  },
  {
    module: "notifications", kind: "create", action: "notifications/pushNotification", summary: "Raise a notification (internal)",
    usedIn: ["store/syncListeners.js"], internal: true, payload: "Notification (without id, createdAt, read)",
    example: { category: "inventory", priority: "high", title: "Out of stock: Kolhapuri Sandals", message: "SKU-FTW-011 has 0 units left.", href: "/inventory" },
    notes: ["The feed is trimmed to the newest 100 items."],
  },

  // Settings
  {
    module: "settings", kind: "read", action: "state.settings.data", summary: "Read settings", usedIn: [`${P}/settings`], returns: "Settings",
  },
  {
    module: "settings", kind: "update", action: "settings/updateSettings", summary: "Save settings (merge)",
    usedIn: [`${P}/settings/page.jsx`], payload: "Partial Settings",
    example: { businessName: "DesiCart Online Retail", supportEmail: "ops@desicartretail.com", defaultLowStockThreshold: 15, marketplaceToggles: { meesho: true, flipkart: true } },
  },
  {
    module: "settings", kind: "action", action: "reset* (all slices)", summary: "Reset all demo data",
    usedIn: [`${P}/settings/page.jsx`, "AppSidebar"], payload: "none", example: null,
    notes: ["Dispatches every slice's reset action, then reloads the page."],
  },

  // Calculator
  {
    module: "calculator", kind: "read", action: "state.calculator.saved", summary: "List saved calculations",
    usedIn: [`${P}/calculator`], returns: "SavedCalculation[]",
  },
  {
    module: "calculator", kind: "create", action: "calculator/saveCalculation", summary: "Save a calculation",
    usedIn: [`${P}/calculator/page.jsx`], payload: "SavedCalculation (without id, createdAt, updatedAt)",
    example: {
      productName: "Anarkali Kurta", platform: "Meesho", notes: "",
      inputs: { purchasePrice: 320, sellingPrice: 749, commissionType: "percent", commissionValue: 0, forwardShipping: 65, reverseShipping: 0, packagingCost: 15, otherExpenses: 0, targetMargin: 20 },
      result: { commissionAmount: 0, totalCost: 400, netProfit: 349, profitMargin: 46.6, roi: 87.25, breakEvenPrice: 400, finalSellingPrice: 749, isProfit: true },
    },
    validation: [["productName", "Give this calculation a product name"], ["sellingPrice", "Enter a selling price"], ["purchasePrice", "Enter a purchase price"], ["commissionValue", "Commission must be under 100%"]],
    notes: ["result is computed in the browser by src/lib/pricingCalculator.js; the example numbers are illustrative."],
  },
  {
    module: "calculator", kind: "update", action: "calculator/updateCalculation", summary: "Update a calculation",
    usedIn: [`${P}/calculator/page.jsx`], payload: "{ id } + SavedCalculation fields", example: { id: "CALC-M3X9K2", notes: "Revised shipping" },
    validation: "Same as save",
  },
  {
    module: "calculator", kind: "delete", action: "calculator/deleteCalculation", summary: "Delete a calculation",
    usedIn: [`${P}/calculator/page.jsx`], payload: "id (string)", example: "CALC-M3X9K2",
  },
];

// ─── Authentication ──────────────────────────────────────────────────────────

export const AUTH_FACTS = [
  { label: "Server authentication", value: "None", detail: "No auth middleware, no JWT / session / cookie library in server/package.json. GET / is public." },
  { label: "Login, signup, forgot password", value: "UI only", detail: 'components/auth/AuthPage.jsx prevents the submit and shows "This is a UI-only demo. Authentication is not connected, and no account data was sent or saved."' },
  { label: "Route protection", value: "None", detail: "Pages under app/(private) render without a session check." },
  { label: "Sign out", value: "localStorage.clear()", detail: "SignOutDialog and the header menu clear browser storage and reload. No token is revoked because none exists." },
  { label: "Roles / permissions", value: "None", detail: "There is no role model. The sidebar user (Vikram Malhotra, DesiCart Retail LLP) is hard-coded." },
  { label: "User storage", value: "Prisma User model", detail: "server/prisma/schema.prisma defines User (id, name, email, password, timestamps) but nothing uses it and no migration exists." },
];

// ─── Gaps ────────────────────────────────────────────────────────────────────

export const GAPS = [
  { severity: "high", title: "No business API", detail: "Every module operation runs in the browser against localStorage. Data is per-browser, cannot be shared between users or devices, and is lost when storage is cleared." },
  { severity: "high", title: "No authentication or authorization", detail: "No login endpoint, no token issuing or verification, no role checks. Required before any data endpoint is exposed." },
  { severity: "high", title: "Error responses leak stack traces", detail: "Malformed JSON (400) and oversized bodies (413) return HTML with the full stack trace and absolute file paths. Set NODE_ENV=production and add a JSON error handler." },
  { severity: "medium", title: "No CORS policy", detail: "Responses carry no Access-Control-Allow-Origin header, so the Next.js app on another origin cannot read them from the browser." },
  { severity: "medium", title: "Database is configured but unused", detail: "DATABASE_URL, pg, Prisma and the User model exist, but Prisma Client is never imported and there are no migrations." },
  { severity: "medium", title: "No server-side validation", detail: "All validation lives in form dialogs. Reducers accept whatever payload they receive." },
  { severity: "medium", title: "IDs generated from list length", detail: "Products, orders, suppliers, POs, expenses, returns, RTOs and movements use count + 1, so a delete followed by a create can produce a duplicate id. A server should own ID generation." },
  { severity: "medium", title: "Multi-step writes are not atomic", detail: "Receiving a PO dispatches receivePO, then adjustStock and addMovement per item from the page. A server endpoint should do this in one transaction." },
  { severity: "low", title: "Marketplace integration is display only", detail: 'The sidebar shows Meesho and Flipkart as "Connected Channels", but there is no marketplace API client; orders and settlements are seed data.' },
  { severity: "low", title: "No error envelope or versioning", detail: "Errors are Express default HTML pages, and routes have no /api or version prefix." },
  { severity: "low", title: "Defined but unused actions", detail: "adjustSupplierBalance, addSettlement and editSettlement exist in slices but no page dispatches them." },
];

// ─── OpenAPI export (real endpoints only) ─────────────────────────────────────

export function buildOpenApi(baseUrl = SERVER.defaultBaseUrl) {
  return {
    openapi: "3.0.3",
    info: {
      title: "SellerDesk Server",
      version: "1.0.0",
      description: "Generated from server/src/app.js. Only routes the server registers are listed. Module operations run client-side and have no HTTP endpoints yet.",
    },
    servers: [{ url: baseUrl, description: "Local Express server" }],
    tags: [{ name: "System" }],
    paths: {
      "/": {
        get: {
          tags: ["System"],
          summary: "Welcome / health check",
          operationId: "getRoot",
          security: [],
          parameters: [
            { name: "If-None-Match", in: "header", required: false, schema: { type: "string" }, description: "ETag from a previous response" },
          ],
          responses: {
            200: {
              description: "Server is running",
              headers: { ETag: { schema: { type: "string" } } },
              content: { "application/json": { schema: { $ref: "#/components/schemas/WelcomeResponse" }, example: { success: true, message: "Welcome to Express Server" } } },
            },
            304: { description: "Not Modified (ETag matched)" },
          },
        },
      },
    },
    components: {
      schemas: {
        WelcomeResponse: {
          type: "object",
          required: ["success", "message"],
          properties: { success: { type: "boolean", example: true }, message: { type: "string", example: "Welcome to Express Server" } },
        },
        ExpressHtmlError: { type: "string", description: "Express default HTML error page (400, 404, 413, 500)." },
      },
      responses: {
        NotFound: { description: "Unmatched route", content: { "text/html": { schema: { $ref: "#/components/schemas/ExpressHtmlError" } } } },
      },
    },
  };
}
