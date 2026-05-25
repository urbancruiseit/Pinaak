// services/leadsReportApi.ts
import axiosInstance from "@/uitils/axioInstance";
import { baseApi } from "@/uitils/commonApi";

// ─── Types ────────────────────────────────────────────────────────────

export interface MonthlyEnquiryRecord {
  month: number;
  day: number;
  total: number;
}

export interface LeadCountRecord {
  date: string;
  leadCount: number;
}

export interface MonthlyEnquiryResponse {
  success: boolean;
  year: number;
  data: MonthlyEnquiryRecord[];
}

export interface LeadCountByDateResponse {
  success: boolean;
  year: number;
  totalLeads: number;
  totalDays: number;
  avgLeadsPerDay: number;
  data: LeadCountRecord[];
}

// ─── Lead Distribution Types ─────────────────────────────────────────

export interface DayRecord {
  day: number;
  leads: number;
  booked: number;
}

export interface AdviserDistributionRecord {
  adviser_id: number;
  adviser_name: string;
  total_leads: number;
  total_booked: number;
  avg_leads_per_day: number;
  cntb_percentage: number;
  days: DayRecord[];
}

export interface TeamTotal {
  total_leads: number;
  total_booked: number;
  days: DayRecord[];
}

export interface LeadDistributionResponse {
  success: boolean;
  month: number;
  year: number;
  advisorId: number | null;
  totalDaysInMonth: number;
  data: AdviserDistributionRecord[];
  teamTotal: TeamTotal;
}

export interface LeadDistributionParams {
  month?: number;
  year?: number;
  advisorId?: number | null;
}

export interface StatusWiseReportParams {
  month?: number;
  year?: number;
}

export interface StatusWiseReportItem {
  adviser_name: string;
  blank: number;
  kyc: number;
  rfq: number;
  lost: number;
  book: number;
  total: number;
  con: string;
}

export interface StatusWiseReportResponse {
  success: boolean;
  month: number;
  year: number;
  data: StatusWiseReportItem[];
  teamTotal: {
    blank: number;
    kyc: number;
    rfq: number;
    lost: number;
    book: number;
    total: number;
  };
}

export interface TimeEnquiryRecord {
  month: number;
  day: number;
  hour: number;
  total: number;
}

export interface TimeEnquiryResponse {
  success: boolean;
  year?: number;
  data: TimeEnquiryRecord[];
}
// ─── Error Handler ───────────────────────────────────────────────────

const handleAxiosError = (error: any, context: string): never => {
  console.error(`❌ [${context}] Error:`, {
    message: error.message,
    code: error.code,
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url,
  });

  if (error.code === "ECONNABORTED") {
    throw new Error("Request timeout - Server is taking too long");
  }

  if (!error.response) {
    throw new Error(
      `Cannot connect to server at ${baseApi}. Backend running hai ya nahi check karo.`,
    );
  }

  throw new Error(
    error.response?.data?.message || `Server error: ${error.response?.status}`,
  );
};

// ─── APIs ────────────────────────────────────────────────────────────

export const getMonthlyEnquiryApi = async (
  year: number,
): Promise<MonthlyEnquiryResponse> => {
  try {
    const { data: res } = await axiosInstance.get<MonthlyEnquiryResponse>(
      "/reports/monthly-enquiry",
      { params: { year }, timeout: 10000 },
    );

    return {
      success: res.success,
      year: res.year ?? year,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch (error) {
    throw handleAxiosError(error, "getMonthlyEnquiryApi");
  }
};

export const getLeadCountByDateApi = async (
  year: number,
): Promise<LeadCountByDateResponse> => {
  try {
    const { data: res } = await axiosInstance.get<LeadCountByDateResponse>(
      "/reports/lead-count-by-date",
      { params: { year }, timeout: 10000 },
    );

    return {
      success: res.success,
      year: res.year ?? year,
      totalLeads: res.totalLeads ?? 0,
      totalDays: res.totalDays ?? 0,
      avgLeadsPerDay: res.avgLeadsPerDay ?? 0,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch (error) {
    throw handleAxiosError(error, "getLeadCountByDateApi");
  }
};

export const getLeadDistributionApi = async (
  params: LeadDistributionParams = {},
): Promise<LeadDistributionResponse> => {
  if (
    params.advisorId !== undefined &&
    params.advisorId !== null &&
    !params.advisorId
  )
    throw new Error("Advisor ID is invalid");

  try {
    const response = await axiosInstance.get<{
      data: LeadDistributionResponse;
    }>("/reports/adviser-report", {
      params: {
        ...(params.month !== undefined && { month: params.month }),
        ...(params.year !== undefined && { year: params.year }),
        ...(params.advisorId !== undefined &&
          params.advisorId !== null && { advisorId: params.advisorId }),
      },
      timeout: 15000,
    });

    const res = response?.data?.data;
    console.log("responce ", response?.data?.data);
    if (!res) throw new Error("Invalid response from server");

    const now = new Date();

    return {
      success: res.success,
      month: res.month ?? params.month ?? now.getMonth() + 1,
      year: res.year ?? params.year ?? now.getFullYear(),
      advisorId: params.advisorId ?? null, // backend doesn't return this, use param
      totalDaysInMonth: res.totalDaysInMonth ?? 0,
      data: Array.isArray(res.data) ? res.data : [],
      teamTotal: res.teamTotal ?? {
        total_leads: 0,
        total_booked: 0,
        days: [],
      },
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Failed to fetch lead distribution";

    throw new Error(errorMessage);
  }
};

export const getStatusWiseReportApi = async (
  params: StatusWiseReportParams = {},
): Promise<StatusWiseReportResponse> => {
  try {
    const response = await axiosInstance.get<{
      data: StatusWiseReportResponse;
    }>("/reports/status-wise-report", {
      params: {
        ...(params.month !== undefined && { month: params.month }),
        ...(params.year !== undefined && { year: params.year }),
      },
      timeout: 15000,
    });

    const res = response?.data?.data;

    console.log("status wise response:", res);

    if (!res) {
      throw new Error("Invalid response from server");
    }

    const now = new Date();

    return {
      success: res.success,
      month: res.month ?? params.month ?? now.getMonth() + 1,
      year: res.year ?? params.year ?? now.getFullYear(),

      data: Array.isArray(res.data) ? res.data : [],

      teamTotal: res.teamTotal ?? {
        blank: 0,
        kyc: 0,
        rfq: 0,
        lost: 0,
        book: 0,
        total: 0,
      },
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Failed to fetch status wise report";

    throw new Error(errorMessage);
  }
};

export const getTimeEnquiryApi = async (
  year: number,
): Promise<TimeEnquiryResponse> => {
  try {
    const { data: res } = await axiosInstance.get<TimeEnquiryResponse>(
      "/reports/time-enquiry",
      { params: { year }, timeout: 10000 },
    );

    return {
      success: res.success,
      year: res.year ?? year,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch (error) {
    throw handleAxiosError(error, "getTimeEnquiryApi");
  }
};

export const getStatusWiseDateReportApi = async (params = {}) => {
  try {
    const response = await axiosInstance.get(
      "/reports/status-wise-date-report",
      {
        params,
      },
    );

    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch date wise report",
    );
  }
};
