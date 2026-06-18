import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  AssignedLeadsResponse,
  assignTravelAdvisorApi,
  getMyAssignedLeadsApi,
  getMyLeadStatusCountApi,
  getPresalesLeadStatusCountApi,
  getTravelAdvisorsByCityApi,
  swapTravelAdvisorApi,
  getMySwapLeadsApi,
  ZoneAdvisor,
} from "./accessApi";

import type { LeadRecord } from "@/types/types";

//
// 🔹 Types
//
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
  selectedStatus: string | null;

  statusCounts: StatusCounts;
  totalLeads: number;

  monthlyStats: {
    month: string;
    monthName: string;
    year: number;
    leadCount: number;
  }[];

  zonesAdvisors: ZoneAdvisor[];
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

export interface SwapLeadsResponse {
  success: boolean;
  leadId: number;
  travelAdvisorId: number;
}

interface FetchMyAssignedLeadsArgs {
  page?: number;
  cityIds?: number[];
  search?: string;
  month?: number | null;
  year?: number | null;
  status?: string | null;
  advisorId?: number | null;
  zoneId?: number | null;
  ageFilter?: string | null; // ✅ ADD
  liveorexpiry?: string | null; // ✅ ADD
}

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
    selectedStatus: null,

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
    zonesAdvisors: [],
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
// 🔹 Fetch Travel Advisors
//
export const fetchTravelAdvisors = createAsyncThunk<
  TravelAdvisor[],
  number,
  { rejectValue: string }
>("travelAdvisor/fetchByCity", async (cityId, { rejectWithValue }) => {
  try {
    return await getTravelAdvisorsByCityApi(cityId);
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to fetch advisors");
  }
});

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
      return rejectWithValue(error?.message || "Failed to assign advisor");
    }
  },
);

export const swapTravelAdvisor = createAsyncThunk<
  SwapLeadsResponse,
  {
    leadId: number;
    travelAdvisorId: number;
  },
  { rejectValue: string }
>(
  "travelAdvisor/swap",
  async ({ leadId, travelAdvisorId }, { rejectWithValue }) => {
    try {
      const response = await swapTravelAdvisorApi(leadId, travelAdvisorId);

      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to swap advisor");
    }
  },
);

export const fetchMyAssignedLeads = createAsyncThunk<
  AssignedLeadsResponse,
  FetchMyAssignedLeadsArgs,
  { rejectValue: string }
>(
  "access/fetchMyAssignedLeads",
  async (
    {
      page = 1,
      cityIds,
      zoneId,
      search,
      month,
      year,
      advisorId,
      status,
      ageFilter,
      liveorexpiry, // ✅ ADD
    },
    { rejectWithValue },
  ) => {
    try {
      return await getMyAssignedLeadsApi(page, {
        cityIds,
        zoneId,
        search,
        month,
        year,
        advisorId,
        status,
        ageFilter, // ✅
        liveorexpiry, // ✅ ADD
      });
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch assigned leads",
      );
    }
  },
);

export const fetchMySwapLeads = createAsyncThunk<
  AssignedLeadsResponse,
  FetchMyAssignedLeadsArgs,
  { rejectValue: string }
>(
  "access/fetchMySwapLeads",
  async (
    { page = 1, cityIds, search, month, year, advisorId, status },
    { rejectWithValue },
  ) => {
    try {
      return await getMySwapLeadsApi(page, {
        cityIds,
        search,
        month,
        year,
        advisorId,
        status,
      });
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch swap leads");
    }
  },
);

//
// 🔹 My Lead Status Count
//
export const fetchMyLeadStatusCount = createAsyncThunk<
  { totalLeads: number; statusCount: StatusCounts },
  void,
  { rejectValue: string }
>("travelAdvisor/fetchMyLeadStatusCount", async (_, { rejectWithValue }) => {
  try {
    return await getMyLeadStatusCountApi();
  } catch (error: any) {
    return rejectWithValue(error?.message);
  }
});

//
// 🔹 Presales Lead Status Count
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
      return rejectWithValue(error?.message);
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

    setAssignedStatus: (state, action) => {
      state.assignedLeads.selectedStatus = action.payload;
      state.assignedLeads.page = 1;
    },

    addRealtimeAssignedLead(state, action) {
      const newLead = action.payload;

      if (!newLead?.id) return;

      const exists = state.assignedLeads.leads.some(
        (lead) => String(lead.id) === String(newLead.id),
      );

      if (!exists) {
        state.assignedLeads.leads.unshift(newLead);
        state.assignedLeads.total += 1;
      }
    },

    updateRealtimeAssignedLead(state, action) {
      const updatedLead = action.payload;

      const index = state.assignedLeads.leads.findIndex(
        (lead) => String(lead.id) === String(updatedLead.id),
      );

      if (index !== -1) {
        state.assignedLeads.leads[index] = updatedLead;
      }
    },
  },

  extraReducers: (builder) => {
    builder

      //
      // Fetch Advisors
      //
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

      //
      // Assign Advisor
      //
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

      //
      // Swap Advisor
      //
      .addCase(swapTravelAdvisor.pending, (state) => {
        state.assignLoading = true;
        state.assignSuccess = false;
      })

      .addCase(swapTravelAdvisor.fulfilled, (state, action) => {
        state.assignLoading = false;
        state.assignSuccess = true;

        const { leadId } = action.payload;

        state.assignedLeads.leads = state.assignedLeads.leads.filter(
          (lead) => String(lead.id) !== String(leadId),
        );

        state.assignedLeads.total = Math.max(0, state.assignedLeads.total - 1);
      })

      .addCase(swapTravelAdvisor.rejected, (state, action) => {
        state.assignLoading = false;
        state.error = action.payload || "Failed to swap advisor";
      })

      //
      // Assigned Leads
      //
      .addCase(fetchMyAssignedLeads.pending, (state) => {
        state.assignedLeads.loading = true;
        state.assignedLeads.error = null;
      })

      .addCase(fetchMyAssignedLeads.fulfilled, (state, action) => {
        const p = action.payload;

        state.assignedLeads.loading = false;
        state.assignedLeads.leads = p.leads;

        state.assignedLeads.page = p.page;
        state.assignedLeads.total = p.total;
        state.assignedLeads.totalPages = p.totalPages;

        state.assignedLeads.hasNextPage = p.hasNextPage;

        state.assignedLeads.selectedMonth = p.selectedMonth;

        state.assignedLeads.selectedYear = p.selectedYear;

        state.assignedLeads.selectedStatus = p.selectedStatus ?? null;

        state.assignedLeads.statusCounts = p.statusCounts;

        state.assignedLeads.totalLeads = p.totalLeads;

        state.assignedLeads.monthlyStats = p.monthlyStats ?? [];

        state.assignedLeads.zonesAdvisors = p.zoneAdvisors ?? [];
      })

      .addCase(fetchMyAssignedLeads.rejected, (state, action) => {
        state.assignedLeads.loading = false;

        state.assignedLeads.error =
          action.payload || "Failed to fetch assigned leads";
      });
  },
});

export const {
  resetAssignState,
  setAssignedStatus,
  addRealtimeAssignedLead,
  updateRealtimeAssignedLead,
} = travelAdvisorSlice.actions;

export default travelAdvisorSlice.reducer;
