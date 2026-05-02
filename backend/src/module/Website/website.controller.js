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

// ─── GET All Website GAC ────────────────────────────────────────────────
export const getWebsiteGacController = asyncHandler(async (req, res) => {
  console.log("🚀 getWebsiteGacController HIT");

  const data = await getAllWebsiteGac();

  console.log("📦 Raw GAC data from DB:", data);
  console.log("📊 Total GAC records:", data?.length ?? 0);

  if (!data || data.length === 0) {
    console.warn("⚠️  No GAC records found in DB");
  } else {
    console.log("✅ First GAC record sample:", data[0]);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Website GAC list fetched successfully"));
});

// ─── GET Single Website GAC By ID ──────────────────────────────────────
export const getWebsiteGacByIdController = asyncHandler(async (req, res) => {
  console.log("🚀 getWebsiteGacByIdController HIT");

  const { id } = req.params;
  console.log("🔍 Requested GAC ID:", id);

  if (!id || isNaN(id)) {
    console.warn("⚠️  Invalid ID received:", id);
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Valid ID required"));
  }

  const record = await getWebsiteGacById(id);

  console.log("📦 GAC record from DB:", record);

  if (!record) {
    console.warn(`⚠️  No GAC record found for ID: ${id}`);
    return res
      .status(404)
      .json(new ApiResponse(404, null, `ID ${id} ka record nahi mila`));
  }

  console.log("✅ GAC record found:", record);

  return res
    .status(200)
    .json(
      new ApiResponse(200, record, "Website GAC record fetched successfully"),
    );
});

// ─── GET All Trip Bookings ──────────────────────────────────────────────
// ─── GET All Trip Bookings ──────────────────────────────────────────────
export const getTripBookingsController = asyncHandler(async (req, res) => {
  console.log("🚀 getTripBookingsController HIT");

  const data = await getAllTripBookings();

  console.log("📦 Raw Trip Bookings data from DB:", data);
  console.log("📊 Total Trip Booking records:", data?.length ?? 0);

  if (!data || data.length === 0) {
    console.warn("⚠️  No trip bookings found in DB");
    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: [],
      count: 0,
      message: "No trip bookings found",
    });
  }

  console.log("✅ First Trip Booking record sample:", data[0]);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    data: data,
    count: data.length,
    message: "Trip bookings list fetched successfully",
  });
});

// ─── GET Single Trip Booking By ID ─────────────────────────────────────
export const getTripBookingByIdController = asyncHandler(async (req, res) => {
  console.log("🚀 getTripBookingByIdController HIT");

  const { id } = req.params;
  console.log("🔍 Requested Trip Booking ID:", id);

  if (!id || isNaN(Number(id))) {
    console.warn("⚠️  Invalid ID received:", id);
    return res.status(400).json({
      success: false,
      statusCode: 400,
      data: null,
      message: "Valid numeric ID required",
    });
  }

  const record = await getTripBookingById(Number(id));

  console.log("📦 Trip Booking record from DB:", record);

  if (!record) {
    console.warn(`⚠️  No trip booking found for ID: ${id}`);
    return res.status(404).json({
      success: false,
      statusCode: 404,
      data: null,
      message: `ID ${id} ka trip booking record nahi mila`,
    });
  }

  console.log("✅ Trip Booking record found:", record);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    data: record,
    message: "Trip booking record fetched successfully",
  });
});
