import { Router } from "express";
import {
  createCustomer,
  getAllCustomersController,
  searchCustomerController,
  updateCustomer,
} from "./newCustomer.Controller.js";

const router = Router();
router.route("/").post(createCustomer);
router.route("/").get(getAllCustomersController);
router.route("/search").get(searchCustomerController);
router.route("/:id").put(updateCustomer);

export default router;
