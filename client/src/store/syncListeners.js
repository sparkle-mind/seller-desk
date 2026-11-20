import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import {
  createOrder,
  editOrder,
  deleteOrder,
  cancelOrder,
  markPacked,
  markShipped,
  markReturned,
  updateOrderStatus,
  syncOrderFields,
} from "./slices/ordersSlice";
import { adjustStock, updateVariantStock } from "./slices/productsSlice";
import { addMovement } from "./slices/inventorySlice";
import {
  updateShipmentStatus,
  editShipment,
  addCustomerReturn,
  updateReturnInspection,
  addRtoRecord,
  updateRtoStatus,
  addShipment,
  syncShippingRecord,
} from "./slices/shippingReturnsSlice";
import { receivePO } from "./slices/suppliersPurchasesSlice";
import { pushNotification } from "./slices/notificationsSlice";
import { formatCurrency } from "@/lib/formatters";

/**
 * SYNC LAYER
 * ──────────
 * Every rule that keeps one feature in step with another lives here, so pages
 * only dispatch their own action and the rest of the app follows.
 *
 *   Orders    -> stock         sale deducts stock; cancel/delete/edit gives it back
 *   Orders    -> shipments     shipping creates/updates the shipment record
 *   Shipments -> orders        delivery status flows back to the order
 *   Orders    -> returns       marking returned opens a customer return
 *   Returns   -> stock         eligible inspection restocks the returned SKU, once
 *   RTOs      -> stock/orders  receiving an RTO restocks the order's own product
 *   Events    -> notifications new/cancelled orders, low/out of stock, returns,
 *                              deliveries, PO receipts
 *
 * Follow-up updates use the internal syncOrderFields / syncShippingRecord /
 * addShipment actions, which no rule listens to, so rules cannot loop.
 *
 * Stock is only committed for orders created in the app (stockCommittedQty).
 * Seeded demo orders are treated as already reflected in the seeded stock.
 */

export const syncListener = createListenerMiddleware();
const listen = syncListener.startListening;

const notify = (api, payload) => api.dispatch(pushNotification(payload));

const findOrder = (state, id) => state.orders.items.find((o) => o.id === id);
const findShipmentForOrder = (state, order) =>
  state.shippingReturns.shipments.find((s) => s.orderId === order.id || (order.shipmentId && s.id === order.shipmentId));

/**
 * Change stock for a product (or the variant matching `sku`) by `delta`, log a
 * movement and return how many units actually moved (stock never goes below 0).
 */
function changeStock(api, { productId, sku, productName, delta, type, reason, referenceId }) {
  if (!delta) return 0;
  const products = api.getState().products.items;
  const prod =
    products.find((p) => p.id === productId) ||
    products.find((p) => p.sku === sku || p.variants?.some((v) => v.sku === sku)) ||
    (productName ? products.find((p) => p.name === productName) : null);
  if (!prod) return 0;

  const variant = sku ? prod.variants?.find((v) => v.sku === sku) : null;
  const previousStock = prod.stock || 0;
  let applied;

  if (variant) {
    const next = Math.max(0, (variant.stock || 0) + delta);
    applied = next - (variant.stock || 0);
    if (applied) api.dispatch(updateVariantStock({ productId: prod.id, variantId: variant.id, newStock: next }));
  } else {
    const next = Math.max(0, previousStock + delta);
    applied = next - previousStock;
    if (applied) api.dispatch(adjustStock({ productId: prod.id, newStock: next }));
  }
  if (!applied) return 0;

  const newStock = api.getState().products.items.find((p) => p.id === prod.id)?.stock ?? previousStock + applied;
  api.dispatch(
    addMovement({
      productId: prod.id,
      productName: prod.name,
      sku: variant?.sku || prod.sku,
      type,
      quantity: applied,
      previousStock,
      newStock,
      reason,
      referenceId,
      performedBy: "Auto-sync",
    })
  );
  return applied;
}

// ─── Orders -> stock ─────────────────────────────────────────────────────────

