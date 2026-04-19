import { Router } from "express";
import {
  createVendorController,
  getAllVendorsController,
  getVendorByIdController,
  updateVendorController,
} from "./vendor.controller.js";

const router = Router();
router.route("/").post(createVendorController);
router.route("/").get(getAllVendorsController);
router.route("/:id").get(getVendorByIdController);
router.route("/:id").put(updateVendorController);

export default router;
