import { Router } from "express";

import {
  createVehicleManager,
  getAllVehicleManagers,
  getVehicleManagerByIdController,
  getVehicleManagerVendors,
  getVehicleMasterCodes,
  getVehicleMasterAmenities,
  getAllCitiesController,
  updateVehicleManagerStatus,
  getVehicleVariantByCodeController,
} from "./vehicleManager.controller.js";

const router = Router();

// Cities
router.get("/citys", getAllCitiesController);

// Options
router.get("/options/codes", getVehicleMasterCodes);
router.get("/options/vendors", getVehicleManagerVendors);
router.get("/options/amenities", getVehicleMasterAmenities);

// Vehicle CRUD
router.route("/").post(createVehicleManager).get(getAllVehicleManagers);

// Vehicle variant by code


// Update status
router.patch("/updatestatus/:id", updateVehicleManagerStatus);

// Get vehicle by ID
router.get("/:id", getVehicleManagerByIdController);

export default router;
