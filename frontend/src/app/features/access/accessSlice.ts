
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  AssignedLeadsResponse,
  assignTravelAdvisorApi,
  getMyAssignedLeadsApi,
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
  monthlyStats: { month: string; monthName: string; year: number; leadCount: number }[]; // ← add
}

interface TravelAdvisorState {
  advisors: TravelAdvisor[];
  loading: boolean;
  error: string | null;

  assignLoading: boolean;
  assignSuccess: boolean;

  // ✅ New State
  assignedLeads: AssignedLeadsState;
}

// 🔹 Initial State
const initialState: TravelAdvisorState = {
  advisors: [],
  loading: false,
  error: null,

  assignLoading: false,
  assignSuccess: false,

  // ✅ New State Init
  assignedLeads: {
  leads: [],
  loading: false,
  error: null,
  page: 1,
  monthlyStats: [], // ← add
}
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




export const fetchMyAssignedLeads = createAsyncThunk<
  AssignedLeadsResponse,  // return type
  number,                  // argument type (page)
  { rejectValue: string }  // ← rejectValue type
>(
  "access/fetchMyAssignedLeads",
  async (page, { rejectWithValue }) => {
    try {
      const data = await getMyAssignedLeadsApi(page);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

//
// ✅ Slice
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
      builder.addCase(fetchMyAssignedLeads.fulfilled, (state, action) => {

  state.assignedLeads.loading = false;
  state.assignedLeads.leads = action.payload.leads;         
  state.assignedLeads.page = action.payload.totalPages;      
  state.assignedLeads.monthlyStats = action.payload.monthlyStats ?? []; 
})
      .addCase(fetchMyAssignedLeads.rejected, (state, action) => {
        state.assignedLeads.loading = false;
        state.assignedLeads.error =
          action.payload || "Failed to fetch assigned leads";
      });
  },
});

export const { resetAssignState } = travelAdvisorSlice.actions;

export default travelAdvisorSlice.reducer;
