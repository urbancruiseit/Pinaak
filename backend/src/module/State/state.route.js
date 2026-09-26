import { Router } from "express";
import {
  fetchAllCities,
  fetchStates,
  fetchStatesByCity, // ← add karo
} from "./state.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, fetchStates);
router.route("/allcity").get(verifyJWT, fetchAllCities);
router.route("/states-by-city/:cityName").get(verifyJWT, fetchStatesByCity); // ← NEW

export default router;
