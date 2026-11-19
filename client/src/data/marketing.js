// Content for the public marketing site (src/app/(public)).
// Copy, navigation, plans and FAQs live here so they can be edited without
// touching page layouts. Pricing and FAQ answers are placeholders: confirm
// them with the business before launch.

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ViewModuleOutlinedIcon from "@mui/icons-material/ViewModuleOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";

/* ── Navigation ─────────────────────────────────────────────────── */

export const publicNav = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Open dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/signup" },
      { label: "Reset password", href: "/forgot-password" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

/* ── Product modules (mirror the dashboard's sections) ──────────── */

export const modules = [
  {
    key: "products",
    title: "Product catalog",
    summary: "Every SKU, cost and selling price in one tidy, searchable catalog.",
    points: [
      "SKU-level cost, MRP and selling price",
      "Marketplace listing details per product",
      "Search, filters and table or card views",
    ],
    Icon: Inventory2OutlinedIcon,
  },
  {
    key: "inventory",
    title: "Inventory control",
    summary: "Live stock levels with reorder points, so you restock before you sell out.",
    points: [
      "Low-stock and out-of-stock watchlist",
      "Stock adjustments with a clear reason",
      "Reorder thresholds per product",
    ],
    Icon: WarehouseOutlinedIcon,
  },
  {
    key: "orders",
    title: "Unified orders",
    summary: "Meesho and Flipkart orders in a single queue, from placed to delivered.",
    points: [
      "One pipeline for every marketplace",
      "Ship, cancel or mark returns in a few clicks",
      "Order detail with customer and payment info",
    ],
    Icon: ShoppingCartOutlinedIcon,
  },
  {
    key: "shipping",
    title: "Shipping & returns",
    summary: "Track shipments, returns and RTOs without losing a parcel in the gaps.",
    points: [
      "Shipment tracking by courier and AWB",
      "Customer returns and RTO records",
      "Return inspection before restocking",
    ],
    Icon: LocalShippingOutlinedIcon,
  },
  {
    key: "suppliers",
    title: "Suppliers & purchases",
    summary: "Manage suppliers and purchase orders alongside the stock they replenish.",
    points: [
      "Supplier directory with contacts and terms",
      "Purchase orders from draft to received",
      "Purchase history for every supplier",
    ],
    Icon: BusinessOutlinedIcon,
  },
  {
    key: "finance",
    title: "Finance & expenses",
    summary: "Expenses and settlements next to sales, so profit is never a guess.",
    points: [
      "Expense tracking by category",
      "Marketplace settlement records",
      "Profit after commissions, shipping and costs",
    ],
    Icon: AccountBalanceWalletOutlinedIcon,
  },
  {
    key: "reports",
    title: "Reports & analytics",
    summary: "Clear trends for sales, expenses, profit and channel performance.",
    points: [
      "Monthly sales, expense and profit trends",
      "Meesho vs Flipkart comparison",
      "Top sellers and slow movers",
    ],
    Icon: InsightsOutlinedIcon,
  },
  {
    key: "settings",
    title: "Workspace settings",
    summary: "Shape the workspace around your business, your team and your taste.",
    points: [
      "Business profile and preferences",
      "Light, dark and system appearance",
      "A choice of colour palettes",
    ],
    Icon: TuneOutlinedIcon,
  },
];

/* ── Home page ──────────────────────────────────────────────────── */

export const heroHighlights = [
  "Meesho & Flipkart in one view",
  "Low-stock alerts",
  "Profit after every fee",
];

export const proofStats = [
  { value: "2", label: "Marketplaces in a single order queue" },
  { value: "8", label: "Connected modules, one source of truth" },
  { value: "1", label: "Calm workspace for the whole business" },
];

export const painPoints = [
  "Switching between seller panels to find one order",
  "Stock counts that disagree with every marketplace",
  "Profit worked out in a spreadsheet at month end",
  "Returns and RTOs tracked in chat threads",
];

export const workflowSteps = [
  {
    title: "Add your catalog",
    description: "Bring products, costs and opening stock into one organised catalog.",
  },
  {
    title: "Process every order",
    description: "Work Meesho and Flipkart orders from a single, filterable queue.",
  },
  {
    title: "Ship, return, restock",
    description: "Track shipments and returns, and keep stock accurate as parcels move.",
  },
  {
    title: "Know your real profit",
    description: "See margins after commissions, shipping, product cost and expenses.",
  },
];

export const profitExample = {
  product: "Cotton Kurta Set",
  rows: [
    { label: "Selling price", value: 799 },
    { label: "Marketplace commission", value: -96 },
    { label: "Shipping fee", value: -62 },
    { label: "Product cost", value: -340 },
    { label: "Packaging", value: -18 },
  ],
};

/* ── Features page ──────────────────────────────────────────────── */

export const thoughtfulDetails = [
  {
    title: "Light, dark or system",
    description: "An appearance that follows your device, with palettes to match your brand.",
    Icon: DarkModeOutlinedIcon,
  },
  {
    title: "Made for your phone",
    description: "A responsive layout with bottom navigation for running the shop on the go.",
    Icon: PhoneIphoneOutlinedIcon,
  },
  {
    title: "Export to CSV",
    description: "Take any table into a spreadsheet when your accountant asks for it.",
    Icon: FileDownloadOutlinedIcon,
  },
  {
    title: "Table or card views",
    description: "Switch between dense tables and scannable cards, whichever suits the task.",
    Icon: ViewModuleOutlinedIcon,
  },
  {
    title: "Attention where it matters",
    description: "Pending orders and low stock surface first, so nothing slips.",
    Icon: NotificationsActiveOutlinedIcon,
  },
  {
    title: "Fast search everywhere",
    description: "Find any order, SKU, supplier or expense in a few keystrokes.",
    Icon: SearchOutlinedIcon,
  },
];

/* ── Pricing ────────────────────────────────────────────────────── */

export const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For new sellers getting organised on one marketplace.",
    features: [
      "One marketplace",
      "Products, inventory and orders",
      "Low-stock alerts",
      "Dashboard overview",
    ],
    cta: { label: "Start for free", href: "/signup" },
  },
  {
    name: "Growth",
    price: "₹999",
    period: "/ month",
    description: "For multi-channel sellers who want the full picture.",
    featured: true,
    features: [
      "Meesho and Flipkart together",
      "Shipping, returns and RTO tracking",
      "Suppliers and purchase orders",
      "Finance, expenses and profit reports",
      "CSV exports",
    ],
    cta: { label: "Get started", href: "/signup" },
  },
  {
    name: "Scale",
    price: "₹2,499",
    period: "/ month",
    description: "For established teams with higher order volumes.",
    features: [
      "Everything in Growth",
      "Multiple team members",
      "Advanced analytics",
      "Priority support",
    ],
    cta: { label: "Talk to us", href: "/contact" },
  },
];

