import { createSlice } from "@reduxjs/toolkit";
import { buildInitialNotifications } from "@/data/notifications";

const STORAGE_KEY = "seller_desk_notifications";

const loadInitial = () => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading notifications from localStorage", e);
    }
  }
  return buildInitialNotifications();
};

const saveToStorage = (data) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving notifications to localStorage", e);
    }
  }
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
  },
  reducers: {
    initializeNotifications: (state) => {
      state.items = loadInitial();
    },
    markNotificationRead: (state, action) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.read) {
        item.read = true;
        saveToStorage(state.items);
      }
    },
    toggleNotificationRead: (state, action) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) {
        item.read = !item.read;
        saveToStorage(state.items);
      }
    },
    markAllNotificationsRead: (state) => {
      state.items.forEach((n) => {
        n.read = true;
      });
      saveToStorage(state.items);
    },
    deleteNotification: (state, action) => {
      state.items = state.items.filter((n) => n.id !== action.payload);
      saveToStorage(state.items);
    },
    clearReadNotifications: (state) => {
      state.items = state.items.filter((n) => !n.read);
      saveToStorage(state.items);
    },
    // Raised by the sync layer when something happens in the app
    pushNotification: (state, action) => {
      state.items.unshift({
        id: `NTF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        priority: "normal",
        createdAt: new Date().toISOString(),
        read: false,
        ...action.payload,
      });
      // Keep the feed bounded
      if (state.items.length > 100) state.items.length = 100;
      saveToStorage(state.items);
    },
    resetNotifications: (state) => {
      state.items = buildInitialNotifications();
      saveToStorage(state.items);
    },
  },
});

export const selectUnreadCount = (state) =>
  state.notifications.items.filter((n) => !n.read).length;

export const {
  initializeNotifications,
  markNotificationRead,
  toggleNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearReadNotifications,
  pushNotification,
  resetNotifications,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
