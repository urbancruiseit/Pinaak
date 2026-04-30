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

interface StatusCounts {
  NEW: number;
  KYC: number;
  RFQ: number;
  HOT: number;
  "VEH-N": number;
  LOST: number;
  BOOK: number;
}

interface AssignedLeadsState {
  leads: LeadRecord[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  selectedMonth: number;
  selectedYear: number;
  statusCounts: StatusCounts;
  totalLeads: number;
  monthlyStats: {
    month: string;
    monthName: string;
    year: number;
    leadCount: number;
  }[];
}

interface LeadStatusState {
  totalLeads: number;
  statusCount: StatusCounts;
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
  leadStatus: LeadStatusState;
}

// 🔹 Filters type (thunk argument)
interface FetchMyAssignedLeadsArgs {
  page?: number;
  cityIds?: number[];
  search?: string;
  month?: number | null;
  year?: number | null;
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
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear(),
    statusCounts: {
      NEW: 0,
      KYC: 0,
      RFQ: 0,
      HOT: 0,
      "VEH-N": 0,
      LOST: 0,
      BOOK: 0,
    },
    totalLeads: 0,
    monthlyStats: [],
  },

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
  }
);

//
// ✅ 3. My Assigned Leads (filters support)
//
export const fetchMyAssignedLeads = createAsyncThunk<
  AssignedLeadsResponse,
  FetchMyAssignedLeadsArgs,
  { rejectValue: string }
>(
  "access/fetchMyAssignedLeads",
  async ({ page = 1, cityIds, search, month, year }, { rejectWithValue }) => {
    try {
      return await getMyAssignedLeadsApi(page, { cityIds, search, month, year });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

//
// ✅ 4. My Lead Status Count
//
export const fetchMyLeadStatusCount = createAsyncThunk<
  { totalLeads: number; statusCount: StatusCounts },
  void,
  { rejectValue: string }
>("travelAdvisor/fetchMyLeadStatusCount", async (_, { rejectWithValue }) => {
  try {
    return await getMyLeadStatusCountApi();
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

//
// ✅ 5. Presales Lead Status Count
//
export const fetchPresalesLeadStatusCount = createAsyncThunk<
  { totalLeads: number; statusCount: StatusCounts },
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
  }
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
        const p = action.payload;
        state.assignedLeads.loading   = false;
        state.assignedLeads.leads     = p.leads;
        state.assignedLeads.page      = p.page;
        state.assignedLeads.total     = p.total;
        state.assignedLeads.totalPages   = p.totalPages;
        state.assignedLeads.hasNextPage  = p.hasNextPage;
        state.assignedLeads.selectedMonth = p.selectedMonth;
        state.assignedLeads.selectedYear  = p.selectedYear;
        state.assignedLeads.statusCounts  = p.statusCounts;
        state.assignedLeads.totalLeads    = p.totalLeads;
        state.assignedLeads.monthlyStats  = p.monthlyStats ?? [];
      })
      .addCase(fetchMyAssignedLeads.rejected, (state, action) => {
        state.assignedLeads.loading = false;
        state.assignedLeads.error = action.payload || "Failed to fetch assigned leads";
      })

      // 🔹 My Lead Status Count
      .addCase(fetchMyLeadStatusCount.pending, (state) => {
        state.leadStatus.loading = true;
        state.leadStatus.error = null;
      })
      .addCase(fetchMyLeadStatusCount.fulfilled, (state, action) => {
        state.leadStatus.loading = false;
        state.leadStatus.totalLeads  = action.payload.totalLeads;
        state.leadStatus.statusCount = action.payload.statusCount;
      })
      .addCase(fetchMyLeadStatusCount.rejected, (state, action) => {
        state.leadStatus.loading = false;
        state.leadStatus.error = action.payload || "Failed to fetch lead status count";
      })

      // 🔹 Presales Lead Status Count
      .addCase(fetchPresalesLeadStatusCount.pending, (state) => {
        state.leadStatus.loading = true;
        state.leadStatus.error = null;
      })
      .addCase(fetchPresalesLeadStatusCount.fulfilled, (state, action) => {
        state.leadStatus.loading = false;
        state.leadStatus.totalLeads  = action.payload.totalLeads;
        state.leadStatus.statusCount = action.payload.statusCount;
      })
      .addCase(fetchPresalesLeadStatusCount.rejected, (state, action) => {
        state.leadStatus.loading = false;
        state.leadStatus.error = action.payload || "Failed to fetch presales lead status count";
      });
  },
});

export const { resetAssignState } = travelAdvisorSlice.actions;
export default travelAdvisorSlice.reducer;