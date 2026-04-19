import axiosInstance from "@/uitils/axioInstance";

export interface VendorFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  panNumber: string;
  aadhaarNumber: string;
  companyName: string;
  businessNumber: string;
  companyRegisteredNumber: string;
  gstNumber: string;
  registeredAddress: string;
  garageAddress: string;
  garagePhone: string;
  cooperativeName: string;
  cooperativeNumber: string;

  passportPhoto: string;
  panDoc: string;
  gstDoc: string;
  vendorProof: string;
  vehicleDoc: string;

  code?: string;
  managerName2: string;
  managerName1: string;
  ownerName: string;
  managerPhone1: string;
  managerEmail1: string;
  managerPhone2: string;
  managerEmail2: string;
  shortName: string;
  companyType: string;
  companyPanNumber: string;
  ownerPhone: string;
  ownerEmail: string;

  personalInfo: {
    personalAddress: string;
    personalCity: string;
    personalState: string;
  };

  companyinfo: {
    companyState: string;
    companyCity: string;
  };
}

export interface VendorResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  code: string;
  message?: string;

  vendor_name?: string;
  mobile?: string;
  company_name?: string;
  companyType?: string;
  company_type?: string;
  gst_number?: string;
  gstNumber?: string;
  owner_name?: string;
  ownerName?: string;
  personal_city?: string;
  personal_state?: string;
  city?: string;
  state?: string;
  status?: string;

  personalInfo?: {
    personalAddress: string;
    personalCity: string;
    personalState: string;
  };
  companyinfo?: {
    companyState: string;
    companyCity: string;
  };
}

// ✅ Payload Builder
const buildJsonPayload = (data: VendorFormData): Record<string, any> => {
  const payload: Record<string, any> = {};

  Object.keys(data).forEach((key) => {
    const value = data[key as keyof VendorFormData];

    if (typeof value === "object" && value !== null) {
      payload[key] = value;
    } else if (value !== null && value !== undefined && value !== "") {
      payload[key] = value;
    }
  });

  return payload;
};

// ─── CREATE VENDOR ─────────────────────────────────
export const createVendorAPI = async (
  formData: VendorFormData,
): Promise<VendorResponse> => {
  try {
    const payload = buildJsonPayload(formData);
    console.log("Payload:", payload);

    const response = await axiosInstance.post("/vendor", payload);

    return response.data?.data?.vendor || response.data.data;
  } catch (error: any) {
    console.error(
      "Error creating vendor:",
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Error creating vendor");
  }
};

// ─── UPDATE VENDOR ─────────────────────────────────
export const updateVendorAPI = async (
  id: number,
  formData: VendorFormData,
): Promise<VendorResponse> => {
  try {
    const payload = buildJsonPayload(formData);
    console.log("Update Payload:", payload);

    const response = await axiosInstance.put(`/vendor/${id}`, payload);

    return response.data?.data?.vendor || response.data.data;
  } catch (error: any) {
    console.error(
      "Error updating vendor:",
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Error updating vendor");
  }
};

// ─── GET ALL VENDORS ─────────────────────────────────
export const getAllVendorsAPI = async (): Promise<VendorResponse[]> => {
  try {
    const response = await axiosInstance.get("/vendor");

    const data = response.data;

    if (data?.data?.vendors) return data.data.vendors;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.vendors)) return data.vendors;

    return [];
  } catch (error: any) {
    console.error(
      "Error fetching vendors:",
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Error fetching vendors");
  }
};

// ─── GET VENDOR BY ID ─────────────────────────────────
export const getVendorByIdAPI = async (
  id: number,
): Promise<VendorResponse | null> => {
  try {
    const response = await axiosInstance.get(`/vendor/${id}`);

    const data = response.data;

    if (data?.data?.vendor) return data.data.vendor;
    if (data?.data) return data.data;
    if (data?.vendor) return data.vendor;

    return data || null;
  } catch (error: any) {
    console.error(
      "Error fetching vendor:",
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Error fetching vendor");
  }
};

export default {
  createVendorAPI,
  updateVendorAPI,
  getAllVendorsAPI,
  getVendorByIdAPI,
};
