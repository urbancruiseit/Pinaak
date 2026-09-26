import express from "express";
import {
  createDriverController,
  getAllDriversController,
  getDriverByIdController,
  updateDriverController,
  deleteDriverController,
} from "./driver.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// router.use(verifyJWT);

router.post("/", verifyJWT, createDriverController);

router.get("/", verifyJWT, getAllDriversController);

router.get("/:id", verifyJWT, getDriverByIdController);

router.put("/:id", verifyJWT, updateDriverController);

router.delete("/:id", verifyJWT, deleteDriverController);

export default router;


