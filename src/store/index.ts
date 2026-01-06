import { configureStore } from "@reduxjs/toolkit";
import revenueReducer from "./revenue";
import categoryReducer from "./category";
import authReducer from "./auth";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    revenue: revenueReducer,
    categories: categoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => store.dispatch as AppDispatch;