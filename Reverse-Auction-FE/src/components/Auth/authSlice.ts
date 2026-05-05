import { userService } from "@/services/userService";
import type { User, UserWithToken } from "@/types/user";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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
  logged: !!accessToken,
};

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.fetchUser();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

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
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = undefined;
      });
  },
});

export const { loginUser, logoutUser, updateUser } = authSlice.actions;
export default authSlice.reducer;
