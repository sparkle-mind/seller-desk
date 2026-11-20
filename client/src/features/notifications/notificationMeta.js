import dayjs from "dayjs";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import BusinessIcon from "@mui/icons-material/Business";
import SyncIcon from "@mui/icons-material/Sync";
import { NOTIFICATION_CATEGORIES } from "@/data/notifications";

// Same tone classes as StatCard so category icons match the KPI tiles.
const TONES = {
  blue:    { bg: "bg-blue-500/10",    icon: "text-blue-500",    ring: "ring-blue-500/20" },
  emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-500", ring: "ring-emerald-500/20" },
  amber:   { bg: "bg-amber-500/10",   icon: "text-amber-500",   ring: "ring-amber-500/20" },
  rose:    { bg: "bg-rose-500/10",    icon: "text-rose-500",    ring: "ring-rose-500/20" },
  purple:  { bg: "bg-purple-500/10",  icon: "text-purple-500",  ring: "ring-purple-500/20" },
  slate:   { bg: "bg-slate-500/10",   icon: "text-slate-500",   ring: "ring-slate-500/20" },
};

const CATEGORY_VISUALS = {
  order:     { icon: ShoppingCartIcon,         tone: "blue" },
  inventory: { icon: WarehouseIcon,            tone: "amber" },
  finance:   { icon: AccountBalanceWalletIcon, tone: "emerald" },
  returns:   { icon: AssignmentReturnIcon,     tone: "rose" },
  purchase:  { icon: BusinessIcon,             tone: "purple" },
  system:    { icon: SyncIcon,                 tone: "slate" },
};

export const getCategoryMeta = (category) => {
  const visuals = CATEGORY_VISUALS[category] || CATEGORY_VISUALS.system;
  return {
    label: NOTIFICATION_CATEGORIES[category]?.label || "System",
    icon: visuals.icon,
    tone: TONES[visuals.tone],
  };
};

export const CATEGORY_OPTIONS = Object.entries(NOTIFICATION_CATEGORIES).map(
  ([value, { label }]) => ({ value, label }),
);

/** "Just now", "12m ago", "3h ago", "Yesterday", "4d ago", then a date. */
export function formatRelativeTime(dateStr) {
  const date = dayjs(dateStr);
  const now = dayjs();
  const minutes = now.diff(date, "minute");
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = now.diff(date, "hour");
  if (hours < 24 && date.isSame(now, "day")) return `${hours}h ago`;
  if (date.isSame(now.subtract(1, "day"), "day")) return "Yesterday";
  const days = now.diff(date, "day");
  if (days < 7) return `${days}d ago`;
  return date.format("DD MMM YYYY");
}

/** Groups a newest-first list into Today / Yesterday / Earlier sections. */
export function groupByDay(items) {
  const today = dayjs();
  const yesterday = today.subtract(1, "day");
  const groups = [
    { key: "today", label: "Today", items: [] },
    { key: "yesterday", label: "Yesterday", items: [] },
    { key: "earlier", label: "Earlier", items: [] },
  ];
  items.forEach((n) => {
    const d = dayjs(n.createdAt);
    if (d.isSame(today, "day")) groups[0].items.push(n);
    else if (d.isSame(yesterday, "day")) groups[1].items.push(n);
    else groups[2].items.push(n);
  });
  return groups.filter((g) => g.items.length > 0);
}

export const sortNewestFirst = (items) =>
  [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
