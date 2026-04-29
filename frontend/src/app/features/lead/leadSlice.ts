import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { LeadRecord } from "@/types/types";
import {
  createLeadApi,
  getLeadApi,
  updateLeadApi,
  markUnwantedApi,
  getAllUnwantedLeadsApi,
} from "./leadApi";

interface LeadState {
  leads: LeadRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  createLoading: boolean;
  error: string | null;

  selectedMonth: number;
  selectedYear: number;
  statusCounts: StatusCounts;
  totalLeads: number;
  search: string;

  unwantedLeads: LeadRecord[];
  unwantedLeadsLoading: boolean;
  unwantedLeadsTotal: number;
  unwantedLeadsError: string | null;
}
const now = new Date();
const initialState: LeadState = {
  leads: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  createLoading: false,
  error: null,
  totalPages: 1,

  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
  statusCounts: {
    NEW: 0,
    RFQ: 0,
    KYC: 0,
    HOT: 0,
    "VEH-N": 0,
    LOST: 0,
    BOOK: 0,
  },
  totalLeads: 0,
  search: "",

  unwantedLeads: [],
  unwantedLeadsLoading: false,
  unwantedLeadsTotal: 0,
  unwantedLeadsError: null,
};

/* ---------- FETCH LEADS ---------- */
export const fetchLeads = createAsyncThunk(
  "lead/fetchLeads",
  async (
    {
      page = 1,
      search = "",
      month,
      year,
    }: {
      page?: number;
      search?: string;
      month?: number;
      year?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      return await getLeadApi(page, search, month, year);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

/* ---------- CREATE LEAD ---------- */
export const createLead = createAsyncThunk(
  "lead/createLead",
  async (leadData: Partial<LeadRecord>, { rejectWithValue }) => {
    try {
      return await createLeadApi(leadData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

/* ---------- UPDATE LEAD ---------- */
export const updateLead = createAsyncThunk(
  "lead/updateLead",
  async (
    { id, data }: { id: string; data: Partial<LeadRecord> },
    { rejectWithValue },
  ) => {
    try {
      return await updateLeadApi(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const markUnwanted = createAsyncThunk(
  "lead/markUnwanted",
  async (
    {
      id,
      unwanted_status,
    }: {
      id: number | string;
      unwanted_status: "unwanted" | "wanted";
    },
    { rejectWithValue },
  ) => {
    try {
      return await markUnwantedApi(Number(id), { unwanted_status });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchUnwantedLeads = createAsyncThunk(
  "lead/fetchUnwantedLeads",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllUnwantedLeadsApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const leadSlice = createSlice({
  name: "lead",
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload;
    },
    setLimit(state, action) {
      state.limit = action.payload;
    },
    setSearch(state, action) {
      state.search = action.payload;
      state.page = 1; // ← search change hone pe page reset
    },
    setMonthYear(state, action) {
      state.selectedMonth = action.payload.month;
      state.selectedYear = action.payload.year;
      state.page = 1; // ← month change hone pe page reset
    },
    resetLeads(state) {
      state.leads = [];
      state.page = 1;
      state.total = 0;
      state.search = "";
    },
  },
  extraReducers: (builder) => {
    builder

     .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        console.log("action paload ", action.payload)
        state.leads = action.payload.leads;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages || 1;
        state.selectedMonth = action.payload.selectedMonth;
        state.selectedYear = action.payload.selectedYear;
        state.statusCounts = action.payload.statusCounts;
        state.totalLeads = action.payload.totalLeads;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createLead.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.createLoading = false;
        state.leads.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createLead.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- UPDATE LEAD ---------- */
      .addCase(updateLead.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.createLoading = false;
        const index = state.leads.findIndex(
          (lead) => lead.id === action.payload.id,
        );
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload as string;
      })

      /* ---------- MARK UNWANTED ---------- */
      .addCase(markUnwanted.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markUnwanted.fulfilled, (state, action) => {
        state.loading = false;

        const { id, unwanted_status } = action.meta.arg;

        // ✅ String aur Number dono se compare karo
        const index = state.leads.findIndex(
          (lead) => String(lead.id) === String(id),
        );

        if (index !== -1) {
          state.leads[index].unwanted_status = unwanted_status;
        }
      })
      .addCase(markUnwanted.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchUnwantedLeads.pending, (state) => {
        state.unwantedLeadsLoading = true;
      })
      .addCase(fetchUnwantedLeads.fulfilled, (state, action) => {
        state.unwantedLeadsLoading = false;
        state.unwantedLeads = action.payload;
      })
      .addCase(fetchUnwantedLeads.rejected, (state) => {
        state.unwantedLeadsLoading = false;
        state.unwantedLeads = [];
      });
  },
});

export const { setPage, setLimit, resetLeads } = leadSlice.actions;

export default leadSlice.reducer;
