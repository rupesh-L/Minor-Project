import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "../redux/slice/authSlice/auth.slice.js";
import cartReducer from "../redux/slice/cartSlice/cartSlice.js";
import notificationReducer from "../redux/slice/notificationSlice/notificationSlice.js";

import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// 1️⃣ Combine reducers here
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  notification: notificationReducer,
});

// 2️⃣ Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "cart"],
};

// 3️⃣ Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4️⃣ Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
