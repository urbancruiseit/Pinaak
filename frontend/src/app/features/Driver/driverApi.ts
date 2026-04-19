import axiosInstance from "@/uitils/axioInstance";

export interface DriverFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone: string;
    emergencyContact: string;
    bloodGroup: string;
    vendor: string;
    vendorState: string;
    vendorCity: string;
  };
  addressInfo: {
    permanentAddress: string;
    currentAddress: string;
    city: string;
    state: string;
    pincode: string;
  };
  licenseInfo: {
    licenseNumber: string;
    licenseType: string;
    issuingAuthority: string;
    issueDate: string;
    experienceDetails: string;
    expiryDate: string;
    dlFront: string;
    dlBack: string;
  };
  employmentInfo: {
    employeeId: string;
  };
  documents: {
    aadharCard: string;
    panCard: string;
  };
}

export interface DriverResponse {
  id: number;
  personalInfo?: DriverFormData["personalInfo"];
  addressInfo?: DriverFormData["addressInfo"];
  licenseInfo?: DriverFormData["licenseInfo"];
  employmentInfo?: DriverFormData["employmentInfo"];
  documents?: DriverFormData["documents"];
  message?: string;
  status?: string;
}

// ✅ Payload Builder
const buildJsonPayload = (data: DriverFormData): Record<string, any> => {
  const payload: Record<string, any> = {};

  Object.keys(data).forEach((key) => {
    const value = data[key as keyof DriverFormData];

    if (typeof value === "object" && value !== null) {
      payload[key] = value;
    } else if (value !== null && value !== undefined && value !== "") {
      payload[key] = value;
    }
  });

  return payload;
};

// ─── CREATE DRIVER ───────────────────────────────
export const createDriverAPI = async (
  formData: DriverFormData,
): Promise<DriverResponse> => {
  try {
    const payload = buildJsonPayload(formData);
    console.log("Driver Payload:", payload);

    const response = await axiosInstance.post("/driver", payload);

    return response.data?.data?.driver || response.data.data;
  } catch (error: any) {
    console.error(
      "Error creating driver:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Error creating driver"
    );
  }
};

export default {
  createDriverAPI,
};