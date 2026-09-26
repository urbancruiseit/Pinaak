import express from "express";
import { monthlyEnquiryReport } from "./hoursreport.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyJWT, monthlyEnquiryReport);

export default router;