import { Router } from "express";
import {
  createVehicle,
  getAllVehicles,
  getSeatOptions,
  getVehicleCodeList,
  getVehiclesById,
  getVehicleVariantByCodeController,
} from "./vehiclemaster.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, getVehicleCodeList);
router.route("/").post(verifyJWT, createVehicle);
router.get("/seat-options", verifyJWT, getSeatOptions);

router.route("/getall").get(verifyJWT, getAllVehicles);
router.route("/:id").get(verifyJWT, getVehiclesById);
router
  .route("/variant/:code")
  .get(verifyJWT, getVehicleVariantByCodeController);
export default router;
