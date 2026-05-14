import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createDsrApi, updateDsrApi } from "./dsrApi";

interface DsrState {
  currentDsr: Record<string, any> | null;
  createLoading: boolean;
  updateLoading: boolean;
  createError: string | null;
  updateError: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
}

const initialState: DsrState = {
  currentDsr: null,
  createLoading: false,
  updateLoading: false,
  createError: null,
  updateError: null,
  createSuccess: false,
  updateSuccess: false,
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
export const createDsr = createAsyncThunk(
  "dsr/createDsr",
  async (dsrData: Record<string, any>, { rejectWithValue }) => {
    try {
      return await createDsrApi(dsrData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export const updateDsr = createAsyncThunk(
  "dsr/updateDsr",
  async (
    { id, data }: { id: string; data: Record<string, any> },
    { rejectWithValue },
  ) => {
    try {
      return await updateDsrApi(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const dsrSlice = createSlice({
  name: "dsr",
  initialState,
  reducers: {
    resetCreateState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;
    },
    resetUpdateState: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
    resetAllStates: (state) => {
      state.createLoading = false;
      state.updateLoading = false;
      state.createError = null;
      state.updateError = null;
      state.createSuccess = false;
      state.updateSuccess = false;
    },
    clearCurrentDsr: (state) => {
      state.currentDsr = null;
    },
    setCurrentDsr: (
      state,
      action: PayloadAction<Record<string, any> | null>,
    ) => {
      state.currentDsr = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDsr.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createDsr.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.currentDsr = action.payload;
      })
      .addCase(createDsr.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
        state.createSuccess = false;
      })
      .addCase(updateDsr.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateDsr.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.currentDsr = action.payload;
      })
      .addCase(updateDsr.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
        state.updateSuccess = false;
      });
  },
});

export const {
  resetCreateState,
  resetUpdateState,
  resetAllStates,
  clearCurrentDsr,
  setCurrentDsr,
} = dsrSlice.actions;

export default dsrSlice.reducer;