listen({
  actionCreator: createOrder,
  effect: (action, api) => {
    const order = api.getState().orders.items[0];
    if (!order) return;
    const qty = Number(order.quantity) || 1;
    const moved = changeStock(api, {
      productId: order.productId,
      sku: order.sku,
      productName: order.productName,
      delta: -qty,
      type: "Sale",
      reason: `Order placed on ${order.marketplace || "marketplace"}`,
      referenceId: order.id,
    });
    api.dispatch(syncOrderFields({ id: order.id, changes: { stockCommittedQty: -moved } }));

    notify(api, {
      category: "order",
      title: order.marketplace ? `New ${order.marketplace} order` : "New order",
      message: `${order.id} · ${qty}x ${order.productName || order.sku}, ${formatCurrency(order.totalAmount || 0)}.`,
      href: `/orders/${order.id}`,
    });
    if (-moved < qty) {
      notify(api, {
        category: "inventory",
        priority: "high",
        title: `Oversold: ${order.productName || order.sku}`,
        message: `${order.id} needs ${qty} units but only ${-moved} were in stock.`,
        href: "/inventory",
      });
    }
  },
});

// Release stock an order is holding (cancel / delete / handed over to a return)
function releaseOrderStock(api, order, { type, reason }) {
  const held = Number(order?.stockCommittedQty) || 0;
  if (held <= 0) return;
  changeStock(api, { productId: order.productId, sku: order.sku, productName: order.productName, delta: held, type, reason, referenceId: order.id });
}

listen({
  actionCreator: cancelOrder,
  effect: (action, api) => {
    const before = findOrder(api.getOriginalState(), action.payload.orderId);
    if (!before || before.orderStatus === "Cancelled") return;
    releaseOrderStock(api, before, { type: "Order Cancelled", reason: "Order cancelled, units back on shelf" });
    api.dispatch(syncOrderFields({ id: before.id, changes: { stockCommittedQty: 0 } }));

    const shipment = findShipmentForOrder(api.getState(), before);
    if (shipment && !["Delivered", "Cancelled"].includes(shipment.deliveryStatus)) {
      api.dispatch(syncShippingRecord({ collection: "shipments", id: shipment.id, changes: { deliveryStatus: "Cancelled" } }));
    }
    notify(api, {
      category: "order",
      title: "Order cancelled",
      message: `${before.id} · ${before.productName || before.sku}${before.stockCommittedQty > 0 ? ", stock restored" : ""}.`,
      href: `/orders/${before.id}`,
    });
  },
});

listen({
  actionCreator: deleteOrder,
  effect: (action, api) => {
    const before = findOrder(api.getOriginalState(), action.payload);
    if (!before || before.orderStatus === "Cancelled") return;
    releaseOrderStock(api, before, { type: "Order Deleted", reason: "Order deleted, units back on shelf" });
  },
});

listen({
  actionCreator: editOrder,
  effect: (action, api) => {
    const before = findOrder(api.getOriginalState(), action.payload.id);
    const after = findOrder(api.getState(), action.payload.id);
    if (!before || !after || after.orderStatus === "Cancelled") return;
    const held = Number(before.stockCommittedQty) || 0;
    if (held <= 0) return;
    const changed =
      before.productId !== after.productId || before.sku !== after.sku || Number(before.quantity) !== Number(after.quantity);
    if (!changed) return;

    // Give back what the old line held, then take the new line
    releaseOrderStock(api, before, { type: "Order Edited", reason: "Order line changed, previous units released" });
    const moved = changeStock(api, {
      productId: after.productId,
      sku: after.sku,
      productName: after.productName,
      delta: -(Number(after.quantity) || 1),
      type: "Sale",
      reason: "Order line changed",
      referenceId: after.id,
    });
    api.dispatch(syncOrderFields({ id: after.id, changes: { stockCommittedQty: -moved } }));
  },
});

// ─── Orders -> shipments ─────────────────────────────────────────────────────

