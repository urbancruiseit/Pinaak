// controllers/websiteGac.controller.js

import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createWebsiteGac, getAllWebsiteGac } from "./website.model.js";
import { createTripBooking, getTripBookings } from "./website.service.js";

// ================= CREATE WEBSITE GAC =================
export const createWebsiteGacController = asyncHandler(async (req, res) => {
  const { name, phone, country_code = "+91", city } = req.body;
  console.log("req.body", req.body);
  if (!name || !phone || !city) {
    throw new ApiError(400, "Name, Phone and City are required");
  }

  const data = await createWebsiteGac({
    name,
    phone,
    country_code,
    city,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, data, "Website GAC submitted successfully"));
});

export const getWebsiteGacController = asyncHandler(async (req, res) => {
  const data = await getAllWebsiteGac();

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Website GAC fetched successfully"));
});

// ================= CREATE TRIP BOOKING =================

export const createTripBookingController = asyncHandler(async (req, res) => {
  const {
    pickup_address,
    pickup_date,
    drop_address,
    drop_date,
    travel_itinerary,
    passengers,
    baggages,
    vehicle_category,
    vehicle_model,
    full_name,
    phone,
    email,
    country_code,
    trip_message,
  } = req.body;

  // Validation
  if (
    !pickup_address ||
    !pickup_date ||
    !drop_address ||
    !drop_date ||
    !travel_itinerary ||
    !passengers ||
    !baggages ||
    !vehicle_category ||
    !vehicle_model ||
    !full_name ||
    !phone
  ) {
    throw new ApiError(400, "Please fill all required fields");
  }

  const booking = await createTripBooking(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, booking, "Trip booking created successfully"));
});

// ================= GET ALL TRIP BOOKINGS =================

export const getTripBookingsController = asyncHandler(async (req, res) => {
  const bookings = await getTripBookings();

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Trip bookings fetched successfully"));
});
