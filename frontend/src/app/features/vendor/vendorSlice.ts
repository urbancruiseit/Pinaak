import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios"; // ✅ Add axios import
import {
  createVendorAPI,
  updateVendorAPI,
  VendorFormData,
  VendorResponse,
} from "./vendorApi";
import { baseApi } from "@/uitils/commonApi";

// ─── Thunks ───────────────────────────────────────────────────────────────

export const createVendorThunk = createAsyncThunk(
  "vendor/createVendor",
  async (vendorData: VendorFormData, { rejectWithValue }) => {
    try {
      console.log("Vendor data received in thunk:", vendorData);
      const response = await createVendorAPI(vendorData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create vendor");
    }
  },
);

export const updateVendorThunk = createAsyncThunk(
  "vendor/updateVendor",
  async (
    { id, vendorData }: { id: number; vendorData: VendorFormData },
    { rejectWithValue },
  ) => {
    try {
      const response = await updateVendorAPI(id, vendorData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update vendor");
    }
  },
);

// ✅ Get All Vendors
// ✅ Get All Vendors
export const getVendorsThunk = createAsyncThunk(
  "vendor/getVendors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseApi}/vendor`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Get Vendors Response:", response.data);

      // Handle different response structures
      if (response.data?.data?.vendors) {
        return response.data.data.vendors;
      } else if (response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error("Get vendors error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vendors",
      );
    }
  },
);
export const getVendorByIdThunk = createAsyncThunk(
  "vendor/getVendorById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseApi}/vendor/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Get Vendor By ID Response:", response.data);

      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error("Get vendor by ID error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vendor",
      );
    }
  },
);

// ─── State Interface ─────────────────────────────────────────────────────

interface VendorState {
  vendors: VendorResponse[];
  currentVendor: VendorResponse | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  isSuccess: boolean;
  vendorId: number | null;
}

const initialState: VendorState = {
  vendors: [],
  currentVendor: null,
  loading: false,
  error: null,
  successMessage: null,
  isSuccess: false,
  vendorId: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    resetSuccess: (state) => {
      state.successMessage = null;
      state.isSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentVendor: (state, action: PayloadAction<VendorResponse | null>) => {
      state.currentVendor = action.payload;
    },
    clearVendorState: (state) => {
      state.vendors = [];
      state.currentVendor = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
      state.isSuccess = false;
      state.vendorId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Create Vendor ──
      .addCase(createVendorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
        state.isSuccess = false;
      })
      .addCase(createVendorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors.push(action.payload);
        state.currentVendor = action.payload;
        state.vendorId = action.payload.id;
        state.successMessage =
          action.payload.message || "Vendor created successfully";
        state.isSuccess = true;
      })
      .addCase(createVendorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isSuccess = false;
      })

      // ── Update Vendor ──
      .addCase(updateVendorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
        state.isSuccess = false;
      })
      .addCase(updateVendorThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vendors.findIndex(
          (v) => v.id === action.payload.id,
        );
        if (index !== -1) {
          state.vendors[index] = action.payload;
        }
        state.currentVendor = action.payload;
        state.successMessage = "Vendor updated successfully";
        state.isSuccess = true;
      })
      .addCase(updateVendorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isSuccess = false;
      })

      // ── Get All Vendors ──
      .addCase(getVendorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVendorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
        state.error = null;
      })
      .addCase(getVendorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── Get Single Vendor ──
      .addCase(getVendorByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVendorByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVendor = action.payload;
        state.error = null;
      })
      .addCase(getVendorByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSuccess, clearError, setCurrentVendor, clearVendorState } =
  vendorSlice.actions;

export default vendorSlice.reducer;
