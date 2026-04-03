// features/cart/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // { book, quantity }
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items;
      state.totalPrice = action.payload.totalPrice;
    },
    updateCart: (state, action) => {
      state.items = action.payload.items;
      state.totalPrice = action.payload.totalPrice;
    },
    clearCart: (state, action) => {
      (state.items = []), (state.totalPrice = 0);
    },
  },
});

export const { setCart, updateCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
