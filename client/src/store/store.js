import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productsSlice";
import inventoryReducer from "./slices/inventorySlice";
import ordersReducer from "./slices/ordersSlice";
import shippingReturnsReducer from "./slices/shippingReturnsSlice";
import suppliersPurchasesReducer from "./slices/suppliersPurchasesSlice";
import financeReducer from "./slices/financeSlice";
import settingsReducer from "./slices/settingsSlice";
import notificationsReducer from "./slices/notificationsSlice";
import calculatorReducer from "./slices/calculatorSlice";
import { syncListener } from "./syncListeners";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    inventory: inventoryReducer,
    orders: ordersReducer,
    shippingReturns: shippingReturnsReducer,
    suppliersPurchases: suppliersPurchasesReducer,
    finance: financeReducer,
    settings: settingsReducer,
    notifications: notificationsReducer,
    calculator: calculatorReducer,
  },
  // Cross-feature rules (orders <-> stock <-> shipments <-> returns, alerts)
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(syncListener.middleware),
});

