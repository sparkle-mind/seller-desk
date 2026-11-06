import dayjs from "dayjs";

/**
 * Formats a number into Indian Rupee format: ₹1,23,456
 */
export function formatCurrency(amount, showSymbol = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? "₹0" : "0";
  }

  const num = Math.round(Number(amount));
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(absNum);

  const prefix = isNegative ? "-₹" : "₹";
  return showSymbol ? `${prefix}${formatted}` : `${isNegative ? "-" : ""}${formatted}`;
}

/**
 * Formats a number with Indian comma grouping
 */
export function formatNumber(val) {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return new Intl.NumberFormat("en-IN").format(val);
}

/**
 * Formats date into readable string (e.g., "05 Mar 2026")
 */
export function formatDate(dateStr, format = "DD MMM YYYY") {
  if (!dateStr) return "N/A";
  return dayjs(dateStr).format(format);
}

/**
 * Formats datetime (e.g., "05 Mar 2026, 02:30 PM")
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return "N/A";
  return dayjs(dateStr).format("DD MMM YYYY, hh:mm A");
}

/**
 * Truncates text with ellipsis
 */
export function truncate(text, length = 35) {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
}

