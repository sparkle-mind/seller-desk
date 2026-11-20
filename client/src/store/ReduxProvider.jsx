"use client";

import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store";
import { initializeProducts } from "./slices/productsSlice";
import { initializeInventory } from "./slices/inventorySlice";
import { initializeOrders } from "./slices/ordersSlice";
import { initializeShippingReturns } from "./slices/shippingReturnsSlice";
import { initializeSuppliersPurchases } from "./slices/suppliersPurchasesSlice";
import { initializeFinance } from "./slices/financeSlice";
import { initializeSettings } from "./slices/settingsSlice";
import { initializeNotifications } from "./slices/notificationsSlice";

function StoreInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Safely initialize data from localStorage on client
    dispatch(initializeProducts());
    dispatch(initializeInventory());
    dispatch(initializeOrders());
    dispatch(initializeShippingReturns());
    dispatch(initializeSuppliersPurchases());
    dispatch(initializeFinance());
    dispatch(initializeSettings());
    dispatch(initializeNotifications());
  }, [dispatch]);

  return <>{children}</>;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <StoreInitializer>{children}</StoreInitializer>
    </Provider>
  );
}

