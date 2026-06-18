import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types";

interface UserState { user: User | null; isAuthenticated: boolean; isVerified: boolean }

const userSlice = createSlice({
  name: "user",
  initialState: { user: null, isAuthenticated: false, isVerified: false } as UserState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => { state.user = action.payload; state.isAuthenticated = true; },
    setVerified: (state, action: PayloadAction<boolean>) => { state.isVerified = action.payload; },
    logout: (state) => { state.user = null; state.isAuthenticated = false; state.isVerified = false; },
  },
});

export const { setUser, setVerified, logout } = userSlice.actions;
export default userSlice.reducer;
export const selectUser = (s: { user: UserState }) => s.user.user;
export const selectIsAuthenticated = (s: { user: UserState }) => s.user.isAuthenticated;
