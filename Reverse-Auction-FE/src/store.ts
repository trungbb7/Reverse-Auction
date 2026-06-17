import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/components/Auth/authSlice";
import chatReducer from "@/components/chat/chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
