import { Router } from "express";
import {
  createVehicle,
  getAllVehicles,
  getVehicleCodeList,
} from "./vehiclemaster.controller.js";

const router = Router();

router.get("/", getVehicleCodeList);
router.route("/").post(createVehicle);
router.route("/getall").get(getAllVehicles);
export default router;