export const includedEverywhere = [
  "Light and dark themes",
  "Mobile-friendly workspace",
  "Search across every module",
  "Your data stays yours",
];

export const faqs = [
  {
    question: "Which marketplaces does SellerDesk support?",
    answer:
      "SellerDesk is built for Meesho and Flipkart sellers. Orders, stock and performance from both channels sit side by side in one workspace.",
  },
  {
    question: "Do I need to change how I sell?",
    answer:
      "No. You keep selling on the marketplaces you already use. SellerDesk is the back office that keeps your catalog, stock, orders and money organised.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes. Start on the plan that fits today and move up or down as your business changes.",
  },
  {
    question: "Does it work on mobile?",
    answer:
      "Yes. Every screen is responsive, and on phones the workspace switches to a bottom navigation bar built for one-handed use.",
  },
  {
    question: "Can I get my data out?",
    answer:
      "Yes. Tables can be exported to CSV at any time, so your records are never locked in.",
  },
];

/* ── About ──────────────────────────────────────────────────────── */

export const values = [
  {
    title: "Clarity over clutter",
    description: "Every screen answers one question well, instead of ten questions badly.",
    Icon: VisibilityOutlinedIcon,
  },
  {
    title: "Built around real workflows",
    description: "Modules follow the way an order actually moves: listed, sold, shipped, settled.",
    Icon: RouteOutlinedIcon,
  },
  {
    title: "Honest numbers",
    description: "Profit means after commissions, shipping, product cost and expenses. Always.",
    Icon: BalanceOutlinedIcon,
  },
  {
    title: "Calm by design",
    description: "Quiet colours, considered type and no noise, so long days feel shorter.",
    Icon: SpaOutlinedIcon,
  },
];

/* ── Contact ────────────────────────────────────────────────────── */

export const contactTopics = [
  {
    value: "sales",
    title: "Sales & demos",
    description: "See SellerDesk with your own catalog and find the right plan.",
    Icon: RocketLaunchOutlinedIcon,
  },
  {
    value: "support",
    title: "Product support",
    description: "Questions about a feature, a setting or something not working.",
    Icon: SupportAgentOutlinedIcon,
  },
  {
    value: "partnerships",
    title: "Partnerships",
    description: "Couriers, suppliers, agencies and tools that work with sellers.",
    Icon: HandshakeOutlinedIcon,
  },
];
