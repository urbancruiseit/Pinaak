import { Router } from "express";
import { travelCityList } from "./travelCity.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, travelCityList);

export default router;
