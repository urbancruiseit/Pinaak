import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getLeadDistributionApi,
  getMonthlyEnquiryApi,
  LeadDistributionParams,
  MonthlyEnquiryRecord,
  AdviserDistributionRecord,
  TeamTotal,
} from "./monthlyReportApi";

interface MonthlyEnquiryState {
  data: MonthlyEnquiryRecord[];
  year: number | null;
  loading: boolean;
  error: string | null;

  distribution: {
    data: AdviserDistributionRecord[];
    teamTotal: TeamTotal | null;
    month: number | null;
    year: number | null;
    totalDaysInMonth: number;
    loading: boolean;
    error: string | null;
  };
}

// ✅ FIXED initial state
const initialState: MonthlyEnquiryState = {
  data: [],
  year: null,
  loading: false,
  error: null,

  distribution: {
    data: [],
    teamTotal: null,
    month: null,
    year: null,
    totalDaysInMonth: 0,
    loading: false,
    error: null,
  },
};

// ─── Thunks ──────────────────────────────────────────────────────────

export const fetchMonthlyEnquiry = createAsyncThunk(
  "report/fetchMonthlyEnquiry",
  async (year: number, { rejectWithValue }) => {
    try {
      return await getMonthlyEnquiryApi(year);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchLeadDistribution = createAsyncThunk(
  "report/fetchLeadDistribution",
  async (params: LeadDistributionParams = {}, { rejectWithValue }) => {
    try {
      return await getLeadDistributionApi(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── Slice ───────────────────────────────────────────────────────────

const monthlyReportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    resetMonthlyEnquiry: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Monthly
      .addCase(fetchMonthlyEnquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyEnquiry.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.year = action.payload.year;
      })
      .addCase(fetchMonthlyEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Distribution
      .addCase(fetchLeadDistribution.pending, (state) => {
        state.distribution.loading = true;
        state.distribution.error = null;
      })
      .addCase(fetchLeadDistribution.fulfilled, (state, action) => {
        state.distribution.loading = false;
        state.distribution.data = action.payload.data;
        state.distribution.teamTotal = action.payload.teamTotal;
        state.distribution.month = action.payload.month;
        state.distribution.year = action.payload.year;
        state.distribution.totalDaysInMonth = action.payload.totalDaysInMonth;
      })
      .addCase(fetchLeadDistribution.rejected, (state, action) => {
        state.distribution.loading = false;
        state.distribution.error = action.payload as string;
      });
  },
});

export const { resetMonthlyEnquiry } = monthlyReportSlice.actions;
export default monthlyReportSlice.reducer;
