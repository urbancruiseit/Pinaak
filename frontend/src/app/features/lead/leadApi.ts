import axiosInstance from "@/uitils/axioInstance";
import type { LeadRecord } from "@/types/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── CREATE LEAD ───────────────────────────────
export const createLeadApi = async (
  leadData: Partial<LeadRecord>,
): Promise<LeadRecord> => {
  try {
    console.log("API leadData:", leadData);

    const response = await axiosInstance.post<ApiResponse<LeadRecord>>(
      "/lead",
      leadData,
    );

    return response.data.data;
  } catch (error: any) {
    console.error("Create Lead Error:", error.response?.data || error.message);

    const apiError = error.response?.data;

    const errorMessage =
      apiError?.error ||
      apiError?.message ||
      apiError?.details ||
      error.message ||
      "Failed to create lead";

    throw new Error(errorMessage);
  }
};

// ─── GET LEADS (PAGINATED) ─────────────────────
export interface PaginatedLeadsResponse {
  leads: LeadRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatusCounts {
  NEW: number;
  RFQ: number;
  KYC: number;
  HOT: number;
  "VEH-N": number;
  LOST: number;
  BOOK: number;
}

export interface PaginatedLeadsResponse {
  leads: LeadRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  selectedMonth: number;
  selectedYear: number;
  statusCounts: StatusCounts;
  totalLeads: number;
}

export const getLeadApi = async (
  page: number = 1,
  search: string = "",
  month?: number,
  year?: number,
): Promise<PaginatedLeadsResponse> => {
  try {
    const response = await axiosInstance.get("/lead", {
      params: {
        page,
        ...(search && { search }),
        ...(month && { month }),
        ...(year && { year }),
      },
    });

    const data: PaginatedLeadsResponse = response.data.data;

    return {
      leads: data.leads || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.limit || 14,
      totalPages: data.totalPages || 1,
      selectedMonth: data.selectedMonth,
      selectedYear: data.selectedYear,
      statusCounts: data.statusCounts || {
        NEW: 0,
        RFQ: 0,
        KYC: 0,
        HOT: 0,
        "VEH-N": 0,
        LOST: 0,
        BOOK: 0,
      },
      totalLeads: data.totalLeads || 0,
    };
  } catch (error: any) {
    console.error("Get Leads Error:", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch leads";

    throw new Error(errorMessage);
  }
};

// ─── UPDATE LEAD ───────────────────────────────
export const updateLeadApi = async (
  id: string,
  leadData: Partial<LeadRecord>,
): Promise<LeadRecord> => {
  try {
    console.log("API update leadDatasss:", id, leadData);

    const response = await axiosInstance.put<ApiResponse<LeadRecord>>(
      `/lead/updatelead/${id}`,
      leadData,
    );

    return response.data.data;
  } catch (error: any) {
    console.error("Update Lead Error:", error.response?.data || error.message);

    throw new Error(
      error.response?.data?.message || error.message || "Failed to update lead",
    );
  }
};

// ─── MARK UNWANTED ─────────────────────────────
export const markUnwantedApi = async (
  id: number,
  data: {
    unwanted_status: "wanted" | "unwanted";
    reason?: string;
  },
) => {
  try {
    console.log("🚀 Marking unwanted - ID:", id, "Data:", data);

    const response = await axiosInstance.patch(`/lead/unwanted/${id}`, data);

    console.log("✅ Success:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.error("❌ API Error:", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to mark unwanted";

    throw new Error(errorMessage);
  }
};

// ─── GET ALL UNWANTED LEADS ────────────────────
export const getAllUnwantedLeadsApi = async (): Promise<LeadRecord[]> => {
  try {
    const response =
      await axiosInstance.get<ApiResponse<LeadRecord[]>>("/lead/unwanted/all");

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Get All Unwanted Leads Error:",
      error.response?.data || error.message,
    );

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch unwanted leads";

    throw new Error(errorMessage);
  }
};