listen({
  actionCreator: markShipped,
  effect: (action, api) => {
    const state = api.getState();
    const order = findOrder(state, action.payload.orderId);
    if (!order) return;
    const existing = findShipmentForOrder(state, order);
    const fields = {
      courierName: order.courier,
      awbNumber: order.awbNumber,
      deliveryStatus: "In Transit",
    };

    if (existing) {
      api.dispatch(syncShippingRecord({ collection: "shipments", id: existing.id, changes: fields }));
      if (order.shipmentId !== existing.id) api.dispatch(syncOrderFields({ id: order.id, changes: { shipmentId: existing.id } }));
      return;
    }

    const expected = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    api.dispatch(
      addShipment({
        ...fields,
        orderId: order.id,
        marketplace: order.marketplace,
        expectedDeliveryDate: expected,
        shippingCost: order.shippingFeeCharged ?? 65,
        destinationCity: [order.city, order.state].filter(Boolean).join(", "),
        pincode: order.pincode,
        itemsSummary: `${order.productName || order.sku} (Qty: ${order.quantity || 1})`,
      })
    );
    const created = api.getState().shippingReturns.shipments[0];
    api.dispatch(syncOrderFields({ id: order.id, changes: { shipmentId: created.id } }));
  },
});

listen({
  actionCreator: markPacked,
  effect: (action, api) => {
    const state = api.getState();
    const order = findOrder(state, action.payload);
    const shipment = order && findShipmentForOrder(state, order);
    if (shipment && shipment.deliveryStatus !== "Ready for Pickup") {
      api.dispatch(syncShippingRecord({ collection: "shipments", id: shipment.id, changes: { deliveryStatus: "Ready for Pickup" } }));
    }
  },
});

// Order detail "Mark Delivered" etc. -> shipment
listen({
  actionCreator: updateOrderStatus,
  effect: (action, api) => {
    const { orderId, orderStatus, shipmentStatus } = action.payload;
    const state = api.getState();
    const order = findOrder(state, orderId);
    const shipment = order && findShipmentForOrder(state, order);
    if (!shipment) return;
    const target = orderStatus === "Delivered" ? "Delivered" : shipmentStatus;
    if (!target || target === shipment.deliveryStatus) return;
    const changes = { deliveryStatus: target };
    if (target === "Delivered" && !shipment.deliveredDate) changes.deliveredDate = new Date().toISOString();
    api.dispatch(syncShippingRecord({ collection: "shipments", id: shipment.id, changes }));
  },
});

// ─── Shipments -> orders ─────────────────────────────────────────────────────

const SHIPPED_STATES = ["In Transit", "Out for Delivery"];

listen({
  matcher: isAnyOf(updateShipmentStatus, editShipment),
  effect: (action, api) => {
    const before = api.getOriginalState().shippingReturns.shipments.find((s) => s.id === action.payload.id);
    const shipment = api.getState().shippingReturns.shipments.find((s) => s.id === action.payload.id);
    if (!shipment?.orderId) return;
    const order = findOrder(api.getState(), shipment.orderId);
    if (!order) return;

    const status = shipment.deliveryStatus;
    const changes = {};
    if (order.shipmentStatus !== status) changes.shipmentStatus = status;
    if (shipment.courierName && order.courier !== shipment.courierName) changes.courier = shipment.courierName;
    if (shipment.awbNumber && order.awbNumber !== shipment.awbNumber) changes.awbNumber = shipment.awbNumber;
    if (order.shipmentId !== shipment.id) changes.shipmentId = shipment.id;

    if (status === "Delivered" && order.orderStatus !== "Delivered" && order.orderStatus !== "Returned") {
      changes.orderStatus = "Delivered";
      changes.deliveredDate = shipment.deliveredDate || new Date().toISOString();
    } else if (SHIPPED_STATES.includes(status) && ["Pending", "Processing"].includes(order.orderStatus)) {
      changes.orderStatus = "Shipped";
    } else if (status === "Returned to Origin" && order.orderStatus !== "Returned") {
      changes.orderStatus = "Returned";
    }

    if (Object.keys(changes).length) api.dispatch(syncOrderFields({ id: order.id, changes }));

    if (status === "Delivered" && before?.deliveryStatus !== "Delivered") {
      notify(api, {
        category: "order",
        title: "Order delivered",
        message: `${order.id} reached ${shipment.destinationCity || order.city || "the customer"} via ${shipment.courierName || "courier"}.`,
        href: `/orders/${order.id}`,
      });
    }
  },
});

