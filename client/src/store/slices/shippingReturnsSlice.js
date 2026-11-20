import { createSlice } from "@reduxjs/toolkit";
import { initialShipments } from "@/data/shipments";
import { initialReturns, initialRtos } from "@/data/returns";

const SHIPMENTS_KEY = "seller_desk_shipments";
const RETURNS_KEY = "seller_desk_returns";
const RTOS_KEY = "seller_desk_rtos";

const loadFromStorage = (key, fallback) => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(`Error loading ${key}`, e);
    }
  }
  return fallback;
};

const saveToStorage = (key, data) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving ${key}`, e);
    }
  }
};

const shippingReturnsSlice = createSlice({
  name: "shippingReturns",
  initialState: {
    shipments: initialShipments,
    returns: initialReturns,
    rtos: initialRtos,
  },
  reducers: {
    initializeShippingReturns: (state) => {
      state.shipments = loadFromStorage(SHIPMENTS_KEY, initialShipments);
      state.returns = loadFromStorage(RETURNS_KEY, initialReturns);
      state.rtos = loadFromStorage(RTOS_KEY, initialRtos);
    },
    updateShipmentStatus: (state, action) => {
      const { id, deliveryStatus, courierName, awbNumber, shippingCost, expectedDeliveryDate } = action.payload;
      const shp = state.shipments.find((s) => s.id === id);
      if (shp) {
        if (deliveryStatus) shp.deliveryStatus = deliveryStatus;
        if (deliveryStatus === "Delivered" && !shp.deliveredDate) shp.deliveredDate = new Date().toISOString();
        if (courierName) shp.courierName = courierName;
        if (awbNumber) shp.awbNumber = awbNumber;
        if (shippingCost !== undefined) shp.shippingCost = Number(shippingCost);
        if (expectedDeliveryDate) shp.expectedDeliveryDate = expectedDeliveryDate;
        saveToStorage(SHIPMENTS_KEY, state.shipments);
      }
    },
    editShipment: (state, action) => {
      const idx = state.shipments.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.shipments[idx] = { ...state.shipments[idx], ...action.payload };
        saveToStorage(SHIPMENTS_KEY, state.shipments);
      }
    },
    addCustomerReturn: (state, action) => {
      const newRet = {
        id: `RET-2026-${String(state.returns.length + 1).padStart(3, "0")}`,
        returnDate: new Date().toISOString().split("T")[0],
        inspectionStatus: "Pending Inspection",
        restockEligibility: "Pending Decision",
        returnStatus: "In Transit to Warehouse",
        restocked: false,
        ...action.payload,
      };
      state.returns.unshift(newRet);
      saveToStorage(RETURNS_KEY, state.returns);
    },
    editCustomerReturn: (state, action) => {
      const idx = state.returns.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) {
        state.returns[idx] = { ...state.returns[idx], ...action.payload };
        saveToStorage(RETURNS_KEY, state.returns);
      }
    },
    updateReturnInspection: (state, action) => {
      const { id, inspectionStatus, restockEligibility, inspectionNotes, returnStatus } = action.payload;
      const ret = state.returns.find((r) => r.id === id);
      if (ret) {
        if (inspectionStatus) ret.inspectionStatus = inspectionStatus;
        if (restockEligibility) ret.restockEligibility = restockEligibility;
        if (inspectionNotes) ret.inspectionNotes = inspectionNotes;
        if (returnStatus) ret.returnStatus = returnStatus;
        saveToStorage(RETURNS_KEY, state.returns);
      }
    },
    addRtoRecord: (state, action) => {
      const newRto = {
        id: `RTO-2026-${String(state.rtos.length + 1).padStart(3, "0")}`,
        rtoStatus: "In Transit to Seller",
        restocked: false,
        receivedBackDate: null,
        ...action.payload,
      };
      state.rtos.unshift(newRto);
      saveToStorage(RTOS_KEY, state.rtos);
    },
    editRtoRecord: (state, action) => {
      const idx = state.rtos.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) {
        state.rtos[idx] = { ...state.rtos[idx], ...action.payload };
        saveToStorage(RTOS_KEY, state.rtos);
      }
    },
    updateRtoStatus: (state, action) => {
      const { id, rtoStatus, notes, receivedBackDate } = action.payload;
      const rto = state.rtos.find((r) => r.id === id);
      if (rto) {
        if (rtoStatus) rto.rtoStatus = rtoStatus;
        if (notes) rto.notes = notes;
        if (receivedBackDate !== undefined) rto.receivedBackDate = receivedBackDate;
        saveToStorage(RTOS_KEY, state.rtos);
      }
    },
    // ── Internal: used by the sync layer (store/syncListeners.js) ────
    // Creates the shipment for an order when it is shipped.
    addShipment: (state, action) => {
      const nums = state.shipments.map((s) => Number(String(s.id).replace(/\D/g, "")) || 0);
      const next = (nums.length ? Math.max(...nums) : 0) + 1;
      state.shipments.unshift({
        id: `SHP-${String(next).padStart(3, "0")}`,
        shipmentDate: new Date().toISOString(),
        deliveredDate: null,
        deliveryStatus: "In Transit",
        shippingCost: 65,
        ...action.payload,
      });
      saveToStorage(SHIPMENTS_KEY, state.shipments);
    },
    // Merges fields into a shipment, return or RTO without triggering sync.
    syncShippingRecord: (state, action) => {
      const { collection, id, changes } = action.payload;
      const KEYS = { shipments: SHIPMENTS_KEY, returns: RETURNS_KEY, rtos: RTOS_KEY };
      const record = state[collection]?.find((r) => r.id === id);
      if (record && KEYS[collection]) {
        Object.assign(record, changes);
        saveToStorage(KEYS[collection], state[collection]);
      }
    },
    resetShippingReturns: (state) => {
      state.shipments = initialShipments;
      state.returns = initialReturns;
      state.rtos = initialRtos;
      saveToStorage(SHIPMENTS_KEY, initialShipments);
      saveToStorage(RETURNS_KEY, initialReturns);
      saveToStorage(RTOS_KEY, initialRtos);
    },
  },
});

export const {
  initializeShippingReturns,
  updateShipmentStatus,
  editShipment,
  addCustomerReturn,
  editCustomerReturn,
  updateReturnInspection,
  addRtoRecord,
  editRtoRecord,
  updateRtoStatus,
  addShipment,
  syncShippingRecord,
  resetShippingReturns,
} = shippingReturnsSlice.actions;

export default shippingReturnsSlice.reducer;

