import express from "express";
import { monthlyEnquiryReport } from "./report.controller.js";

const router = express.Router();

router.get("/monthly-enquiry", monthlyEnquiryReport);

export default router;