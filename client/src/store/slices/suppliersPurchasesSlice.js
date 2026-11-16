import { createSlice } from "@reduxjs/toolkit";
import { initialSuppliers } from "@/data/suppliers";
import { initialPurchases } from "@/data/purchases";

const SUPPLIERS_KEY = "seller_desk_suppliers";
const PURCHASES_KEY = "seller_desk_purchases";

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

const suppliersPurchasesSlice = createSlice({
  name: "suppliersPurchases",
  initialState: {
    suppliers: initialSuppliers,
    purchases: initialPurchases,
  },
  reducers: {
    initializeSuppliersPurchases: (state) => {
      state.suppliers = loadFromStorage(SUPPLIERS_KEY, initialSuppliers);
      state.purchases = loadFromStorage(PURCHASES_KEY, initialPurchases);
    },
    addSupplier: (state, action) => {
      const newSup = {
        id: `SUP-${String(state.suppliers.length + 1).padStart(3, "0")}`,
        totalPurchases: 0,
        outstandingBalance: 0,
        status: "Active",
        ...action.payload,
      };
      state.suppliers.unshift(newSup);
      saveToStorage(SUPPLIERS_KEY, state.suppliers);
    },
    updateSupplier: (state, action) => {
      const idx = state.suppliers.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.suppliers[idx] = { ...state.suppliers[idx], ...action.payload };
        saveToStorage(SUPPLIERS_KEY, state.suppliers);
      }
    },
    deleteSupplier: (state, action) => {
      state.suppliers = state.suppliers.filter((s) => s.id !== action.payload);
      saveToStorage(SUPPLIERS_KEY, state.suppliers);
    },
    addPurchaseOrder: (state, action) => {
      const nextNum = state.purchases.length + 1;
      const poNum = `PO-2026-${String(nextNum).padStart(3, "0")}`;
      const newPO = {
        id: poNum,
        poNumber: poNum,
        orderDate: new Date().toISOString().split("T")[0],
        status: "Ordered",
        paymentStatus: "Pending",
        paidAmount: 0,
        receivedDate: null,
        ...action.payload,
      };
      state.purchases.unshift(newPO);

      // Update supplier total purchases and balance
      const sup = state.suppliers.find((s) => s.id === newPO.supplierId);
      if (sup) {
        sup.totalPurchases = (sup.totalPurchases || 0) + newPO.totalAmount;
        sup.outstandingBalance = (sup.outstandingBalance || 0) + (newPO.totalAmount - (newPO.paidAmount || 0));
        saveToStorage(SUPPLIERS_KEY, state.suppliers);
      }

      saveToStorage(PURCHASES_KEY, state.purchases);
    },
    receivePO: (state, action) => {
      const { poId, receivedDate } = action.payload;
      const po = state.purchases.find((p) => p.id === poId);
      if (po && po.status !== "Received") {
        po.status = "Received";
        po.receivedDate = receivedDate || new Date().toISOString().split("T")[0];
        // Mark all items as fully received
        po.items = po.items.map((it) => ({
          ...it,
          receivedQuantity: it.quantity,
        }));
        saveToStorage(PURCHASES_KEY, state.purchases);
      }
    },
    recordPayment: (state, action) => {
      const { poId, amount } = action.payload;
      const po = state.purchases.find((p) => p.id === poId);
      if (po) {
        po.paidAmount = (po.paidAmount || 0) + Number(amount);
        if (po.paidAmount >= po.totalAmount) {
          po.paymentStatus = "Paid";
        } else {
          po.paymentStatus = "Partially Paid";
        }

        // Adjust supplier outstanding balance
        const sup = state.suppliers.find((s) => s.id === po.supplierId);
        if (sup) {
          sup.outstandingBalance = Math.max(0, (sup.outstandingBalance || 0) - Number(amount));
          saveToStorage(SUPPLIERS_KEY, state.suppliers);
        }

        saveToStorage(PURCHASES_KEY, state.purchases);
      }
    },
    updatePurchaseOrder: (state, action) => {
      const idx = state.purchases.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.purchases[idx] = { ...state.purchases[idx], ...action.payload };
        saveToStorage(PURCHASES_KEY, state.purchases);
      }
    },
    cancelPurchaseOrder: (state, action) => {
      const { poId, reason } = action.payload;
      const po = state.purchases.find((p) => p.id === poId);
      if (po && po.status !== "Received") {
        po.status = "Cancelled";
        po.notes = `${po.notes || ""} [Cancelled: ${reason || "Cancelled by user"}]`.trim();
        // Adjust supplier outstanding balance if it was added
        const sup = state.suppliers.find((s) => s.id === po.supplierId);
        if (sup) {
          sup.outstandingBalance = Math.max(0, (sup.outstandingBalance || 0) - (po.totalAmount - (po.paidAmount || 0)));
          saveToStorage(SUPPLIERS_KEY, state.suppliers);
        }
        saveToStorage(PURCHASES_KEY, state.purchases);
      }
    },
    adjustSupplierBalance: (state, action) => {
      const { supplierId, newBalance, reason } = action.payload;
      const sup = state.suppliers.find((s) => s.id === supplierId);
      if (sup) {
        sup.outstandingBalance = Math.max(0, Number(newBalance));
        saveToStorage(SUPPLIERS_KEY, state.suppliers);
      }
    },
    resetSuppliersPurchases: (state) => {
      state.suppliers = initialSuppliers;
      state.purchases = initialPurchases;
      saveToStorage(SUPPLIERS_KEY, initialSuppliers);
      saveToStorage(PURCHASES_KEY, initialPurchases);
    },
  },
});

export const {
  initializeSuppliersPurchases,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  addPurchaseOrder,
  updatePurchaseOrder,
  cancelPurchaseOrder,
  adjustSupplierBalance,
  receivePO,
  recordPayment,
  resetSuppliersPurchases,
} = suppliersPurchasesSlice.actions;

export default suppliersPurchasesSlice.reducer;

