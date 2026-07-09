import { MonthLead } from "@/app/components/Rules/Entryform";
import axiosInstance from "@/uitils/axioInstance";

export interface AdvisorsByZoneResponse {
  zoneAdvisors: ZoneAdvisor[];
}

export interface ZoneAdvisor {
  id: number;
  name: string;
  shiftTiming: string;
}
export interface CreateRulePayload {
  type: "T20" | "T60";
  months: string[];
  monthLeads: MonthLead[];
  overflow: string;
  advisorId: number;
  shiftTiming: string;
  lead: number;
}
export interface RuleEntry {
  id: number;
  type: "T20" | "T60";
  months: string[];
  monthLeads: MonthLead[];
  advisorId: number;
  shiftTiming: string;
  lead: number;
  overflow: string;
}
export const getAdvisorsByZone = async (): Promise<ZoneAdvisor[]> => {
  try {
    const response = await axiosInstance.get<ZoneAdvisor[]>(
      "/rule/advisors-by-zone",
    );

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Get Advisors By Zone Error:",
      error.response?.data || error.message || error,
    );
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch advisors",
    );
  }
};

export const createRule = async (payload: CreateRulePayload) => {
  try {
    console.log("payload payload ", payload);
    const response = await axiosInstance.post("/rule", payload);

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Create Rule Error:",
      error.response?.data || error.message || error,
    );

    throw new Error(
      error.response?.data?.message || error.message || "Failed to create rule",
    );
  }
};

export const getRules = async () => {
  try {
    const response = await axiosInstance.get("/rule/getrule");

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Get Rules Error:",
      error.response?.data || error.message || error,
    );

    throw new Error(
      error.response?.data?.message || error.message || "Failed to fetch rules",
    );
  }
};

export const updateRule = async (
  id: number,
  data: FormState,
): Promise<RuleEntry> => {
  try {
    const response = await axiosInstance.put<RuleEntry>(`/rule/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("Update Rule Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update entry",
    );
  }
};

export const deleteRule = async (id: number): Promise<{ id: number }> => {
  try {
    const response = await axiosInstance.delete<{ id: number }>(
      `/rule/delete/${id}`,
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Delete Rule Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete entry",
    );
  }
};
