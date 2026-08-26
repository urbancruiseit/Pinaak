import axiosInstance from "@/uitils/axioInstance";

export interface Followup {
  followup_date: string | null;
  remark: string | null;
}

export const getAllLeadsApi = async () => {
  try {
    const res = await axiosInstance.get("/followup");

    return res.data?.data || [];
  } catch (error: any) {
    console.error(
      "❌ Error fetching leads:",
      error?.response?.data || error?.message || error,
    );

    throw new Error(error?.response?.data?.message || "Failed to fetch leads");
  }
};

export const getFollowupsByLeadIdApi = async (
  leadId: number | string,
): Promise<Followup[]> => {
  try {
    const res = await axiosInstance.get(`/followup/${leadId}`);

    return res.data?.data || [];
  } catch (error: any) {
    console.error(
      "❌ Error fetching followups:",
      error?.response?.data || error?.message || error,
    );

    throw error;
  }
};
