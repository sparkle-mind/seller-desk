# SellerDesk — E-commerce Business Management Web Application

A modern, production-quality SaaS operations dashboard built for Indian e-commerce sellers operating across **Meesho** and **Flipkart**.

SellerDesk provides centralized management across product catalogs, inventory valuation, multi-channel orders, shipping logistics, returns & RTOs, vendor purchasing, financial accounting, and analytics.

---

## 🚀 Key Features & Modules

### 1. Dashboard (`/`)
- **Key Metrics:** Total Sales, Orders, Estimated Profit, Total Expenses, Pending Dispatches, Low-Stock items.
- **Charts:**
  - Monthly Sales, Expenses & Net Profit trends (Recharts)
  - Orders by status donut breakdown
  - Channel revenue split (Meesho vs Flipkart)
  - Top-selling products leaderboard
- **Quick Filters:** Today, Last 7 Days, Last 30 Days, This Month, All Time, Channel Selector.
- **Recent Activity:** Quick lists for recent orders and low-stock alerts.

### 2. Products Catalog (`/products` & `/products/[id]`)
- Internal SKU catalog management with purchase cost, selling price, MRP, and gross profit margin.
- Channel listing mappings: Meesho Listing ID and Flipkart FSN identifiers.
- Variant support (sizes, colors, custom SKUs).
- Reusable Add & Edit Product Dialog with live unit margin calculation.
- Delete product with confirmation dialog.
- Product details page with sales velocity and order history.
- CSV Catalog Export.

### 3. Inventory & Valuation (`/inventory`)
- Stock valuation at internal purchase cost and retail market potential.
- Inventory status chips: In Stock, Low Stock (≤ threshold), Out of Stock.
- **Stock Adjustment Dialog:** Supports Stock-In (+), Stock-Out (-), Transit Damage (-), and Physical Audit Manual Count.
- Prevents negative inventory.
- Real-time **Stock Movement History** tracking reason, reference ID, and user action.
- CSV Stock Valuation & Movement Logs Export.

### 4. Orders Management (`/orders` & `/orders/[id]`)
- Centralized multi-channel order feed for Meesho & Flipkart.
- Separate tracking for **Order Status** (Pending, Processing, Shipped, Delivered, Cancelled, Returned), **Payment Status** (Paid, Pending, Refunded), and **Shipment Status**.
- **Interactive Actions:**
  - "Pack Order" (transitions from Pending to Processing)
  - "Ship Order" with courier selection (Ekart, Shadowfax, Delhivery, etc.) and AWB generation
  - "Cancel Order" with refund flow
- Detailed Order View with fulfillment timeline and marketplace accounting breakdown (buyer price, platform commission, shipping freight, net payout).
- CSV Orders Export.

### 5. Shipping & Returns (`/shipping-returns`)
- **Tab 1: Forward Shipments:** Courier tracking, AWB, delivery status updates, destination city.
- **Tab 2: Customer Returns:** Return reasons (size mismatch, damaged), refund tracking, and **Quality Inspection Dialog** (Intact vs Damaged, Eligible for Restock vs Ineligible). Automatically restocks eligible returns to inventory!
- **Tab 3: RTO (Courier Return to Origin):** Tracks undelivered packages, reverse shipping charge penalties, and restock verification.

### 6. Suppliers & Purchases (`/suppliers-purchases`)
- **Suppliers Directory:** Vendors from Surat, Jaipur, Tirupur, Delhi, Rajkot, etc., with contact info, GSTIN, lifetime purchases, and balance due.
- **Purchase Orders:**
  - Create PO with multiple product line items, automatic subtotal, GST (0%, 5%, 12%, 18%), and inbound freight.
  - **Goods Receipt Flow:** One-click "Receive Goods" updates the PO status to Received AND automatically increments active inventory for all items without double-counting!
  - **Pay Vendor Flow:** Record part or full payments to reduce outstanding supplier balances.

### 7. Finance & Expenses (`/finance`)
- **Transparent Accounting Model:**
  - Clearly distinguishes between Gross Sales, Direct COGS, Platform Commissions, Shipping Freight, and Fixed Operating Overheads (Rent, Salaries, Packaging, Advertising, Software).
  - Supplier purchase orders are capitalized into inventory rather than double-counted as direct expenses.
- **Expense Management:** Full CRUD (Add, Edit, Delete) for operational expenses.
- **Marketplace Settlements:** Track settlement cycles from Meesho and Flipkart, fees, TCS/TDS deductions, and record bank UTR payments.
- **Profit & Loss Statement:** Structured P&L view.

### 8. Reports & Analytics (`/reports`)
- 9 Dedicated Report Views:
  1. Sales Report
  2. Orders Report
  3. Product Performance Report
  4. Inventory Valuation Report
  5. Expenses Report
  6. Profit & Loss Summary
  7. Marketplace Performance (Meesho vs Flipkart)
  8. Returns & RTO Analysis
  9. Supplier Purchase Report
- Date range and channel filters.
- Recharts visualizations and CSV exports.
- Print-ready report layout (`Print Report` button).

### 9. Settings (`/settings`)
- Business Profile: Display name, legal entity, GSTIN, PAN, warehouse address.
- Preferences: Currency (INR ₹), date format (DD/MM/YYYY), tax display (Inclusive/Exclusive), low-stock threshold, default table page size.
- **Reset Demo Data:** Restores all mock data back to factory demo state.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** JavaScript & JSX only (`.js`, `.jsx` - NO TypeScript / TSX)
- **Styling:** Tailwind CSS (with custom palette)
- **Components:** Material UI (`@mui/material`, `@mui/icons-material`, Emotion)
- **Charts:** Recharts
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) with LocalStorage persistence
- **Date Utilities:** Day.js
- **Formatters:** Indian Rupee formatting (`₹1,23,456`) and Indian numbering standards

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

