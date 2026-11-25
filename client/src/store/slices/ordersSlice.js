import { createSlice } from "@reduxjs/toolkit";
import { initialOrders } from "@/data/orders";

const STORAGE_KEY = "seller_desk_orders";

const loadInitial = () => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading orders from localStorage", e);
    }
  }
  return initialOrders;
};

const saveToStorage = (data) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving orders to localStorage", e);
    }
  }
};

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    items: initialOrders,
  },
  reducers: {
    initializeOrders: (state) => {
      state.items = loadInitial();
    },
    // ── Create a new order manually ───────────────────────────────
    createOrder: (state, action) => {
      const year = new Date().getFullYear();
      const nextNum = state.items.length + 1;
      const newOrder = {
        id: `ORD-${year}-${String(9000 + nextNum).padStart(4, "0")}`,
        marketplaceOrderNo: `MANUAL-${Date.now().toString().slice(-8)}`,
        orderDate: new Date().toISOString(),
        orderStatus: "Pending",
        shipmentStatus: "Pending",
        paymentStatus: action.payload.paymentMethod?.toLowerCase().includes("cash")
          ? "Pending"
          : "Paid",
        courier: "Unassigned",
        awbNumber: null,
        shipmentId: null,
        deliveredDate: null,
        marketplaceFee: 0,
        shippingFeeCharged: 65,
        sellerSettlement: 0,
        settlementStatus: "Pending",
        ...action.payload,
      };
      newOrder.sellerSettlement =
        (newOrder.totalAmount || 0) -
        (newOrder.marketplaceFee || 0) -
        (newOrder.shippingFeeCharged || 65);
      state.items.unshift(newOrder);
      saveToStorage(state.items);
    },
    // ── Edit an existing order ────────────────────────────────────
    editOrder: (state, action) => {
      const idx = state.items.findIndex((o) => o.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
        saveToStorage(state.items);
      }
    },
    // ── Delete an order permanently ───────────────────────────────
    deleteOrder: (state, action) => {
      state.items = state.items.filter((o) => o.id !== action.payload);
      saveToStorage(state.items);
    },
    // ── Mark an order as Returned ─────────────────────────────────
    markReturned: (state, action) => {
      const { orderId, returnReason } = action.payload;
      const order = state.items.find((o) => o.id === orderId);
      if (order) {
        order.orderStatus = "Returned";
        order.shipmentStatus = "Returned to Origin";
        order.returnReason = returnReason || "Returned by customer";
        saveToStorage(state.items);
      }
    },
    updateOrderStatus: (state, action) => {
      const { orderId, orderStatus, shipmentStatus, paymentStatus } = action.payload;
      const order = state.items.find((o) => o.id === orderId);
      if (order) {
        if (orderStatus) order.orderStatus = orderStatus;
        if (shipmentStatus) order.shipmentStatus = shipmentStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        saveToStorage(state.items);
      }
    },
    // ── Set any order status (forward or backward) ────────────────
    // Keeps shipment/payment fields consistent, so a wrong click can be
    // undone by picking the previous status again.
    setOrderStatus: (state, action) => {
      const { orderId, orderStatus, courier, awbNumber, reason } = action.payload;
      const order = state.items.find((o) => o.id === orderId);
      if (!order) return;

      const wasCancelled = order.orderStatus === "Cancelled";
      const isCod = order.paymentMethod?.toLowerCase().includes("cash");
      order.orderStatus = orderStatus;

      if (orderStatus === "Pending" || orderStatus === "Processing") {
        order.shipmentStatus = orderStatus === "Pending" ? "Pending" : "Ready for Pickup";
        order.courier = "Unassigned";
        order.awbNumber = null;
        order.deliveredDate = null;
      }
      if (orderStatus === "Shipped") {
        order.shipmentStatus = "In Transit";
        order.deliveredDate = null;
        if (courier) order.courier = courier;
        if (awbNumber) order.awbNumber = awbNumber;
      }
      if (orderStatus === "Delivered") {
        order.shipmentStatus = "Delivered";
        order.paymentStatus = "Paid";
        order.deliveredDate = order.deliveredDate || new Date().toISOString();
      }
      if (orderStatus === "Cancelled") {
        order.shipmentStatus = "Cancelled";
        order.paymentStatus = order.paymentStatus === "Paid" ? "Refunded" : "Cancelled";
        order.cancellationReason = reason || "Cancelled by seller";
      }
      if (orderStatus === "Returned") {
        order.shipmentStatus = "Returned to Origin";
        order.returnReason = reason || "Returned by customer";
      }

      // Leaving a terminal state: undo its side effects.
      if (orderStatus !== "Cancelled") {
        delete order.cancellationReason;
        if (wasCancelled && ["Refunded", "Cancelled"].includes(order.paymentStatus)) {
          order.paymentStatus = isCod && orderStatus !== "Delivered" ? "Pending" : "Paid";
        }
      }
      if (orderStatus !== "Returned") delete order.returnReason;

      saveToStorage(state.items);
    },
    markPacked: (state, action) => {
      const order = state.items.find((o) => o.id === action.payload);
      if (order) {
        order.orderStatus = "Processing";
        order.shipmentStatus = "Ready for Pickup";
        saveToStorage(state.items);
      }
    },
    markShipped: (state, action) => {
      const { orderId, courier, awbNumber } = action.payload;
      const order = state.items.find((o) => o.id === orderId);
      if (order) {
        order.orderStatus = "Shipped";
        order.shipmentStatus = "In Transit";
        if (courier) order.courier = courier;
        if (awbNumber) order.awbNumber = awbNumber;
        saveToStorage(state.items);
      }
    },
    cancelOrder: (state, action) => {
      const { orderId, reason } = action.payload;
      const order = state.items.find((o) => o.id === orderId);
      if (order) {
        order.orderStatus = "Cancelled";
        order.shipmentStatus = "Cancelled";
        order.paymentStatus = order.paymentStatus === "Paid" ? "Refunded" : "Cancelled";
        order.cancellationReason = reason || "Cancelled by seller";
        saveToStorage(state.items);
      }
    },
    // ── Internal: used by the sync layer (store/syncListeners.js) to link
    // records (shipmentId, committed stock, status mirrored from shipments).
    // Not listened to, so it can never start a sync loop.
    syncOrderFields: (state, action) => {
      const { id, changes } = action.payload;
      const order = state.items.find((o) => o.id === id);
      if (order) {
        Object.assign(order, changes);
        saveToStorage(state.items);
      }
    },
    resetOrders: (state) => {
      state.items = initialOrders;
      saveToStorage(initialOrders);
    },
  },
});

export const {
  initializeOrders,
  createOrder,
  editOrder,
  deleteOrder,
  markReturned,
  updateOrderStatus,
  setOrderStatus,
  markPacked,
  markShipped,
  cancelOrder,
  syncOrderFields,
  resetOrders,
} = ordersSlice.actions;

export default ordersSlice.reducer;

