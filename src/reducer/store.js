import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import formReducer from "./serviceReducer";
import formGlobal from "./serviceReducer";
import thunk from "redux-thunk";
import { findBase64ToObjectForRedux, findObjectToBase64ForRedux } from "../tools/tools";

const persistConfig = {
  key: "root",
  storage,
};

const saveToLocalStorage = async (state) => {
  try {
    const stateWithBase64 = await findBase64ToObjectForRedux(state); // استفاده از نسخه تبدیل شده
    const serializedState = JSON.stringify(stateWithBase64); // تبدیل شی‌ء به رشته JSON
    localStorage.setItem("reduxStateKioskSatrap", serializedState);
  } catch (err) {
    console.error("Error saving state to localStorage:", err);
  }
};

const reduxLocalStorage =
  ({ getState }) =>
  (next) =>
  (action) => {
    const result = next(action);
    const state = getState();
    saveToLocalStorage(state);
    return result;
  };

const persistedReducer = persistReducer(persistConfig, formGlobal);

const loadFromLocalStorage = async () => {
  try {
    const serializedState = localStorage.getItem("reduxStateKioskSatrap");
    if (serializedState === null) {
      return undefined;
    }
    let parserLocal = JSON.parse(serializedState);
    let temp = await findObjectToBase64ForRedux(parserLocal);
    return temp;
  } catch (err) {
    console.error("Error loading state from localStorage:", err);
    return undefined;
  }
};
const preloadedState = await loadFromLocalStorage();

export const store = configureStore({
  reducer: {
    session: formReducer,
    local: persistedReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  // middleware: [thunk],
  middleware: [reduxLocalStorage],
  preloadedState,
});

export const persistor = persistStore(store);
