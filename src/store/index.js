import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./auth.slice";
import { hotelOrderReducer } from "./hotel-orders.slice";

export * from "./auth.slice";
export * from "./hotel-orders.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hotelOrders: hotelOrderReducer,
  },
});
