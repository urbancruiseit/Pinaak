// routes/websiteGac.routes.js

import express from "express";

import { getTripBookingByIdController, getTripBookingsController, getWebsiteGacByIdController, getWebsiteGacController } from "./website.controller.js";

const router = express.Router();

// Website GAC routes
router.get("/gac",    getWebsiteGacController);        // GET all
router.get("/gac/:id",  getWebsiteGacByIdController);    // GET by ID

// Trip Bookings routes
router.get("/trip-bookings", getTripBookingsController);
router.get("/trip-bookings/:id", getTripBookingByIdController);

export default router;

