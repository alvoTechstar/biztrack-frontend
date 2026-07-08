import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "hotelOrders",
  initialState: { orders: [], counter: 1 },
  reducers: {
    addOrder(state, action) {
      state.orders.push(action.payload);
      state.counter += 1;
    },
    // Replace entire orders list (used when fetching from backend on mount)
    setOrders(state, action) {
      state.orders = action.payload;
      // Keep counter above the highest existing order number
      const max = action.payload.reduce((n, o) => {
        const num = parseInt((o.id || "").replace(/\D/g, ""), 10);
        return isNaN(num) ? n : Math.max(n, num);
      }, state.counter);
      state.counter = max + 1;
    },
    // Store backend _id alongside the frontend order after a successful POST
    setBackendId(state, action) {
      const { frontendId, backendId } = action.payload;
      const order = state.orders.find((o) => o.id === frontendId);
      if (order) order.backendId = backendId;
    },
    updateOrderStatus(state, action) {
      const { id, status, paymentMethod } = action.payload;
      const order = state.orders.find((o) => o.id === id);
      if (order) {
        order.status = status;
        if (paymentMethod) order.paymentMethod = paymentMethod;
        order.updatedAt = new Date().toISOString();
      }
    },
    // Merge backend orders into Redux without wiping local-only changes
    mergeOrders(state, action) {
      const incoming = action.payload;
      incoming.forEach((bo) => {
        const idx = state.orders.findIndex(
          (o) => o.backendId === bo.backendId || o.id === bo.id
        );
        if (idx === -1) {
          state.orders.push(bo);
        } else {
          // Keep local status if it's ahead of backend status
          const statusPriority = {
            pending: 0, "in-progress": 1, ready: 2,
            served: 3, completed: 4, cancelled: 5,
          };
          const localAhead =
            (statusPriority[state.orders[idx].status] ?? 0) >
            (statusPriority[bo.status] ?? 0);
          state.orders[idx] = {
            ...bo,
            status: localAhead ? state.orders[idx].status : bo.status,
            paymentMethod: state.orders[idx].paymentMethod || bo.paymentMethod,
          };
        }
      });
      // Update counter
      const max = state.orders.reduce((n, o) => {
        const num = parseInt((o.id || "").replace(/\D/g, ""), 10);
        return isNaN(num) ? n : Math.max(n, num);
      }, state.counter);
      state.counter = Math.max(state.counter, max + 1);
    },
    removeOrder(state, action) {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
    },
  },
});

export const hotelOrderActions = { ...slice.actions };
export const hotelOrderReducer = slice.reducer;
