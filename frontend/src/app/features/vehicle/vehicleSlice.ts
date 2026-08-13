import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Vehicle } from "@/types/types";
import {
  getVehiclesApi,
  createvehiclesApi,
  getAllVehiclesApi,
  PaginatedVehicles,
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
      });
  },
});

export default vehicleSlice.reducer;
