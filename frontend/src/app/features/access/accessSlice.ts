import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  AssignedLeadsResponse,
  assignTravelAdvisorApi,
  getMyAssignedLeadsApi,
  getMyLeadStatusCountApi,
  getPresalesLeadStatusCountApi,
  getTravelAdvisorsByCityApi,
} from "./accessApi";
import type { LeadRecord } from "@/types/types";

// 🔹 Types
interface TravelAdvisor {
  id: number;
  fullName: string;
}

interface AssignedLeadsState {
  leads: LeadRecord[];
  loading: boolean;
  error: string | null;
  page: number;
  monthlyStats: {
    month: string;
    monthName: string;
    year: number;
    leadCount: number;
  }[];
}

interface StatusCount {
  NEW: number;
  KYC: number;
  RFQ: number;
  HOT: number;
  "VEH-N": number;
  LOST: number;
  BOOK: number;
}

interface LeadStatusState {
  totalLeads: number;
  statusCount: StatusCount;
  loading: boolean;
  error: string | null;
}

interface TravelAdvisorState {
  advisors: TravelAdvisor[];
  loading: boolean;
  error: string | null;

  assignLoading: boolean;
  assignSuccess: boolean;

  assignedLeads: AssignedLeadsState;

  // ❗ Missing tha (fix)
  leadStatus: LeadStatusState;
}

// 🔹 Initial State
const initialState: TravelAdvisorState = {
  advisors: [],
  loading: false,
  error: null,

  assignLoading: false,
  assignSuccess: false,

  assignedLeads: {
    leads: [],
    loading: false,
    error: null,
    page: 1,
    monthlyStats: [],
  },

  // ❗ add kiya
  leadStatus: {
    totalLeads: 0,
    statusCount: {
      NEW: 0,
      KYC: 0,
      RFQ: 0,
      HOT: 0,
      "VEH-N": 0,
      LOST: 0,
      BOOK: 0,
    },
    loading: false,
    error: null,
  },
};

//
// ✅ 1. Fetch Advisors
//
export const fetchTravelAdvisors = createAsyncThunk<
  TravelAdvisor[],
  number,
  { rejectValue: string }
>("travelAdvisor/fetchByCity", async (cityId, { rejectWithValue }) => {
  try {
    return await getTravelAdvisorsByCityApi(cityId);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

//
// ✅ 2. Assign Advisor
//
export const assignTravelAdvisor = createAsyncThunk<
  { success: boolean; leadId: number; travelAdvisorId: number },
  { leadId: number; travelAdvisorId: number },
  { rejectValue: string }
>(
  "travelAdvisor/assign",
  async ({ leadId, travelAdvisorId }, { rejectWithValue }) => {
    try {
      return await assignTravelAdvisorApi(leadId, travelAdvisorId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

//
// ✅ 3. My Assigned Leads
//
export const fetchMyAssignedLeads = createAsyncThunk<
  AssignedLeadsResponse,
  number,
  { rejectValue: string }
>("access/fetchMyAssignedLeads", async (page, { rejectWithValue }) => {
  try {
    return await getMyAssignedLeadsApi(page);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

//
// ❗ FIX: syntax error tha yahan
//
export const fetchMyLeadStatusCount = createAsyncThunk<
  { totalLeads: number; statusCount: StatusCount },
  void,
  { rejectValue: string }
>("travelAdvisor/fetchMyLeadStatusCount", async (_, { rejectWithValue }) => {
  try {
    return await getMyLeadStatusCountApi();
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchPresalesLeadStatusCount = createAsyncThunk<
  { totalLeads: number; statusCount: StatusCount },
  void,
  { rejectValue: string }
>(
  "travelAdvisor/fetchPresalesLeadStatusCount",
  async (_, { rejectWithValue }) => {
    try {
      return await getPresalesLeadStatusCountApi();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

//
// 🔹 Slice
//
const travelAdvisorSlice = createSlice({
  name: "travelAdvisor",
  initialState,
  reducers: {
    resetAssignState: (state) => {
      state.assignSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder

      // 🔹 Fetch Advisors
      .addCase(fetchTravelAdvisors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTravelAdvisors.fulfilled, (state, action) => {
        state.loading = false;
        state.advisors = action.payload;
      })
      .addCase(fetchTravelAdvisors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch advisors";
      })

      // 🔹 Assign Advisor
      .addCase(assignTravelAdvisor.pending, (state) => {
        state.assignLoading = true;
        state.assignSuccess = false;
      })
      .addCase(assignTravelAdvisor.fulfilled, (state) => {
        state.assignLoading = false;
        state.assignSuccess = true;
      })
      .addCase(assignTravelAdvisor.rejected, (state, action) => {
        state.assignLoading = false;
        state.error = action.payload || "Failed to assign advisor";
      })

      // 🔹 My Assigned Leads
      .addCase(fetchMyAssignedLeads.pending, (state) => {
        state.assignedLeads.loading = true;
        state.assignedLeads.error = null;
      })
      .addCase(fetchMyAssignedLeads.fulfilled, (state, action) => {
        state.assignedLeads.loading = false;
        state.assignedLeads.leads = action.payload.leads;
        state.assignedLeads.page = action.payload.totalPages;
        state.assignedLeads.monthlyStats = action.payload.monthlyStats ?? [];
      })
      .addCase(fetchMyAssignedLeads.rejected, (state, action) => {
        state.assignedLeads.loading = false;
        state.assignedLeads.error =
          action.payload || "Failed to fetch assigned leads";
      })

      // 🔹 Lead Status Count
      .addCase(fetchMyLeadStatusCount.pending, (state) => {
        state.leadStatus.loading = true;
        state.leadStatus.error = null;
      })
      .addCase(fetchMyLeadStatusCount.fulfilled, (state, action) => {
        state.leadStatus.loading = false;
        state.leadStatus.totalLeads = action.payload.totalLeads;
        state.leadStatus.statusCount = action.payload.statusCount;
      })
      .addCase(fetchMyLeadStatusCount.rejected, (state, action) => {
        state.leadStatus.loading = false;
        state.leadStatus.error =
          action.payload || "Failed to fetch lead status count";
      })
      .addCase(fetchPresalesLeadStatusCount.pending, (state) => {
        state.leadStatus.loading = true;
        state.leadStatus.error = null;
      })
      .addCase(fetchPresalesLeadStatusCount.fulfilled, (state, action) => {
        state.leadStatus.loading = false;
        state.leadStatus.totalLeads = action.payload.totalLeads;
        state.leadStatus.statusCount = action.payload.statusCount;
      })
      .addCase(fetchPresalesLeadStatusCount.rejected, (state, action) => {
        state.leadStatus.loading = false;
        state.leadStatus.error =
          action.payload || "Failed to fetch presales lead status count";
      });
  },
});

export const { resetAssignState } = travelAdvisorSlice.actions;
export default travelAdvisorSlice.reducer;
