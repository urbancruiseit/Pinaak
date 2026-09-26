import { Router } from "express";
import {
  createVendorController,
  getAllVendorsController,
  getVendorByIdController,
  updateVendorController,
} from "./vendor.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();
// router.use(verifyJWT);
router.route("/").post(verifyJWT, createVendorController);
router.route("/").get(verifyJWT, getAllVendorsController);
router.route("/:id").get(verifyJWT, getVendorByIdController);
router.route("/:id").put(verifyJWT, updateVendorController);

export default router;
