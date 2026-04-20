import axiosInstance, { axiosInstance_hrms } from "@/uitils/axioInstance";
import type { User } from "@/types/types";

interface LoginData {
  username: string;
  password: string;
}

// ✅ LOGIN USER
export const loginUser = async (data: LoginData): Promise<User> => {
  try {
    const response = await axiosInstance_hrms.post<User>("/user/login", data);
    console.log(response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.error(
      "Login Error:",
      error.response?.data || error.message || error,
    );
    throw new Error(
      error.response?.data?.message || error.message || "Login failed",
    );
  }
};

// ✅ CURRENT USER
export const currentUser = async (): Promise<User> => {
  try {
    const response = await axiosInstance_hrms.get<User>("/user/current-user");

    return response.data.data;
  } catch (error: any) {
    console.error("Current user error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Unauthorized");
  }
};

// ✅ CREATE USER
