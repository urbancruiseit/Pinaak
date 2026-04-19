import express from "express";
import {
  createDriverController,
  getAllDriversController,
  getDriverByIdController,
  updateDriverController,
  deleteDriverController,
} from "./driver.controller.js";

const router = express.Router();

router.post("/", createDriverController);

router.get("/", getAllDriversController);

router.get("/:id", getDriverByIdController);

router.put("/:id", updateDriverController);

router.delete("/:id", deleteDriverController);

export default router;
