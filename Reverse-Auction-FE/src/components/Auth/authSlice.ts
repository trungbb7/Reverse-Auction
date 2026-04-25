import type { User, UserWithToken } from "@/types/user";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  logged: boolean;
}

const accessToken = localStorage.getItem("accessToken") || "";
const refreshToken = localStorage.getItem("refreshToken") || "";

const initialState: AuthState = {
  accessToken,
  refreshToken,
  logged: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<UserWithToken>) => {
      const payload = action.payload;
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      state.logged = true;

      localStorage.setItem("accessToken", payload.accessToken || "");
      localStorage.setItem("refreshToken", payload.refreshToken || "");
    },
    logoutUser: (state) => {
      state.user = undefined;
      state.logged = false;
      state.accessToken = undefined;
      state.refreshToken = undefined;

      localStorage.setItem("accessToken", "");
      localStorage.setItem("refreshToken", "");
    },
  },
});

export const { loginUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
