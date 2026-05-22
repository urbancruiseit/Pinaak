// controllers/websiteGac.controller.js

import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getAllTripBookings,
  getAllWebsiteGac,
  getTripBookingById,
  getWebsiteGacById,
} from "./website.model.js";

// ================= GET ALL WEBSITE GAC =================
export const getWebsiteGacController = asyncHandler(async (req, res) => {
  const data = await getAllWebsiteGac();

  if (!data || data.length === 0) {
    throw new ApiError(404, "No Website GAC records found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Website GAC list fetched successfully"));
});

// ================= GET WEBSITE GAC BY ID =================
export const getWebsiteGacByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    throw new ApiError(400, "Valid Website GAC ID is required");
  }

  const record = await getWebsiteGacById(Number(id));

  if (!record) {
    throw new ApiError(404, `Website GAC record not found for ID ${id}`);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, record, "Website GAC record fetched successfully"),
    );
});

// ================= GET ALL TRIP BOOKINGS =================
export const getTripBookingsController = asyncHandler(async (req, res) => {
  const data = await getAllTripBookings();

  if (!data || data.length === 0) {
    throw new ApiError(404, "No trip bookings found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tripBookings: data,
        count: data.length,
      },
      "Trip bookings list fetched successfully",
    ),
  );
});

// ================= GET TRIP BOOKING BY ID =================
export const getTripBookingByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    throw new ApiError(400, "Valid Trip Booking ID is required");
  }

  const record = await getTripBookingById(Number(id));

  if (!record) {
    throw new ApiError(404, `Trip booking record not found for ID ${id}`);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, record, "Trip booking record fetched successfully"),
    );
});
