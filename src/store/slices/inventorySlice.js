import { createSlice } from "@reduxjs/toolkit";
import { initialStockMovements } from "@/data/inventory";

const STORAGE_KEY = "seller_desk_movements";

const loadInitial = () => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading movements from localStorage", e);
    }
  }
  return initialStockMovements;
};

const saveToStorage = (data) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving movements to localStorage", e);
    }
  }
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    movements: initialStockMovements,
  },
  reducers: {
    initializeInventory: (state) => {
      state.movements = loadInitial();
    },
    addMovement: (state, action) => {
      const newMov = {
        id: `MOV-2026-${String(state.movements.length + 1).padStart(3, "0")}`,
        date: new Date().toISOString(),
        performedBy: "Store Admin",
        ...action.payload,
      };
      state.movements.unshift(newMov);
      saveToStorage(state.movements);
    },
    resetInventory: (state) => {
      state.movements = initialStockMovements;
      saveToStorage(initialStockMovements);
    },
  },
});

export const { initializeInventory, addMovement, resetInventory } = inventorySlice.actions;
export default inventorySlice.reducer;

