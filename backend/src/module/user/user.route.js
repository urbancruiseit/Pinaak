import { Router } from "express";
import {
  getCurrentUSer,
  loginUser,
  registerUser,
  getSalesUsersController,
  updateUserController,
} from "./user.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = Router();

router.route("/").post(registerUser);
router.route("/login").post(loginUser);
router.use(verifyJWT);
router.route("/current-user").get(getCurrentUSer);
router.route("/sales").get(getSalesUsersController);
router.route("/update/:id").put(updateUserController);

export default router;
