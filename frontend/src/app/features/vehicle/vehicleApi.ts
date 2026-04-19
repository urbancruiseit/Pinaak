import axiosInstance from "@/uitils/axioInstance";
import { Vehicle } from "@/types/types";

// ✅ GET ALL VEHICLES
export const getVehiclesApi = async (): Promise<Vehicle[]> => {
  try {
    const res = await axiosInstance.get("/vehicle");

    return res.data.data;
  } catch (error: any) {
    console.error(
      "❌ Error fetching vehicles:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch vehicles",
    );
  }
};
