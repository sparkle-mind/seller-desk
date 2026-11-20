/**
 * Pricing calculator math (one product unit).
 *
 * Inputs (all ₹ unless noted):
 *   purchasePrice, sellingPrice, forwardShipping, reverseShipping,
 *   packagingCost, otherExpenses
 *   commissionType  "percent" | "flat"
 *   commissionValue % of selling price, or a flat ₹ amount
 *   targetMargin    desired profit margin in % (for the suggested final price)
 *
 * Total product cost = purchase + commission + forward + reverse + packaging + other
 * Net profit         = selling price - total product cost
 * Profit margin      = net profit / selling price
 * Final selling price = price that hits targetMargin after commission.
 */

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const round2 = (n) => Math.round(n * 100) / 100;

export function calculatePricing(input) {
  const purchasePrice = num(input.purchasePrice);
  const sellingPrice = num(input.sellingPrice);
  const forwardShipping = num(input.forwardShipping);
  const reverseShipping = num(input.reverseShipping);
  const packagingCost = num(input.packagingCost);
  const otherExpenses = num(input.otherExpenses);
  const commissionValue = num(input.commissionValue);
  const targetMargin = num(input.targetMargin);
  const isPercent = input.commissionType !== "flat";

  const commissionAmount = isPercent
    ? (sellingPrice * commissionValue) / 100
    : commissionValue;

  // Costs that do not depend on the selling price
  const fixedCosts =
    purchasePrice + forwardShipping + reverseShipping + packagingCost + otherExpenses;

  const totalCost = fixedCosts + commissionAmount;
  const netProfit = sellingPrice - totalCost;
  const profitMargin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;
  const roi = purchasePrice > 0 ? (netProfit / purchasePrice) * 100 : 0;

  // Price P where P - fixed - commission(P) = margin * P
  const priceFor = (marginPct) => {
    const m = marginPct / 100;
    const denom = isPercent ? 1 - commissionValue / 100 - m : 1 - m;
    if (denom <= 0) return null; // target not reachable
    const base = isPercent ? fixedCosts : fixedCosts + commissionValue;
    return base / denom;
  };

  const breakEvenPrice = priceFor(0);
  const finalSellingPrice = priceFor(targetMargin);

  return {
    commissionAmount: round2(commissionAmount),
    totalCost: round2(totalCost),
    netProfit: round2(netProfit),
    profitMargin: round2(profitMargin),
    roi: round2(roi),
    breakEvenPrice: breakEvenPrice === null ? null : Math.ceil(breakEvenPrice),
    finalSellingPrice: finalSellingPrice === null ? null : Math.ceil(finalSellingPrice),
    isProfit: netProfit >= 0,
    breakdown: [
      { key: "purchasePrice", label: "Purchase price", value: purchasePrice },
      { key: "commission", label: "Platform commission", value: round2(commissionAmount) },
      { key: "forwardShipping", label: "Forward shipping", value: forwardShipping },
      { key: "reverseShipping", label: "Reverse shipping", value: reverseShipping },
      { key: "packagingCost", label: "Packaging", value: packagingCost },
      { key: "otherExpenses", label: "Other expenses", value: otherExpenses },
    ],
  };
}

export function marginTone(margin) {
  if (margin < 0) return "rose";
  if (margin < 10) return "amber";
  return "emerald";
}
