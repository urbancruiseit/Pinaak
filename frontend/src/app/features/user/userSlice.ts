import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/types";
import { currentUser, loginUser } from "./userApi";

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  createdUser?: User | null;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
  createdUser: null,
};

export const loginUserThunk = createAsyncThunk<
  User,
  { username: string; password: string }
>("user/login", async (loginData, { rejectWithValue }) => {
  try {
    const user = await loginUser(loginData);
    return user;
  } catch (error: any) {
    return rejectWithValue(error.message || "Login failed");
  }
});

export const currentUserThunk = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("user/current", async (_, { rejectWithValue }) => {
  try {
    const user = await currentUser();
    return user;
  } catch (error: any) {
    return rejectWithValue(error.message || "Unauthorized");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login user
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUserThunk.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.currentUser = action.payload;
        },
      )
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Current user
      .addCase(currentUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        currentUserThunk.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.currentUser = action.payload;
        },
      )
      .addCase(currentUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.currentUser = null;
        state.error = action.payload || null;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
