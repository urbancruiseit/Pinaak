import axiosInstance from "@/uitils/axioInstance";
import { Vehicle } from "@/types/types";

export const createVehiclesManagerApi = async (
  vehicleData: Omit<Vehicle, "id">,
): Promise<Vehicle> => {
  try {
    const res = await axiosInstance.post("/vehiclemanager", vehicleData);

    console.log("✅ Vehicle manager created successfully:", res.data?.data);

    return res.data.data;
  } catch (error: any) {
    console.error(
      "❌ Error creating vehicle manager:",
      error?.response?.data || error?.message,
    );

    throw new Error(
      error?.response?.data?.message || "Failed to create vehicle manager",
    );
  }
};

// GET ALL VEHICLE MANAGERS
export interface GetVehicleManagersParams {
  search?: string;
  vendor?: string;
  garage?: string;
  city?: string;
  year?: number | string;
  page?: number;
  limit?: number;
}

export interface GetVehicleManagersResponse {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getVehicleManagersApi = async (
  params: GetVehicleManagersParams = {},
): Promise<GetVehicleManagersResponse> => {
  try {
    const res = await axiosInstance.get("/vehiclemanager", {
      params: {
        search: params.search || undefined,
        vendor: params.vendor || undefined,
        garage: params.garage || undefined,
        city: params.city || undefined,
        year: params.year || undefined,
        page: params.page || 1,
        limit: params.limit || 20,
      },
    });
    return res.data.data;
  } catch (error: any) {
    console.error(
      "❌ Error fetching vehicle managers:",
      error?.response?.data || error?.message,
    );

    throw new Error(
      error?.response?.data?.message || "Failed to fetch vehicle managers",
    );
  }
};

export interface VehicleMasterCode {
  code: string;
  amenities: string | null;
}

export const getVehicleMasterCodesApi = async (): Promise<
  VehicleMasterCode[]
> => {
  try {
    const res = await axiosInstance.get("/vehiclemanager/options/codes");

    console.log("✅ Vehicle master codes:", res.data?.data);

    return res.data?.data || [];
  } catch (error: any) {
    console.error(
      "❌ Error fetching vehicle master codes:",
      error?.response?.data || error?.message,
    );

    throw new Error(
      error?.response?.data?.message || "Failed to fetch vehicle master codes",
    );
  }
};

export interface VehicleMasterAmenity {
  name: string;
}

export const getVehicleMasterAmenitiesApi = async (): Promise<
  VehicleMasterAmenity[]
> => {
  try {
    const res = await axiosInstance.get("/vehiclemanager/options/amenities");

    console.log("✅ Vehicle master amenities:", res.data?.data);

    return res.data?.data || [];
  } catch (error: any) {
    console.error(
      "❌ Error fetching vehicle master amenities:",
      error?.response?.data || error?.message,
    );

    throw new Error(
      error?.response?.data?.message ||
        "Failed to fetch vehicle master amenities",
    );
  }
};

// =====================================================
// VENDORS
// =====================================================

export interface VehicleManagerVendor {
  name: string;
}

export const getVehicleManagerVendorsApi = async (): Promise<
  VehicleManagerVendor[]
> => {
  try {
    const res = await axiosInstance.get("/vehiclemanager/options/vendors");

    console.log("✅ Vendors:", res.data?.data);

    return res.data?.data || [];
  } catch (error: any) {
    console.error(
      "❌ Error fetching vendors:",
      error?.response?.data || error?.message,
    );

    throw new Error(
      error?.response?.data?.message || "Failed to fetch vendors",
    );
  }
};

// =====================================================
// CITIES (generic /vehiclemanager/citys endpoint)
// =====================================================

// ⚠️ IMPORTANT: backend (getAllCitiesModel) returns rows shaped like
// { id, city_name } — NOT { id, name }. That mismatch was the bug:
// the <select> was rendering `city.name`, which was always undefined,
// so every option showed up blank even though the array had data.
// We normalize the shape here so the rest of the app can keep using
// `.name` consistently (same as vendors/codes).

export interface VehicleCity {
  id: number;
  name: string;
}

interface RawCityFromApi {
  id: number;
  city_name: string;
}

export const getAllCitiesApi = async (): Promise<VehicleCity[]> => {
  try {
    const res = await axiosInstance.get("/vehiclemanager/citys");

    console.log("✅ Cities raw response:", res.data?.data);

    const rawCities: RawCityFromApi[] = res.data?.data || [];

    // Normalize city_name -> name
    const normalized: VehicleCity[] = rawCities.map((c) => ({
      id: c.id,
      name: c.city_name,
    }));

    return normalized;
  } catch (error: any) {
    console.error(
      "❌ Error fetching cities:",
      error?.response?.data || error?.message,
    );

    throw new Error(error?.response?.data?.message || "Failed to fetch cities");
  }
};
