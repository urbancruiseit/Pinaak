import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Vehicle } from "@/types/types";
import {
  getVehiclesApi,
  createvehiclesApi,
  getAllVehiclesApi,
  PaginatedVehicles,
  getSeatOptionsApi,
} from "./vehicleApi";

interface VehicleState {
  vehicleCodes: Vehicle[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  createError: string | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  seatOptions: string[];
  seatOptionsLoading: boolean;
  seatOptionsError: string | null;
}

const initialState: VehicleState = {
  vehicleCodes: [],
  loading: false,
  error: null,
  creating: false,
  createError: null,
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  seatOptions: [],
  seatOptionsLoading: false,
  seatOptionsError: null,
};

export const fetchVehicles = createAsyncThunk(
  "vehicle/fetchVehicles",
  async (_, { rejectWithValue }) => {
    try {
      return await getVehiclesApi();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const createVehicle = createAsyncThunk(
  "vehicle/createVehicle",
  async (vehicleData: Vehicle, { rejectWithValue }) => {
    try {
      return await createvehiclesApi(vehicleData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const vehicleslice = createAsyncThunk(
  "vehicle/vehicleslice",
  async (
    params:
      | {
          search?: string;
          category?: string;
          make?: string;
          seat?: string; // ✅ add kiya
          variant?: string; // ✅ add kiya
          page?: number;
          limit?: number;
        }
      | undefined,
    { rejectWithValue },
  ) => {
    try {
      const data: PaginatedVehicles = await getAllVehiclesApi(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchSeatOptions = createAsyncThunk(
  "vehicle/fetchSeatOptions",
  async (_, { rejectWithValue }) => {
    try {
      return await getSeatOptionsApi();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);
const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleCodes = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createVehicle.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.creating = false;
        state.vehicleCodes.unshift(action.payload);
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload as string;
      })
      .addCase(vehicleslice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(vehicleslice.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleCodes = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(vehicleslice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSeatOptions.pending, (state) => {
        state.seatOptionsLoading = true;
        state.seatOptionsError = null;
      })
      .addCase(fetchSeatOptions.fulfilled, (state, action) => {
        state.seatOptionsLoading = false;
        state.seatOptions = action.payload;
      })
      .addCase(fetchSeatOptions.rejected, (state, action) => {
        state.seatOptionsLoading = false;
        state.seatOptionsError = action.payload as string;
      });
  },
});

export default vehicleSlice.reducer;
