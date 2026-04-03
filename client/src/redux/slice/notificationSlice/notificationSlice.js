import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  unreadCount: 0,
};

const slice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.unshift(action.payload);
      state.unreadCount += 1;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
      state.unreadCount = action.payload.length;
    },
    markAllRead: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const { addMessage, setMessages, markAllRead } = slice.actions;
export default slice.reducer;
