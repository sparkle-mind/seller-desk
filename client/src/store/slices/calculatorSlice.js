import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "seller_desk_calculations";

const loadFromStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading calculations", e);
    }
  }
  return [];
};

const saveToStorage = (data) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving calculations", e);
    }
  }
};

const calculatorSlice = createSlice({
  name: "calculator",
  initialState: {
    saved: [],
  },
  reducers: {
    initializeCalculator: (state) => {
      state.saved = loadFromStorage();
    },
    saveCalculation: (state, action) => {
      const now = new Date().toISOString();
      state.saved.unshift({
        id: `CALC-${Date.now().toString(36).toUpperCase()}`,
        createdAt: now,
        updatedAt: now,
        ...action.payload,
      });
      saveToStorage(state.saved);
    },
    updateCalculation: (state, action) => {
      const idx = state.saved.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) {
        state.saved[idx] = {
          ...state.saved[idx],
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
        saveToStorage(state.saved);
      }
    },
    deleteCalculation: (state, action) => {
      state.saved = state.saved.filter((c) => c.id !== action.payload);
      saveToStorage(state.saved);
    },
    resetCalculator: (state) => {
      state.saved = [];
      saveToStorage([]);
    },
  },
});

export const {
  initializeCalculator,
  saveCalculation,
  updateCalculation,
  deleteCalculation,
  resetCalculator,
} = calculatorSlice.actions;
export default calculatorSlice.reducer;
