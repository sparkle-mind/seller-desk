export const initialPurchases = [
  {
    id: "PO-2026-001",
    poNumber: "PO-2026-001",
    supplierId: "SUP-001",
    supplierName: "Rajesh Textiles & Weaving",
    orderDate: "2026-01-10",
    expectedDeliveryDate: "2026-01-22",
    receivedDate: "2026-01-20",
    status: "Received",
    paymentStatus: "Paid",
    items: [
      { productId: "PROD-001", productName: "Embroidered Rayon Anarkali Kurta", sku: "SKU-KUR-001", quantity: 60, receivedQuantity: 60, unitCost: 320, total: 19200 },
    ],
    subtotal: 19200,
    tax: 960,
    shippingCost: 800,
    totalAmount: 20960,
    paidAmount: 20960,
    notes: "Festive season pre-stock lot"
  },
  {
    id: "PO-2026-002",
    poNumber: "PO-2026-002",
    supplierId: "SUP-002",
    supplierName: "Pink City Loom Crafts",
    orderDate: "2026-01-18",
    expectedDeliveryDate: "2026-01-28",
    receivedDate: "2026-01-27",
    status: "Received",
    paymentStatus: "Paid",
    items: [
      { productId: "PROD-002", productName: "Cotton Hand Block Printed Saree", sku: "SKU-SAR-002", quantity: 40, receivedQuantity: 40, unitCost: 450, total: 18000 }
    ],
    subtotal: 18000,
    tax: 900,
    shippingCost: 650,
    totalAmount: 19550,
    paidAmount: 19550,
    notes: "Indigo and rust shade assortment"
  },
  {
    id: "PO-2026-003",
    poNumber: "PO-2026-003",
    supplierId: "SUP-003",
    supplierName: "AcousticVibe Electronics",
    orderDate: "2026-01-22",
    expectedDeliveryDate: "2026-02-02",
    receivedDate: "2026-02-01",
    status: "Received",
    paymentStatus: "Paid",
    items: [
      { productId: "PROD-003", productName: "Wireless Bluetooth 5.3 Neckband", sku: "SKU-AUD-003", quantity: 120, receivedQuantity: 120, unitCost: 260, total: 31200 },
      { productId: "PROD-022", productName: "Heavy Bass True Wireless Earbuds (TWS)", sku: "SKU-AUD-022", quantity: 50, receivedQuantity: 50, unitCost: 590, total: 29500 }
    ],
    subtotal: 60700,
    tax: 10926,
    shippingCost: 1200,
    totalAmount: 72826,
    paidAmount: 72826,
    notes: "Includes 18% GST invoice"
  },
  {
    id: "PO-2026-004",
    poNumber: "PO-2026-004",
    supplierId: "SUP-004",
    supplierName: "Kovai Comfort Linens",
    orderDate: "2026-01-28",
    expectedDeliveryDate: "2026-02-08",
    receivedDate: "2026-02-07",
    status: "Received",
    paymentStatus: "Paid",
    items: [
      { productId: "PROD-004", productName: "100% Glace Cotton King Bedsheet", sku: "SKU-BED-004", quantity: 30, receivedQuantity: 30, unitCost: 290, total: 8700 }
    ],
    subtotal: 8700,
    tax: 435,
    shippingCost: 600,
    totalAmount: 9735,
    paidAmount: 9735,
    notes: "Bulk packaging carton"
  },
  {
    id: "PO-2026-005",
    poNumber: "PO-2026-005",
    supplierId: "SUP-005",
    supplierName: "Shenzhen-India Gadget Hub",
    orderDate: "2026-02-01",
    expectedDeliveryDate: "2026-02-12",
    receivedDate: "2026-02-10",
    status: "Received",
    paymentStatus: "Paid",
    items: [
      { productId: "PROD-005", productName: "Waterproof Bluetooth Calling Smartwatch", sku: "SKU-WAT-005", quantity: 50, receivedQuantity: 50, unitCost: 650, total: 32500 },
      { productId: "PROD-013", productName: "Fast Charging 10000mAh Power Bank", sku: "SKU-MOB-013", quantity: 60, receivedQuantity: 60, unitCost: 440, total: 26400 }
    ],
    subtotal: 58900,
    tax: 10602,
    shippingCost: 1500,
    totalAmount: 71002,
    paidAmount: 71002,
    notes: "Custom branding printed on box"
  },
  {
    id: "PO-2026-006",
    poNumber: "PO-2026-006",
    supplierId: "SUP-006",
    supplierName: "Tirupur Knits & Garments",
    orderDate: "2026-02-05",
    expectedDeliveryDate: "2026-02-18",
    receivedDate: "2026-02-16",
    status: "Received",
    paymentStatus: "Paid",
    items: [
      { productId: "PROD-006", productName: "Men's Slim Fit Chinos Trousers", sku: "SKU-MEN-006", quantity: 70, receivedQuantity: 70, unitCost: 310, total: 21700 },
      { productId: "PROD-015", productName: "Men's Oversized Anime Graphic T-Shirt", sku: "SKU-MEN-015", quantity: 90, receivedQuantity: 90, unitCost: 210, total: 18900 }
    ],
    subtotal: 40600,
    tax: 2030,
    shippingCost: 1100,
    totalAmount: 43730,
    paidAmount: 43730,
    notes: "High quality export grade combed cotton"
  },
  {
    id: "PO-2026-007",
    poNumber: "PO-2026-007",
    supplierId: "SUP-007",
    supplierName: "SteelCraft Kitchenware",
    orderDate: "2026-02-10",
    expectedDeliveryDate: "2026-02-22",
    receivedDate: "2026-02-21",
    status: "Received",
    paymentStatus: "Paid",
    items: [
      { productId: "PROD-007", productName: "Stainless Steel 2-Tier Spice Rack", sku: "SKU-KIT-007", quantity: 30, receivedQuantity: 30, unitCost: 195, total: 5850 },
      { productId: "PROD-020", productName: "Non-Stick 3-Piece Cookware Set", sku: "SKU-KIT-020", quantity: 25, receivedQuantity: 25, unitCost: 680, total: 17000 }
    ],
    subtotal: 22850,
    tax: 2742,
    shippingCost: 1400,
    totalAmount: 26992,
    paidAmount: 26992,
    notes: "Corrugated box reinforced with thermocol"
  },
  {
    id: "PO-2026-008",
    poNumber: "PO-2026-008",
    supplierId: "SUP-008",
    supplierName: "Aura Herbals & Cosmetics",
    orderDate: "2026-02-15",
    expectedDeliveryDate: "2026-02-27",
    receivedDate: "2026-02-26",
    status: "Received",
    paymentStatus: "Paid",
    items: [
      { productId: "PROD-008", productName: "Matte Liquid Waterproof Lipstick Combo", sku: "SKU-BEA-008", quantity: 120, receivedQuantity: 120, unitCost: 140, total: 16800 },
      { productId: "PROD-012", productName: "20% Vitamin C Face Glow Serum", sku: "SKU-BEA-012", quantity: 150, receivedQuantity: 150, unitCost: 110, total: 16500 }
    ],
    subtotal: 33300,
    tax: 5994,
    shippingCost: 800,
    totalAmount: 40094,
    paidAmount: 40094,
    notes: "Batch expiry checked 24 months"
  },
  {
    id: "PO-2026-009",
    poNumber: "PO-2026-009",
    supplierId: "SUP-001",
    supplierName: "Rajesh Textiles & Weaving",
    orderDate: "2026-03-01",
    expectedDeliveryDate: "2026-03-12",
    receivedDate: null,
    status: "Ordered",
    paymentStatus: "Pending",
    items: [
      { productId: "PROD-001", productName: "Embroidered Rayon Anarkali Kurta", sku: "SKU-KUR-001", quantity: 50, receivedQuantity: 0, unitCost: 320, total: 16000 },
      { productId: "PROD-021", productName: "Women's Floral Georgette Printed Dress", sku: "SKU-WES-021", quantity: 50, receivedQuantity: 0, unitCost: 275, total: 13750 }
    ],
    subtotal: 29750,
    tax: 1487,
    shippingCost: 763,
    totalAmount: 32000,
    paidAmount: 0,
    notes: "Dispatched via V-Trans logistics, LR tracking pending"
  },
  {
    id: "PO-2026-010",
    poNumber: "PO-2026-010",
    supplierId: "SUP-005",
    supplierName: "Shenzhen-India Gadget Hub",
    orderDate: "2026-03-04",
    expectedDeliveryDate: "2026-03-15",
    receivedDate: null,
    status: "Ordered",
    paymentStatus: "Partially Paid",
    items: [
      { productId: "PROD-005", productName: "Waterproof Bluetooth Calling Smartwatch", sku: "SKU-WAT-005", quantity: 40, receivedQuantity: 0, unitCost: 650, total: 26000 },
      { productId: "PROD-013", productName: "Fast Charging 10000mAh Power Bank", sku: "SKU-MOB-013", quantity: 30, receivedQuantity: 0, unitCost: 440, total: 13200 }
    ],
    subtotal: 39200,
    tax: 7056,
    shippingCost: 1744,
    totalAmount: 48000,
    paidAmount: 20000,
    notes: "50% advance token paid via RTGS, balance on delivery"
  }
];

