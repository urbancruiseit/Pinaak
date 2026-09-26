import { Router } from "express";
import {
  addCountryCode,
  AllCountryCodes,
  getCountryCode,
} from "./country.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/")
  .post(verifyJWT, addCountryCode)
  .get(verifyJWT, getCountryCode);
router.route("/codes").get(verifyJWT, AllCountryCodes);

export default router;
