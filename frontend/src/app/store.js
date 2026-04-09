import authReducer from "./authSlice";
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import { configureStore, combineReducers } from "@reduxjs/toolkit";

const createNoopStorage = () => ({
  getItem(_key) { return Promise.resolve(null); },
  setItem(_key, value) { return Promise.resolve(value); },
  removeItem(_key) { return Promise.resolve(); },
});

const storage = typeof window !== "undefined"
  ? {
      getItem: (key) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
    }
  : createNoopStorage();

// ✅ Persist only 'user' from auth slice, not isAuthenticated or isCheckingAuth
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user"],  // ← only this survives refresh
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer), 
});

export const store = configureStore({
  reducer: rootReducer,  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);