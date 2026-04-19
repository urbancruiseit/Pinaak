import axiosInstance from "@/uitils/axioInstance";
import type { LeadRecord } from "@/types/types";
// 🔹 Types (agar already defined nahi hai to add karo)
interface TravelAdvisor {
  id: number;
  fullName: string;
}

interface AssignResponse {
  success: boolean;
  leadId: number;
  travelAdvisorId: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ✅ 1. Get Travel Advisors by City
export const getTravelAdvisorsByCityApi = async (
  cityId: number,
): Promise<TravelAdvisor[]> => {
  if (!cityId) {
    throw new Error("City ID is required");
  }
  console.log("advisor city id", cityId);
  try {
    const response = await axiosInstance.get(
      `/assign/travel-advisors/${cityId}`,
    );

    const data = response?.data?.data;

    // 🔥 fallback safety
    if (!Array.isArray(data)) return [];

    return data;
  } catch (error: any) {
    console.error(
      "Get Travel Advisors Error:",
      error?.response?.data || error.message,
    );

    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Failed to fetch travel advisors";

    throw new Error(errorMessage);
  }
};

// ✅ 2. Assign Travel Advisor to Lead
export const assignTravelAdvisorApi = async (
  leadId: number,
  travelAdvisorId: number,
): Promise<AssignResponse> => {
  if (!leadId) throw new Error("Lead ID is required");
  if (!travelAdvisorId) throw new Error("Travel Advisor ID is required");

  try {
    const response = await axiosInstance.patch<ApiResponse<AssignResponse>>(
      `/assign/assign-travel-advisor/${leadId}`, // ✅ leadId URL mein
      {
        travelAdvisorId, // ✅ sirf advisorId body mein
      },
    );

    const data = response?.data?.data;
    if (!data) throw new Error("Invalid response from server");

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Failed to assign travel advisor";

    throw new Error(errorMessage);
  }
};

export interface AssignedLeadsResponse {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  leads: LeadRecord[];
}

export const getMyAssignedLeadsApi = async (
  page: number = 1,
): Promise<AssignedLeadsResponse> => {
  try {
    const response = await axiosInstance.get<
      ApiResponse<AssignedLeadsResponse>
    >(`/assign/myleads?page=${page}`);

    const data = response?.data?.data;

    if (!data) throw new Error("Invalid response from server");

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Failed to fetch assigned leads";

    throw new Error(errorMessage);
  }
};
