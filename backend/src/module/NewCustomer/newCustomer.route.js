import { Router } from "express";
import {
  createCustomer,
  getAllCustomersController,
  getCustomerByIdController,
  searchCustomerController,
  updateCustomer,
} from "./newCustomer.Controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();
// router.use(verifyJWT);
router.route("/").post(verifyJWT, createCustomer);
router.route("/").get(verifyJWT, getAllCustomersController);
router.route("/search").get(verifyJWT, searchCustomerController);
router.route("/:id").get(verifyJWT, getCustomerByIdController);
router.route("/:id").put(verifyJWT, updateCustomer);

export default router;
