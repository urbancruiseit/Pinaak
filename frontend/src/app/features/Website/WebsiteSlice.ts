import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../../redux/store";

import {
  getTripBookingByIdApi,
  getTripBookingsApi,
  getWebsiteGacApi,
  getWebsiteGacByIdApi,
  TripBookingRecord,
  WebsiteGacRecord,
} from "./websiteApi";

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────

interface WebsiteGacState {
  data: WebsiteGacRecord[];
  tripBookings: TripBookingRecord[];

  count: number;
  loading: boolean;
  error: string | null;

  selected: {
    data: WebsiteGacRecord | TripBookingRecord | null;
    loading: boolean;
    error: string | null;
  };
}

const initialState: WebsiteGacState = {
  data: [],
  tripBookings: [],

  count: 0,
  loading: false,
  error: null,

  selected: {
    data: null,
    loading: false,
    error: null,
  },
};

// ─────────────────────────────────────────────
// THUNKS
// ─────────────────────────────────────────────

// WEBSITE GAC
export const getWebsiteGacThunk = createAsyncThunk(
  "websiteGac/getAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getWebsiteGacApi();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const getWebsiteGacByIdThunk = createAsyncThunk(
  "websiteGac/getById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getWebsiteGacByIdApi(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// TRIP BOOKINGS
export const getTripBookingsThunk = createAsyncThunk(
  "tripBookings/getAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getTripBookingsApi();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const getTripBookingByIdThunk = createAsyncThunk(
  "tripBookings/getById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await getTripBookingByIdApi(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const websiteGacSlice = createSlice({
  name: "websiteGac",
  initialState,
  reducers: {
    resetWebsiteGac: () => initialState,

    clearSelected: (state) => {
      state.selected.data = null;
      state.selected.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ───────── WEBSITE GAC ─────────
      .addCase(getWebsiteGacThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWebsiteGacThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.count = action.payload.count;
      })
      .addCase(getWebsiteGacThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ───────── WEBSITE GAC BY ID ─────────
      .addCase(getWebsiteGacByIdThunk.pending, (state) => {
        state.selected.loading = true;
        state.selected.error = null;
      })
      .addCase(getWebsiteGacByIdThunk.fulfilled, (state, action) => {
        state.selected.loading = false;
        state.selected.data = action.payload.data;
      })
      .addCase(getWebsiteGacByIdThunk.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.error = action.payload as string;
      })

      // ───────── TRIP BOOKINGS ─────────
      .addCase(getTripBookingsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTripBookingsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.tripBookings = action.payload.data;
      })
      .addCase(getTripBookingsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ───────── TRIP BOOKING BY ID ─────────
      .addCase(getTripBookingByIdThunk.pending, (state) => {
        state.selected.loading = true;
        state.selected.error = null;
      })
      .addCase(getTripBookingByIdThunk.fulfilled, (state, action) => {
        state.selected.loading = false;
        state.selected.data = action.payload.data;
      })
      .addCase(getTripBookingByIdThunk.rejected, (state, action) => {
        state.selected.loading = false;
        state.selected.error = action.payload as string;
      });
  },
});

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

export const { resetWebsiteGac, clearSelected } = websiteGacSlice.actions;

export default websiteGacSlice.reducer;

// ─────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────

export const selectGacList = (state: RootState) => state.websiteGac?.data ?? [];

export const selectTripBookings = (state: RootState) =>
  state.websiteGac?.tripBookings ?? [];

export const selectSelected = (state: RootState) =>
  state.websiteGac?.selected.data ?? null;

export const selectLoading = (state: RootState) =>
  state.websiteGac?.loading ?? false;

export const selectError = (state: RootState) =>
  state.websiteGac?.error ?? null;
