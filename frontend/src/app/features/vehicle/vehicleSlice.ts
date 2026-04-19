import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Vehicle } from "@/types/types";
import { getVehiclesApi } from "./vehicleApi";

interface VehicleState {
  vehicleCodes: Vehicle[];
  loading: boolean;
  error: string | null;
}

const initialState: VehicleState = {
  vehicleCodes: [],
  loading: false,
  error: null,
};

export const fetchVehicles = createAsyncThunk(
  "vehicle/fetchVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getVehiclesApi();
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
      });
  },
});

export default vehicleSlice.reducer;