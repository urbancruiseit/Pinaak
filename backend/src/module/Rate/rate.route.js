// rate.routes.js
import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import {
  createRateQuotation,
  getAllRateQuotations,
} from "./rate.controller.js";

const router = express.Router();

router.use(verifyJWT); // ✅ Add this line - same as DSR

router.post("/create", verifyJWT, createRateQuotation);
router.get("/all", verifyJWT, getAllRateQuotations);

export default router;