// ─── Orders -> returns ───────────────────────────────────────────────────────

listen({
  actionCreator: markReturned,
  effect: (action, api) => {
    const state = api.getState();
    const order = findOrder(state, action.payload.orderId);
    if (!order) return;
    const exists = state.shippingReturns.returns.some((r) => r.originalOrderId === order.id);
    if (!exists) {
      api.dispatch(
        addCustomerReturn({
          originalOrderId: order.id,
          marketplace: order.marketplace,
          productName: order.productName,
          sku: order.sku,
          productId: order.productId,
          quantity: Number(order.quantity) || 1,
          customerName: order.customerName,
          returnReason: order.returnReason || action.payload.returnReason || "Returned by customer",
          refundAmount: order.totalAmount || 0,
          reverseShippingFee: 65,
        })
      );
    }
    // Units come back through inspection now, not through the order
    if (order.stockCommittedQty) api.dispatch(syncOrderFields({ id: order.id, changes: { stockCommittedQty: 0 } }));

    notify(api, {
      category: "returns",
      title: "Return opened",
      message: `${order.id} · ${order.productName || order.sku}. Inspect it when it arrives to restock.`,
      href: "/shipping-returns",
    });
  },
});

// ─── Returns -> stock ────────────────────────────────────────────────────────

listen({
  actionCreator: updateReturnInspection,
  effect: (action, api) => {
    const { id, restockEligibility } = action.payload;
    if (restockEligibility !== "Eligible") return;
    const ret = api.getState().shippingReturns.returns.find((r) => r.id === id);
    if (!ret || ret.restocked) return;

    const order = ret.originalOrderId ? findOrder(api.getState(), ret.originalOrderId) : null;
    const qty = Number(ret.quantity) || Number(order?.quantity) || 1;
    const moved = changeStock(api, {
      productId: ret.productId || order?.productId,
      sku: ret.sku || order?.sku,
      productName: ret.productName,
      delta: qty,
      type: "Return Restock",
      reason: `Customer return restocked after quality inspection (${ret.id})`,
      referenceId: ret.id,
    });
    if (moved) {
      api.dispatch(syncShippingRecord({ collection: "returns", id: ret.id, changes: { restocked: true } }));
      notify(api, {
        category: "returns",
        title: "Return restocked",
        message: `${ret.id} · ${moved} unit${moved === 1 ? "" : "s"} of ${ret.productName || ret.sku} back in stock.`,
        href: `/shipping-returns/${ret.id}`,
      });
    } else {
      notify(api, {
        category: "returns",
        priority: "high",
        title: "Return could not be restocked",
        message: `${ret.id}: no product matches ${ret.sku || ret.productName}. Adjust stock manually.`,
        href: "/inventory",
      });
    }
  },
});

// ─── RTOs -> orders & stock ──────────────────────────────────────────────────

listen({
  actionCreator: addRtoRecord,
  effect: (action, api) => {
    const rto = api.getState().shippingReturns.rtos[0];
    const order = rto?.originalOrderId && findOrder(api.getState(), rto.originalOrderId);
    if (!order) return;
    if (order.orderStatus !== "Returned" || order.shipmentStatus !== "Returned to Origin") {
      api.dispatch(syncOrderFields({ id: order.id, changes: { orderStatus: "Returned", shipmentStatus: "Returned to Origin" } }));
    }
    const shipment = findShipmentForOrder(api.getState(), order);
    if (shipment && shipment.deliveryStatus !== "Returned to Origin") {
      api.dispatch(syncShippingRecord({ collection: "shipments", id: shipment.id, changes: { deliveryStatus: "RTO Initiated" } }));
    }
    // Units come back when the RTO is received, not through the order
    if (order.stockCommittedQty) api.dispatch(syncOrderFields({ id: order.id, changes: { stockCommittedQty: 0 } }));
  },
});

