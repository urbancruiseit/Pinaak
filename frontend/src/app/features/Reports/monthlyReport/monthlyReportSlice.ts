import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getLeadDistributionApi,
  getMonthlyEnquiryApi,
  LeadDistributionParams,
  MonthlyEnquiryRecord,
  AdviserDistributionRecord,
  getStatusWiseReportApi,
  TimeEnquiryRecord,
  TeamTotal,
  getTimeEnquiryApi,
  getStatusWiseDateReportApi,
  getLongWeekendReportApi,
  getMonthlyReportTwoApi,
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
  statusReport: {
    data: any[];
    teamTotal: any;
    month: number | null;
    year: number | null;
    loading: boolean;
    error: string | null;
  };
  timeEnquiry: {
    data: TimeEnquiryRecord[];
    year: number | null;
    loading: boolean;
    error: string | null;
  };
  statusDateReport: {
    data: any[];
    teamTotal: any;
    month: number | null;
    year: number | null;
    loading: boolean;
    error: string | null;
  };
  longWeekend: {
    data: any[];
    year: number | null;
    loading: boolean;
    error: string | null;
  };
    monthlyReportTwo: {  // ← Add this
    data: any[];
    year: number | null;
    loading: boolean;
    error: string | null;
  };
}

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
  statusReport: {
    data: [],
    teamTotal: {},
    month: null,
    year: null,
    loading: false,
    error: null,
  },
  timeEnquiry: {
    data: [],
    year: null,
    loading: false,
    error: null,
  },
  statusDateReport: {
    data: [],
    teamTotal: {},
    month: null,
    year: null,
    loading: false,
    error: null,
  },
  longWeekend: {
    data: [],
    year: null,
    loading: false,
    error: null,
  },
  monthlyReportTwo: {
    data: [],
    year: null,
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

export const fetchStatusWiseReport = createAsyncThunk(
  "report/fetchStatusWiseReport",
  async (
    params: { month?: number; year?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      return await getStatusWiseReportApi(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchTimeEnquiry = createAsyncThunk(
  "report/fetchTimeEnquiry",
  async (year: number, { rejectWithValue }) => {
    try {
      const response = await getTimeEnquiryApi(year);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchStatusWiseDateReport = createAsyncThunk(
  "report/fetchStatusWiseDateReport",
  async (
    params: {
      month?: number;
      year?: number;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      return await getStatusWiseDateReportApi(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchLongWeekendReport = createAsyncThunk(
  "report/fetchLongWeekendReport",
  async (year: number, { rejectWithValue }) => {
    try {
      return await getLongWeekendReportApi(year);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchMonthlyReportTwo = createAsyncThunk(
  "reportTwo/fetchMonthlyReportTwo",
  async (year: number, { rejectWithValue }) => {
    try {
      return await getMonthlyReportTwoApi(year);
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
    resetTimeEnquiry: (state) => {
      state.timeEnquiry = {
        data: [],
        year: null,
        loading: false,
        error: null,
      };
    },
    resetAllTimeEnquiry: (state) => {
      state.timeEnquiry.data = [];
      state.timeEnquiry.year = null;
      state.timeEnquiry.error = null;
      // Keep loading as false
    },
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
      })

      // Status Report
      .addCase(fetchStatusWiseReport.pending, (state) => {
        state.statusReport.loading = true;
        state.statusReport.error = null;
      })
      .addCase(fetchStatusWiseReport.fulfilled, (state, action) => {
        state.statusReport.loading = false;
        state.statusReport.data = action.payload.data;
        state.statusReport.teamTotal = action.payload.teamTotal;
        state.statusReport.month = action.payload.month;
        state.statusReport.year = action.payload.year;
      })
      .addCase(fetchStatusWiseReport.rejected, (state, action) => {
        state.statusReport.loading = false;
        state.statusReport.error = action.payload as string;
      })

      // Time Enquiry
      .addCase(fetchTimeEnquiry.pending, (state) => {
        state.timeEnquiry.loading = true;
        state.timeEnquiry.error = null;
      })
      .addCase(fetchTimeEnquiry.fulfilled, (state, action) => {
        state.timeEnquiry.loading = false;
        state.timeEnquiry.data = action.payload.data;
        state.timeEnquiry.year = action.payload.year;
      })
      .addCase(fetchTimeEnquiry.rejected, (state, action) => {
        state.timeEnquiry.loading = false;
        state.timeEnquiry.error = action.payload as string;
      })
      // Status Date Report
      .addCase(fetchStatusWiseDateReport.pending, (state) => {
        state.statusDateReport.loading = true;
        state.statusDateReport.error = null;
      })

      .addCase(fetchStatusWiseDateReport.fulfilled, (state, action) => {
        state.statusDateReport.loading = false;
        state.statusDateReport.data = action.payload.data;

        state.statusDateReport.teamTotal = action.payload.teamTotal;

        state.statusDateReport.month = action.payload.month;

        state.statusDateReport.year = action.payload.year;
      })

      .addCase(fetchStatusWiseDateReport.rejected, (state, action) => {
        state.statusDateReport.loading = false;
        state.statusDateReport.error = action.payload as string;
      })
      // Long Weekend Report
      .addCase(fetchLongWeekendReport.pending, (state) => {
        state.longWeekend.loading = true;
        state.longWeekend.error = null;
      })

      .addCase(fetchLongWeekendReport.fulfilled, (state, action) => {
        state.longWeekend.loading = false;

        state.longWeekend.data = action.payload.data;

        state.longWeekend.year = action.payload.year;
      })

      .addCase(fetchLongWeekendReport.rejected, (state, action) => {
        state.longWeekend.loading = false;

        state.longWeekend.error = action.payload as string;
      })
      .addCase(fetchMonthlyReportTwo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyReportTwo.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.year = action.payload.year;
      })
      .addCase(fetchMonthlyReportTwo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetMonthlyEnquiry, resetTimeEnquiry, resetAllTimeEnquiry } =
  monthlyReportSlice.actions;
export default monthlyReportSlice.reducer;
