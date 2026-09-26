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
} from "./vehicleManager.controller.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();
router.route("/citys").get(verifyJWT, getAllCitiesController);

// ⚠️ Static/named routes ALWAYS "/:id" se pehle honi chahiye
router.get("/options/codes", verifyJWT, getVehicleMasterCodes);
router.get("/options/vendors", verifyJWT, getVehicleManagerVendors);
router.get("/options/amenities", verifyJWT, getVehicleMasterAmenities);

router.route("/").post(verifyJWT, createVehicleManager).get(verifyJWT, getAllVehicleManagers);
router.route("/updatestatus/:id").patch(verifyJWT, updateVehicleManagerStatus);
router.route("/:id").get(verifyJWT, getVehicleManagerByIdController);

export default router;