listen({
  actionCreator: updateRtoStatus,
  effect: (action, api) => {
    if (action.payload.rtoStatus !== "Received Back & Verified") return;
    const rto = api.getState().shippingReturns.rtos.find((r) => r.id === action.payload.id);
    if (!rto || rto.restocked) return;

    const order = rto.originalOrderId ? findOrder(api.getState(), rto.originalOrderId) : null;
    if (!order) {
      notify(api, {
        category: "returns",
        priority: "high",
        title: "RTO received, restock skipped",
        message: `${rto.id}: original order ${rto.originalOrderId || "unknown"} not found, so the product is unknown. Adjust stock manually.`,
        href: "/inventory",
      });
      return;
    }

    const qty = Number(order.quantity) || 1;
    const moved = changeStock(api, {
      productId: order.productId,
      sku: order.sku,
      productName: order.productName,
      delta: qty,
      type: "Return Restock",
      reason: `RTO package verified and restocked (${rto.id})`,
      referenceId: rto.id,
    });
    if (moved) api.dispatch(syncShippingRecord({ collection: "rtos", id: rto.id, changes: { restocked: true } }));

    const shipment = findShipmentForOrder(api.getState(), order);
    if (shipment && shipment.deliveryStatus !== "Returned to Origin") {
      api.dispatch(syncShippingRecord({ collection: "shipments", id: shipment.id, changes: { deliveryStatus: "Returned to Origin" } }));
    }

    notify(api, {
      category: "returns",
      title: "RTO received",
      message: `${rto.id} · ${moved} unit${moved === 1 ? "" : "s"} of ${order.productName || order.sku} back in stock.`,
      href: `/shipping-returns/${rto.id}`,
    });
  },
});

// ─── Purchases -> notifications ──────────────────────────────────────────────

listen({
  actionCreator: receivePO,
  effect: (action, api) => {
    const before = api.getOriginalState().suppliersPurchases.purchases.find((p) => p.id === action.payload.poId);
    const po = api.getState().suppliersPurchases.purchases.find((p) => p.id === action.payload.poId);
    if (!po || before?.status === "Received" || po.status !== "Received") return;
    const units = (po.items || []).reduce((n, i) => n + (Number(i.quantity) || 0), 0);
    notify(api, {
      category: "purchase",
      title: "Purchase order received",
      message: `${po.poNumber || po.id} from ${po.supplierName || "supplier"} · ${units} units added to stock.`,
      href: `/suppliers-purchases/po/${po.id}`,
    });
  },
});

// ─── Stock levels -> notifications ───────────────────────────────────────────
// Fires when a product crosses into low or out of stock, from any source
// (orders, manual adjustments, edits). Loading or resetting data is ignored.

listen({
  predicate: (action, current, previous) =>
    current.products.items !== previous.products.items &&
    !/\/(initialize|reset)/.test(action.type),
  effect: (action, api) => {
    const prev = new Map(api.getOriginalState().products.items.map((p) => [p.id, p]));
    for (const p of api.getState().products.items) {
      const old = prev.get(p.id);
      if (!old) continue;
      const level = Number(p.reorderLevel) || 15;
      if (old.stock > 0 && p.stock <= 0) {
        notify(api, {
          category: "inventory",
          priority: "high",
          title: `Out of stock: ${p.name}`,
          message: `${p.sku} has 0 units left. Restock or pause listings.`,
          href: `/inventory/${p.id}`,
        });
      } else if (old.stock > level && p.stock <= level && p.stock > 0) {
        notify(api, {
          category: "inventory",
          priority: "high",
          title: `Low stock: ${p.name}`,
          message: `${p.sku} is down to ${p.stock} units (reorder level ${level}).`,
          href: `/inventory/${p.id}`,
        });
      }
    }
  },
});
