import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  token: null,
  first_name: null,
  last_name: null,
  email: null,
  username: null,
};

const authReducer = createSlice({
  name: "authReducer",
  initialState,
  reducers: {
    login: (state, { payload }) => {
      state.id = payload.id;
      state.token = payload.token;
      state.email = payload.email;
      state.username = payload.username;
      state.first_name = payload.first_name;
      state.last_name = payload.last_name;
    },
    logout: (state) => {
      state.id = null;
      state.token = null;
      state.email = null;
      state.username = null;
      state.first_name = null;
      state.last_name = null;
    },
  },
});

export const { login, logout } = authReducer.actions;

export default authReducer.reducer;
