import axiosInstance from "@/uitils/axioInstance";

export interface WebsiteGacRecord {
  id: number;
  name: string;
  country_code: string;
  phone: string;
  city: string;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export interface TripBookingRecord {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  customerPhone: string;
  country_code: string;
  customerEmail: string;
  message: string;
  pickupAddress: string;
  pickup_date: string;
  dropAddress: string;
  drop_date: string;
  itinerary: string;
  passengerTotal: number;
  baggageTotal: number;
  vehicle_model: string;
  city: string;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

// ─── GET ALL GAC ──────────────────────────────────────────────────────

export const getWebsiteGacApi = async (): Promise<{
  data: WebsiteGacRecord[];
  count: number;
}> => {
  try {
    const response =
      await axiosInstance.get<ApiResponse<WebsiteGacRecord[]>>(
        "/website-gac/gac",
      );

    console.log("✅ Website GAC Response:", response.data);

    return {
      data: response.data.data ?? [],
      count: response.data.count ?? response.data.data?.length ?? 0,
    };
  } catch (error: any) {
    console.error(
      "❌ Get Website GAC Error:",
      error.response?.data || error.message,
    );

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch website GAC entries";

    throw new Error(errorMessage);
  }
};

// ─── GET GAC BY ID ────────────────────────────────────────────────────

export const getWebsiteGacByIdApi = async (
  id: number,
): Promise<{ data: WebsiteGacRecord }> => {
  try {
    const response = await axiosInstance.get<ApiResponse<WebsiteGacRecord>>(
      `/website-gac/gac/${id}`,
    );

    console.log("✅ Website GAC By ID Response:", response.data);

    return { data: response.data.data };
  } catch (error: any) {
    console.error(
      "❌ Get Website GAC By ID Error:",
      error.response?.data || error.message,
    );

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch GAC entry";

    throw new Error(errorMessage);
  }
};

export const getTripBookingsApi = async (): Promise<{
  data: TripBookingRecord[];
  count: number;
}> => {
  try {
    const response = await axiosInstance.get<ApiResponse<TripBookingRecord[]>>(
      "/website-gac/trip-bookings",
    );

    console.log("✅ Trip Bookings Response:", response.data);

    return {
      data: response.data.data ?? [],
      count: response.data.count ?? response.data.data?.length ?? 0,
    };
  } catch (error: any) {
    console.error(
      "❌ Get Trip Bookings Error:",
      error.response?.data || error.message,
    );

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch trip bookings";

    throw new Error(errorMessage);
  }
};

// ─── GET TRIP BOOKING BY ID ─────────────────────────────

export const getTripBookingByIdApi = async (
  id: number,
): Promise<{ data: TripBookingRecord }> => {
  try {
    const response = await axiosInstance.get<ApiResponse<TripBookingRecord>>(
      `/website-gac/trip-bookings/${id}`,
    );

    console.log("✅ Trip Booking By ID Responsessesss:", response.data.data);

    return { data: response.data.data };
  } catch (error: any) {
    console.error(
      "❌ Get Trip Booking By ID Error:",
      error.response?.data || error.message,
    );

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch trip booking";

    throw new Error(errorMessage);
  }
};
