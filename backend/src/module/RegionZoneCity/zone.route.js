import { Router } from "express";

import {
  getCitiesByZoneController,
  getAllRegionsController,
  getZonesByRegionController,
} from "./zone.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// Get all regions
router.route("/regions").get(verifyJWT, getAllRegionsController);

// Get zones by region
router.route("/regions/:regionId/zones").get(verifyJWT, getZonesByRegionController);

// Get cities by zone
router.route("/zones/:zoneId/cities").get(verifyJWT, getCitiesByZoneController);

export default router;
