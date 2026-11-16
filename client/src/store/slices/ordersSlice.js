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
  markPacked,
  markShipped,
  cancelOrder,
  resetOrders,
} = ordersSlice.actions;

export default ordersSlice.reducer;

