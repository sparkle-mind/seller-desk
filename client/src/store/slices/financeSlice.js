import { createSlice } from "@reduxjs/toolkit";
import { initialExpenses } from "@/data/expenses";
import { initialSettlements } from "@/data/settlements";

const EXPENSES_KEY = "seller_desk_expenses";
const SETTLEMENTS_KEY = "seller_desk_settlements";

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

const financeSlice = createSlice({
  name: "finance",
  initialState: {
    expenses: initialExpenses,
    settlements: initialSettlements,
  },
  reducers: {
    initializeFinance: (state) => {
      state.expenses = loadFromStorage(EXPENSES_KEY, initialExpenses);
      state.settlements = loadFromStorage(SETTLEMENTS_KEY, initialSettlements);
    },
    addExpense: (state, action) => {
      const nextNum = state.expenses.length + 1;
      const newExp = {
        id: `EXP-2026-${String(nextNum).padStart(3, "0")}`,
        date: new Date().toISOString().split("T")[0],
        ...action.payload,
      };
      state.expenses.unshift(newExp);
      saveToStorage(EXPENSES_KEY, state.expenses);
    },
    updateExpense: (state, action) => {
      const idx = state.expenses.findIndex((e) => e.id === action.payload.id);
      if (idx !== -1) {
        state.expenses[idx] = { ...state.expenses[idx], ...action.payload };
        saveToStorage(EXPENSES_KEY, state.expenses);
      }
    },
    deleteExpense: (state, action) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      saveToStorage(EXPENSES_KEY, state.expenses);
    },
    updateSettlementStatus: (state, action) => {
      const { id, status, utrNumber } = action.payload;
      const set = state.settlements.find((s) => s.id === id);
      if (set) {
        if (status) set.status = status;
        if (utrNumber) set.utrNumber = utrNumber;
        saveToStorage(SETTLEMENTS_KEY, state.settlements);
      }
    },
    addSettlement: (state, action) => {
      const nextNum = state.settlements.length + 1;
      const newSet = {
        id: `SET-2026-${String(nextNum).padStart(3, "0")}`,
        settlementDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        utrNumber: "Pending Release",
        bankAccount: "HDFC Bank (A/C **4419)",
        ...action.payload,
      };
      state.settlements.unshift(newSet);
      saveToStorage(SETTLEMENTS_KEY, state.settlements);
    },
    editSettlement: (state, action) => {
      const idx = state.settlements.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.settlements[idx] = { ...state.settlements[idx], ...action.payload };
        saveToStorage(SETTLEMENTS_KEY, state.settlements);
      }
    },
    resetFinance: (state) => {
      state.expenses = initialExpenses;
      state.settlements = initialSettlements;
      saveToStorage(EXPENSES_KEY, initialExpenses);
      saveToStorage(SETTLEMENTS_KEY, initialSettlements);
    },
  },
});

export const {
  initializeFinance,
  addExpense,
  updateExpense,
  deleteExpense,
  updateSettlementStatus,
  addSettlement,
  editSettlement,
  resetFinance,
} = financeSlice.actions;

export default financeSlice.reducer;

