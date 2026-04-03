import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
    },
    signInFailure: (state) => {
      state.loading = false;
    },
    signInSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    signOutStart: (state) => {
      state.loading = true;
    },
    signOutFailure: (state) => {
      state.loading = false;
    },
    signOutSuccess: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
    },
    updateStart: (state) => {
      state.loading = true;
    },
    updateFailure: (state) => {
      state.loading = false;
    },
    updateSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.user = action.payload;
    },
  },
});

export const {
  signInStart,
  signInFailure,
  signInSuccess,
  signOutStart,
  signOutFailure,
  signOutSuccess,
  updateStart,
  updateFailure,
  updateSuccess,
  hydrateSuccess,
} = authSlice.actions;

export default authSlice.reducer;
