import { createSlice } from "@reduxjs/toolkit";
import { initialProducts } from "@/data/products";

const STORAGE_KEY = "seller_desk_products";

const loadInitial = () => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading products from localStorage", e);
    }
  }
  return initialProducts;
};

const saveToStorage = (data) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving products to localStorage", e);
    }
  }
};

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: initialProducts,
    isLoaded: false,
  },
  reducers: {
    initializeProducts: (state) => {
      state.items = loadInitial();
      state.isLoaded = true;
    },
    addProduct: (state, action) => {
      const newProd = {
        id: `PROD-${String(state.items.length + 1).padStart(3, "0")}`,
        createdAt: new Date().toISOString(),
        variants: [],
        ...action.payload,
      };
      state.items.unshift(newProd);
      saveToStorage(state.items);
    },
    updateProduct: (state, action) => {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
        saveToStorage(state.items);
      }
    },
    deleteProduct: (state, action) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
      saveToStorage(state.items);
    },
    adjustStock: (state, action) => {
      const { productId, newStock } = action.payload;
      const prod = state.items.find((p) => p.id === productId);
      if (prod) {
        prod.stock = Math.max(0, Number(newStock));
        saveToStorage(state.items);
      }
    },
    updateReorderLevel: (state, action) => {
      const { productId, reorderLevel } = action.payload;
      const prod = state.items.find((p) => p.id === productId);
      if (prod) {
        prod.reorderLevel = Math.max(1, Number(reorderLevel));
        saveToStorage(state.items);
      }
    },
    updateVariantStock: (state, action) => {
      const { productId, variantId, newStock } = action.payload;
      const prod = state.items.find((p) => p.id === productId);
      if (prod && prod.variants) {
        const variant = prod.variants.find((v) => v.id === variantId);
        if (variant) {
          variant.stock = Math.max(0, Number(newStock));
          // Recalculate total product stock as sum of variants
          prod.stock = prod.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
          saveToStorage(state.items);
        }
      }
    },
    resetProducts: (state) => {
      state.items = initialProducts;
      saveToStorage(initialProducts);
    },
  },
});

export const {
  initializeProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  updateReorderLevel,
  updateVariantStock,
  resetProducts,
} = productsSlice.actions;

export default productsSlice.reducer;

