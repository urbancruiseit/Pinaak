import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { createDriverAPI, DriverFormData, DriverResponse } from "./driverApi";
import { baseApi } from "@/uitils/commonApi";

// ─── Thunks ───────────────────────────────────────────────────────────────

export const createDriverThunk = createAsyncThunk(
  "driver/createDriver",
  async (driverData: DriverFormData, { rejectWithValue }) => {
    try {
      console.log("Driver data received in thunk:", driverData);
      const response = await createDriverAPI(driverData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create driver");
    }
  }
);

// ✅ Get All Drivers (optional - if needed)
export const getDriversThunk = createAsyncThunk(
  "driver/getDrivers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseApi}/driver`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Get Drivers Response:", response.data);

      if (response.data?.data?.drivers) {
        return response.data.data.drivers;
      } else if (response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error("Get drivers error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch drivers"
      );
    }
  }
);

// ✅ Get Single Driver by ID (optional - if needed)
export const getDriverByIdThunk = createAsyncThunk(
  "driver/getDriverById",
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseApi}/driver/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Get Driver By ID Response:", response.data);

      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error("Get driver by ID error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch driver"
      );
    }
  }
);

// ─── State Interface ─────────────────────────────────────────────────────

interface DriverState {
  drivers: DriverResponse[];
  currentDriver: DriverResponse | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  isSuccess: boolean;
  driverId: number | null;
}

const initialState: DriverState = {
  drivers: [],
  currentDriver: null,
  loading: false,
  error: null,
  successMessage: null,
  isSuccess: false,
  driverId: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    resetSuccess: (state) => {
      state.successMessage = null;
      state.isSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentDriver: (state, action: PayloadAction<DriverResponse | null>) => {
      state.currentDriver = action.payload;
    },
    clearDriverState: (state) => {
      state.drivers = [];
      state.currentDriver = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
      state.isSuccess = false;
      state.driverId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Create Driver ──
      .addCase(createDriverThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
        state.isSuccess = false;
      })
      .addCase(createDriverThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers.push(action.payload);
        state.currentDriver = action.payload;
        state.driverId = action.payload.id;
        state.successMessage = action.payload.message || "Driver created successfully";
        state.isSuccess = true;
      })
      .addCase(createDriverThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isSuccess = false;
      })

      // ── Get All Drivers ──
      .addCase(getDriversThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDriversThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload;
        state.error = null;
      })
      .addCase(getDriversThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── Get Single Driver ──
      .addCase(getDriverByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDriverByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDriver = action.payload;
        state.error = null;
      })
      .addCase(getDriverByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSuccess, clearError, setCurrentDriver, clearDriverState } =
  driverSlice.actions;

export default driverSlice.reducer;