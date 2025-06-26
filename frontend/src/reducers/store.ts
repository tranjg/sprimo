import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth.reducer";

export const store = configureStore({
  reducer: {
    authReducer
  }
})
