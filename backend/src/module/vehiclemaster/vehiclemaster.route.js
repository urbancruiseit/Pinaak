import { Router } from "express";
import {
  createVehicle,
  getAllVehicles,
  getSeatOptions,
  getVehicleCodeList,
} from "./vehiclemaster.controller.js";

const router = Router();

router.get("/", getVehicleCodeList);
router.route("/").post(createVehicle);
router.get("/seat-options", getSeatOptions);

router.route("/getall").get(getAllVehicles);
export default router;
