// routes/websiteGac.routes.js

import express from "express";

import {
  createTripBookingController,
  createWebsiteGacController,
  getTripBookingsController,
  getWebsiteGacController,
  markWebsiteGacReadController,
} from "./website.controller.js";

const router = express.Router();

router.post("/gac", createWebsiteGacController);
router.get("/gac", getWebsiteGacController);

router.post("/trip-bookings", createTripBookingController);
router.get("/trip-bookings", getTripBookingsController);
router.patch("/gac/:id/read", markWebsiteGacReadController);

export default router;
