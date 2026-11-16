import { createSlice } from "@reduxjs/toolkit";
import { defaultSettings } from "@/data/settings";

const SETTINGS_KEY = "seller_desk_settings";

const loadFromStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading settings", e);
    }
  }
  return defaultSettings;
};

const saveToStorage = (data) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving settings", e);
    }
  }
};

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    data: defaultSettings,
  },
  reducers: {
    initializeSettings: (state) => {
      state.data = loadFromStorage();
    },
    updateSettings: (state, action) => {
      state.data = { ...state.data, ...action.payload };
      saveToStorage(state.data);
    },
    resetSettings: (state) => {
      state.data = defaultSettings;
      saveToStorage(defaultSettings);
    },
  },
});

export const { initializeSettings, updateSettings, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;

